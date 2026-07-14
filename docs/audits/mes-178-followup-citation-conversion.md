# MES-178 follow-up — staged citation conversion (audit W2)

**Status: proposed, NOT applied.** Converts each enriched draft's
`sources_markdown` into `case_study_sources` rows so citations match the new
bodies. `sources_markdown` is editorial-only per the ticket, so a human reviews
labels and adds URLs for the prose-only references below, then applies
`out/enrichment/sources_proposal.sql`.

- **Additive, insert-only:** new rows skip any URL already present and are
  numbered after the current max citation. Existing citations are never
  deleted (several drafts are prose-only, so a blind replace would strip live
  pages down to 0-1 sources). Editorial removes the stale pre-enrichment
  citations by hand — the 7 replace targets still carry those until then.
- Bare-URL references get a domain-host label (editorial should polish).
- Prose-only references with **no URL** cannot be rows (`url` is NOT NULL) —
  listed per target for an editorial URL.

| Live slug | Action | Sources emitted | Needs editorial URL |
|---|---|---:|---:|
| `netflix-streaming-australia-launch` | fill | 7 | 0 |
| `afterpay-buy-now-pay-later-revolution` | fill | 2 | 2 |
| `secretlab-anz-market-entry` | replace | 5 | 0 |
| `shopback-anz-market-entry` | replace | 5 | 3 |
| `starbucks-australia-market-entry` | replace | 1 | 3 |
| `masters-australia-market-entry` | replace | 1 | 4 |
| `ola-australia-market-entry` | replace | 0 | 4 |
| `topshop-australia-market-entry` | replace | 1 | 4 |
| `wework-australia-market-entry` | replace | 4 | 3 |

## Prose-only references needing an editorial URL

**`afterpay-buy-now-pay-later-revolution`**
- AFR, "Key moments in the Afterpay story from zero to \$39b", August 2021 (incorporation date)
- Afterpay H1 FY21 results announcement, February 2021

**`shopback-anz-market-entry`**
- AFR, "Australian battle for online cashback deals begins as ShopBack launches", April 2018
- ShopBack corporate press: ShopBack Pay Melbourne launch (May 2023); Banked/Chemist Warehouse Pay by Bank (April 2025)
- ShopBack Australia help centre: ShopBack Pay discontinued 25 March 2026

**`starbucks-australia-market-entry`**
- Contemporary reporting on the July 2008 closures
- SMH, "Starbucks closes 61 shops, cuts 700 jobs", July 2008
- CNBC, "Why there are almost no Starbucks in Australia", July 2018 (23 remaining stores; tourist-focused re-expansion)

**`masters-australia-market-entry`**
- AFR post-mortems on the Masters exit
- AFR, "Masters director Melinda Smith resigns as D-Day looms", November 2015 (Stallings and Smith leadership history)
- Insight DIY, "Masters Home Improvement — an obituary" (Merrill Lynch 2009 warning)
- AFR Chanticleer, "US retailer Lowe's makes the Masters disaster an even uglier mess", August 2016

**`ola-australia-market-entry`**
- AFR / news coverage of Ola's April 2024 Australian exit
- Reuters, "India's Ola to stop ride-hailing operations in international markets", 9 April 2024 (Aggarwal; Vanguard valuation cut)
- Yahoo Finance AU, "Confusion as Ola suddenly pulls Australian rideshare service" (driver email; account cutoff dates)
- University of Queensland, "Ola has left Australia", April 2024 (city footprint)

**`topshop-australia-market-entry`**
- AFR coverage of the 2017 administration
- SMH, "Topshop Australia goes into voluntary administration amid mounting debts", May 2017 (Ferrier Hodgson; James Stewart)
- SMH, "Myer 'erases' Topshop concessions from stores", July 2017; SBS/AAP, "Four Topshop stores to live on in Aust", August 2017
- The Nightly, "Myer to relaunch British retailer Topshop in Australia" (Austradia stake; \$37M debts)

**`wework-australia-market-entry`**
- LinkedIn, Balder Tol (first Australian hire 2016; GM Australia & SEA; departure January 2025)
- Digital News Asia, "WeWork appoints Balder Tol as SEA head", May 2021 (12,000+ Australian members)
- LiquidSpace, WeWork 5 Martin Place listing (Money Box Building history)

