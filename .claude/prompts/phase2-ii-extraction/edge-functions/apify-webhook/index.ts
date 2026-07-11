// Apify webhook receiver.
//
// Apify fires ACTOR.RUN.SUCCEEDED at this endpoint. We fetch the dataset,
// normalise each item to ContentRow, run the pre-filter, and upsert the
// survivors into ii_content with is_ii_relevant=null. A separate Python cron
// picks up the unclassified rows and runs the Claude classifier.
//
// All filter decisions (kept and dropped) are logged to ii_prefilter_log so
// we can tune rules against real traffic.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import type { ContentRow, SourceType } from "./types.ts";
import { normaliseLinkedInPost, type ApifyLinkedInPost } from "./normalisers/linkedin.ts";
import { preFilter, type FilterDecision } from "./filters/prefilter.ts";

// Map Apify actor task IDs to the SourceType they produce.
const TASK_TO_SOURCE_TYPE: Record<string, SourceType> = {
  "3RnAZzC9CsXXPZrbM": "linkedin_post",
};

interface ApifyWebhookPayload {
  userId?: string;
  createdAt?: string;
  eventType?: string;
  eventData?: {
    actorId?: string;
    actorRunId?: string;
    actorTaskId?: string;
  };
  resource?: {
    id?: string;
    actId?: string;
    actorTaskId?: string;
    defaultDatasetId?: string;
    status?: string;
  };
}

const APIFY_WEBHOOK_SECRET = Deno.env.get("APIFY_WEBHOOK_SECRET") ?? "";
const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function fetchDatasetItems(datasetId: string): Promise<unknown[]> {
  const url = `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`Apify dataset fetch failed: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

function normaliseItem(
  item: unknown,
  sourceType: SourceType,
  apifyRunId: string,
): ContentRow | null {
  if (sourceType === "linkedin_post") {
    return normaliseLinkedInPost(item as ApifyLinkedInPost, apifyRunId);
  }
  return null;
}

function bodyPreview(row: ContentRow): string | null {
  const body = row.body_text ?? "";
  if (!body) return null;
  // Slice by codepoint, not UTF-16 code unit, so emoji aren't cut mid-surrogate.
  // An unpaired surrogate is invalid UTF-8 and poisons the entire batch insert
  // into ii_prefilter_log, which is why v3 silently lost all log rows post-deploy.
  return Array.from(body).slice(0, 500).join("");
}

function logMetadata(row: ContentRow, apifyRunId: string): Record<string, unknown> {
  const meta = row.source_metadata ?? {};
  return {
    apify_run_id: apifyRunId,
    author_handle: row.author_handle,
    author_name: row.author_name,
    source_url: row.source_url,
    published_at: row.published_at,
    total_engagement: meta.total_engagement ?? null,
    author_type: meta.author_type ?? null,
    is_repost: meta.is_repost ?? false,
  };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method not allowed" });
  }

  const providedSecret = req.headers.get("x-apify-webhook-secret") ?? "";
  if (!APIFY_WEBHOOK_SECRET || providedSecret !== APIFY_WEBHOOK_SECRET) {
    return jsonResponse(401, { error: "invalid webhook secret" });
  }

  let payload: ApifyWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: "invalid json" });
  }

  const eventType = payload.eventType ?? "";
  if (eventType !== "ACTOR.RUN.SUCCEEDED") {
    return jsonResponse(200, { ok: true, skipped: true, reason: `ignoring event ${eventType}` });
  }

  const runId = payload.eventData?.actorRunId ?? payload.resource?.id ?? "";
  const datasetId = payload.resource?.defaultDatasetId ?? "";
  const taskId = payload.eventData?.actorTaskId ?? payload.resource?.actorTaskId ?? "";
  if (!runId || !datasetId) {
    return jsonResponse(400, { error: "missing runId or datasetId in payload" });
  }

  const sourceType = TASK_TO_SOURCE_TYPE[taskId];
  if (!sourceType) {
    return jsonResponse(200, {
      ok: true,
      skipped: true,
      reason: `no source_type mapping for task ${taskId}`,
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  let items: unknown[];
  try {
    items = await fetchDatasetItems(datasetId);
  } catch (e) {
    console.error("apify dataset fetch failed", e);
    return jsonResponse(502, { error: String(e) });
  }

  const counts = {
    total: items.length,
    normalised: 0,
    kept: 0,
    dropped: 0,
    upsert_errors: 0,
  };
  const dropReasons: Record<string, number> = {};
  const logRows: Array<{
    source_type: string;
    source_id: string;
    kept: boolean;
    reason: string | null;
    body_preview: string | null;
    metadata: Record<string, unknown>;
  }> = [];
  const upsertRows: ContentRow[] = [];

  for (const item of items) {
    let row: ContentRow | null;
    try {
      row = normaliseItem(item, sourceType, runId);
    } catch (e) {
      console.error("normalise failed", e);
      continue;
    }
    if (!row) continue;
    counts.normalised += 1;

    const decision: FilterDecision = preFilter(row);
    logRows.push({
      source_type: row.source_type,
      source_id: row.source_id,
      kept: decision.kept,
      reason: decision.reason,
      body_preview: bodyPreview(row),
      metadata: logMetadata(row, runId),
    });

    if (decision.kept) {
      counts.kept += 1;
      upsertRows.push(row);
    } else {
      counts.dropped += 1;
      const r = decision.reason ?? "unknown";
      dropReasons[r] = (dropReasons[r] ?? 0) + 1;
    }
  }

  if (upsertRows.length > 0) {
    // ignoreDuplicates preserves any existing classification on re-scrape.
    // First delivery wins; later webhook hits for the same source_id are no-ops.
    const { error } = await supabase
      .from("ii_content")
      .upsert(upsertRows, { onConflict: "source_type,source_id", ignoreDuplicates: true });
    if (error) {
      console.error("ii_content upsert failed", error);
      counts.upsert_errors = upsertRows.length;
    }
  }

  let logError: string | null = null;
  if (logRows.length > 0) {
    const { error } = await supabase.from("ii_prefilter_log").insert(logRows);
    if (error) {
      console.error("ii_prefilter_log insert failed", error);
      logError = error.message;
    }
  }

  return jsonResponse(200, { ok: true, run_id: runId, source_type: sourceType, counts, drop_reasons: dropReasons, log_error: logError });
});
