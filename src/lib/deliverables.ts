/**
 * Deliverables & introductions hub normalisation (MES-188 T15).
 *
 * Unifies the member's owner-scoped deliverable streams into one status-ordered
 * list: service_entitlements (concierge credits — mentor/ecosystem intros,
 * walkthrough/strategy calls) + lead_list_requests (custom lists). Pure +
 * deterministic (nowMs passed in) so it's node-testable. Read-only projection —
 * no writes, no new RLS (both sources are already owner-scoped SELECT).
 *
 * The SLA-breach → Slack alert (charter T15) is a separate approval-gated
 * producer, deliberately not built here; this v1 is the member-facing view.
 */

export type DeliverableStatus =
  | 'available' | 'in_progress' | 'delivered' | 'used' | 'expired' | 'declined';

export interface DeliverableItem {
  id: string;
  /** Source kind for the icon/label. */
  kind: string;
  label: string;
  status: DeliverableStatus;
  detail?: string;
  reportId?: string | null;
}

export interface EntitlementInput {
  /** Row PK. A user can hold MULTIPLE rows of the same `kind` — service_entitlements
   * uniqueness is (source_purchase, kind), so a repeat buyer has e.g. two
   * `mentor_intro` grants. Use this (not `kind`) to key each deliverable so the
   * rows don't collide into one React key and silently drop. */
  id?: string;
  kind: string;
  granted_count: number;
  consumed_count: number;
  expires_at: string | null;
}

export interface LeadRequestInput {
  id: string;
  report_id: string | null;
  status: string; // 'new' | 'in_progress' | 'delivered' | 'declined'
  created_at?: string;
}

const ENTITLEMENT_LABELS: Record<string, string> = {
  mentor_intro: 'Mentor introduction',
  ecosystem_intro: 'Ecosystem introduction',
  walkthrough_call: 'Walkthrough call',
  strategy_session: 'Strategy session',
};

export function entitlementLabel(kind: string): string {
  return ENTITLEMENT_LABELS[kind] ?? kind.replace(/_/g, ' ');
}

const DAY_MS = 86_400_000;

/** Project one entitlement row into a deliverable (nowMs for expiry maths). */
export function entitlementToDeliverable(e: EntitlementInput, nowMs: number): DeliverableItem {
  const remaining = Math.max(0, (e.granted_count ?? 0) - (e.consumed_count ?? 0));
  const expMs = e.expires_at ? Date.parse(e.expires_at) : NaN;
  const expired = Number.isFinite(expMs) && expMs <= nowMs;

  let status: DeliverableStatus;
  let detail: string;
  if (expired) {
    status = 'expired';
    detail = `${e.consumed_count ?? 0} of ${e.granted_count ?? 0} used · expired`;
  } else if (remaining === 0) {
    status = 'used';
    detail = `${e.granted_count ?? 0} of ${e.granted_count ?? 0} used`;
  } else {
    status = 'available';
    const days = Number.isFinite(expMs) ? Math.ceil((expMs - nowMs) / DAY_MS) : null;
    detail = `${remaining} of ${e.granted_count ?? 0} available${days != null ? ` · expires in ${days} day${days === 1 ? '' : 's'}` : ''}`;
  }
  // Key on the row PK when present (a user can hold several rows of the same
  // kind); fall back to kind only when no id was supplied (e.g. bare test input).
  return { id: `ent:${e.id ?? e.kind}`, kind: e.kind, label: entitlementLabel(e.kind), status, detail };
}

const LEAD_STATUS: Record<string, DeliverableStatus> = {
  new: 'in_progress',
  in_progress: 'in_progress',
  delivered: 'delivered',
  declined: 'declined',
};
const LEAD_STATUS_DETAIL: Record<string, string> = {
  new: 'Requested — we’re building it',
  in_progress: 'In progress',
  delivered: 'Delivered to your dashboard',
  declined: 'Not a fit — see notes',
};

export function leadRequestToDeliverable(r: LeadRequestInput): DeliverableItem {
  return {
    id: `lead:${r.id}`,
    kind: 'lead_list',
    label: 'Custom lead list',
    status: LEAD_STATUS[r.status] ?? 'in_progress',
    detail: LEAD_STATUS_DETAIL[r.status] ?? 'In progress',
    reportId: r.report_id,
  };
}

// Sort: actionable/active first (available, in_progress), then delivered, then
// used/expired/declined last. Stable within a bucket.
const STATUS_ORDER: Record<DeliverableStatus, number> = {
  available: 0, in_progress: 1, delivered: 2, used: 3, expired: 4, declined: 5,
};

/** Build the unified, ordered deliverables list. Pure. */
export function buildDeliverables(
  entitlements: readonly EntitlementInput[],
  leadRequests: readonly LeadRequestInput[],
  nowMs: number,
): DeliverableItem[] {
  const items: DeliverableItem[] = [
    // Only entitlements the member actually holds (granted > 0).
    ...entitlements.filter((e) => (e.granted_count ?? 0) > 0).map((e) => entitlementToDeliverable(e, nowMs)),
    ...leadRequests.map(leadRequestToDeliverable),
  ];
  return items.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}
