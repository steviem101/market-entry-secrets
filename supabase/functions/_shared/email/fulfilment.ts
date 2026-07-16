// supabase/functions/_shared/email/fulfilment.ts
//
// Single source of truth for the paid-tier fulfilment promise, shared across
// the transactional emails that make it (paymentConfirmation + reportCompleted)
// — MES-197 / T16a. Keeping the Calendly booking links, the "what's coming"
// bullets, and the delivery SLA in ONE place stops the emails from drifting
// apart (and from drifting off the in-app copy).
//
// NOTE: the in-app T13 booking banner links live in src/lib/sessionBooking.ts —
// a deliberate cross-runtime duplicate (frontend Vite vs edge Deno cannot share
// a module). Keep the Calendly URLs here in lockstep with that file and with
// the pricing/tier copy (CLAUDE.md §12: tier copy moves together).

export interface TierFulfilment {
  /** CTA label for the booking button. */
  bookLabel: string;
  /** Calendly event URL for this tier's included advisor session (D7). */
  calendly: string;
  /** What the paid tier includes — brokered after the session, never guaranteed (D5). */
  whatsComing: string[];
  /** Whether this tier includes a curated lead list (scale+). */
  includesLeadList: boolean;
}

export const FULFILMENT: Record<string, TierFulfilment> = {
  growth: {
    bookLabel: "Book your 20–30 min walkthrough call",
    calendly: "https://calendly.com/stephen-marketentrysecrets/30min",
    whatsComing: [
      "A 20–30 minute market-entry walkthrough with your advisor",
      "1 personal mentor introduction",
      "3 ecosystem introductions",
    ],
    includesLeadList: false,
  },
  scale: {
    bookLabel: "Book your 60-minute strategy session",
    calendly: "https://calendly.com/stephen-marketentrysecrets/60-minute-meeting",
    whatsComing: [
      "A 60-minute market-entry strategy session",
      "2 mentor introductions + priority ecosystem access",
      "Your curated lead list, tuned after the session",
    ],
    includesLeadList: true,
  },
};

// Delivery SLA — the ONE place these windows are stated. Identical to the
// pricing/tier and deliverables-hub copy (T3/T15). If a window changes, change
// it here only.
export const SLA = {
  leadList: "within 48 hours",
  intros: "within 7 days of your session",
} as const;

const LEGACY_TIERS: Record<string, string> = { premium: "growth", concierge: "enterprise" };

/** Lowercase + map legacy tier labels (premium→growth, concierge→enterprise). */
export function normalizeTier(raw: unknown): string {
  const t = String(raw ?? "").trim().toLowerCase();
  return LEGACY_TIERS[t] ?? t;
}

/**
 * "What's coming to your hub and when" — a single sentence composed from the
 * SLA constant, tuned to whether the tier includes a lead list. Empty string
 * for tiers without a defined fulfilment (e.g. enterprise/bespoke, free).
 */
export function hubSlaSentence(tier: string): string {
  const f = FULFILMENT[normalizeTier(tier)];
  if (!f) return "";
  return f.includesLeadList
    ? `Your introductions land in your member hub ${SLA.intros}, and your curated lead list follows ${SLA.leadList}.`
    : `Your introductions land in your member hub ${SLA.intros}.`;
}
