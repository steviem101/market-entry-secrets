# Trade & Investment Agencies — Phase 3.5 staging review (2026-05-09)

This document is the manual diff review gate before Phase 3.6 applies the
staged enrichment to `trade_investment_agencies`. The full staging table
contains **140 rows** (139 `pending`, 1 `invalid`); 12 representative samples
are shown here.

## Summary stats

| Bucket | Source | Total | Staged | Pending | Invalid |
|---|---|---|---|---|---|
| All agencies | `trade_investment_agencies` | 140 | 140 | 139 | 1 |
| Smoke test (3) | Austrade, AKBC, FACCI | — | 3 | 3 | 0 |
| Bulk batches (1–G, 137 records) | research sub-agents | — | 137 | 136 | 1 |

**Confidence distribution** (from the agent self-reports during dispatch):
~104 high, ~33 medium, 1 low (ASEAN Chamber — no standalone site exists),
1 invalid (`Australia Malaysia Chamber of Commerce (AMCC)` — agent confirmed
the org does not exist; the listed website was unrelated to AU-MY trade).

**Known duplicates flagged for Phase 4 dedup** (agents independently
verified pairs share the same canonical website):
- Danish Trade Council ⇄ Danish Trade Council / Danish Connect (`australien.um.dk`)
- DCCQ - Dutch Chamber of Commerce Queensland ⇄ Dutch Chamber of Commerce Queensland (`dccq.org`)
- Estonian Australian Chamber of Commerce ⇄ Estonian Chamber of Commerce (`eacci.com.au`)
- ICCWA - Indonesian Chamber of Commerce Western Australia ⇄ Indonesian Chamber of Commerce Western Australia (`iccwa.net.au`)
- New Zealand Middle East Business Council ⇄ NZ-Middle East Business Council (NZMEBC) (`nzmebc.org.nz`)
- JETRO - Japan External Trade Organisation ⇄ JETRO - Japan External Trade Organization (Org/Organisation spelling variant — both valid hits, same org)

## Apply rules — quick reminder (Phase 3.6 spec)

| Field | Apply rule |
|---|---|
| `tagline`, `basic_info`, `why_work_with_us`, `linkedin_url`, `government_level` | overwrite if currently null/empty |
| `description` | overwrite if currently null, length < 100, OR length = 400 (truncated) |
| `description_full` | overwrite if currently null and new value meaningfully longer than description |
| `location_city` | overwrite if currently null OR matches address pattern (Street, " St ", Avenue, Level, Suite, Floor, House, Building, Tower, or starts with digit) |
| `location_state` | overwrite if currently null |
| `jurisdiction`, `sectors_supported`, `target_company_stage` | overwrite if currently empty |
| `support_types` | **REPLACE entirely** (current values are over-tagged defaults) |
| `experience_tiles` | **REPLACE entirely** (only 6 records had any) |
| Booleans/numerics (`is_government_funded` etc.) | overwrite if currently null |
| `domain`, `website_url` | overwrite if `needs_re_research = true` AND verified value differs |
| `needs_re_research` | set to false after successful apply |

---

## Federal agencies (3)

### 1. Austrade — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `austrade.gov.au` | `austrade.gov.au` (unchanged) |
| tagline | "We're matching Australian ideas, innovation and business with global demand." | "Connecting Australian businesses to the world and the world to Australian business" |
| description_short | "The Australian Trade and Investment Commission helps Australian businesses succeed in international markets…" *(2 sentences)* | "Austrade is the Australian Government's international trade promotion, investment and visitor attraction agency. It helps exporters grow, attracts foreign investment and strengthens tourism and international education." |
| basic_info | (existing 350-char copy — likely AI-generated default) | **"Federal trade and investment promotion agency of the Australian Government"** |
| why_work_with_us | (existing 240-char copy — generic default) | "Austrade is the official entry point for foreign investors and buyers into Australia, offering free market intelligence, in-market introductions and coordinated support across federal and state agencies." |
| location_city | **"300 Barangaroo Ave"** ❌ (street, not city) | **"Sydney"** ✅ |
| government_level | `federal` | `federal` (unchanged) |
| jurisdiction | `[australia, global]` (lowercase, vague) | `[AU]` (ISO codes) |
| sectors_supported | `[all]` (placeholder) | `[Sector Agnostic]` (canonical enum) |
| support_types | `[grants, export_finance, market_intelligence, trade_missions, landing_program, matchmaking]` | `[market_intelligence, matchmaking, trade_missions, advocacy, grants, regulatory_guidance, networking]` *(removed export_finance — Austrade doesn't do export finance, that's EFA; added advocacy + regulatory_guidance + networking)* |
| experience_tiles count | 3 | 0 |

