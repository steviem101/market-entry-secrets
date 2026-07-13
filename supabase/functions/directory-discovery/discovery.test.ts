import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildQueries,
  cleanName,
  dedupeAgainstExisting,
  extractCandidates,
  isJunkDomain,
  normalizeDomain,
  normalizeName,
  type Candidate,
  type RawHit,
} from "./discovery.ts";

test("normalizeDomain strips scheme, www, and port; adds scheme when missing", () => {
  assert.equal(normalizeDomain("https://www.Acme.com/path"), "acme.com");
  assert.equal(normalizeDomain("acme.com.au"), "acme.com.au");
  assert.equal(normalizeDomain("http://foo.io:8080"), "foo.io");
  assert.equal(normalizeDomain("not a url"), null);
  assert.equal(normalizeDomain(null), null);
});

test("normalizeName lowercases and collapses whitespace", () => {
  assert.equal(normalizeName("  Acme   Legal  "), "acme legal");
  assert.equal(normalizeName(42), "");
});

test("isJunkDomain flags aggregators/socials and their subdomains", () => {
  assert.equal(isJunkDomain("linkedin.com"), true);
  assert.equal(isJunkDomain("au.linkedin.com"), true);
  assert.equal(isJunkDomain("en.wikipedia.org"), true);
  assert.equal(isJunkDomain("acme.com.au"), false);
  assert.equal(isJunkDomain(null), true);
});

test("cleanName drops trailing site/tagline segments and clamps length", () => {
  assert.equal(cleanName("Acme Legal | Sydney Lawyers"), "Acme Legal");
  assert.equal(cleanName("Acme Legal - Trusted advisors"), "Acme Legal");
  assert.equal(cleanName("Acme Legal : Home"), "Acme Legal");
  assert.equal(cleanName("PlainName"), "PlainName");
  assert.equal(cleanName("x".repeat(200)).length, 120);
});

test("buildQueries yields a base AU query, plus a sector query when context exists", () => {
  assert.deepEqual(
    buildQueries({ term_slug: "legal", term_label: "Legal", sample_sectors: [], sample_regions: [] }),
    ["Legal service providers for companies expanding to Australia"],
  );
  const q = buildQueries({ term_slug: "legal", term_label: "Legal", sample_sectors: ["Fintech"], sample_regions: ["NSW"] });
  assert.equal(q.length, 2);
  assert.match(q[1], /Fintech/);
  assert.deepEqual(buildQueries({ term_slug: "", term_label: "" }), []);
});

test("extractCandidates drops junk hosts, dedupes by domain, cleans names", () => {
  const hits: RawHit[] = [
    { title: "Acme Legal | Sydney", url: "https://www.acmelegal.com.au/", description: "Corporate law." },
    { title: "Acme Legal on LinkedIn", url: "https://linkedin.com/company/acme", description: "socials" },
    { title: "Acme Legal duplicate", url: "https://acmelegal.com.au/about", description: "same domain" },
    { title: "Beta Advisors", url: "https://beta.io", description: "" },
    { title: null, url: "not-a-url", description: null },
  ];
  const out = extractCandidates(hits);
  assert.equal(out.length, 2); // acmelegal (once) + beta; linkedin + dup + bad-url dropped
  assert.equal(out[0].name, "Acme Legal");
  assert.equal(out[0].domain, "acmelegal.com.au");
  assert.equal(out[1].domain, "beta.io");
});

test("extractCandidates falls back to the domain when the title is empty", () => {
  const out = extractCandidates([{ title: "", url: "https://gamma.co", description: "x" }]);
  assert.equal(out[0].name, "gamma.co");
});

test("dedupeAgainstExisting removes domain and name collisions", () => {
  const candidates: Candidate[] = [
    { name: "Acme Legal", url: "https://acmelegal.com.au", domain: "acmelegal.com.au", description: "" },
    { name: "Beta Advisors", url: "https://beta.io", domain: "beta.io", description: "" },
    { name: "Gamma Co", url: "https://gamma.co", domain: "gamma.co", description: "" },
  ];
  const existingDomains = new Set(["beta.io"]);
  const existingNames = new Set(["acme legal"]);
  const out = dedupeAgainstExisting(candidates, existingDomains, existingNames);
  assert.equal(out.length, 1);
  assert.equal(out[0].domain, "gamma.co");
});

test("dedupeAgainstExisting tolerates empty inputs", () => {
  assert.deepEqual(dedupeAgainstExisting([], new Set(), new Set()), []);
});
