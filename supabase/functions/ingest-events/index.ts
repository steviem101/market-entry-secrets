import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { log, logError } from "../_shared/log.ts";

const PREFIX = "ingest-events";

// Apify webhook receiver for the "Events Finder" actor. Verifies a shared
// secret, fetches the run's dataset, dedups on url (collapsing the actor's
// multi-city duplication), stages raw rows, then kicks off normalisation.
Deno.serve(async (req: Request) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Webhook auth: Apify is configured to send this shared secret header.
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== Deno.env.get("EVENTS_WEBHOOK_SECRET")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const datasetId = body?.resource?.defaultDatasetId;
    const runId = body?.resource?.id ?? null;
    if (!datasetId) {
      return new Response(JSON.stringify({ error: "no dataset id in payload" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Prefer the workstream-specific token; fall back to the existing project-wide
    // APIFY_TOKEN (used by the Irish Insights apify-webhook) so no new secret is required
    // when the Events Finder actor lives in the same Apify account.
    const apifyToken = Deno.env.get("APIFY_API_TOKEN") ?? Deno.env.get("APIFY_TOKEN");
    if (!apifyToken) {
      logError(PREFIX, "No Apify token configured (set APIFY_API_TOKEN or APIFY_TOKEN)", null);
      return new Response(JSON.stringify({ error: "apify_token_not_configured" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Fetch the run's dataset items.
    const dsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&token=${apifyToken}`,
    );
    if (!dsRes.ok) {
      logError(PREFIX, `Apify dataset fetch failed (${dsRes.status})`, await dsRes.text());
      return new Response(JSON.stringify({ error: "apify_fetch_failed", status: dsRes.status }), {
        status: 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const items = await dsRes.json();
    if (!Array.isArray(items)) {
      logError(PREFIX, "Apify dataset returned a non-array payload", items);
      return new Response(JSON.stringify({ error: "apify_bad_response" }), {
        status: 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Dedup the batch in memory on url (the actor returns national events once per queried city).
    const byUrl = new Map<string, any>();
    for (const it of items) {
      if (it && typeof it.url === "string" && it.url && !byUrl.has(it.url)) byUrl.set(it.url, it);
    }
    const deduped = [...byUrl.values()];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let newlyStaged = 0;
    if (deduped.length) {
      const rows = deduped.map((it) => ({ source_url: it.url, run_id: runId, raw: it }));
      const { error, count } = await supabase
        .from("events_staging")
        .upsert(rows, { onConflict: "source_url", ignoreDuplicates: true, count: "exact" });
      if (error) {
        logError(PREFIX, "events_staging upsert failed", error);
        return new Response(JSON.stringify({ error: "staging_failed", details: error.message }), {
          status: 500, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      newlyStaged = count ?? 0;
    }

    // Kick off normalisation inline using the service role key.
    let normalize: unknown = null;
    try {
      const nRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/normalize-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ batch: 100 }),
      });
      normalize = await nRes.json().catch(() => null);
    } catch (nErr) {
      // Staging already succeeded; a later normalise run will pick these up.
      logError(PREFIX, "normalize-events invocation failed (rows remain staged for retry)", nErr);
    }

    const summary = { received: items.length, deduped: deduped.length, newly_staged: newlyStaged, run_id: runId, normalize };
    log(PREFIX, "Ingest complete", summary);
    return new Response(JSON.stringify(summary), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    logError(PREFIX, "Unexpected error", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
