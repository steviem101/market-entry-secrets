// loop-content-refresh — weekly content-freshness loop. PROPOSE-ONLY: writes one automation_runs
// row + N agent_content_proposals; never mutates production (apply-proposal does).
//
// Auth in-code by x-webhook-secret == SLACK_NOTIFY_WEBHOOK_SECRET (same cron pattern as
// directory-steward / demand-mining). verify_jwt is false in config.toml so the gateway lets the
// cron POST through. DOUBLY gated: requires CONTENT_REFRESH_ENABLED=on unless the caller passes
// {"force":true} or {"dry_run":true} (dry run computes proposals and returns them, writing nothing).
//
// Pilot (Workstream B): only the archive_event check runs (ENABLED_CHECKS). Fan-out enables the
// remaining checks one at a time.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { log, logError } from "../_shared/log.ts";
import {
  ENABLED_CHECKS, DEFAULT_BATCH_CAP, buildArchiveEventProposals, filterNewProposals,
  isPastEvent, type ProposalInsert, type EventRow,
} from "./contentRefresh.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const LOOP_NAME = "content-refresh";

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Cron/server auth: shared-secret header (no JWT).
  const secret = req.headers.get("x-webhook-secret");
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: { dry_run?: boolean; force?: boolean; batch_cap?: number } = {};
  try { body = await req.json(); } catch { /* empty body = cron default */ }
  const dryRun = body.dry_run === true;
  const batchCap = Math.max(1, Math.min(500, body.batch_cap ?? DEFAULT_BATCH_CAP));

  const enabled = ["on", "1", "true"].includes((Deno.env.get("CONTENT_REFRESH_ENABLED") || "").trim().toLowerCase());
  if (!enabled && !dryRun && body.force !== true) {
    return new Response(JSON.stringify({ skipped: true, reason: "CONTENT_REFRESH_ENABLED is off" }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const startedAt = new Date().toISOString();
  const todayISO = startedAt.slice(0, 10);

  // Open one run row (skipped on dry_run — nothing to join to).
  let runId: string | null = null;
  if (!dryRun) {
    const { data: run } = await supabase.from("automation_runs")
      .insert({ loop: LOOP_NAME, started_at: startedAt, status: "running", metadata: { checks: ENABLED_CHECKS, dry_run: false } })
      .select("id").maybeSingle();
    runId = run?.id ?? null;
  }

  const byCheck: Record<string, number> = {};
  let itemsScanned = 0;
  let allProposals: ProposalInsert[] = [];

  try {
    // --- archive_event (the only enabled pilot check) ---
    if (ENABLED_CHECKS.includes("archive_event")) {
      const { data: events, error } = await supabase.from("events")
        .select("id,title,status,date,event_date")
        .in("status", ["approved", "needs_review"])
        .limit(1000);
      if (error) throw new Error(`events read: ${error.message}`);
      const past = (events ?? []).filter((e) => isPastEvent(e as EventRow, todayISO)).slice(0, batchCap);
      itemsScanned += events?.length ?? 0;
      const candidates = buildArchiveEventProposals(past as EventRow[], runId);

      const keys = candidates.map((c) => c.dedup_key);
      const existingOpen = new Set<string>();
      if (keys.length > 0) {
        const { data: open } = await supabase.from("agent_content_proposals")
          .select("dedup_key").in("dedup_key", keys).in("status", ["pending", "approved", "auto_approved"]);
        for (const r of open ?? []) existingOpen.add(r.dedup_key as string);
      }
      const fresh = filterNewProposals(candidates, existingOpen);
      byCheck["archive_event"] = fresh.length;
      allProposals = allProposals.concat(fresh);
    }

    if (dryRun) {
      return new Response(JSON.stringify({ dry_run: true, items_scanned: itemsScanned, by_check: byCheck, would_propose: allProposals.length, sample: allProposals.slice(0, 5) }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    let proposed = 0;
    let accepted = 0;
    if (allProposals.length > 0) {
      const { data: inserted, error: insErr } = await supabase.from("agent_content_proposals")
        .insert(allProposals).select("id,status");
      if (insErr) throw new Error(`proposal insert: ${insErr.message}`);
      proposed = inserted?.length ?? 0;
      accepted = (inserted ?? []).filter((r) => r.status === "auto_approved").length;
    }

    await supabase.from("automation_runs").update({
      finished_at: new Date().toISOString(), status: "success",
      proposed, accepted, metadata: { checks: ENABLED_CHECKS, by_check: byCheck, items_scanned: itemsScanned, batch_cap: batchCap },
    }).eq("id", runId);

    // Best-effort digest signal (Slack routing for 'content.refresh' is wired in Workstream D).
    try {
      await supabase.from("activity_events").insert({
        event_type: "content.refresh", severity: "info",
        metadata: { run_id: runId, proposed, accepted, by_check: byCheck, items_scanned: itemsScanned },
      });
    } catch (e) { logError(LOOP_NAME, "activity_event insert failed (non-fatal)", e); }

    log(LOOP_NAME, `run ${runId}: proposed ${proposed}, accepted ${accepted}`, byCheck);
    return new Response(JSON.stringify({ run_id: runId, proposed, accepted, by_check: byCheck, items_scanned: itemsScanned }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(LOOP_NAME, "run failed", err);
    if (runId) {
      await supabase.from("automation_runs").update({ finished_at: new Date().toISOString(), status: "failed", error: msg.slice(0, 500) }).eq("id", runId);
    }
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
