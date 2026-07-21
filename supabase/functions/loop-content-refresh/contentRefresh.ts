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

// Checks enabled in the current rollout. Fan-out flips these on one at a time (Workstream B).
export const ENABLED_CHECKS = ["archive_event"] as const;
export type CheckName =
  | "archive_event" | "flag_dead_link" | "set_logo_url"
  | "queue_enrichment" | "trigger_reembed" | "remove_kb_row" | "flag_stale_content";

export const DEFAULT_BATCH_CAP = 50;

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
