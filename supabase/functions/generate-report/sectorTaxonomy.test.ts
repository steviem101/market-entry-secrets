/**
 * Tests for the Phase D sector rollup. Run: `npm test`.
 * Guards that the form's LinkedIn industry GROUPS roll up to the right 20-sector
 * slugs and that the slugs match the SQL migration's canonical slugs.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { industryGroupsToSectorSlugs, sectorSlug, overlapCount } from "./sectorTaxonomy.ts";

test("sector slugs match the migration's canonical form", () => {
  assert.equal(sectorSlug("Financial Services"), "financial-services");
  assert.equal(sectorSlug("Technology, Information and Media"), "technology-information-and-media");
  assert.equal(sectorSlug("Oil, Gas, and Mining"), "oil-gas-and-mining");
  assert.equal(sectorSlug("Real Estate and Equipment Rental Services"), "real-estate-and-equipment-rental-services");
  assert.equal(sectorSlug("Transportation, Logistics, Supply Chain and Storage"), "transportation-logistics-supply-chain-and-storage");
});

test("real user industry picks roll up to the right sectors", () => {
  assert.deepEqual(
    industryGroupsToSectorSlugs(["Data Infrastructure and Analytics", "Software Development"]).sort(),
    ["technology-information-and-media"],
  );
  assert.deepEqual(
    industryGroupsToSectorSlugs(["Capital Markets", "Credit Intermediation"]).sort(),
    ["financial-services"],
  );
  assert.deepEqual(
    industryGroupsToSectorSlugs(["Architecture and Planning"]),
    ["professional-services"],
  );
  assert.deepEqual(industryGroupsToSectorSlugs(["Mining"]), ["oil-gas-and-mining"]);
});

test("a mixed pick dedupes to distinct sectors", () => {
  const slugs = industryGroupsToSectorSlugs([
    "Data Infrastructure and Analytics", // tech
    "Capital Markets",                   // finance
    "Architecture and Planning",         // professional
    "Software Development",              // tech (dup)
  ]);
  assert.equal(slugs.length, 3);
  assert.ok(slugs.includes("technology-information-and-media"));
  assert.ok(slugs.includes("financial-services"));
  assert.ok(slugs.includes("professional-services"));
});

test("custom / unknown industries are ignored, not crashed", () => {
  assert.deepEqual(industryGroupsToSectorSlugs(["My Bespoke Industry", "Quantum Widgets"]), []);
  assert.deepEqual(industryGroupsToSectorSlugs(null), []);
  assert.deepEqual(industryGroupsToSectorSlugs(undefined), []);
  assert.deepEqual(industryGroupsToSectorSlugs([]), []);
});

test("free-text aliases roll up to real sectors (covers actual customer intake values)", () => {
  // V-Key — observed values from a real generated report
  assert.deepEqual(
    industryGroupsToSectorSlugs(["Cybersecurity", "Digital Identity", "FinTech"]).sort(),
    ["financial-services", "professional-services", "technology-information-and-media"],
  );
  // Ailytics — observed values from a real generated report
  assert.deepEqual(
    industryGroupsToSectorSlugs(["Artificial Intelligence", "Video Analytics", "Workplace Health and Safety"]).sort(),
    ["construction", "professional-services", "technology-information-and-media"],
  );
  // Mixed case + canonical-form support
  assert.ok(industryGroupsToSectorSlugs(["fintech"]).includes("financial-services"));
  assert.ok(industryGroupsToSectorSlugs(["SaaS"]).includes("technology-information-and-media"));
  assert.ok(industryGroupsToSectorSlugs(["AI"]).includes("technology-information-and-media"));
  assert.ok(industryGroupsToSectorSlugs(["Healthcare"]).includes("hospitals-and-health-care"));
  assert.ok(industryGroupsToSectorSlugs(["EdTech"]).includes("education"));
  assert.ok(industryGroupsToSectorSlugs(["Cleantech"]).includes("utilities"));
});

test("canonical taxonomy hits still win over aliases (no regression)", () => {
  // "Software Development" is the canonical group — must map only to tech,
  // never trip a substring keyword that adds extra slugs.
  assert.deepEqual(
    industryGroupsToSectorSlugs(["Software Development"]),
    ["technology-information-and-media"],
  );
});

test("alias word boundaries: no false positives on adjacent words", () => {
  // Bare-substring matches against the alias keywords ("gas", "wind",
  // "analytics", "ai", "ml") used to over-trigger sector tagging on
  // unrelated industries. Each alias is now \b-bounded.
  assert.deepEqual(industryGroupsToSectorSlugs(["Window Manufacturing"]), ["manufacturing"]);
  // "Texas Holdings" — must NOT match "gas" as a substring of "Texas".
  assert.deepEqual(industryGroupsToSectorSlugs(["Texas Holdings"]), []);
  // "Passage" / "Massage" must not match "gas".
  assert.deepEqual(industryGroupsToSectorSlugs(["Massage Therapy"]), []);
  // Bare "AI" must match.
  assert.ok(industryGroupsToSectorSlugs(["AI"]).includes("technology-information-and-media"));
  // "Said" / "Maid" must NOT match "ai".
  assert.deepEqual(industryGroupsToSectorSlugs(["Maid Services"]), []);
});

test("inflection support: manufacturer, consulting, miners", () => {
  // Real customer values that should still map after the boundary tightening.
  assert.deepEqual(industryGroupsToSectorSlugs(["Manufacturer"]), ["manufacturing"]);
  assert.deepEqual(industryGroupsToSectorSlugs(["Manufacturers"]), ["manufacturing"]);
  assert.ok(industryGroupsToSectorSlugs(["Strategy Consulting"]).includes("professional-services"));
  assert.ok(industryGroupsToSectorSlugs(["Independent Consultants"]).includes("professional-services"));
  assert.ok(industryGroupsToSectorSlugs(["Mineral Exploration"]).includes("oil-gas-and-mining"));
});

test("overlapCount counts shared elements", () => {
  assert.equal(overlapCount(["a", "b", "c"], ["b", "c", "d"]), 2);
  assert.equal(overlapCount(["a"], ["x"]), 0);
  assert.equal(overlapCount([], ["a"]), 0);
  assert.equal(overlapCount(null, ["a"]), 0);
});