**Apply rules note:** support_types is a full replace, removing the incorrect `export_finance` and `landing_program` defaults. location_city overwrites because current matches the "Avenue/digit-prefix" pattern.

### 2. KOTRA — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `kotra.or.kr` | `kotra.or.kr` (unchanged) |
| tagline | (empty) | "Korea's national trade and investment promotion agency" |
| description_short | "CEO's Message…" (raw site copy, truncated mid-sentence) | "KOTRA Sydney is the Australian office of Korea's state-funded trade and investment promotion agency, helping Australian and Korean businesses connect through trade, investment, and partnership opportunities." |
| basic_info | (empty) | "Australian office of South Korea's national trade and investment promotion agency." |
| why_work_with_us | (empty) | "If you are a Korean company entering Australia, or an Australian company sourcing from or partnering with Korea, KOTRA Sydney provides free government-backed market intelligence, buyer/supplier matching and trade mission access." |
| location_city | **"KOTRA Bldg"** ❌ | **"Sydney"** ✅ (ANZ office, not Seoul HQ — per spec for foreign agencies) |
| government_level | (empty) | `bilateral` *(KOTRA Sydney is bilateral AU-KR rather than purely federal — defensible)* |
| jurisdiction | (null) | `[Australia, South Korea]` |
| sectors_supported | (null) | `[Sector Agnostic]` |
| support_types | `[market_intelligence, matchmaking, trade_missions]` | `[market_intelligence, matchmaking, networking, trade_missions, advocacy]` |
| experience_tiles count | 0 | 3 |

**Reviewer flag:** the agent classified KOTRA as `bilateral` rather than `international`. Worth a sanity check — KOTRA is structurally a foreign federal agency operating an Australian office, similar to JETRO/Enterprise Ireland. Compare with Enterprise Ireland below (which got `international`). You may want to nudge KOTRA to `international` for consistency.

### 3. Enterprise Ireland — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `enterprise-ireland.com` | `enterprise-ireland.com` (unchanged) |
| tagline | "Enterprise Ireland is the state agency responsible for the development and growth of Irish enterprises in world markets." *(over-long tagline)* | "Helping Irish business go global in Australia & New Zealand" |
| description_short | "Ireland's trade and innovation agency supporting Irish enterprises…" | "Enterprise Ireland's ANZ office connects Australian and New Zealand businesses with innovative Irish export companies across digital tech, fintech, healthtech, agribusiness and construction." |
| basic_info | (existing default copy) | "Irish state agency promoting Irish exporters to Australian and New Zealand buyers via its Sydney office." |
| location_city | **"East Point Business Park"** ❌ (Dublin HQ address) | **"Sydney"** ✅ (ANZ office per spec) |
| government_level | `federal` | **`international`** *(more precise — foreign state agency)* |
| jurisdiction | (null) | `[Australia, New Zealand]` *(scope of the ANZ office)* |
| sectors_supported | (null) | `[Fintech, Healthtech, Agritech, Construction, Manufacturing, Financial Services]` |
| support_types | `[market_intelligence, matchmaking, trade_missions]` | `[matchmaking, market_intelligence, trade_missions, networking, advocacy]` |
| experience_tiles count | 3 | 2 |

**Reviewer flag:** Enterprise Ireland's `government_level` correctly went from `federal` (wrong; it's a foreign agency) → `international`. KOTRA above got `bilateral` for the same situation; please reconcile during review.

---

## State bodies (2)

