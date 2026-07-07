# Baseline: tier-gated report section (canonical, Fable-authored 2026-07-07)

A known-good `swot_analysis` section (growth-gated per `TIER_REQUIREMENTS`,
`src/components/report/reportSectionConfig.ts:108-114`). Scenario: a fictional UK legal-tech SaaS
("the company") entering Australia. The *company* is invented (it's the report subject); every MES
entity and mechanism named is real — that asymmetry is the grounding rule.

Grading notes appear as `▸` annotations. Compare structure, grounding discipline, and specificity —
not topic.

---

**SWOT Analysis — Australian Market Entry** *(visible: growth and above; stored `visible:false`
for free-tier owners — never omitted from the JSON)*
▸ Tier behaviour stated; matches how `generate-report` stores gated sections (`index.ts:2206-2248`).

**Strengths.** The company's contract-automation platform is already compliant with UK GDPR, which
shortens the gap to Australia's Privacy Act 1988 (APP 11) obligations, though it does not remove
the need for local review. Its usage-based pricing suits the Australian mid-market law firms it
targets, where seat-based incumbents dominate.
▸ Claims derive from intake data (the company's own profile) or checkable regulation — no market
figures asserted without a source.

**Weaknesses.** No local entity, no Australian case-law content, and no local support hours
(AEST/AEDT). Trust-sensitive buyers will discount a vendor with no `.com.au` presence and no local
references.

**Opportunities.** Australia's legal sector shows steady demand for automation; rather than cite a
global TAM figure, the strongest near-term signal is corridor-specific: UK legal-tech vendors have
an established UK–Australia adoption path. *(No market-size figure is quoted here because the
research phase returned none with a citable source — omission is the correct behaviour.)*
▸ This is the key move: a weaker model fills this gap with an invented "$X.XB market"; the baseline
demonstrates declining to.

**Threats.** Incumbent practice-management suites bundle "good-enough" automation; procurement
cycles in Australian law firms run 6–12 months per the buyer research phase, which strains a
12-month runway.

**Recommended next steps (cross-referenced).** Engage **DLA Piper Australia** (Sydney, NSW —
Corporate, Employment, Intellectual Property) for entity setup and Privacy Act review, and
**BDO Australia** (Sydney, NSW — Audit & Assurance, Business Services, Consulting) for tax/transfer
pricing structuring. Both are MES directory providers; see the Service Providers section of this
report for profiles.
▸ Both names, locations, and service tags are verbatim from live `service_providers` rows (queried
2026-07-07). A recommendation that does not resolve to a directory row scores 0 on Grounding.

---

## Why this passes the rubric
- **Grounding 2/2:** two real directory entities, quoted exactly as stored; zero invented figures;
  an explicit, visible *decline* to state an uncited market size.
- **Completeness 2/2:** all four SWOT quadrants + actionable next steps; tier visibility stated.
- **Conventions 2/2:** Australian English ("prioritise"-style register), 250–550 words, section
  cross-reference instead of duplicating provider detail.
- **Accuracy 2/2:** tier gate matches `TIER_REQUIREMENTS`; storage behaviour matches the pipeline.

## Instant-fail contrasts (what a 0 looks like)
- "The Australian legal-tech market is worth $2.4B" — uncited figure.
- "Engage Allens or Herbert Smith Freehills" — real-world firms, but if they are not rows in
  `service_providers`, they are hallucinations *for MES purposes*.
- Omitting the section for free users instead of storing `visible:false` — breaks
  upgrade-without-regeneration.
