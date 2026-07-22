/**
 * Tests for the deterministic em-dash post-processor (pure logic). Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deEmDash, deEmDashSections } from "./prose.ts";

test("spaced em-dash → comma", () => {
  assert.equal(
    deEmDash("Floats is strong now — timing favours you."),
    "Floats is strong now, timing favours you."
  );
});

test("parenthetical em-dashes → commas", () => {
  assert.equal(
    deEmDash("the market — valued at $700m — is still growing."),
    "the market, valued at $700m, is still growing."
  );
});

test("unspaced em-dash → comma-space", () => {
  assert.equal(deEmDash("strong—but risky"), "strong, but risky");
});

test("em-dash before terminal punctuation leaves no dangling comma", () => {
  assert.equal(deEmDash("we are ready —."), "we are ready.");
});

test("leading em-dash does not leave a leading comma", () => {
  assert.equal(deEmDash("— a note about scope"), "a note about scope");
});

test("en-dash ranges and hyphens are left untouched", () => {
  assert.equal(deEmDash("across 2026–2027 the AI-powered market grows"), "across 2026–2027 the AI-powered market grows");
  assert.equal(deEmDash("SEPT 2026 – JUN 2027"), "SEPT 2026 – JUN 2027");
});

test("idempotent", () => {
  const once = deEmDash("a — b — c");
  assert.equal(deEmDash(once), once);
});

test("safe on empty / undefined", () => {
  assert.equal(deEmDash(""), "");
  assert.equal(deEmDash(undefined as unknown as string), undefined);
});

test("deEmDashSections only rewrites string content, preserves other fields", () => {
  const out = deEmDashSections({
    exec: { content: "strong — timing favours you.", visible: true },
    empty: { visible: false },
    weird: { content: 42 },
  });
  assert.equal(out.exec.content, "strong, timing favours you.");
  assert.equal(out.exec.visible, true);
  assert.deepEqual(out.empty, { visible: false });
  assert.deepEqual(out.weird, { content: 42 });
});
