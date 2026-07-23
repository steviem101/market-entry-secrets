// agent-actions — pure resolution logic (no IO, unit-tested in agentActions.test.ts).
//
// agent-actions is the admin/Slack endpoint that flips a proposal's review status across ANY of
// the loops' source tables and, for the applyable ones, invokes apply-proposal. Because each
// source table has its own status vocabulary and its own capabilities, the mapping lives here as
// a typed registry so approve/reject write the right value to the right column, deterministically.
//
// Only agent_content_proposals is "applyable" through apply-proposal today; the legacy staging
// tables keep their own reviewed apply paths, so here approve/reject is a triage that writes their
// native status (a human or the existing path applies). This is the same code path the Slack
// buttons hit, so Slack and the dashboard converge on one implementation.

export type CanonicalAction = "approve" | "reject" | "retry";

export interface SourceConfig {
  table: string;
  approvedValue: string;   // native value written on approve
  rejectedValue: string;   // native value written on reject
  appliedValue: string;    // native terminal value (production already mutated) — never re-flip it
  hasReviewedBy: boolean;  // some source tables carry a reviewed_by column, some don't
  applyable: boolean;      // true => approve also invokes apply-proposal
}

// Keyed by the proposal_key source prefix (see the agent_proposals view).
export const SOURCE_CONFIG: Record<string, SourceConfig> = {
  agent_content_proposals: { table: "agent_content_proposals", approvedValue: "approved", rejectedValue: "rejected", appliedValue: "applied", hasReviewedBy: true, applyable: true },
  directory_steward_staging: { table: "directory_steward_staging", approvedValue: "approved", rejectedValue: "dismissed", appliedValue: "applied", hasReviewedBy: false, applyable: false },
  directory_discovery_staging: { table: "directory_discovery_staging", approvedValue: "approved", rejectedValue: "dismissed", appliedValue: "imported", hasReviewedBy: false, applyable: false },
  directory_demand_signals: { table: "directory_demand_signals", approvedValue: "ack", rejectedValue: "dismissed", appliedValue: "actioned", hasReviewedBy: false, applyable: false },
  report_quality_proposals: { table: "report_quality_proposals", approvedValue: "accepted", rejectedValue: "rejected", appliedValue: "shipped", hasReviewedBy: true, applyable: false },
  prompt_ab_proposals: { table: "prompt_ab_proposals", approvedValue: "accepted", rejectedValue: "dismissed", appliedValue: "shipped", hasReviewedBy: false, applyable: false },
  ecosystem_import_candidates: { table: "ecosystem_import_candidates", approvedValue: "approved", rejectedValue: "rejected", appliedValue: "applied", hasReviewedBy: true, applyable: false },
  innovation_ecosystem_enrichment_staging: { table: "innovation_ecosystem_enrichment_staging", approvedValue: "approved", rejectedValue: "rejected", appliedValue: "applied", hasReviewedBy: false, applyable: false },
  trade_agencies_enrichment_staging: { table: "trade_agencies_enrichment_staging", approvedValue: "approved", rejectedValue: "rejected", appliedValue: "applied", hasReviewedBy: false, applyable: false },
};

export const MAX_KEYS = 100; // bulk cap per action

// Staging sources that apply-proposal CAN apply once enabled (MES-223 E1). SOURCE_CONFIG keeps
// applyable=false for these — the apply is gated at runtime by AGENT_APPLY_SOURCES, not by the
// static config — so the default (env unset) behaves exactly as before: approve records status,
// applies nothing.
export const STAGING_APPLY_SOURCES: ReadonlySet<string> = new Set([
  "directory_steward_staging",
  "innovation_ecosystem_enrichment_staging",
  "trade_agencies_enrichment_staging",
]);

/** Parse AGENT_APPLY_SOURCES into the set of staging sources whose approve should also apply.
 * Unknown names are ignored (a typo can only under-enable). Unset/empty => empty set. */
export function enabledApplySources(env: string | undefined | null): ReadonlySet<string> {
  const out = new Set<string>();
  for (const part of (env ?? "").split(",")) {
    const name = part.trim();
    if (name && STAGING_APPLY_SOURCES.has(name)) out.add(name);
  }
  return out;
}

export function parseProposalKey(key: string): { source: string; id: string } | null {
  const idx = key.indexOf(":");
  if (idx <= 0 || idx === key.length - 1) return null;
  return { source: key.slice(0, idx), id: key.slice(idx + 1) };
}

export interface StatusUpdate {
  table: string;
  id: string;
  set: Record<string, unknown>;
  applyAfter: boolean;  // invoke apply-proposal after the status write
  guardStatus: string;  // never overwrite a row already in this (applied) status
}

export interface ActionRefusal { refused: true; reason: string }

export function isActionRefusal(x: StatusUpdate | ActionRefusal): x is ActionRefusal {
  return (x as ActionRefusal).refused === true;
}

/**
 * Resolve one (source, action) into the status write to perform. Pure: no IO.
 * `nowISO` and `reviewerId` are passed in so the result is deterministic and testable.
 */
export function resolveAction(
  source: string, action: CanonicalAction, id: string, nowISO: string, reviewerId: string | null,
): StatusUpdate | ActionRefusal {
  const cfg = SOURCE_CONFIG[source];
  if (!cfg) return { refused: true, reason: `unknown source '${source}'` };

  if (action === "retry") {
    if (!cfg.applyable) return { refused: true, reason: `retry not supported for '${source}'` };
    // No status flip: apply-proposal accepts apply_failed directly, so retry just re-runs apply
    // (flipping back to an "open" status would risk colliding with the open-per-dedup unique index).
    const retrySet: Record<string, unknown> = { reviewed_at: nowISO };
    if (cfg.hasReviewedBy && reviewerId) retrySet.reviewed_by = reviewerId;
    return { table: cfg.table, id, set: retrySet, applyAfter: true, guardStatus: cfg.appliedValue };
  }

  const set: Record<string, unknown> = {
    status: action === "approve" ? cfg.approvedValue : cfg.rejectedValue,
    reviewed_at: nowISO,
  };
  if (cfg.hasReviewedBy && reviewerId) set.reviewed_by = reviewerId;

  return { table: cfg.table, id, set, applyAfter: action === "approve" && cfg.applyable, guardStatus: cfg.appliedValue };
}