### 4. Investment NSW — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `investment.nsw.gov.au` | `investment.nsw.gov.au` (unchanged) |
| tagline | "NSW Government's agency for attracting international investment" | "NSW Government's economic development and investment attraction agency" |
| description_short | "Investment NSW leads the NSW Government's efforts…" | "Investment NSW is the NSW Government's economic development agency, attracting global investment, supporting exporters, and helping businesses establish, expand and thrive in New South Wales." |
| basic_info | (existing default copy) | "NSW state government agency for investment attraction, trade and economic development, headquartered in Sydney." |
| why_work_with_us | (existing default copy) | "Investment NSW provides international companies with a single, government-backed entry point into NSW — Australia's largest economy — offering market intelligence, matchmaking, site selection, regulatory navigation, and access to grant and innovation programs." |
| location_city | `Sydney` | `Sydney` (unchanged) |
| government_level | `state` | `state` (unchanged) |
| jurisdiction | `[nsw, australia]` | `[New South Wales]` |
| sectors_supported | `[fintech, technology, defence, professional_services]` *(non-canonical strings)* | `[Fintech, Cleantech, Deep Tech, Defence, Mining, Foodtech, Healthtech, Manufacturing, Space]` |
| support_types | `[market_intelligence, matchmaking]` | `[market_intelligence, matchmaking, networking, trade_missions, advocacy, grants, regulatory_guidance]` |
| experience_tiles count | 3 | 2 |

### 5. Trade and Investment Queensland — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `tiq.qld.gov.au` | `tiq.qld.gov.au` (unchanged) |
| tagline | "Connecting Queensland business to the world…" | "Supporting Queensland exporters and global investors" |
| description_short | "Trade and Investment Queensland helps Queensland businesses grow internationally…" | "Trade and Investment Queensland (TIQ) is the Queensland Government's dedicated global business agency…" |
| basic_info | (empty) | "Queensland state government statutory body for trade promotion and investment attraction, headquartered in Brisbane." |
| why_work_with_us | (empty) | "TIQ provides international companies with a free, government-backed gateway into Queensland, including in-market advisors, investor matchmaking, and access to grants and incentives for establishing operations." |
| location_city | **"1 William Street"** ❌ | **"Brisbane"** ✅ |
| government_level | `state` | `state` (unchanged) |
| jurisdiction | `[queensland, australia]` | `[Queensland]` |
| sectors_supported | `[agritech, tourism, resources, energy, technology]` *(non-canonical)* | `[Mining, Foodtech, Manufacturing, Deep Tech, Healthtech]` |
| support_types | `[market_intelligence, trade_missions, matchmaking]` | `[market_intelligence, matchmaking, networking, trade_missions, landing_program, advocacy, grants]` |
| experience_tiles count | 0 | 0 |

**Reviewer flag:** new sector list dropped `tourism` and `agritech` (current values). Tourism is genuinely no longer in TIQ's remit (it's Tourism & Events Queensland), but Agritech / Foodtech overlap is plausible. Worth a sanity check.

---

## Bilateral chambers (3)

### 6. FACCI - French-Australian Chamber of Commerce & Industry — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `facci.com.au` | `facci.com.au` (unchanged) |
| tagline | "Welcome to the French-Australian business community. Networking, Industry Committees, events and business opportunities." *(over-long)* | "The leading French-Australian business network since 1899." |
| description_short | "Official Company Page \| The French-Australian Chamber of Commerce & Industry (FACCI) was founded in 1899…" *(truncated, length=400)* | "FACCI is the leading bilateral chamber promoting commerce between France and Australia. Founded in 1899, it supports 500+ members across five Australian chapters with market entry and networking services." |
| location_city | **"Level 8"** ❌ | **"Sydney"** ✅ |
| government_level | (empty) | `bilateral` |
| jurisdiction | (null) | `[AU, FR]` |
| sectors_supported | (null) | `[Sector Agnostic]` |
| support_types | `[networking, matchmaking, market_intelligence]` | `[networking, matchmaking, advocacy, training, landing_program, market_intelligence]` |
| experience_tiles count | 0 | 0 |

### 7. Australia-Korea Business Council (AKBC) — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `akbc.com.au` | `akbc.com.au` (unchanged) |
| tagline | "Maximising your potential in the Australia-Korea relationship." | "Australia's national body advancing the Australia-Korea economic relationship." |
| description_short | "The Australia-Korea Business Council (AKBC) is Australia's only independent national body…" *(truncated, length=400)* | "AKBC is Australia's only independent national body fostering bilateral trade and investment with South Korea. Member-based and led by senior industry/government leaders, it convenes networking, advocacy and trade-mission activity." |
| location_city | **"121 Exhibition Street"** ❌ | **"Melbourne"** ✅ *(agent verified head office is Melbourne, not Sydney as I had hinted in the smoke-test prompt)* |
| government_level | (empty) | `bilateral` |
| jurisdiction | (null) | `[AU, KR]` |
| sectors_supported | (null) | `[Sector Agnostic]` |
| support_types | `[networking, matchmaking, market_intelligence]` | `[networking, advocacy, matchmaking, trade_missions, training]` |
| experience_tiles count | 0 | 0 |

