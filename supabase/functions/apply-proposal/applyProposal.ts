// apply-proposal — pure apply-planning logic (no IO, unit-tested in applyProposal.test.ts).
//
// The single production choke point for the MES agent loops. Given a proposal row and the
// current state of its target production row, planApply() returns exactly what mutation to
// perform (or a refusal). All network/DB IO lives in index.ts; this module stays pure so the
// whitelist, COALESCE-protection, and guard rules are deterministically testable.
//
// Invariants encoded here:
//   • ACTION_WHITELIST is the ONLY set of action_types that may touch production.
//   • auto_approve is limited to low-risk types (archive_event, set_logo_url, trigger_reembed).
//   • curated-field writes (set_logo_url, queue_enrichment) are COALESCE-protected: a field is
//     only written when the current value is empty, so a loop can never overwrite hand-curated data.
//   • an already-satisfied action returns op 'noop', not a redundant write.

export type ProposalStatus =
  | "pending" | "approved" | "rejected" | "auto_approved" | "applied" | "apply_failed";

export interface Proposal {
  id: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  payload: Record<string, unknown>;
  status: ProposalStatus;
}

export type ApplyOp = "update" | "delete" | "reembed" | "noop";

export interface ApplyPlan {
  op: ApplyOp;
  table?: string;
  id?: string;
  set?: Record<string, unknown>;   // op 'update'
  kbIds?: string[];                 // op 'reembed'
  note?: string;                    // op 'noop' explanation
}

export interface ApplyRefusal {
  refused: true;
  reason: string;
}

export type ApplyResult = ApplyPlan | ApplyRefusal;

export function isRefusal(r: ApplyResult): r is ApplyRefusal {
  return (r as ApplyRefusal).refused === true;
}

// action_type -> whether it may be auto-approved by a loop (low-risk only).
export const ACTION_WHITELIST: Record<string, { autoApprove: boolean }> = {
  archive_event: { autoApprove: true },
  set_logo_url: { autoApprove: true },
  trigger_reembed: { autoApprove: true },
  flag_dead_link: { autoApprove: false },
  queue_enrichment: { autoApprove: false },
  remove_kb_row: { autoApprove: false },
  flag_stale_content: { autoApprove: false },
};

// Statuses from which apply-proposal will act. Approving is agent-actions' job; apply consumes
// already-approved / auto-approved rows, plus apply_failed (a retry re-runs the same apply).
const APPLYABLE_STATUSES = new Set<ProposalStatus>(["approved", "auto_approved", "apply_failed"]);

const DIRECTORY_LOGO_FIELDS = new Set([
  "logo", "image", "avatar_url", "event_logo_url", "logo_url", "image_url",
]);

// target_table allowlist: even though only service-role loops write proposals, the choke point
// must never become a general-purpose table writer. Every table-targeting action is confined to
// the curated directory/content tables.
const CURATED_TABLES = new Set([
  "service_providers", "community_members", "investors",
  "trade_investment_agencies", "innovation_ecosystem", "events", "content_items",
]);

function isHttpsUrl(v: unknown): boolean {
  if (typeof v !== "string") return false;
  try { return new URL(v).protocol === "https:"; } catch { return false; }
}

