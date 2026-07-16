# Market Entry Secrets — Refund Policy

> **Decision record: MES-188 D5, decided 2026-07-16 by Stephen (owner).**
> This supersedes the charter's earlier placeholder D5 ("no advertised refund copy —
> case-by-case internally"). The owner chose a **published, customer-forward** policy:
> a 14-day satisfaction window, a delivered-vs-undelivered split on partial refunds,
> and a satisfaction refund on the digital report where the paid sections haven't been
> substantially accessed. Trade-off accepted: higher trust at checkout vs a higher
> refund-request rate (tracked as a launch guardrail).
>
> **Not legal advice.** Reviewed for consistency with the Australian Consumer Law (ACL);
> have counsel confirm before publishing the customer-facing page (`/refund-policy`).
> This file is both the decision record and the source copy for that page (built in T8).

**Last updated: 2026-07-16 · Applies to Growth and Scale one-time purchases (AUD)**

## 1. Your rights come first
Nothing in this policy limits your rights under the **Australian Consumer Law**. Our
products come with guarantees that can't be excluded. If something we deliver has a
**major failure** — it's substantially unfit for purpose or not as described — you're
entitled to a refund or replacement, regardless of anything below.

## 2. What you're buying
Your purchase has two kinds of deliverables, treated differently:
- **Digital deliverables** — the unlocked report sections (and, for Scale, your curated
  lead list). Delivered instantly.
- **Human deliverables** — your advisor walkthrough call or strategy session, and your
  mentor/ecosystem introductions. Delivered over the days after purchase.

## 3. The report and lead list (digital, instant)
Because these unlock immediately, we offer a **14-day satisfaction refund** *provided the
paid sections have not been substantially accessed*. If you've opened and read the premium
sections (or exported the lead list), that value has been delivered and those items are
non-refundable — except for a major failure under the ACL (§1).

## 4. Your advisor session and introductions (human service)
- **Before delivery:** if you cancel a booked walkthrough call or strategy session **at
  least 24 hours** beforehand, and no introductions have been made, that portion is
  **fully refundable**.
- **After delivery:** once a call or session has been held, or an introduction has been
  made, that portion has been delivered and is **non-refundable**.
- **Partial delivery → partial refund:** if some human deliverables are complete and
  others aren't (e.g. you've had the call but not your introductions), we refund the
  **undelivered portion**.

## 5. Introductions are brokerage, not a guarantee
We introduce you to mentors and ecosystem contacts in good faith. We **can't guarantee**
a mentor will respond, accept, or produce any particular outcome — an introduction being
made is the deliverable, not the other party's reply. A non-response is not grounds for a
refund.

## 6. How to request a refund
Email **refunds@marketentrysecrets.com** within the applicable window, from your account
email, with your order reference and a brief reason. We aim to respond within **2 business
days** and to process approved refunds to your original payment method within **5–10
business days**.

## 7. Things we may decline
Repeated refund requests, requests after substantially accessing paid content, or requests
that appear to abuse this policy may be declined (your ACL rights still stand). Chargebacks
filed without contacting us first may delay resolution.

## 8. Questions
Contact **support@marketentrysecrets.com** — we'd always rather make it right than process
a refund.

---

## Internal implementation notes (not customer-facing — for T8/MES-195)
- **Refunds do NOT auto-revoke tier.** The Stripe webhook only handles
  `checkout.session.completed` (CLAUDE.md §8), so a refund is a **manual** two-step:
  refund in Stripe **and** downgrade `user_subscriptions` via service role. T8 must ship a
  documented runbook or a small admin action so a refund actually removes access.
- **Enforceability of the terms:** "substantially accessed" leans on `report_viewed`
  funnel events (MES-191); "introduction made" / "session held" lean on the
  `service_entitlements` fulfilment status (built in T8). So the delivered-vs-undelivered
  split is data-backed, not just aspirational.
- **Guardrail:** track refund rate post-launch (charter §metrics); if it climbs, revisit
  the 14-day window or the "substantially accessed" threshold.
