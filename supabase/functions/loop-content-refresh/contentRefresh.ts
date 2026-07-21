// loop-content-refresh — pure check logic (no IO, unit-tested in contentRefresh.test.ts).
//
// The content-refresh loop keeps directory + content data fresh by PROPOSING typed changes into
// agent_content_proposals; it never mutates production itself (apply-proposal does, after review /
// auto-approve). This module holds the deterministic parts: which rows are stale, what proposal to
// emit, and the dedup filtering. IO (DB reads/writes, HTTP) lives in index.ts.
//
// Pilot scope (Workstream B): only the archive_event check is enabled. Later checks (set_logo_url,
// flag_dead_link, queue_enrichment, trigger_reembed, remove_kb_row, flag_stale_content) are enabled
// one at a time, each with its own builder here.

export interface ProposalInsert {
  run_id: string | null;
  loop_name: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  payload: Record<string, unknown>;
  reason: string;
  confidence: number | null;
  status: "pending" | "auto_approved";
  dedup_key: string;
}

export type CheckName =
  | "archive_event" | "flag_dead_link" | "set_logo_url"
  | "queue_enrichment" | "trigger_reembed" | "remove_kb_row" | "flag_stale_content";

// Every check the loop knows how to run. Which ones actually run is env-driven (see
// getEnabledChecks) so the maintainer can enable them ONE AT A TIME with a manual run each,
// per the staged-rollout plan, without a code change.
export const KNOWN_CHECKS: CheckName[] = [
  "archive_event", "set_logo_url", "flag_dead_link",
  "queue_enrichment", "trigger_reembed", "remove_kb_row", "flag_stale_content",
];

/**
 * Enabled checks come from CONTENT_REFRESH_CHECKS (comma-separated), defaulting to archive_event
 * only (the pilot). Unknown names are dropped. The maintainer widens this env value one check at a
 * time. Kept pure (env passed in) so it is testable.
 */
export function getEnabledChecks(rawEnv: string | undefined): CheckName[] {
  const raw = (rawEnv ?? "archive_event").split(",").map((s) => s.trim()).filter(Boolean);
  const known = new Set<string>(KNOWN_CHECKS);
  const enabled = raw.filter((c) => known.has(c)) as CheckName[];
  return enabled.length > 0 ? enabled : ["archive_event"];
}

export const DEFAULT_BATCH_CAP = 50;

// Publishable Logo.dev key (pk_) — documented safe to ship client-side (src/lib/logoUtils.ts),
// so it is fine in the edge runtime too. set_logo_url only ever writes an https logo.dev URL.
const LOGO_DEV_TOKEN = "pk_L3JbJjCeT0-mUdhpPlS6SA";

