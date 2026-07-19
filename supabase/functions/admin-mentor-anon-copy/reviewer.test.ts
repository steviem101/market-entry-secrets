/**
 * Tests for the semantic resolvability reviewer (MES-208). Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  REVIEWER_SYSTEM_PROMPT,
  buildReviewPrompt,
  parseReview,
} from "./reviewer.ts";

test("reviewer system prompt is about resolvability, not vocabulary", () => {
  for (const marker of ["RESOLVABILITY", "ONE real", "a national trade agency", "identifies"]) {
    assert.ok(REVIEWER_SYSTEM_PROMPT.includes(marker), `must mention: ${marker}`);
  }
});

test("buildReviewPrompt includes draft, real facts, and the visible facts", () => {
  const p = buildReviewPrompt(
    { alias: "US–Australia Trade Insider", headline: "h", company_label: null, bio: "Leads Australia's largest US–Australia body." },
    {
      real_name: "April Palmerlee",
      real_company: "AmCham Australia",
      tile_companies: [],
      sector_tags: ["trade"],
      market_corridors: [],
      location: "Sydney, New South Wales, Australia",
    },
  );
  assert.ok(p.includes("Leads Australia's largest US–Australia body."), "draft bio present");
  assert.ok(p.includes("April Palmerlee"), "real name present for the auditor");
  assert.ok(p.includes("AmCham Australia"), "real employer present");
  assert.ok(p.includes("Sydney, New South Wales, Australia"), "visible location present");
});

test("parseReview: clean verdict", () => {
  const v = parseReview('{"identifies": false, "phrases": [], "reason": ""}');
  assert.equal(v.identifies, false);
  assert.deepEqual(v.phrases, []);
});

test("parseReview: leak verdict with phrases", () => {
  const v = parseReview(
    '{"identifies": true, "phrases": ["Australia\'s largest US–Australia body"], "reason": "resolves to AmCham"}',
  );
  assert.equal(v.identifies, true);
  assert.equal(v.phrases.length, 1);
  assert.match(v.reason, /AmCham/);
});

test("parseReview: phrases present forces identifies true even if flag omitted", () => {
  const v = parseReview('{"identifies": false, "phrases": ["the national X agency"]}');
  assert.equal(v.identifies, true, "phrases present ⇒ treat as identifying");
});

test("parseReview: fenced JSON tolerated", () => {
  const v = parseReview('```json\n{"identifies": false, "phrases": []}\n```');
  assert.equal(v.identifies, false);
});

test("parseReview: unparseable fails SAFE (needs review)", () => {
  const v = parseReview("the model rambled without json");
  assert.equal(v.identifies, true, "unparseable ⇒ do not silently pass");
});
