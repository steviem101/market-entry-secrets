## Fix: Stripe checkout tier/price mismatch (SEC critical)

**Bug:** `supabase/functions/create-checkout/index.ts` accepts a client-supplied `price_id`. For subscription tier checkouts (no `lead_database_id`), it uses `directPriceId` without verifying it matches `PRICE_IDS[tier]`. An authenticated user can post `{ tier: "enterprise", price_id: "<growth price>" }`, pay the cheaper price, and the webhook grants them `enterprise` (tier comes from metadata).

**Fix (one guard, server-side):**

In `create-checkout/index.ts`, right after resolving `directPriceId` / `priceId`, add:

```ts
// If a direct price_id was supplied WITHOUT a lead_database_id,
// it must exactly match the server-side price for the requested tier.
if (directPriceId && !extraMetadata.lead_database_id) {
  if (!PRICE_IDS[tier] || directPriceId !== PRICE_IDS[tier]) {
    logError("create-checkout", "price_id/tier mismatch", { tier });
    return new Response(JSON.stringify({ error: "Invalid price for tier" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
```

Existing lead-database branch (validates against `lead_databases.stripe_price_id`) is unchanged. Tier-only flow (no `price_id`) is unchanged.

**Verify:** re-run security scan; mark finding fixed with explanation.

**Then:** publish, and re-run Lighthouse in SEO tab.

No frontend changes — `useCheckout` never sends `price_id` for tier upgrades.