function isEmpty(v: unknown): boolean {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

/** proposal_key is "<source_table>:<uuid>". */
export function parseProposalKey(key: string): { source: string; id: string } | null {
  const idx = key.indexOf(":");
  if (idx <= 0 || idx === key.length - 1) return null;
  return { source: key.slice(0, idx), id: key.slice(idx + 1) };
}

/**
 * Only agent_content_proposals rows are directly applyable through this choke point today; the
 * per-loop staging tables (steward, report-quality, ecosystem, ...) keep their own reviewed apply
 * paths, which agent-actions delegates here incrementally.
 */
export function isApplyableSource(source: string): boolean {
  return source === "agent_content_proposals";
}

/**
 * Decide the mutation for a proposal given the current target row (null when the row is gone).
 * Pure: same inputs -> same plan. Never performs IO.
 */
export function planApply(p: Proposal, currentRow: Record<string, unknown> | null): ApplyResult {
  const wl = ACTION_WHITELIST[p.action_type];
  if (!wl) return { refused: true, reason: `action_type '${p.action_type}' not in whitelist` };
  if (!APPLYABLE_STATUSES.has(p.status)) {
    return { refused: true, reason: `status '${p.status}' is not applyable (need approved/auto_approved)` };
  }

  switch (p.action_type) {
    case "archive_event": {
      if (p.target_table !== "events" || !p.target_id) {
        return { refused: true, reason: "archive_event requires target_table=events + target_id" };
      }
      if (currentRow && currentRow.status === "archived") {
        return { op: "noop", note: "event already archived" };
      }
      return { op: "update", table: "events", id: p.target_id, set: { status: "archived" } };
    }

    case "set_logo_url": {
      const field = String(p.payload.logo_field ?? "");
      const url = p.payload.logo_url;
      if (!p.target_table || !p.target_id) {
        return { refused: true, reason: "set_logo_url requires target_table + target_id" };
      }
      if (!CURATED_TABLES.has(p.target_table)) {
        return { refused: true, reason: `set_logo_url target_table '${p.target_table}' not allowed` };
      }
      if (!DIRECTORY_LOGO_FIELDS.has(field)) {
        return { refused: true, reason: `set_logo_url logo_field '${field}' not allowed` };
      }
      if (!isHttpsUrl(url)) return { refused: true, reason: "set_logo_url requires an https logo_url" };
      // COALESCE-protect: never overwrite an existing logo.
      if (currentRow && !isEmpty(currentRow[field])) {
        return { op: "noop", note: `${field} already set` };
      }
      return { op: "update", table: p.target_table, id: p.target_id, set: { [field]: url } };
    }

    case "flag_dead_link": {
      if (!p.target_table || !p.target_id) {
        return { refused: true, reason: "flag_dead_link requires target_table + target_id" };
      }
      if (!CURATED_TABLES.has(p.target_table)) {
        return { refused: true, reason: `flag_dead_link target_table '${p.target_table}' not allowed` };
      }
      const health = typeof p.payload.health === "number" ? p.payload.health : 0;
      return { op: "update", table: p.target_table, id: p.target_id, set: { data_health: health } };
    }

    case "queue_enrichment": {
      if (!p.target_table || !p.target_id) {
        return { refused: true, reason: "queue_enrichment requires target_table + target_id" };
      }
      if (!CURATED_TABLES.has(p.target_table)) {
        return { refused: true, reason: `queue_enrichment target_table '${p.target_table}' not allowed` };
      }
      const fields = (p.payload.fields ?? {}) as Record<string, unknown>;
      // COALESCE-protect every curated field: only fill blanks, never overwrite.
      const set: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(fields)) {
        if (isEmpty(v)) continue;
        if (!currentRow || isEmpty(currentRow[k])) set[k] = v;
      }
      if (Object.keys(set).length === 0) {
        return { op: "noop", note: "no empty curated fields to fill" };
      }
      return { op: "update", table: p.target_table, id: p.target_id, set };
    }

    case "trigger_reembed": {
      const kbIds = Array.isArray(p.payload.kb_ids) ? (p.payload.kb_ids as string[]) : [];
      if (kbIds.length === 0) return { refused: true, reason: "trigger_reembed missing kb_ids" };
      return { op: "reembed", kbIds };
    }

    case "remove_kb_row": {
      if (!p.target_id) return { refused: true, reason: "remove_kb_row requires target_id" };
      return { op: "delete", table: "mes_knowledge_base", id: p.target_id };
    }

    case "flag_stale_content": {
      // Review-only: approving records the human decision; no production mutation is made here.
      return { op: "noop", note: "content flagged for human review (no direct mutation)" };
    }

    default:
      return { refused: true, reason: `unhandled action_type '${p.action_type}'` };
  }
}
