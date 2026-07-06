import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanUrlLabel } from "./cleanUrlLabel.ts";

test("cleanUrlLabel: shortens full URLs to host, dropping www + scheme", () => {
  assert.equal(cleanUrlLabel("https://www.example.com/about"), "example.com/about");
  assert.equal(cleanUrlLabel("https://example.com"), "example.com");
  assert.equal(cleanUrlLabel("http://www.austrade.gov.au/"), "austrade.gov.au");
});

test("cleanUrlLabel: keeps a short word-like first path segment, drops long slugs", () => {
  assert.equal(cleanUrlLabel("https://reuters.com/markets"), "reuters.com/markets");
  // long slug → host only
  assert.equal(
    cleanUrlLabel("https://blog.example.com/2026/01/the-full-story-of-market-entry-in-anz"),
    "blog.example.com",
  );
  // file-ish segment → host only
  assert.equal(cleanUrlLabel("https://example.com/report.pdf"), "example.com");
});

test("cleanUrlLabel: bare host and www. host (no scheme) are handled", () => {
  assert.equal(cleanUrlLabel("www.example.com/news"), "example.com/news");
  assert.equal(cleanUrlLabel("example.com"), "example.com");
});

test("cleanUrlLabel: real text labels are left untouched", () => {
  assert.equal(cleanUrlLabel("Austrade"), "Austrade");
  assert.equal(cleanUrlLabel("Enterprise Ireland"), "Enterprise Ireland");
  assert.equal(cleanUrlLabel("See section 4.2 for details"), "See section 4.2 for details");
  assert.equal(cleanUrlLabel("3.5% APR"), "3.5% APR");
  assert.equal(cleanUrlLabel(""), "");
});

test("cleanUrlLabel: query strings and ports resolve to clean host", () => {
  assert.equal(cleanUrlLabel("https://example.com/search?q=anz+market"), "example.com/search");
  assert.equal(cleanUrlLabel("https://www.example.com:8080/"), "example.com");
});
