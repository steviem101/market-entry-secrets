import { test } from "node:test";
import assert from "node:assert/strict";
import { corporateWebsiteFromEmail } from "./corporateDomain.ts";

test("returns the domain for a corporate address", () => {
  assert.equal(corporateWebsiteFromEmail("jane@acmecorp.com"), "acmecorp.com");
});

test("handles multi-part TLDs and subdomains", () => {
  assert.equal(corporateWebsiteFromEmail("stephen@ignitepartners.com.au"), "ignitepartners.com.au");
  assert.equal(corporateWebsiteFromEmail("a@team.startup.io"), "team.startup.io");
});

test("is case-insensitive and trims", () => {
  assert.equal(corporateWebsiteFromEmail("  Jane@AcmeCorp.COM "), "acmecorp.com");
});

test("returns null for free / consumer providers", () => {
  for (const e of [
    "x@gmail.com", "x@googlemail.com", "x@outlook.com", "x@hotmail.com",
    "x@yahoo.co.uk", "x@icloud.com", "x@proton.me", "x@bigpond.com",
    "stevie_50_omagh@hotmail.com",
  ]) {
    assert.equal(corporateWebsiteFromEmail(e), null, `expected null for ${e}`);
  }
});

test("returns null for malformed or missing input", () => {
  assert.equal(corporateWebsiteFromEmail(null), null);
  assert.equal(corporateWebsiteFromEmail(undefined), null);
  assert.equal(corporateWebsiteFromEmail(""), null);
  assert.equal(corporateWebsiteFromEmail("no-at-sign"), null);
  assert.equal(corporateWebsiteFromEmail("@nolocal.com"), null);
  assert.equal(corporateWebsiteFromEmail("trailing@"), null);
  assert.equal(corporateWebsiteFromEmail("nodot@localhost"), null);
});

test("plus-addressing doesn't affect the domain", () => {
  assert.equal(corporateWebsiteFromEmail("jane+reports@acmecorp.com"), "acmecorp.com");
});
