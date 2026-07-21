// Pure bulk-selection logic for the /admin/agents proposals queue (tested in
// agentSelection.test.ts). The dashboard's bulk approve/reject is capped (the agent-actions
// server cap, passed in by the caller as MAX_BULK), the confirm modal summarises what is about
// to be actioned, and a partial failure must never read as a clean success — all of that
// behaviour lives here so it is deterministically testable without a DOM.
//
// Deliberately import-free (structural types, cap as a parameter) so Node's test runner can load
// it without resolving "@/" aliases or dragging in the Supabase client — same pattern as the
// other tested src/lib modules.

export interface SelectionChange {
  selection: string[];
  /** true when the cap prevented adding one or more keys */
  capped: boolean;
}

/** Toggle one proposal_key. Adding beyond the cap is refused (capped: true). */
export function toggleKey(selection: string[], key: string, cap: number): SelectionChange {
  if (selection.includes(key)) {
    return { selection: selection.filter((k) => k !== key), capped: false };
  }
  if (selection.length >= cap) return { selection, capped: true };
  return { selection: [...selection, key], capped: false };
}

/** Add every given key (e.g. the current page) up to the cap; already-selected keys are kept. */
export function selectAll(selection: string[], keys: string[], cap: number): SelectionChange {
  const merged = [...selection];
  let capped = false;
  for (const key of keys) {
    if (merged.includes(key)) continue;
    if (merged.length >= cap) { capped = true; break; }
    merged.push(key);
  }
  return { selection: merged, capped };
}

/** True when every given key is already selected (drives the header checkbox state). */
export function allSelected(selection: string[], keys: string[]): boolean {
  return keys.length > 0 && keys.every((k) => selection.includes(k));
}

export interface ProposalLike {
  proposal_key: string;
  action_type: string;
}

export interface SelectionSummary {
  total: number;
  /** action_type -> count, sorted most-frequent first, for the confirm modal */
  byActionType: Array<{ actionType: string; count: number }>;
}

/** Summarise the selected rows for the confirmation modal (count + distinct action types). */
export function summariseSelection(rows: ProposalLike[], selection: string[]): SelectionSummary {
  const selected = new Set(selection);
  const counts = new Map<string, number>();
  let total = 0;
  for (const row of rows) {
    if (!selected.has(row.proposal_key)) continue;
    total += 1;
    counts.set(row.action_type, (counts.get(row.action_type) ?? 0) + 1);
  }
  const byActionType = Array.from(counts.entries())
    .map(([actionType, count]) => ({ actionType, count }))
    .sort((a, b) => b.count - a.count || a.actionType.localeCompare(b.actionType));
  return { total, byActionType };
}

export interface RowResultLike {
  proposal_key: string;
  ok: boolean;
  applied?: boolean;
  error?: string;
}

export interface ResultPartition<T extends RowResultLike = RowResultLike> {
  ok: T[];
  failed: T[];
}

/** Split an agent-actions response into successes and failures. Never drops a row. */
export function partitionResults<T extends RowResultLike>(results: T[]): ResultPartition<T> {
  const ok: T[] = [];
  const failed: T[] = [];
  for (const r of results) (r.ok ? ok : failed).push(r);
  return { ok, failed };
}
