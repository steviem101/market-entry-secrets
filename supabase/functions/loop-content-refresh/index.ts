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
  getEnabledChecks, DEFAULT_BATCH_CAP, buildArchiveEventProposals, filterNewProposals,
  isPastEvent, LOGO_TARGETS, buildSetLogoProposals,
  LINK_CHECK_TARGETS, LINK_CHECK_BATCH, LINK_CHECK_TIMEOUT_MS, nextLinkCheckCounters,
  shouldProposeDeadLink, checkedRecently, buildDeadLinkProposal,
  type ProposalInsert, type EventRow, type LogoCandidate, type CheckName, type LinkCheckResult,
} from "./contentRefresh.ts";
import { isPrivateOrReservedUrl } from "../_shared/url.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const APPLY_SECRET = Deno.env.get("APPLY_PROPOSAL_SECRET") ?? Deno.env.get("EMAIL_INTERNAL_SECRET") ?? "";
const APPLY_CHUNK = 100; // apply-proposal's bulk cap
const LOOP_NAME = "content-refresh";

// Apply the run's auto_approved proposals through the single choke point, chunked to its bulk cap.
// Best-effort: a failed apply leaves the proposal apply_failed (visible in the dashboard/digest);
// it never throws the run.
async function applyAutoApproved(keys: string[]): Promise<number> {
  if (!APPLY_SECRET) { logError(LOOP_NAME, "auto-apply skipped: no APPLY_PROPOSAL_SECRET", null); return 0; }
  let applied = 0;
  for (let i = 0; i < keys.length; i += APPLY_CHUNK) {
    const chunk = keys.slice(i, i + APPLY_CHUNK);
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/apply-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-secret": APPLY_SECRET },
        body: JSON.stringify({ proposal_keys: chunk }),
      });
      const j = await resp.json().catch(() => ({ results: [] }));
      applied += (j.results ?? []).filter((r: { ok: boolean }) => r.ok).length;
    } catch (e) { logError(LOOP_NAME, "auto-apply chunk failed", e); }
  }
  return applied;
}

// Drop candidates whose dedup_key already has an OPEN proposal (pending/approved/auto_approved),
// so a re-scan never floods. Shared by every check.
// Bare `ReturnType<typeof createClient>` resolves the schema generics to `never` under strict Deno
// type-checking (supabase-js v2 defaults), so type the client loosely like the other functions.
async function dropAlreadyOpen(
  // deno-lint-ignore no-explicit-any
  supabase: any, candidates: ProposalInsert[],
): Promise<ProposalInsert[]> {
  if (candidates.length === 0) return [];
  const keys = candidates.map((c) => c.dedup_key);
  const existingOpen = new Set<string>();
  const { data: open } = await supabase.from("agent_content_proposals")
    .select("dedup_key").in("dedup_key", keys).in("status", ["pending", "approved", "auto_approved"]);
  for (const r of open ?? []) existingOpen.add(r.dedup_key as string);
  return filterNewProposals(candidates, existingOpen);
}

