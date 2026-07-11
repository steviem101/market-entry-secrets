import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildCompetitorQueries,
  domainOf,
  dedupeCompetitorResults,
  isNonCompetitor,
  dropNonCompetitors,
} from "./competitorQueries.ts";

test("buildCompetitorQueries: 3 angled queries from sector + company", () => {
  const q = buildCompetitorQueries({
    industry_sector: ["Identity Verification", "Biometrics"],
    target_regions: ["Sydney/NSW"],
    company_name: "Daon",
  });
  assert.equal(q.length, 3);
  assert.ok(q.some((s) => /companies in Australia/i.test(s)));
  assert.ok(q.some((s) => /vendors Australia/i.test(s)));
  assert.ok(q.some((s) => /alternatives to Daon/i.test(s)));
});

test("buildCompetitorQueries: defaults region to Australia, caps at 3", () => {
  const q = buildCompetitorQueries({ industry_sector: ["FinTech"], company_name: "X" });
  assert.ok(q.length <= 3);
  assert.ok(q[0].includes("Australia"));
});

test("buildCompetitorQueries: no sector + no company → empty", () => {
  assert.deepEqual(buildCompetitorQueries({}), []);
  assert.deepEqual(buildCompetitorQueries({ industry_sector: [], company_name: "" }), []);
});

test("buildCompetitorQueries: known competitors anchor the category and win the cap", () => {
  const q = buildCompetitorQueries({
    industry_sector: ["FinTech", "Financial Services"],
    target_regions: ["Sydney/NSW"],
    company_name: "Infact",
    known_competitors: [
      { name: "Equifax", website: "https://equifax.com.au" },
      { name: "Experian", website: "https://experian.com.au" },
    ],
  });
  assert.equal(q.length, 3);
  // The known-competitor angle is present AND first (wins the discovery cap).
  assert.match(q[0], /companies like Equifax, Experian in Australia/i);
  // Sector breadth is retained; the lowest-priority sector-vendors angle is dropped by the cap.
  assert.ok(q.some((s) => /FinTech, Financial Services companies in Australia/i.test(s)));
});

test("buildCompetitorQueries: known competitors accepted as bare strings, capped at 3 names", () => {
  const q = buildCompetitorQueries({
    company_name: "X",
    known_competitors: ["A", "", "  B ", "C", "D"],
  });
  assert.match(q[0], /companies like A, B, C in Australia Australia/i);
  assert.ok(!/D/.test(q[0]));
});

test("buildCompetitorQueries: known competitors only (no sector/company) → single anchored query", () => {
  const q = buildCompetitorQueries({ known_competitors: [{ name: "Equifax" }] });
  assert.deepEqual(q, ["companies like Equifax in Australia Australia"]);
});

test("isNonCompetitor: fires on explicit self-disqualifying language only", () => {
  assert.ok(isNonCompetitor("An AI employer branding platform. Not a technical competitor in credit data."));
  assert.ok(isNonCompetitor("A service-based firm rather than a product-based real-time data bureau."));
  assert.ok(isNonCompetitor("A software recruitment agency for fintechs."));
  // Genuine competitors must NOT be dropped.
  assert.ok(!isNonCompetitor("A real-time credit bureau competing directly on API latency."));
  assert.ok(!isNonCompetitor("Provides credit scoring and identity verification to lenders."));
  assert.ok(!isNonCompetitor(""));
});

test("dropNonCompetitors: filters discovered rows by combined description + key_info", () => {
  const rows = [
    { name: "Equifax", description: "Credit bureau", key_info: "Deeply integrated with AU banks" },
    { name: "The Martec", description: "Employer branding platform", key_info: "Not a competitor in credit data" },
    { name: "Cleveroad", description: "Software dev firm", key_info: "service-based firm rather than a product-based bureau" },
    { name: "Experian", description: "Global credit bureau", key_info: "Experian Boost feature" },
  ];
  assert.deepEqual(dropNonCompetitors(rows).map((r) => r.name), ["Equifax", "Experian"]);
  assert.deepEqual(dropNonCompetitors(null), []);
  assert.deepEqual(dropNonCompetitors(undefined), []);
});

test("domainOf: strips scheme/www/case, tolerates bare host", () => {
  assert.equal(domainOf("https://www.Example.com/x?y=1"), "example.com");
  assert.equal(domainOf("acme.com"), "acme.com");
  assert.equal(domainOf("not a url"), "");
});

test("dedupeCompetitorResults: excludes given domains, dedupes, caps", () => {
  const results = [
    { url: "https://acme.com/a" },       // excluded (user)
    { url: "https://rival.com/x" },      // keep
    { url: "https://www.rival.com/y" },  // dup domain → drop
    { url: "https://known.com" },        // excluded (known competitor)
    { url: "https://other.com" },        // keep
    { url: "https://third.com" },        // keep, but cap=2 stops before
  ];
  const out = dedupeCompetitorResults(results, ["acme.com", "known.com"], 2);
  assert.deepEqual(out.map((r) => r.url), ["https://rival.com/x", "https://other.com"]);
});

test("dedupeCompetitorResults: handles empty/null", () => {
  assert.deepEqual(dedupeCompetitorResults(null, [], 3), []);
  assert.deepEqual(dedupeCompetitorResults([], ["a.com"], 3), []);
});