### 8. European Australian Business Council (EABC) — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `eabc.com.au` | `eabc.com.au` (unchanged) |
| tagline | (empty) | "Premier corporate forum advancing Europe-Australia trade and investment" |
| description_short | "The European Australian Business Council (EABC) is one of the premier and most effective corporate forums in Australia…" *(truncated, length=400)* | "Non-profit bilateral business council promoting trade, investment and policy dialogue between Europe and Australia. Sydney-based with a Brussels presence." |
| basic_info | (empty) | "Bilateral non-profit business council connecting European and Australian companies and institutions." |
| why_work_with_us | (empty) | "EABC gives European firms a credentialed Australian platform — and Australian firms a Brussels gateway — through high-level government and corporate networks for market entry, advocacy and policy intelligence." |
| location_city | **"43 Phillip Street"** ❌ | **"Sydney"** ✅ |
| government_level | (empty) | `bilateral` |
| jurisdiction | (null) | `[Australia, European Union]` |
| sectors_supported | (null) | `[Sector Agnostic, Financial Services, Defence, Cleantech, Manufacturing]` |
| support_types | `[networking, matchmaking, market_intelligence]` | `[advocacy, networking, market_intelligence, matchmaking, regulatory_guidance]` |
| experience_tiles count | 0 | 4 |

---

## Truncated descriptions (2 — were length=400, now full)

### 9. Callaghan Innovation — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `callaghaninnovation.govt.nz` | `callaghaninnovation.govt.nz` (unchanged) |
| tagline | "New Zealand's innovation agency accelerating tech commercialisation" | "New Zealand's innovation agency — powering R&D and backing Kiwi businesses" |
| description_short | "Callaghan Innovation accelerates the commercialisation of innovation by providing R&D grants…" | "New Zealand's government innovation agency providing R&D grants, the R&D Tax Incentive, scientific services, and commercialisation support to help businesses innovate and grow globally." |
| location_city | `Wellington` | `Lower Hutt` *(NB: agent corrected — HQ is in Lower Hutt, not Wellington proper)* |
| government_level | `federal` | `federal` (unchanged) |
| jurisdiction | `[new_zealand]` | `[New Zealand]` |
| sectors_supported | `[technology, deeptech, manufacturing]` *(non-canonical)* | `[Healthtech, Cleantech, Deep Tech, Manufacturing, Foodtech, Agritech]` |
| support_types | `[grants, market_intelligence, matchmaking]` | `[grants, market_intelligence, matchmaking, networking, training, regulatory_guidance]` |

**Reviewer note:** the agent's research notes flagged that the NZ government announced intent to disestablish Callaghan Innovation in Jan 2025; the agency is still operating but this might warrant a future review.

### 10. FinTech Australia — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `fintechaustralia.org.au` | `fintechaustralia.org.au` (unchanged) |
| tagline | "Australia's peak body for the fintech industry" | "Australia's peak industry body for fintech" |
| description_short | "FinTech Australia is the peak industry body for Australian fintech companies, advocating for a regulatory environment…" | "Not-for-profit peak industry body representing 400+ Australian fintech companies through advocacy, engagement, and ecosystem growth programs." |
| basic_info | (empty) | "Sydney-based not-for-profit peak industry body for Australian fintech, founded 2015." |
| why_work_with_us | (empty) | "FinTech Australia connects international fintechs to 400+ Australian member companies, regulators, and policymakers, accelerating market entry through advocacy, networking events, and ecosystem introductions." |
| location_city | `Sydney` | `Sydney` (unchanged) |
| government_level | `industry` | `industry` (unchanged) |
| jurisdiction | `[australia]` | `[Australia]` |
| sectors_supported | `[fintech]` | `[Fintech, Financial Services]` |
| support_types | `[networking, advocacy, market_intelligence]` | `[advocacy, networking, matchmaking, regulatory_guidance, market_intelligence, trade_missions]` |
| experience_tiles count | 0 | 3 |

