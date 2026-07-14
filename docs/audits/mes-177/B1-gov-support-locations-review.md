# MES-177 Phase B1 — Government Support location normalisation (REVIEW — awaiting sign-off)

**Status:** proposal only. No DB writes. Migration written *after* sign-off, then staged in
`supabase/migrations/`. **Proposal:** `docs/audits/mes-177/gov-support-location-proposal.csv`
(id, name, location_raw, proposed_location, confidence, rationale — rationale per row so you can
flip any case).

This is the worst-offending directory and had **no prior CSV** (MES-131 covered the other four
tables). Fresh mapping of all **149** `trade_investment_agencies` rows.

## What was proposed
- **149 rows** · confidence **high 98 · medium 44 · low 7**
- **134 changed · 15 unchanged** (already clean `City, ST` / `Australia`)
- **7 → NULL** (all 7 low-confidence): unresolvable `Unknown` rows with junk/unrelated domains and
  no reliable city — NULL is correct (hidden from filter options by the A7 guard; better than a guess).

## Method (applied consistently; each row's rationale states which rule fired)
- **AU street address** → `"City, ST"`, city inferred from the CBD postcode when the address lacks a
  suburb (NSW 2000 = Sydney, VIC 3000 = Melbourne, QLD 4000 = Brisbane, WA 6000 = Perth,
  SA 5000 = Adelaide, ACT 2600 = Canberra). — the `high` bucket. I spot-verified these postcodes.
- **Federal government bodies** (Austrade, Export Finance Australia, Indigenous Business Australia,
  NIAA, Regional Development Australia, Many Rivers, Thrive, Disability Gateway…) → country-level
  **`"Australia"`** (national coverage — a city would mislead). NZ national agencies (NZTE,
  Callaghan Innovation) → **`"New Zealand"`**.
- **Foreign trade agencies HQ'd overseas** (Business France, Enterprise Ireland, JETRO, KOTRA,
  ITA, ProChile, EDC…) → **`"City, Country"`** from the overseas address.
- **Embassies/consulates in ANZ** → the ANZ city they sit in (embassies → Canberra; consulates →
  their named city).
- **`Unknown` + a legit matching domain + a state signal** → capital-city inference at `medium`.
- **`Unknown` + junk/unrelated domain** → **NULL** at `low`.
- **National industry associations**: city when a HQ city is stated (AiGroup, FinTech Australia →
  Sydney), country-level when not (Export Council of Australia, ICC Australia → Australia).

`location_state`/`location_country` are unreliable across this table (verified: e.g. the Uzbekistan
CCI and Danish Trade Council both carry `location_country="australia"`), so proposals lean on the
address string + name first and use `location_state` only to corroborate.

## Please eyeball — genuinely ambiguous rows (all flagged in the CSV)
1. **Chamber of Commerce and Industry of Uzbekistan** → `Tashkent, Uzbekistan` (medium). Its address
   (235 St Georges Terrace, Perth) + domain (cciwa.com) are **mis-sourced from CCIWA**; name +
   `location_state="Tashkent"` drove the call. Confirm foreign, not Perth.
2. **Australia-UK Chamber of Commerce** → `Sydney, NSW` (medium). Location field says Sydney but
   `location_state="England"` — AUKCC may be London-based. Your call.
3. **Danish Trade Council** → `Denmark` (medium). Distinct from the "Trade Council of Denmark in
   Oceania" record (Sydney). Confirm this generic row is the Copenhagen HQ, not the Sydney desk.
4. **FinTech Australia** → `Sydney, NSW` (from its location field), though it's a national body often
   cited as Melbourne-based. Keep Sydney, or make it `Australia`/`Melbourne, VIC`?

## Dedupe candidates surfaced (out of scope for B1 — noted for a later pass)
- **ALABC** (→NULL) vs **Australia-Latin America Business Council** (Sydney) — likely the same body.
- **UK Department for International Trade** (→NULL) vs **Department for Business and Trade** (London).
- **Estonian Australian Chamber** vs **EACCI Estonian…** (both Sydney).
- **Australia Malaysia Chamber (AMCC)** (→NULL, junk domain) — the enrichment playbook's canonical
  "fabricated/mis-sourced org" pattern; agent quarantined it correctly.

## Migration design (written after sign-off)
- Add a **`location_raw`** snapshot column (idempotent), copy the current `location` into it for the
  changed rows, then id-keyed UPDATE `location` from the reviewed CSV (NULL for the 7). Reversal =
  restore from `location_raw`, drop the column (step4d pattern).
- **Preview-safe** (id-scoped, no-op on empty DB), **idempotent**, **reversible**. Timestamp after
  `20260714093000`. No RLS/grant/frontend change — the clean values just make the existing
  gov-support location filter options tidy.

## Sign-off
- [ ] Approve the mapping (or amend specific rows in the CSV — rationale column tells you why each is what it is)
- [ ] Resolve the 4 ambiguous rows above
- [ ] Confirm the 7 NULLs stay NULL
- [ ] Green-light writing the guarded `location_raw`-snapshot migration from the (possibly amended) CSV