// GET-check a URL (not HEAD — the audit found HEAD yields 4xx/415 false positives).
// SSRF-safe by construction: redirect:"manual" means we NEVER follow a redirect, so the caller's
// pre-fetch isPrivateOrReservedUrl(url) check can't be bypassed by a 30x to an internal address
// (the redirect target is never requested). A redirect (opaqueredirect, status 0) means the origin
// responded and the link is alive, so it counts as ok. Bounded by an AbortController timeout;
// any throw (DNS, TLS, timeout) counts as a failure.
async function checkUrl(url: string): Promise<LinkCheckResult> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), LINK_CHECK_TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual", signal: ctrl.signal, headers: { "User-Agent": "MES-linkcheck/1.0" } });
    if (res.type === "opaqueredirect") return { ok: true, status: 301 }; // alive, redirects (not followed)
    return { ok: res.status >= 200 && res.status < 400, status: res.status };
  } catch {
    return { ok: false, status: null };
  } finally {
    clearTimeout(to);
  }
}

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
  const enabledChecks: CheckName[] = getEnabledChecks(Deno.env.get("CONTENT_REFRESH_CHECKS"));

  let runId: string | null = null;
  if (!dryRun) {
    const { data: run } = await supabase.from("automation_runs")
      .insert({ loop: LOOP_NAME, started_at: startedAt, status: "running", metadata: { checks: enabledChecks, dry_run: false } })
      .select("id").maybeSingle();
    runId = run?.id ?? null;
  }

  const byCheck: Record<string, number> = {};
  let itemsScanned = 0;
  let allProposals: ProposalInsert[] = [];

  try {
    // --- archive_event: past-dated events still on a live status ---
    if (enabledChecks.includes("archive_event")) {
      const { data: events, error } = await supabase.from("events")
        .select("id,title,status,date,event_date")
        .in("status", ["approved", "needs_review"])
        .limit(1000);
      if (error) throw new Error(`events read: ${error.message}`);
      const past = (events ?? []).filter((e) => isPastEvent(e as EventRow, todayISO)).slice(0, batchCap);
      itemsScanned += events?.length ?? 0;
      const fresh = await dropAlreadyOpen(supabase, buildArchiveEventProposals(past as EventRow[], runId));
      byCheck["archive_event"] = fresh.length;
      allProposals = allProposals.concat(fresh);
    }

    // --- set_logo_url: directory rows with a domain but no logo (fill via logo.dev) ---
    if (enabledChecks.includes("set_logo_url")) {
      for (const t of LOGO_TARGETS) {
        const remaining = batchCap - allProposals.length;
        if (remaining <= 0) break;
        // Dynamic table + a computed select string defeats supabase-js's type-level select parser,
        // so query through a loosely-typed client (house pattern) and shape the rows ourselves.
        // deno-lint-ignore no-explicit-any
        const { data: rows, error } = await (supabase as any).from(t.table)
          .select(`id,name,${t.websiteCol},${t.logoCol}`)
          .is(t.logoCol, null)                       // NULL logos (the dominant missing case)
          .not(t.websiteCol, "is", null)
          .limit(remaining);
        if (error) throw new Error(`${t.table} read: ${error.message}`);
        const rowList = (rows ?? []) as Array<Record<string, unknown>>;
        itemsScanned += rowList.length;
        const candidates: LogoCandidate[] = rowList.map((r) => ({
          id: String(r.id), website: (r[t.websiteCol] as string | null) ?? null, name: (r.name as string | null) ?? null,
        }));
        const fresh = await dropAlreadyOpen(supabase, buildSetLogoProposals(candidates, t.table, t.logoCol, runId));
        byCheck["set_logo_url"] = (byCheck["set_logo_url"] ?? 0) + fresh.length;
        allProposals = allProposals.concat(fresh);
      }
    }

    // --- flag_dead_link: GET-check directory links; propose after 2 consecutive failures ---
    if (enabledChecks.includes("flag_dead_link")) {
      const nowMs = Date.parse(startedAt);
      let checked = 0;
      const deadCandidates: ProposalInsert[] = [];
      for (const t of LINK_CHECK_TARGETS) {
        if (checked >= LINK_CHECK_BATCH) break;
        // deno-lint-ignore no-explicit-any
        const { data: rows } = await (supabase as any).from(t.table)
          .select(`id,${t.urlCol}`).not(t.urlCol, "is", null).limit(300);
        for (const r of (rows ?? []) as Array<Record<string, unknown>>) {
          if (checked >= LINK_CHECK_BATCH) break;
          const url = (r[t.urlCol] as string | null) ?? null;
          if (!url || isPrivateOrReservedUrl(url)) continue; // SSRF guard: never fetch internal/reserved hosts
          const recordId = String(r.id);

          const { data: prev } = await supabase.from("content_link_checks")
            .select("consecutive_failures,last_checked_at")
            .eq("directory_table", t.table).eq("record_id", recordId).eq("url", url).maybeSingle();
          if (checkedRecently(prev?.last_checked_at as string | null | undefined, nowMs)) continue; // weekly cadence

          const result = await checkUrl(url);
          checked++;
          const counters = nextLinkCheckCounters(prev ?? null, result);
          if (!dryRun) {
            await supabase.from("content_link_checks").upsert({
              directory_table: t.table, record_id: recordId, url,
              last_status: counters.last_status, last_ok: counters.last_ok,
              consecutive_failures: counters.consecutive_failures,
              last_checked_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            }, { onConflict: "directory_table,record_id,url" });
          }

          if (shouldProposeDeadLink(counters.consecutive_failures)) {
            deadCandidates.push(buildDeadLinkProposal(t.table, recordId, url, counters.consecutive_failures, counters.last_status, runId));
          }
        }
      }
      itemsScanned += checked;
      const fresh = await dropAlreadyOpen(supabase, deadCandidates);
      byCheck["flag_dead_link"] = fresh.length;
      allProposals = allProposals.concat(fresh);
    }

    if (dryRun) {
      return new Response(JSON.stringify({ dry_run: true, items_scanned: itemsScanned, by_check: byCheck, would_propose: allProposals.length, sample: allProposals.slice(0, 5) }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    let proposed = 0;
    let accepted = 0;
    let applied = 0;
    let autoApprovedKeys: string[] = [];
    if (allProposals.length > 0) {
      const { data: inserted, error: insErr } = await supabase.from("agent_content_proposals")
        .insert(allProposals).select("id,status");
      if (insErr) throw new Error(`proposal insert: ${insErr.message}`);
      proposed = inserted?.length ?? 0;
      accepted = (inserted ?? []).filter((r) => r.status === "auto_approved").length;
      autoApprovedKeys = (inserted ?? []).filter((r) => r.status === "auto_approved").map((r) => `agent_content_proposals:${r.id}`);
    }

    // Gated end-of-run auto-apply: when CONTENT_REFRESH_AUTOAPPLY is on, the whitelisted
    // auto_approved proposals apply themselves through the choke point (apply-proposal). Default
    // OFF, so the pilot's first runs stay propose-only until you flip it on.
    const autoApply = ["on", "1", "true"].includes((Deno.env.get("CONTENT_REFRESH_AUTOAPPLY") || "").trim().toLowerCase());
    if (autoApply && autoApprovedKeys.length > 0) {
      applied = await applyAutoApproved(autoApprovedKeys);
    }

    await supabase.from("automation_runs").update({
      finished_at: new Date().toISOString(), status: "success",
      proposed, accepted, metadata: { checks: enabledChecks, by_check: byCheck, items_scanned: itemsScanned, batch_cap: batchCap, auto_apply: autoApply, applied },
    }).eq("id", runId);

    // Best-effort digest signal (Slack routing for 'content.refresh' is wired in Workstream D).
    try {
      await supabase.from("activity_events").insert({
        event_type: "content.refresh", severity: "info",
        metadata: { run_id: runId, proposed, accepted, by_check: byCheck, items_scanned: itemsScanned },
      });
    } catch (e) { logError(LOOP_NAME, "activity_event insert failed (non-fatal)", e); }

    log(LOOP_NAME, `run ${runId}: proposed ${proposed}, accepted ${accepted}, applied ${applied}`, byCheck);
    return new Response(JSON.stringify({ run_id: runId, proposed, accepted, applied, by_check: byCheck, items_scanned: itemsScanned }), {
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