---

## Wrong / missing domain (2)

### 11. Haymarket HQ — `pending` ✅

| field | current | new |
|---|---|---|
| verified_domain | `haymarkethq.com` | `haymarkethq.com` (unchanged — verified as canonical) |
| tagline | "Haymarket HQ supports tech companies to land, launch and win new markets." | "Land, launch & win new customers across Australia and APAC" |
| description_short | "Haymarket HQ supports tech. companies to start and expand into new markets…" *(truncated)* | "Sydney-based market-entry hub helping tech companies land, launch and grow across Australia and the Asia-Pacific via country-manager-as-a-service, go-to-market programs and a coworking hub." |
| location_city | **"Level 2/63 Dixon Street"** ❌ | **"Sydney"** ✅ |
| government_level | (empty) | `industry` |
| jurisdiction | (null) | `[Australia, Asia-Pacific]` |
| sectors_supported | (null) | `[Sector Agnostic]` |
| support_types | `[market_intelligence, matchmaking, landing_program]` | `[landing_program, matchmaking, networking, training, market_intelligence]` |
| experience_tiles count | 0 | 4 |

### 12. ASEAN Chamber of Commerce Inc. — `pending` ⚠️ (low confidence)

| field | current | new |
|---|---|---|
| verified_domain | (null) | **(empty — agent could not find a standalone official site)** |
| tagline | (empty) | "Connecting Australian and ASEAN business communities" |
| description_short | "The ASEAN Chamber of Commerce Inc. was formed on 13 July 2018." | "Perth-based non-profit chamber formed in 2018 to foster business, trade, and cultural ties between Western Australia and the ten ASEAN member states." |
| location_city | **"St Georges Terrace"** ❌ | **"Perth"** ✅ |
| government_level | (empty) | `bilateral` |
| jurisdiction | (null) | `[Australia, ASEAN]` |
| sectors_supported | (null) | `[Sector Agnostic]` |
| support_types | `[networking, matchmaking, market_intelligence]` | `[networking, advocacy, matchmaking]` *(removed market_intelligence — they don't appear to actually publish market intel)* |

**Reviewer flag:** This is the only `low` confidence record from bulk research. The agent verified org existence + Perth HQ via LinkedIn but found no standalone official website — `verified_domain` is empty. The agent confirmed it's distinct from ACCI Malaysia, AustCham ASEAN, and the Australia-ASEAN Business Council. Recommend either: (a) approve and accept that the org has minimal public footprint, or (b) reject this row and consider archiving the source record entirely. **The Phase 3.6 apply rule for `domain` would not overwrite the existing null with the empty string, so this is a benign-no-op for `domain` regardless.**

---

## Cross-cutting reviewer questions

1. **`government_level` reconciliation for foreign agencies.** KOTRA → `bilateral`, Enterprise Ireland → `international`. Both are foreign federal agencies running an Australian office. Pick a single convention (recommendation: `international` for foreign federal agencies; reserve `bilateral` for member-funded business councils like AKBC/FACCI).

2. **`location_city` cleanup is high-impact.** Of the 12 samples, 7 had street addresses or building names where `location_city` belongs (Austrade, KOTRA, Enterprise Ireland, TIQ, FACCI, AKBC, EABC, Haymarket, ASEAN — actually 9). The Phase 3.6 regex rule should catch all of these.

3. **The 1 invalid record** — `Australia Malaysia Chamber of Commerce (AMCC)` — agent confirmed this org does not exist (the legitimate AU-MY body is Australia Malaysia Business Council, AMBC, which is a separate record). Recommend: skip during apply, then archive the source row in a follow-up.

4. **Duplicates** — six dup pairs were independently confirmed by separate agents converging on the same canonical site. These need explicit handling in Phase 4 (merge → keep one, archive the other; preserve any non-overlapping `contact_persons` rows during the migration to `agency_contacts`).

## Next step

If the diffs above look right, reply "apply" and I'll run Phase 3.6
(per-field upsert against the apply rules above), set
`needs_re_research = false` on success, and run the post-enrichment audit
from §3.7. If you want changes to specific records first, call them out
and I'll adjust the staging row before applying.

**STOP.** Awaiting approval.
