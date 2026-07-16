/**
 * Single source of truth for tier prices shown on upgrade gates.
 *
 * Historically `ReportGatedSection.tsx` hardcoded its own `{growth:'$99',
 * scale:'$999'}` map separately from `PERSONA_CONTENT[persona].pricing.tiers`
 * in `src/config/personaContent.ts`, which is the authoritative pricing
 * display. Two copies of the same number drift; this file centralises so
 * any upgrade gate / banner uses the same value, and a future change can
 * be made in one place (or wired to a real API).
 *
 * Note: this is the **display** price only. The underlying Stripe checkout
 * uses `STRIPE_GROWTH_PRICE_ID` / `STRIPE_SCALE_PRICE_ID` via the
 * `create-checkout` edge function — keep this map aligned with whatever
 * those price objects are configured for.
 */

export const TIER_DISPLAY_PRICE: Record<string, string> = {
  growth: '$199',
  scale: '$999',
};

export const tierDisplayPrice = (tier: string): string | undefined =>
  TIER_DISPLAY_PRICE[tier];