/** Bare registrable domain from a URL/host string (mirrors src/lib/logoUtils.extractDomain). */
export function extractDomain(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  let hostname = url.trim();
  if (!/^https?:\/\//i.test(hostname)) hostname = `https://${hostname}`;
  try {
    let domain = new URL(hostname).hostname.toLowerCase();
    if (domain.startsWith("www.")) domain = domain.slice(4);
    return domain || null;
  } catch { return null; }
}

export function buildLogoDevUrl(domain: string): string {
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`;
}

// Directory tables whose missing logos set_logo_url can fill, with the website column to derive the
// domain from. Mentors (people) are deliberately excluded — logo.dev is for company domains.
export const LOGO_TARGETS: Array<{ table: string; websiteCol: string; logoCol: string }> = [
  { table: "service_providers", websiteCol: "website", logoCol: "logo" },
  { table: "investors", websiteCol: "website", logoCol: "logo" },
  { table: "trade_investment_agencies", websiteCol: "website_url", logoCol: "logo" }, // agencies populate website_url, not website
  { table: "innovation_ecosystem", websiteCol: "website", logoCol: "logo" },
];

export interface LogoCandidate { id: string; website: string | null; name?: string | null; }

/**
 * set_logo_url proposals for directory rows with a resolvable domain but no logo. Auto-approved
 * (low-risk) and COALESCE-protected at apply, so an existing logo is never overwritten.
 */
export function buildSetLogoProposals(
  rows: LogoCandidate[], table: string, logoCol: string, runId: string | null,
): ProposalInsert[] {
  const out: ProposalInsert[] = [];
  for (const r of rows) {
    const domain = extractDomain(r.website);
    if (!domain) continue;
    out.push({
      run_id: runId,
      loop_name: "content-refresh",
      action_type: "set_logo_url",
      target_table: table,
      target_id: r.id,
      payload: { logo_field: logoCol, logo_url: buildLogoDevUrl(domain) },
      reason: `${table} "${r.name ?? r.id}" has no logo; deriving one from ${domain} via logo.dev.`,
      confidence: null,
      status: "auto_approved",
      dedup_key: dedupKey("set_logo_url", table, r.id),
    });
  }
  return out;
}

export function dedupKey(action: string, table: string, id: string): string {
  return `${action}:${table}:${id}`;
}

export interface EventRow {
  id: string;
  title?: string | null;
  status: string;
  date?: string | null;        // date column (YYYY-MM-DD)
  event_date?: string | null;  // timestamptz column
}

/** An event is past when its best available date is strictly before today (UTC date). */
export function isPastEvent(e: EventRow, todayISO: string): boolean {
  const d = (e.event_date ? e.event_date.slice(0, 10) : null) ?? e.date ?? null;
  return d !== null && d < todayISO;
}

/**
 * archive_event proposals for past-dated events that are still on a live status. Auto-approved
 * (whitelisted low-risk): apply-proposal sets status='archived', which removes them from every
 * surface that gates on 'approved'. Batch-capped by the caller (slice before passing in).
 */
export function buildArchiveEventProposals(pastEvents: EventRow[], runId: string | null): ProposalInsert[] {
  return pastEvents.map((e) => {
    const shownDate = (e.event_date ? e.event_date.slice(0, 10) : null) ?? e.date ?? "an unknown date";
    return {
      run_id: runId,
      loop_name: "content-refresh",
      action_type: "archive_event",
      target_table: "events",
      target_id: e.id,
      payload: {},
      reason: `Event "${e.title ?? e.id}" is dated ${shownDate} (past) but still status '${e.status}'; archive it from live listings.`,
      confidence: null,
      status: "auto_approved",
      dedup_key: dedupKey("archive_event", "events", e.id),
    };
  });
}

/** Drop candidates whose dedup_key already has an OPEN proposal, so a re-scan never floods. */
export function filterNewProposals(candidates: ProposalInsert[], existingOpenKeys: Set<string>): ProposalInsert[] {
  return candidates.filter((c) => !existingOpenKeys.has(c.dedup_key));
}

// ── flag_dead_link ────────────────────────────────────────────────────────────────────────────
// Directory tables whose website links the loop GET-checks. Mentors/events excluded.
export const LINK_CHECK_TARGETS: Array<{ table: string; urlCol: string }> = [
  { table: "service_providers", urlCol: "website" },
  { table: "investors", urlCol: "website" },
  { table: "innovation_ecosystem", urlCol: "website" },
  { table: "trade_investment_agencies", urlCol: "website_url" },
];

export const LINK_CHECK_BATCH = 15;        // URLs GET-checked per run (bounds runtime under the cron timeout)
export const LINK_CHECK_TIMEOUT_MS = 6000;
export const LINK_RECHECK_AFTER_DAYS = 6;  // re-check weekly-ish; skip URLs checked more recently
export const DEAD_LINK_THRESHOLD = 2;      // consecutive failed checks before proposing (audit: HEAD gives false positives, so this is a GET + a 2-strike rule)

export interface LinkCheckState { consecutive_failures: number | null; last_checked_at?: string | null; }
export interface LinkCheckResult { ok: boolean; status: number | null; }

/** New counters from the prior state + this check's result. A success resets the streak to 0. */
export function nextLinkCheckCounters(prev: LinkCheckState | null, result: LinkCheckResult): { consecutive_failures: number; last_status: number | null; last_ok: boolean } {
  const prevFail = prev?.consecutive_failures ?? 0;
  return { consecutive_failures: result.ok ? 0 : prevFail + 1, last_status: result.status, last_ok: result.ok };
}

export function shouldProposeDeadLink(consecutiveFailures: number): boolean {
  return consecutiveFailures >= DEAD_LINK_THRESHOLD;
}

/** True when the URL was checked within the recheck window (so this run should skip it). */
export function checkedRecently(lastCheckedAt: string | null | undefined, nowMs: number): boolean {
  if (!lastCheckedAt) return false;
  const t = Date.parse(lastCheckedAt);
  if (Number.isNaN(t)) return false;
  return nowMs - t < LINK_RECHECK_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

export function buildDeadLinkProposal(table: string, recordId: string, url: string, consecutiveFailures: number, lastStatus: number | null, runId: string | null): ProposalInsert {
  return {
    run_id: runId, loop_name: "content-refresh", action_type: "flag_dead_link",
    target_table: table, target_id: recordId,
    payload: { url, consecutive_failures: consecutiveFailures, last_status: lastStatus, health: 0 },
    reason: `${table} link ${url} failed ${consecutiveFailures} consecutive checks (last status ${lastStatus ?? "no response"}); flag for review.`,
    confidence: null, status: "pending",
    dedup_key: dedupKey("flag_dead_link", table, recordId),
  };
}

// ── trigger_reembed ─────────────────────────────────────────────────────────────────────────────
export const REEMBED_CAP = 200; // ids per proposal

/**
 * One trigger_reembed proposal for KB rows whose embedding is STUCK (content changed but the
 * 2-minute embed-knowledge cron has not caught up after an hour) — a genuinely stuck pipeline, not
 * the normal small backlog. Auto-approved: apply nulls the hashes so the cron re-embeds. Null when
 * nothing is stuck. Single stable dedup_key so only one is open at a time.
 */
export function buildReembedProposal(stuckKbIds: string[], runId: string | null): ProposalInsert | null {
  if (stuckKbIds.length === 0) return null;
  const ids = stuckKbIds.slice(0, REEMBED_CAP);
  return {
    run_id: runId, loop_name: "content-refresh", action_type: "trigger_reembed",
    target_table: "mes_knowledge_base", target_id: null,
    payload: { kb_ids: ids },
    reason: `${ids.length} knowledge-base row(s) have a stale embedding older than 1h (embed cron may be stuck); re-embed them.`,
    confidence: null, status: "auto_approved",
    dedup_key: "trigger_reembed:mes_knowledge_base:stuck",
  };
}

// ── remove_kb_row ───────────────────────────────────────────────────────────────────────────────
// Directory entity tables whose deleted rows should not linger in the KB / RAG surface.
export const KB_ORPHAN_TABLES = [
  "service_providers", "community_members", "events", "investors",
  "innovation_ecosystem", "trade_investment_agencies",
];

/** remove_kb_row proposals for KB rows whose source entity no longer exists. Pending (not auto). */
export function buildRemoveKbProposals(
  orphans: Array<{ id: string; source_table: string; source_id: string }>, runId: string | null,
): ProposalInsert[] {
  return orphans.map((o) => ({
    run_id: runId, loop_name: "content-refresh", action_type: "remove_kb_row",
    target_table: "mes_knowledge_base", target_id: o.id,
    payload: { source_table: o.source_table, source_id: o.source_id },
    reason: `KB row ${o.id} points at a deleted ${o.source_table} (${o.source_id}); remove the orphan.`,
    confidence: null, status: "pending",
    dedup_key: dedupKey("remove_kb_row", "mes_knowledge_base", o.id),
  }));
}

/** KB rows whose source_id is absent from the set of live ids for that source_table. Pure. */
export function findKbOrphans(
  kbRows: Array<{ id: string; source_id: string }>, liveIds: Set<string>, sourceTable: string,
): Array<{ id: string; source_table: string; source_id: string }> {
  return kbRows
    .filter((k) => k.source_id && !liveIds.has(k.source_id))
    .map((k) => ({ id: k.id, source_table: sourceTable, source_id: k.source_id }));
}

// ── flag_stale_content ──────────────────────────────────────────────────────────────────────────
export const STALE_CONTENT_DAYS = 180;

/** True when a title/subtitle references a year strictly before 2025 (a staleness signal). */
export function hasOldYearRef(text: string | null | undefined): boolean {
  if (!text) return false;
  const years = text.match(/\b(19|20)\d{2}\b/g);
  if (!years) return false;
  return years.some((y) => Number(y) < 2025);
}

export interface StaleContentRow { id: string; title?: string | null; reason_detail: string; }

/** flag_stale_content proposals (pending, review-only) for content_items flagged stale. */
export function buildStaleContentProposals(rows: StaleContentRow[], runId: string | null): ProposalInsert[] {
  return rows.map((r) => ({
    run_id: runId, loop_name: "content-refresh", action_type: "flag_stale_content",
    target_table: "content_items", target_id: r.id,
    payload: { detail: r.reason_detail },
    reason: `content_item "${r.title ?? r.id}" looks stale: ${r.reason_detail}. Flag for a refresh.`,
    confidence: null, status: "pending",
    dedup_key: dedupKey("flag_stale_content", "content_items", r.id),
  }));
}
