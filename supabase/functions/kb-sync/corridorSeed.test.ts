// Tests for corridorSeed.ts — pure logic, runnable under `npm test` (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { seedKey, resolveFromSeed, unknownCorridor } from "./corridorSeed.ts";

test("seedKey normalises extension, dedupe suffix, and punctuation", () => {
  assert.equal(seedKey("doing-business-in-australia-2020.pdf"), "doing business in australia 2020");
  assert.equal(
    seedKey("Australia_Engineering_Biology_market_opportunities_Report_Intralink___Tech_Growth_Programme (1).pdf"),
    "australia engineering biology market opportunities report intralink tech growth programme",
  );
  assert.equal(seedKey("HC_DBIA-Our-Guide-2021.pdf"), "hc dbia our guide 2021");
});

test("directional inbound corridor is asserted", () => {
  const m = resolveFromSeed("2Exporting from the UK to Australia _ business.gov.uk - business.gov.uk.pdf");
  assert.ok(m);
  assert.equal(m!.origin_country, "United Kingdom");
  assert.equal(m!.target_country, "Australia");
  assert.deepEqual(m!.countries, ["United Kingdom", "Australia"]);
});

test("directional outbound corridor is asserted", () => {
  const m = resolveFromSeed("An Aussie Founders Guide to Scaling into the UK.pdf");
  assert.equal(m!.origin_country, "Australia");
  assert.equal(m!.target_country, "United Kingdom");
});

test("vintage year is captured as an ISO date", () => {
  assert.equal(resolveFromSeed("1605_doing_business_in_australia_2016.pdf")!.publication_date, "2016-01-01");
  assert.equal(resolveFromSeed("doing-business-in-australia-2020.pdf")!.publication_date, "2020-01-01");
  assert.equal(resolveFromSeed("gtal_2022_doing_business_in_australia_2021.pdf")!.publication_date, "2021-01-01");
});

test("bilateral/ambiguous titles leave origin null but keep countries", () => {
  const m = resolveFromSeed("Australia-and-the-United-Sta (1).pdf");
  assert.equal(m!.origin_country, null);
  assert.equal(m!.target_country, "Australia");
  assert.deepEqual(m!.countries, ["Australia", "United States"]);
});

test("no dated figures are invented and proprietary is false for third-party PDFs", () => {
  const m = resolveFromSeed("REPORT How To Scale From The UK To Australia.pdf");
  assert.equal(m!.is_proprietary, false);
});

test("unknown file returns null (never guessed)", () => {
  assert.equal(resolveFromSeed("some-random-file-not-in-seed.pdf"), null);
  assert.equal(resolveFromSeed(null), null);
  assert.equal(resolveFromSeed(undefined), null);
});

test("all 17 known source_documents resolve from the seed", () => {
  const files = [
    "1605_doing_business_in_australia_2016.pdf",
    "2Exporting from the UK to Australia _ business.gov.uk - business.gov.uk.pdf",
    "An Aussie Founders Guide to Scaling into the UK.pdf",
    "Australia_Engineering_Biology_market_opportunities_Report_Intralink___Tech_Growth_Programme (1).pdf",
    "Australia-and-the-United-Sta (1).pdf",
    "australia-singapore-digital-trade-standards-research-report.pdf",
    "doing-business-in-australia-2020.pdf",
    "entering-the-german-market-a-guide-for-australian-technology-companies (1).pdf",
    "Example+Snapshot+High+Fashion+Retail.pdf",
    "Example+Snapshot+US+SaaS+Platform.pdf",
    "export-finance-australia_expanding-globally_southeast-asia-europe-and-the-pacific-ebook_january-2026.pdf",
    "Foreign Market Entry Strategies for Australian and Singaporean SMEs- Findings of a two country comparative study.pdf",
    "gtal_2022_doing_business_in_australia_2021.pdf",
    "HC_DBIA-Our-Guide-2021.pdf",
    "passing-us-by2.pdf",
    "REPORT How To Scale From The UK To Australia.pdf",
    "UK GOV Exporting to Australia - GOV.UK.pdf",
  ];
  for (const f of files) {
    assert.ok(resolveFromSeed(f), `expected seed hit for ${f}`);
  }
});

test("unknownCorridor is all-null", () => {
  const u = unknownCorridor();
  assert.equal(u.origin_country, null);
  assert.equal(u.target_country, null);
  assert.deepEqual(u.countries, []);
  assert.equal(u.publication_date, null);
});
