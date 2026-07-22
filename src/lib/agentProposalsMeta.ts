// Pure metadata + per-row action matrix for the /admin/agents dashboard (tested in
// agentProposalsMeta.test.ts). Import-free so Node's test runner loads it directly.
//
// The agent_proposals view's union branches are fixed literals: each source table maps to
// exactly one loop_name. This module is the single client-side home for that pairing, so the
// Source and Loop filters are derived from ONE list (extending the view means adding one entry
// here) — and the Loop filter can never contain an unmatchable option or lose an idle loop the
// way a 30-day-windowed derivation could.
//
// rowActions() is the UI's per-row action matrix, kept deliberately aligned with the server
// contract (agent-actions resolveAction + apply-proposal APPLYABLE_STATUSES):
//   - approve/reject are refused server-side only for already-applied rows;
//   - retry (re-apply) exists only for the applyable source (agent_content_proposals) and is
//     valid from approved/auto_approved/apply_failed.

export interface AgentSourceMeta {
  source: string;    // agent_proposals.source_table
  loop: string;      // agent_proposals.loop_name literal for that source
  applyable: boolean; // true => apply-proposal can act on it (retry/apply paths exist)
}

export const AGENT_PROPOSAL_SOURCES: AgentSourceMeta[] = [
  { source: "agent_content_proposals", loop: "content-refresh", applyable: true },
  { source: "directory_steward_staging", loop: "directory-steward", applyable: false },
  { source: "directory_discovery_staging", loop: "directory-discovery", applyable: false },
  { source: "directory_demand_signals", loop: "demand-mining", applyable: false },
  { source: "report_quality_proposals", loop: "report-quality-loop", applyable: false },
  { source: "prompt_ab_proposals", loop: "prompt-ab-rollup", applyable: false },
  { source: "ecosystem_import_candidates", loop: "ecosystem-import", applyable: false },
  { source: "innovation_ecosystem_enrichment_staging", loop: "ecosystem-enrichment", applyable: false },
  { source: "trade_agencies_enrichment_staging", loop: "agency-enrichment", applyable: false },
];

export const SOURCE_OPTIONS = AGENT_PROPOSAL_SOURCES.map((s) => s.source);
export const LOOP_OPTIONS = [...new Set(AGENT_PROPOSAL_SOURCES.map((s) => s.loop))].sort();

export const STATUS_OPTIONS = ["pending", "approved", "auto_approved", "applied", "apply_failed", "rejected"];

// Only rows a bulk action meaningfully targets are selectable. This is what stops the header
// select-all from sweeping applied/rejected rows into a bulk approve (the server would
// re-approve a rejected row and APPLY it — admin authority per-row is one thing, an accidental
// bulk click is another).
export const SELECTABLE_STATUSES = new Set(["pending", "auto_approved"]);

export function isSelectable(status: string): boolean {
  return SELECTABLE_STATUSES.has(status);
}

export type RowAction = "approve" | "reject" | "retry";

function isApplyableSource(source: string): boolean {
  return AGENT_PROPOSAL_SOURCES.some((s) => s.source === source && s.applyable);
}

/**
 * The actions the UI offers for one row, by canonical status + source. Mirrors the server:
 *   pending        -> approve, reject
 *   auto_approved  -> approve (drives apply when auto-apply is off), reject
 *   approved       -> retry (applyable source only: re-runs a stranded apply), reject (withdraw)
 *   apply_failed   -> retry (applyable source only), reject (abandon a deterministic failure)
 *   applied/rejected -> none (terminal in the UI; applied is terminal server-side too)
 */
export function rowActions(status: string, source: string): RowAction[] {
  switch (status) {
    case "pending":
      return ["approve", "reject"];
    case "auto_approved":
      return ["approve", "reject"];
    case "approved":
      return isApplyableSource(source) ? ["retry", "reject"] : ["reject"];
    case "apply_failed":
      return isApplyableSource(source) ? ["retry", "reject"] : ["reject"];
    default:
      return [];
  }
}
