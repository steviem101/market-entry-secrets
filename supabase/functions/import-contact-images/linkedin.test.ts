import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeLinkedInUrl, normalizeKey } from "./linkedin.ts";

test("normalizeLinkedInUrl: canonicalises protocol, www, query, trailing slash, casing", () => {
  const canon = "linkedin.com/in/jane-doe";
  assert.equal(normalizeLinkedInUrl("https://www.linkedin.com/in/jane-doe"), canon);
  assert.equal(normalizeLinkedInUrl("http://linkedin.com/in/jane-doe/"), canon);
  assert.equal(normalizeLinkedInUrl("LinkedIn.com/in/Jane-Doe"), "linkedin.com/in/jane-doe");
  assert.equal(normalizeLinkedInUrl("https://www.linkedin.com/in/jane-doe?utm_source=lemlist"), canon);
  assert.equal(normalizeLinkedInUrl("https://www.linkedin.com/in/jane-doe#contact"), canon);
  assert.equal(normalizeLinkedInUrl("  https://www.linkedin.com/in/jane-doe/  "), canon);
});

test("normalizeLinkedInUrl: strips country/other subdomains", () => {
  assert.equal(normalizeLinkedInUrl("https://uk.linkedin.com/in/jane-doe"), "linkedin.com/in/jane-doe");
  assert.equal(normalizeLinkedInUrl("https://au.linkedin.com/in/jane-doe/"), "linkedin.com/in/jane-doe");
  assert.equal(normalizeLinkedInUrl("de.linkedin.com/in/jane-doe"), "linkedin.com/in/jane-doe");
});

test("normalizeLinkedInUrl: keeps the /in/ slug segment only, drops sub-paths", () => {
  assert.equal(normalizeLinkedInUrl("https://www.linkedin.com/in/jane-doe/detail/contact-info/"), "linkedin.com/in/jane-doe");
});

test("normalizeLinkedInUrl: returns null for non-profile / junk / empty", () => {
  assert.equal(normalizeLinkedInUrl(""), null);
  assert.equal(normalizeLinkedInUrl(null), null);
  assert.equal(normalizeLinkedInUrl(undefined), null);
  assert.equal(normalizeLinkedInUrl("https://www.linkedin.com/company/acme"), null);
  assert.equal(normalizeLinkedInUrl("https://example.com/in/jane"), null);
  assert.equal(normalizeLinkedInUrl("not a url"), null);
});

test("normalizeKey: lowercases and collapses whitespace", () => {
  assert.equal(normalizeKey("  Jane   Doe "), "jane doe");
  assert.equal(normalizeKey("ACME  Pty  Ltd"), "acme pty ltd");
  assert.equal(normalizeKey(""), null);
  assert.equal(normalizeKey(null), null);
});
