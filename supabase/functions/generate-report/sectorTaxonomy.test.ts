/**
 * Tests for the Phase D sector rollup. Run: `npm test`.
 * Guards that the form's LinkedIn industry GROUPS roll up to the right 20-sector
 * slugs and that the slugs match the SQL migration's canonical slugs.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { industryGroupsToSectorSlugs, sectorSlug, overlapCount, unresolvedIndustries } from "./sectorTaxonomy.ts";

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

test("occupational/workplace health & safety variants map to construction + professional-services", () => {
  for (const v of ["Occupational Health and Safety", "Occupational Safety", "OHS", "EHS", "Health and Safety", "Workplace Safety", "Safety Management"]) {
    assert.deepEqual(
      industryGroupsToSectorSlugs([v]).sort(),
      ["construction", "professional-services"],
      `failed for "${v}"`,
    );
  }
  // The real Ailytics intake value: the form sent "Occupational Health and Safety",
  // which previously mapped to NOTHING — silently dropping the user's core domain
  // from matching (only AI + Video Analytics → tech survived).
  assert.deepEqual(
    industryGroupsToSectorSlugs(["Artificial Intelligence", "Video Analytics", "Occupational Health and Safety"]).sort(),
    ["construction", "professional-services", "technology-information-and-media"],
  );
  // Guard: genuine healthcare terms must NOT be pulled into construction by the new aliases.
  assert.deepEqual(industryGroupsToSectorSlugs(["Mental Health"]), ["hospitals-and-health-care"]);
  assert.deepEqual(industryGroupsToSectorSlugs(["Telehealth"]).sort(), ["hospitals-and-health-care"]);
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

test("MES-110: intake quick-pick chips all resolve via the canonical group lookup", async () => {
  const { TOP_INDUSTRIES, MORE_INDUSTRIES } = await import(
    "../../../src/components/report-creator/v2/rcData.ts"
  );
  for (const chip of [...TOP_INDUSTRIES, ...MORE_INDUSTRIES]) {
    assert.ok(
      industryGroupsToSectorSlugs([chip]).length >= 1,
      `chip "${chip}" resolves to no sector slugs`,
    );
  }
});

test("MES-110: previously-dropped live intake values now roll up to sectors", () => {
  // Every value here was observed in user_intake_forms and resolved to NOTHING
  // before the MES-110 alias extension (audit §6.1-6.2).
  const cases: Array<[string, string]> = [
    ["Financial Services", "financial-services"],
    ["finance", "financial-services"],
    ["Software as a Service", "technology-information-and-media"],
    ["Software", "technology-information-and-media"],
    ["Automation Software", "technology-information-and-media"],
    ["Banking Software", "technology-information-and-media"],
    ["Recruitment Technology", "administrative-and-support-services"],
    ["Staffing & Recruiting", "administrative-and-support-services"],
    ["HR Tech", "administrative-and-support-services"],
    ["Human Resources", "administrative-and-support-services"],
    ["Credit Bureau", "financial-services"],
    ["lending", "financial-services"],
    ["Biometrics", "technology-information-and-media"],
    ["Identity Management", "technology-information-and-media"],
    ["Identity Verification", "technology-information-and-media"],
    ["Market Research", "professional-services"],
    ["Decision Intelligence", "technology-information-and-media"],
    ["Medical Devices", "hospitals-and-health-care"],
    ["Pharmaceuticals", "hospitals-and-health-care"],
    ["Biotechnology Research", "hospitals-and-health-care"],
    ["Agriculture", "farming-ranching-forestry"],
    ["Education", "education"],
    ["Architecture & Planning", "professional-services"],
  ];
  for (const [value, expectedSlug] of cases) {
    assert.ok(
      industryGroupsToSectorSlugs([value]).includes(expectedSlug),
      `"${value}" no longer rolls up to ${expectedSlug}`,
    );
  }
});

test("MES-110 aliases keep word boundaries (no new false positives)", () => {
  // "Softwareland" must not trip \bsoftware\b via partial word.
  assert.deepEqual(industryGroupsToSectorSlugs(["Softwarehouse Widgets"]), []);
  // "Refinance" must not trip \bfinance\b.
  assert.deepEqual(industryGroupsToSectorSlugs(["Refinanced Assets"]), []);
  // "Educational" must not trip bare \beducation\b (edtech alias handles education technology).
  assert.deepEqual(industryGroupsToSectorSlugs(["Educationalists"]), []);
});

test("MES-110 step 5: the last matcher-invisible intake values roll up to their crosswalk sector", () => {
  // Each was observed in user_intake_forms and still resolved to NOTHING after
  // step 1. Expected slug = legacy_industry_mapping.linkedin_sector for that
  // value, so the matcher and the crosswalk agree.
  const cases: Array<[string, string]> = [
    ["banking", "financial-services"],
    ["Banking", "financial-services"],
    ["Investment Banking", "financial-services"], // via \bbanking\b
    ["cyber", "technology-information-and-media"], // bare, folded into the cybersecurity alias
    ["Apparel & Fashion", "manufacturing"],        // crosswalk → Apparel Manufacturing
    ["Restaurants", "accommodation-and-food-services"], // plural the earlier \brestaurant\b missed
    ["Commercial Real Estate", "real-estate-and-equipment-rental-services"],
    ["Law Practice", "professional-services"],     // via \blaw\b, alias had only "legal"
  ];
  for (const [value, expectedSlug] of cases) {
    assert.ok(
      industryGroupsToSectorSlugs([value]).includes(expectedSlug),
      `"${value}" does not roll up to ${expectedSlug}`,
    );
  }
});

test("MES-110 step 5: horizontal business-functions stay deliberately unresolved", () => {
  // These are functions, not industries — they denote no target-market sector,
  // so the matcher correctly ignores them (same principle as tagging-rules.md
  // rule 1, business-model ≠ industry). Locking this in guards against a future
  // over-eager alias silently pulling them into a sector.
  for (const v of ["Project Management", "Customer Experience", "Field Management"]) {
    assert.deepEqual(industryGroupsToSectorSlugs([v]), [], `"${v}" should stay unresolved`);
  }
});

test("MES-110 step 5 aliases keep word boundaries (no new false positives)", () => {
  assert.deepEqual(industryGroupsToSectorSlugs(["Lawn Care Services"]), []);   // \blaw\b ≠ "lawn"
  assert.deepEqual(industryGroupsToSectorSlugs(["Cybernetics Lab"]), []);      // \bcyber\b ≠ "cybernetics"
  assert.deepEqual(industryGroupsToSectorSlugs(["Embankment Works"]), []);     // \bbanking\b ≠ "embankment"
});

test("overlapCount counts shared elements", () => {
  assert.equal(overlapCount(["a", "b", "c"], ["b", "c", "d"]), 2);
  assert.equal(overlapCount(["a"], ["x"]), 0);
  assert.equal(overlapCount([], ["a"]), 0);
  assert.equal(overlapCount(null, ["a"]), 0);
});

test("unresolvedIndustries: returns only labels that map to no sector slug (MES-230 finding 2)", () => {
  // Alias/direct hits are NOT unresolved (biometrics/cybersecurity/fintech resolve).
  assert.deepEqual(unresolvedIndustries(["Biometrics", "Cybersecurity", "FinTech"]), []);
  // Genuinely unmapped free text is surfaced, preserving the ORIGINAL label.
  assert.deepEqual(unresolvedIndustries(["Pet Grooming", "Artisanal Cheese"]), ["Pet Grooming", "Artisanal Cheese"]);
  // Mixed → only the unmapped label comes back.
  assert.deepEqual(unresolvedIndustries(["Cybersecurity", "Pet Grooming"]), ["Pet Grooming"]);
  // Empty / blank / nullish are ignored (never blocks, never noise).
  assert.deepEqual(unresolvedIndustries([]), []);
  assert.deepEqual(unresolvedIndustries(null), []);
  assert.deepEqual(unresolvedIndustries([" ", ""]), []);
});
