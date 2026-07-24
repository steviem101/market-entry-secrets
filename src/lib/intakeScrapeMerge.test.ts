import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractDomain, isMaterialDomainChange, mergeScrapeResult, clearScrapedFields, parseScrapeMeta,
  type ScrapeFormSlice,
} from "./intakeScrapeMerge.ts";

// --- extractDomain / isMaterialDomainChange -------------------------------

test("extractDomain normalises protocol, www, path and case", () => {
  assert.equal(extractDomain("https://www.Acme.com/about?x=1"), "acme.com");
  assert.equal(extractDomain("acme.com"), "acme.com");
  assert.equal(extractDomain("  http://sub.acme.co.uk/ "), "sub.acme.co.uk");
});

test("extractDomain returns null for non-domains", () => {
  assert.equal(extractDomain(""), null);
  assert.equal(extractDomain(undefined), null);
  assert.equal(extractDomain("acme"), null);
  assert.equal(extractDomain("acme."), null);
});

test("isMaterialDomainChange only fires when both sides parse and differ", () => {
  assert.equal(isMaterialDomainChange("acme.com", "https://www.acme.com/team"), false);
  assert.equal(isMaterialDomainChange("acme.com", "other.io"), true);
  assert.equal(isMaterialDomainChange("acme.com", "acm"), false);
  assert.equal(isMaterialDomainChange("", "other.io"), false);
});

// --- mergeScrapeResult ----------------------------------------------------

const emptyForm: ScrapeFormSlice = {
  company_name: "", country_of_origin: "", industry_sector: [], company_stage: undefined, employee_count: undefined,
};

test("merge fills empty form and records provenance for every scraped field", () => {
  const out = mergeScrapeResult(emptyForm, {
    company_name: "Acme", country_of_origin: "Ireland",
    industry_sector: ["Fintech"], company_stage: "Series A-B", employee_count: "11-50",
  });
  assert.equal(out.patch.company_name, "Acme");
  assert.deepEqual(out.patch.industry_sector, ["Fintech"]);
  assert.deepEqual(Object.keys(out.provenance).sort(), [
    "company_name", "company_stage", "country_of_origin", "employee_count", "industry_sector",
  ]);
  assert.equal(out.aiFields.company_name, true);
  assert.equal(out.missingRequired, false);
});

test("merge never overwrites an existing company name and doesn't claim provenance for it", () => {
  const out = mergeScrapeResult({ ...emptyForm, company_name: "My Typed Co" }, { company_name: "Scraped Co" });
  assert.equal(out.patch.company_name, "My Typed Co");
  assert.equal(out.provenance.company_name, undefined);
  assert.equal(out.aiFields.company_name, false);
});

test("merge keeps existing values when the scrape misses a field (no provenance claimed)", () => {
  const form: ScrapeFormSlice = { ...emptyForm, country_of_origin: "Germany", industry_sector: ["SaaS"] };
  const out = mergeScrapeResult(form, { company_name: "NewCo" });
  assert.equal(out.patch.country_of_origin, "Germany");
  assert.deepEqual(out.patch.industry_sector, ["SaaS"]);
  assert.equal(out.provenance.country_of_origin, undefined);
  assert.equal(out.provenance.industry_sector, undefined);
});

test("merge flags missingRequired when a required field is still empty", () => {
  const out = mergeScrapeResult(emptyForm, { company_name: "Acme", industry_sector: ["Fintech"], company_stage: "Startup/Seed" });
  assert.equal(out.missingRequired, true); // country still empty (the observed nory.ai dead-Next case)
});

// --- clearScrapedFields ---------------------------------------------------

test("clear resets exactly the scrape-owned, unedited fields", () => {
  const merged = mergeScrapeResult(emptyForm, {
    company_name: "Acme", country_of_origin: "Ireland", industry_sector: ["Fintech"], company_stage: "Series A-B",
  });
  const form: ScrapeFormSlice = { ...emptyForm, ...merged.patch };
  const patch = clearScrapedFields(form, merged.provenance);
  assert.equal(patch.company_name, "");
  assert.equal(patch.country_of_origin, "");
  assert.deepEqual(patch.industry_sector, []);
  assert.equal("company_stage" in patch, true);
  assert.equal(patch.company_stage, undefined);
  assert.equal("employee_count" in patch, false); // scrape never set it
});

test("clear keeps fields the user edited after the scrape", () => {
  const merged = mergeScrapeResult(emptyForm, { company_name: "Acme", country_of_origin: "Ireland", industry_sector: ["Fintech"] });
  const form: ScrapeFormSlice = {
    ...emptyForm, ...merged.patch,
    country_of_origin: "United Kingdom", // user changed it
    industry_sector: ["Fintech", "SaaS"], // user added one
  };
  const patch = clearScrapedFields(form, merged.provenance);
  assert.equal(patch.company_name, "");
  assert.equal("country_of_origin" in patch, false);
  assert.equal("industry_sector" in patch, false);
});

test("clear with empty provenance is a no-op", () => {
  assert.deepEqual(clearScrapedFields({ ...emptyForm, company_name: "Typed" }, {}), {});
});

// --- parseScrapeMeta ------------------------------------------------------

test("parseScrapeMeta round-trips and rejects junk", () => {
  const meta = { domain: "acme.com", provenance: { company_name: "Acme" } };
  assert.deepEqual(parseScrapeMeta(JSON.stringify(meta)), meta);
  assert.equal(parseScrapeMeta(null), null);
  assert.equal(parseScrapeMeta("not json"), null);
  assert.equal(parseScrapeMeta(JSON.stringify({ provenance: {} })), null);
  // Missing provenance tolerated (old/partial writes)
  assert.deepEqual(parseScrapeMeta(JSON.stringify({ domain: "a.com" })), { domain: "a.com", provenance: {} });
});
