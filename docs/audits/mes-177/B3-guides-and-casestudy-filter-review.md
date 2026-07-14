# MES-177 Phase B3 — Guide tagging + Case-study Industry filter (REVIEW — awaiting sign-off)

**Status:** proposal/recommendation. No DB writes. This one **pushes back on the ticket premise**
with evidence, so read the recommendation before any tagging.

## Finding 1 — the untagged guides should NOT be sector-tagged (recommend: leave untagged)

**Count correction:** it's **21** untagged published guides, not the "10" I quoted earlier — my
interim count used `array_length(sector_tags,1)=0`, which is NULL for an empty `{}` array and so
missed the empty-array rows. The correct predicate is **`sector_tags IS NULL OR cardinality(sector_tags)=0`**
(or `coalesce(cardinality(sector_tags),0)=0`) — `cardinality()=0` alone still has the same NULL blind
spot. That gives the true 21 = **10 NULL + 11 empty `{}`** (matches the ticket's original 21).

**All 21 are horizontal, cross-sector how-to content**, e.g.:
- Registration/structure: "Complete Guide to Australian Business Registration", "Choosing Your
  Startup Structure (Sole Trader vs Company vs Trust)"
- Tax: "Understanding Australian Tax Obligations for Foreign Companies", "R&D Tax Incentive (RDTI)"
- Employment: "Hiring Your First Employees (PAYG, Super, Fair Work)", "Hiring Talent & Visa Sponsorship"
- Funding/equity: "Raising Your First Round (SAFEs, Convertible Notes…)", "Setting Up an ESOP"
- IP: "Protecting Your IP from Day One"
- Strategy/GTM: "How to choose the right market entry strategy", "Distributor, partner or direct",
  "Localising your product, pricing and marketing", "What it really costs to enter", etc.

None is sector-specific. Tagging "Understanding Australian Tax Obligations" as `financial-services`,
or "Protecting Your IP" as `professional-services`, would be false precision — the exact over-tagging
MES-169 forbids. **Recommendation: leave all 21 untagged.** With the A4 zero-hidden sector select they
already behave correctly — they surface under "All Sectors" and don't pollute the sector options. So
**B3 guide-tagging is a no-op by design**, not unfinished work.

## Finding 2 — the real guides gap is the *category* axis, not sectors (flag for a follow-up)
All 21 sit in a single generic **"Market Entry Guides"** category, so the existing Category filter
can't help a user browse them by topic (registration / tax / employment / IP / funding / strategy /
go-to-market) — which is what ticket item 7 actually asked for ("type — company registration,
employment etc."). Fixing that means introducing a **topic taxonomy** for guides (new
`content_categories` or a `guide_topic` field), which is a content-modelling task beyond B3's scope.
**Recommendation:** spin this out as its own small ticket; do not shoehorn it into MES-177.

## ✅ Full-coverage update (2026-07-14) — proposal now covers all **102** untagged studies

