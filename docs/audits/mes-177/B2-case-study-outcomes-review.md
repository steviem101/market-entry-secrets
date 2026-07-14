# MES-177 Phase B2 — Case-study outcome classification (REVIEW — awaiting sign-off)

**Status:** proposal only. No DB writes. The migration is not written yet — it's finalised
*after* you resolve the decision points below, then staged in `supabase/migrations/` for merge.

**Proposal:** `docs/audits/mes-177/case-study-outcome-proposal.csv` (id, title, proposed_outcome,
confidence, rationale). **Non-NULL recheck:** `case-study-outcome-recheck.csv` (header only — **0
contradictions** found among the 47 already-classified studies).

## What was proposed
Of the **55 NULL-outcome** published case studies:
- **50 classified** — `unsuccessful` 17 · `successful` 14 · `scaling` 11 · `acquired` 7 · `ipo` 1
- **5 deliberately left NULL** (better NULL than a guess — MES-169): Peloton (still operating, just
  struggling), Pizza Hut (a franchisee class action the franchisor *won*; company operates on),
  Valve/Steam & Viagogo (ACCC penalties but still trading), WeWork (the content itself rates it
  "Mixed" — the ANZ network held even as the global parent imploded).
- Confidence of the 50: high 18 · medium 29 · low 3.

I spot-verified a sample against the live content; the classifications are grounded (e.g. Volt Bank's
title is literally "Collapsed", Sezzle "found itself in an existential crisis by 2022"). The
author-written titles strongly corroborate the sensitive class: **11 of the 17 `unsuccessful` titles
literally say** Withdrew / Struggled / Collapsed / Exited / Cancelled / Lost.

## ⚠️ Decision 1 — `acquired` vs `successful` (7 rows, the main call)
`acquired` was proposed wherever a company's *headline corporate outcome* was a buy-out — but for a
**market-entry** case study, the outcome arguably describes whether the *ANZ entry* worked, not the
parent's later global fate. Two patterns in the 7:
- **Acquisition IS the entry arc** → `acquired` fits: **Contino** ("opened Melbourne 2017 → acquired
  an Australian company 2018 → sold 2019"; the ANZ client base was the exit catalyst).
- **ANZ entry succeeded; acquisition was a separate global event** → arguably `successful`:
  **Blue Prism** (blurb is a pure success story — "20,000 hours back into Telstra"), **Featurespace,
  Mimecast, Onfido** (successful ANZ entry; parent later acquired), **Darktrace** & **PropertyGuru**
  (low confidence; IPO-then-taken-private / strategic-stake unwinds).

**My recommendation:** keep `acquired` only for **Contino**; reclassify **Blue Prism, Featurespace,
Mimecast, Onfido** → `successful`; and leave **Darktrace, PropertyGuru** NULL (genuinely nuanced,
already low-confidence). Your call — I'll apply whatever you decide.

## Decision 2 — the 17 `unsuccessful` (please eyeball; this is the public "Failure" label)
Affirm, Binance Australia Derivatives, Carl's Jr., Catch.com.au, Debenhams, Deliveroo, Esprit,
Foodora, Gap, Groupon, Kaufland, Laybuy, Menulog, MilkRun, Sezzle, Uber Carshare, Volt Bank.
13 are high-confidence (clear administration/exit/wind-down). 4 are medium and worth a glance:
**Binance** (AFSL cancelled — the *licensed derivatives* entry ended, the brand persists),
**Groupon** (became marginal rather than a hard exit), **Sezzle** (scaled back + ASX-delisted —
effective withdrawal), **Uber Carshare** (exited late 2025). If you'd rather any of these be NULL
than "Failure", say which.

## Migration design (written after sign-off, not now)
- Guarded, **id-keyed** UPDATE of `content_company_profiles.outcome` from the reviewed CSV, **only
  `WHERE outcome IS NULL`** (a latch — never overwrites a human value), only for ids with a
  non-empty proposed outcome.
- **Preview-safe** (no matching ids on an empty DB → no-op); **reversible** (reverse sets exactly
  the applied ids back to NULL). Idempotent. Timestamp after `20260714093000`.

## Note
MES-178 (#436) merged ~concurrently, importing 65 case-study *drafts*. This pass covers only
`status='published'` studies, so those drafts are out of scope here (they'll want their own outcome
pass once published).

## Sign-off
- [ ] Decision 1 (acquired vs successful) — confirm the recommendation or amend
- [ ] Decision 2 (the 17 `unsuccessful`) — approve, or list any to hold as NULL
- [ ] Approve the 5 NULLs staying NULL
- [ ] Green-light writing the guarded fill-NULL migration from the (possibly amended) CSV
