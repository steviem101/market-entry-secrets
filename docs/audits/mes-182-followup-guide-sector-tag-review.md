# Guide sector-tag review pass (MES-182 follow-up) — PROPOSAL, awaiting sign-off

**Status:** review proposal only. **No data writes.** The tag-fix migration ships only after
row-level sign-off below, as a guarded, slug-keyed migration (MES-177 B2 pattern).

**Origin:** MES-182 audit §8.1 (`docs/audits/mes-182-guide-topic-taxonomy-audit.md`) — 23 of the
44 published guides carry sector tags of mixed quality, never reviewed (MES-177 B3 only decided
the *untagged 21* stay untagged). Reviewed 2026-07-17 against live prod titles/subtitles/tags,
applying the MES-169 principle (judgement, never keyword-mapped; no false precision) and one
rule: **a tag reflects the sector of the companies the guide serves, not a topic the guide
covers nor the buyer it sells to.** All proposed tags are canonical MES-110 slugs.

## Review principles applied

1. **Horizontal how-to content gets no tags** (B3 Finding 1) — a setup/tax/employment guide
   framed "for tech founders" is still usable by any sector; tagging it is false precision.
2. **Sector playbooks keep tags matching their audience** — a fintech playbook is genuinely
   `financial-services` + `technology-information-and-media`.
3. **Buyer ≠ audience:** guides about selling **to** government keep the vendor's sector (tech),
   not `government-administration`.
4. **Topic ≠ audience:** covering ARENA funding doesn't make a guide `financial-services`;
   covering food standards doesn't make it `farming-ranching-forestry`.
5. Guides dropped to no tags also get `sector_agnostic = true`, consistent with the 21.

## Proposed changes (23 rows: 6 keep · 7 amend · 10 drop)

Confidence: **H** = clear-cut; **M** = defensible either way, alternative noted.

| # | Guide (slug) | Current tags | Proposed | Action | Conf | Rationale / alternative |
|---|---|---|---|---|---|---|
| 1 | irish-tech-founders-guide-anz-expansion | technology-information-and-media | (unchanged) | Keep | H | Explicitly a tech-founder corridor playbook |
| 2 | fintech-market-entry-anz | financial-services, technology-information-and-media | (unchanged) | Keep | H | Genuine fintech sector playbook |
| 3 | regtech-identity-verification-anz | technology-information-and-media | (unchanged) | Keep | H | RegTech vendor playbook |
| 4 | edtech-training-market-entry-anz | education, technology-information-and-media | (unchanged) | Keep | H | Edtech: both tags correct |
| 5 | india-to-anz-market-entry | technology-information-and-media | (unchanged) | Keep | M | Corridor guide centred on tech services/GCCs; alt: drop to agnostic like the Canada corridor |
| 6 | saas-go-to-market-anz | government-administration, technology-information-and-media | technology-information-and-media | Amend | H | Gov procurement is a chapter, not the audience (rule 3) |
| 7 | cybersecurity-market-entry-anz | government-administration, technology-information-and-media | technology-information-and-media | Amend | H | Same as #6 |
| 8 | ai-data-platform-market-entry-anz | government-administration, technology-information-and-media | technology-information-and-media | Amend | H | Same as #6 |
| 9 | retail-qsr-market-entry-anz | farming-ranching-forestry, retail | retail, accommodation-and-food-services | Amend | H | Farming is wrong (food standards ≠ agriculture, rule 4); QSR audience = hospitality |
| 10 | healthtech-medtech-market-entry-anz | education, hospitals-and-health-care, technology-information-and-media | hospitals-and-health-care, technology-information-and-media | Amend | H | `education` is an import artefact; not an edtech guide |
| 11 | cleantech-energy-market-entry-anz | financial-services, technology-information-and-media, utilities | utilities, technology-information-and-media | Amend | H | ARENA/CEFC funding is a topic, not a fin-services audience (rule 4) |
| 12 | government-enterprise-procurement-anz | financial-services, government-administration, technology-information-and-media | technology-information-and-media | Amend | M | Vendors selling ICT via BuyICT panels; buyer ≠ audience. Alt: drop to agnostic (any-sector vendors sell to gov) |
| 13 | foreign-company-setup-anz | professional-services, technology-information-and-media | *(none)* + sector_agnostic | Drop | M | Horizontal incorporation guide despite tech framing; alt: keep tech only |
| 14 | entry-structure-subsidiary-branch-distributor | technology-information-and-media | *(none)* + sector_agnostic | Drop | M | Horizontal structure decision framework; alt: keep tech |
| 15 | firb-foreign-investment-approval-anz | financial-services, technology-information-and-media | *(none)* + sector_agnostic | Drop | H | FIRB applies to every foreign investor; fin-services is wrong (rule 4) |
| 16 | employment-payroll-superannuation-anz | technology-information-and-media | *(none)* + sector_agnostic | Drop | H | Fair Work/PAYG/super apply to every employer |
| 17 | business-banking-payments-anz | financial-services, professional-services, technology-information-and-media | *(none)* + sector_agnostic | Drop | H | Banking is an activity every entrant does, not an audience sector |
| 18 | cross-border-pricing-billing-gst-anz | technology-information-and-media | *(none)* + sector_agnostic | Drop | M | GST/low-value-goods rules are horizontal; alt: keep tech (digital-services focus) |
| 19 | data-residency-privacy-act-anz | technology-information-and-media | *(none)* + sector_agnostic | Drop | M | Privacy Act applies to all; alt: keep tech (data residency is software-centric) |
| 20 | au-startup-go-to-market-first-customers | professional-services | *(none)* + sector_agnostic | Drop | H | Horizontal GTM guide; tag is an import artefact |
| 21 | au-gst-bas-bookkeeping-startups | financial-services, professional-services, technology-information-and-media | *(none)* + sector_agnostic | Drop | H | Bookkeeping compliance for any startup (rule 4) |
| 22 | au-cofounder-agreements-founding-team | construction | *(none)* + sector_agnostic | Drop | H | `construction` is plainly erroneous |
| 23 | au-startup-grants-government-support | government-administration | *(none)* + sector_agnostic | Drop | H | Grant *source* is government; audience is any founder (rules 3+4) |

**Net effect:** tagged guides 23 → 13; every surviving tag is a genuine audience-sector claim.
Facet impact on `/content`: the Sector select loses the spurious options these tags created for
guides (`construction`, `farming-ranching-forestry` etc. remain only where case studies
legitimately carry them); dropped guides stay reachable via "All Sectors" — same behaviour as
the untagged 21. `guide_topic` values are untouched.

## Apply plan (after sign-off — NOT in this PR)

One guarded, slug-keyed migration setting `sector_tags` to the exact proposed arrays (and
`sector_agnostic = true` on the 10 drops), latched on the **current** tag values so a re-run or
an interim manual edit can't be clobbered; empty-preview-DB safe (0 rows). Verified rollback:
the table above records every before-state.

## Sign-off

- [ ] Approve the 6 Keeps
- [ ] Approve the 7 Amends (flag any row; M-rows note the alternative)
- [ ] Approve the 10 Drops → agnostic (flag any row)
- [ ] Green-light the guarded apply migration
