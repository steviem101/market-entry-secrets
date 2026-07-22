/**
 * Tests for the deterministic em-dash post-processor (pure logic). Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deEmDash, deEmDashSections, deEmDashMatches, deEmDashList, deEmDashKeyMetrics } from "./prose.ts";

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

test("deEmDashMatches strips em-dashes from match description/subtitle, preserves the rest", () => {
  const out = deEmDashMatches({
    events: [{ name: "Expo", description: "A great room — meet buyers", subtitle: "SEP 2026 – Sydney" }],
    empty: [],
    scalar: "x",
  });
  assert.equal(out.events[0].description, "A great room, meet buyers");
  assert.equal(out.events[0].subtitle, "SEP 2026 – Sydney"); // en-dash range untouched
  assert.equal(out.events[0].name, "Expo");
  assert.deepEqual(out.empty, []);
  assert.equal(out.scalar, "x");
});

test("em-dash at a line boundary does not fuse the next line (list item / heading)", () => {
  // The em-dash sits at the end of one bullet and start of the next — a \n-eating
  // regex would merge them into one line. Horizontal-only whitespace keeps the break.
  assert.equal(
    deEmDash("- Grow revenue —\n- Enter ANZ"),
    "- Grow revenue,\n- Enter ANZ"
  );
  assert.equal(
    deEmDash("First item\n— Second item"),
    "First item\nSecond item"
  );
});

test("leading indentation and trailing hard breaks survive the tidy pass", () => {
  // Nested-list indent (2 leading spaces) must not collapse…
  assert.equal(deEmDash("- Parent\n  - Child"), "- Parent\n  - Child");
  // …and a markdown hard break (two trailing spaces before \n) must survive.
  assert.equal(deEmDash("line one  \nline two"), "line one  \nline two");
  // interior double spaces the swap could leave are still tidied.
  assert.equal(deEmDash("a  —  b"), "a, b");
});

test("deEmDashMatches also strips em-dashes from meta_description (guide card blurb)", () => {
  const out = deEmDashMatches({
    case_studies: [{ name: "Guide", meta_description: "How they won — the full story", description: "d" }],
  });
  assert.equal(out.case_studies[0].meta_description, "How they won, the full story");
});

test("deEmDashList strips em-dashes and passes non-strings through", () => {
  assert.deepEqual(
    deEmDashList(["fast — and grounded", "no dash here", 42 as unknown as string]),
    ["fast, and grounded", "no dash here", 42]
  );
  assert.deepEqual(deEmDashList("not an array"), []);
});

test("deEmDashKeyMetrics strips label/value/context, keeps en-dash ranges + other fields", () => {
  const out = deEmDashKeyMetrics([
    { label: "Market — TAM", value: "$2m–$5m", context: "grows fast — per Perplexity", estimated: true },
  ]);
  assert.equal(out[0].label, "Market, TAM");
  assert.equal(out[0].value, "$2m–$5m"); // en-dash range untouched
  assert.equal(out[0].context, "grows fast, per Perplexity");
  assert.equal(out[0].estimated, true);
  assert.deepEqual(deEmDashKeyMetrics(null), []);
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
