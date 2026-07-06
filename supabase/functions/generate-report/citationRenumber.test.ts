import { test } from "node:test";
import assert from "node:assert/strict";
import { renumberCitations } from "./citationRenumber.ts";

// 19-source list; only a sparse subset is cited (the real Infact report pattern).
const cites19 = Array.from({ length: 19 }, (_, i) => `https://src${i + 1}.example.com`);

test("renumberCitations: sparse markers → contiguous 1..M, sources filtered to cited (B11/B15)", () => {
  const sections = {
    executive_summary: { content: "Market grows [1]. Sydney leads [2]. Regs tighten [3]." },
    swot_analysis: { content: "Strength [1]. Risk [6]. Upside [7]. Edge [9]." },
  };
  const order = ["executive_summary", "swot_analysis"];
  const res = renumberCitations(sections, order, cites19);

  // 6 distinct used indices (1,2,3,6,7,9) in first-appearance order → 1..6
  assert.equal(res.remapped, 6);
  assert.equal(res.citations.length, 6);
  assert.deepEqual(res.citations, [
    cites19[0], cites19[1], cites19[2], cites19[5], cites19[6], cites19[8],
  ]);
  assert.equal(res.sections.executive_summary.content, "Market grows [1]. Sydney leads [2]. Regs tighten [3].");
  // [1]→[1] (already seen), [6]→[4], [7]→[5], [9]→[6]
  assert.equal(res.sections.swot_analysis.content, "Strength [1]. Risk [4]. Upside [5]. Edge [6].");
});

test("renumberCitations: first-appearance order follows sectionOrder, not numeric order", () => {
  const sections = {
    a: { content: "cite [9] then [3]" },
    b: { content: "cite [1]" },
  };
  const res = renumberCitations(sections, ["a", "b"], cites19);
  // Order of first appearance: 9, 3, 1 → new 1, 2, 3
  assert.deepEqual(res.citations, [cites19[8], cites19[2], cites19[0]]);
  assert.equal(res.sections.a.content, "cite [1] then [2]");
  assert.equal(res.sections.b.content, "cite [3]");
});

test("renumberCitations: out-of-range markers (years, hallucinations) left untouched", () => {
  const sections = { s: { content: "In [2024] the market [1] grew; see [99]." } };
  const res = renumberCitations(sections, ["s"], cites19);
  // only [1] is in range (1..19); [2024] and [99] are left as-is
  assert.equal(res.remapped, 1);
  assert.equal(res.sections.s.content, "In [2024] the market [1] grew; see [99].");
  assert.deepEqual(res.citations, [cites19[0]]);
});

test("renumberCitations: no citations → no-op", () => {
  const sections = { s: { content: "no markers here" } };
  const res = renumberCitations(sections, ["s"], []);
  assert.equal(res.remapped, 0);
  assert.deepEqual(res.citations, []);
  assert.equal(res.sections, sections); // same reference (untouched)
});

test("renumberCitations: citations exist but none used → no-op, keeps full list", () => {
  const sections = { s: { content: "prose with no citation markers at all" } };
  const res = renumberCitations(sections, ["s"], cites19);
  assert.equal(res.remapped, 0);
  assert.equal(res.citations.length, 19); // unchanged — don't drop provenance when nothing cited
  assert.equal(res.sections, sections);
});

test("renumberCitations: duplicate markers collapse to one source; input not mutated", () => {
  const sections = { s: { content: "[3] and again [3] and [3], plus [1]" } };
  const before = sections.s.content;
  const res = renumberCitations(sections, ["s"], cites19);
  assert.equal(res.remapped, 2); // sources 3 and 1
  assert.equal(res.sections.s.content, "[1] and again [1] and [1], plus [2]");
  assert.deepEqual(res.citations, [cites19[2], cites19[0]]);
  // original object untouched
  assert.equal(sections.s.content, before);
});

test("renumberCitations: sections without content and stragglers not in order are handled", () => {
  const sections = {
    intro: { content: "see [2]" },
    gated: { content: "hidden cites [5]", visible: false }, // hidden sections still count + rewrite
    noContent: { visible: true }, // no content key
  };
  const res = renumberCitations(sections, ["intro", "gated"], cites19);
  assert.equal(res.remapped, 2);
  assert.equal(res.sections.intro.content, "see [1]");
  assert.equal(res.sections.gated.content, "hidden cites [2]");
  assert.equal(res.sections.gated.visible, false); // other fields preserved
  assert.deepEqual(res.citations, [cites19[1], cites19[4]]);
});
