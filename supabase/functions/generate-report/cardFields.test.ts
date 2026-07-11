import { test } from "node:test";
import assert from "node:assert/strict";
import { metaLine, recordCountLabel, resolveWebsite } from "./cardFields.ts";

test("metaLine: drops nullish/empty/placeholder parts, joins the rest", () => {
  assert.equal(metaLine(["Venture Capital", "Sydney"]), "Venture Capital · Sydney");
  assert.equal(metaLine([null, "Sydney"]), "Sydney");
  assert.equal(metaLine(["Venture Capital", null]), "Venture Capital");
  assert.equal(metaLine([undefined, undefined]), undefined);
  assert.equal(metaLine(["", "  "]), undefined);
  // literal string leaks from an interpolated null/undefined upstream
  assert.equal(metaLine(["null", "Melbourne"]), "Melbourne");
  assert.equal(metaLine(["undefined", "N/A"]), undefined);
});

test("metaLine: trims parts and honours a custom separator", () => {
  assert.equal(metaLine(["  Growth  ", " NSW "]), "Growth · NSW");
  assert.equal(metaLine(["A", "B"], ", "), "A, B");
});

test("metaLine: numeric parts stringify; zero is kept (a real value)", () => {
  assert.equal(metaLine([2026, "Sydney"]), "2026 · Sydney");
  assert.equal(metaLine([0, "x"]), "0 · x");
});

test("recordCountLabel: formats positive counts, drops missing/zero/garbage", () => {
  assert.equal(recordCountLabel(5000), "5,000 records");
  assert.equal(recordCountLabel("1200"), "1,200 records");
  assert.equal(recordCountLabel(0), undefined);
  assert.equal(recordCountLabel(null), undefined);
  assert.equal(recordCountLabel(undefined), undefined);
  assert.equal(recordCountLabel("lots"), undefined);
});

test("metaLine + recordCountLabel compose for the lead-database subtitle", () => {
  // location present, count present
  assert.equal(metaLine(["Australia", recordCountLabel(5000)]), "Australia · 5,000 records");
  // location missing → no dangling separator
  assert.equal(metaLine(["", recordCountLabel(5000)]), "5,000 records");
  // count missing → just the location, no "· ? records"
  assert.equal(metaLine(["Australia", recordCountLabel(null)]), "Australia");
  // both missing → undefined (card hides the line)
  assert.equal(metaLine(["", recordCountLabel(null)]), undefined);
});

test("resolveWebsite: falls back website_url → website → domain; adds scheme to bare host", () => {
  // AiGroup / Global Victoria: website NULL, URL in website_url — the P2-F bug.
  assert.equal(resolveWebsite({ website: null, website_url: "https://www.aigroup.com.au", domain: "aigroup.com.au" }), "https://www.aigroup.com.au");
  assert.equal(resolveWebsite({ website: null, website_url: "https://global.vic.gov.au" }), "https://global.vic.gov.au");
  // legacy `website` still honoured when website_url absent
  assert.equal(resolveWebsite({ website: "https://example.com" }), "https://example.com");
  // only a bare domain → build an https URL
  assert.equal(resolveWebsite({ domain: "aigroup.com.au" }), "https://aigroup.com.au");
  // website_url wins over website + domain
  assert.equal(resolveWebsite({ website_url: "https://a.com", website: "https://b.com", domain: "c.com" }), "https://a.com");
});

test("resolveWebsite: nothing usable → undefined; whitespace/blank ignored", () => {
  assert.equal(resolveWebsite({ website: null, website_url: null, domain: null }), undefined);
  assert.equal(resolveWebsite({ website: "   ", domain: "" }), undefined);
  assert.equal(resolveWebsite(null), undefined);
  assert.equal(resolveWebsite(undefined), undefined);
  // http (not just https) is left as-is
  assert.equal(resolveWebsite({ website_url: "http://legacy.example" }), "http://legacy.example");
});
