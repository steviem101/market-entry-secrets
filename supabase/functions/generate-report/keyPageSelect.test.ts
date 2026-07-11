import { test } from "node:test";
import assert from "node:assert/strict";
import { selectKeyPages } from "./keyPageSelect.ts";

test("prioritises tier-1 (customers/pricing) over tier-2 (about/products)", () => {
  const urls = [
    "https://x.com/about",
    "https://x.com/products",
    "https://x.com/customers",
    "https://x.com/pricing",
  ];
  // tier-1 customers + pricing come first regardless of map order
  assert.deepEqual(selectKeyPages(urls, 2), [
    "https://x.com/customers",
    "https://x.com/pricing",
  ]);
});

test("respects max", () => {
  const urls = ["https://x.com/customers", "https://x.com/pricing", "https://x.com/about"];
  assert.equal(selectKeyPages(urls, 1).length, 1);
  assert.equal(selectKeyPages(urls, 3).length, 3);
  assert.equal(selectKeyPages(urls, 0).length, 0);
});

test("preserves map order within the same tier", () => {
  const urls = ["https://x.com/products", "https://x.com/solutions", "https://x.com/about"];
  // all tier-2 → original order preserved
  assert.deepEqual(selectKeyPages(urls, 3), [
    "https://x.com/products",
    "https://x.com/solutions",
    "https://x.com/about",
  ]);
});

test("drops URLs that match no tier (blog/contact/careers/legal)", () => {
  const urls = [
    "https://x.com/blog/post",
    "https://x.com/contact",
    "https://x.com/careers",
    "https://x.com/privacy",
    "https://x.com/about",
  ];
  assert.deepEqual(selectKeyPages(urls, 5), ["https://x.com/about"]);
});

test("dedupes by host+path (scheme + trailing slash + www ignored for path)", () => {
  const urls = [
    "https://x.com/customers",
    "http://x.com/customers/", // same path, different scheme + trailing slash
    "https://x.com/customers?ref=nav", // same path, query
  ];
  assert.equal(selectKeyPages(urls, 5).length, 1);
});

test("handles empty / null / undefined input", () => {
  assert.deepEqual(selectKeyPages([], 3), []);
  assert.deepEqual(selectKeyPages(null, 3), []);
  assert.deepEqual(selectKeyPages(undefined, 3), []);
});

test("does not select the bare homepage (matches no tier)", () => {
  const urls = ["https://x.com", "https://x.com/", "https://x.com/case-studies"];
  assert.deepEqual(selectKeyPages(urls, 3), ["https://x.com/case-studies"]);
});
