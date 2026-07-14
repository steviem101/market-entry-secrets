# MES-177 Phase B3 — Guide tagging + Case-study Industry filter (REVIEW — awaiting sign-off)

**Status:** proposal/recommendation. No DB writes. This one **pushes back on the ticket premise**
with evidence, so read the recommendation before any tagging.

## Finding 1 — the untagged guides should NOT be sector-tagged (recommend: leave untagged)

**Count correction:** it's **21** untagged published guides, not the "10" I quoted earlier — my
interim count used `array_length(sector_tags,1)=0`, which is NULL for an empty `{}` array and so
missed the empty-array rows. `cardinality()=0` gives the true 21 (matches the ticket's original 21).

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

## Finding 3 — Case-study "Industry" filter → canonical sectors (green-light, frontend-only)
Verified: **all 102 published case studies are already `sector_tags`-tagged, and every tag is
canonical** (12 distinct: `technology-information-and-media` ×32, `financial-services` ×12,
`administrative-and-support-services` ×5, `government-administration`, `retail`, … ). So no tagging
is needed — just the frontend switch:
- Repoint the Case Studies **"Industry"** filter from the free-text
  `content_company_profiles.industry` to canonical `sector_tags`, rendered with the shipped
  `sectorLabel` + `curateValues` pattern (identical to A4). Keep free-text industry **searchable** so
  nothing is lost. No fourth sector vocabulary survives.
- This is a small, tested frontend change (pure predicate in `caseStudyFilters.ts` + the page's
  select) — it can ride in the Phase B frontend PR alongside the B2 outcome-badge data once outcomes
  land, or ship on its own.

## Net B3 outcome
- **No guide sector-tagging** (recommended) — the content is horizontal; forcing tags would be wrong.
- **No case-study tagging** — already canonical.
- **One frontend change** (case-study Industry filter → canonical sectors) — green-light on your nod.
- **One spun-out follow-up** — a guide topic taxonomy (the actual item-7 need).

## Sign-off
- [ ] Agree: leave the 21 guides untagged (no forced sectors)
- [ ] Approve the case-study Industry→canonical-sector filter switch (frontend)
- [ ] Approve spinning out "guide topic taxonomy" as a separate ticket
