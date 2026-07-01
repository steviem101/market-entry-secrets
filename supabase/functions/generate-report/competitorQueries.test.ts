import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCompetitorQueries, domainOf, dedupeCompetitorResults } from "./competitorQueries.ts";

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