Re-measured live after Phase B merged: case studies are now **146 total / 44 tagged / 102 untagged**
(was 102 total / 58 untagged). The MES-178 case-study import (#436, merged before Phase B) added
~44 new drafts, **all untagged** (58 + 44 = 102). Owner decision (2026-07-14): **extend to the full
102** before the Industry-filter switch. Done:

- The reviewed proposal CSV (`case-study-sector-tag-proposal.csv`) now has **102 rows** — the
  original 61 plus **41** newly-classified MES-178 imports. Verified live against prod
  (`xhziwveaiuhzdoutpgrh`): all 102 ids are `case_study`, **all 102 still untagged**, **0 already
  tagged**, and **0 untagged studies remain uncovered**. Full coverage.
- **Vocabulary check:** every proposed tag is a canonical MES-110 slug (validated against
  `CANONICAL_SECTOR_SLUGS` = slugify(`LINKEDIN_SECTORS`)) — 13 distinct slugs, no junk, so nothing
  will silently coerce away in the curated filter. Confidence: **78 high · 21 medium · 3 low**.
  Two studies carry a defensible dual tag (`technology-information-and-media|entertainment-providers`).
- **Method (per MES-169 — crosswalk/judgement, never keyword-mapped):** each study mapped from its
  `content_company_profiles.industry` + title into the canonical vocabulary. Rules applied
  consistently: SaaS/software/IT/telco-tech → technology-information-and-media; fintech/banking/BNPL/
  investing → financial-services; ride-hail/mobility/freight → transportation-logistics; automotive →
  manufacturing; retail/apparel/grocery/D2C → retail; QSR/hotels → accommodation-and-food-services;
  music/video streaming → entertainment-providers. Ambiguous rows (Agoda OTA, Fujitsu IT-vs-consulting,
  QuickBooks/Rippling/Starling fintech-adjacent SaaS, OVO energy-vs-software, Kobo publishing-vs-retail)
  are marked medium with the alternative noted in the rationale column so any can be flipped in review.
- **Still needs sign-off before any DB write.** After approval: one guarded, id-keyed,
  fill-only-empty (`coalesce(cardinality(sector_tags),0)=0` latch) migration on `content_items`,
  same pattern as B2 — then the frontend Industry→canonical-sector filter switch (which stays
  **blocked** until the tags land, since an untagged study drops out of every facet value).

## Finding 3 — Case studies are only **44/102** tagged → tag the 58 FIRST, then switch the filter
**Correction (a code-review caught my earlier error):** case studies are **NOT** all tagged. Live:
**44 tagged / 58 untagged (57%) / 102 total** — the 58 carry an empty `{}` `sector_tags` array (0
NULL). My earlier "all 102 tagged" came from the same empty-array trap as the guide miscount (a
distinct-tags query shows only the 12 canonical tags in use, not coverage). The tags that DO exist
are all canonical (12 distinct: `technology-information-and-media` ×32, `financial-services` ×12, …),
so the vocabulary is clean — but coverage is not.

**Consequence:** switching the "Industry" filter to `sector_tags` **without tagging the 58 first**
would silently drop 57% of case studies from every Industry facet value (empty tags → no option).
The "keep free-text industry searchable" note preserves only text search, not the facet. So Finding 3
is **not** a free frontend switch — it needs a tagging pass first.

**Revised plan (this restores what the ticket's B2/B3 actually asked for):**
1. **Tag the 58 untagged case studies** with canonical `sector_tags` — propose→review pass over each
   study's `content_company_profiles.industry` (24 distinct free-text values) + content, mapped into
   the MES-110 canonical vocabulary via the existing crosswalk (never keyword-mapped — MES-169). Same
   guarded, id-keyed, fill-only-empty migration pattern as B2. Produces a reviewed CSV for sign-off.
2. **Then** repoint the Case Studies "Industry" filter to canonical `sector_tags` (shipped
   `sectorLabel` + `curateValues` pattern, identical to A4), keeping free-text industry searchable.
   Small tested frontend change (`caseStudyFilters.ts` predicate + the page select).

## Net B3 outcome
- **No guide sector-tagging** (recommended) — the 21 guides are horizontal; forcing tags would be wrong.
- **Tag the 58 untagged case studies** (propose→review) — required before the filter switch, not a no-op.
- **Then one frontend change** (case-study Industry filter → canonical sectors).
- **One spun-out follow-up** — a guide topic taxonomy (the actual item-7 need).

## Sign-off
- [ ] Agree: leave the 21 guides untagged (no forced sectors)
- [ ] Approve the **102-row** case-study sector-tag proposal (`case-study-sector-tag-proposal.csv`) —
      or amend specific rows (rationale column explains each; medium-confidence rows flag their alternative)
- [ ] Green-light writing the guarded, id-keyed, fill-only-empty tagging migration from the approved CSV
- [ ] Approve the case-study Industry→canonical-sector filter switch **after** the 102 are tagged
- [ ] Approve spinning out "guide topic taxonomy" as a separate ticket
