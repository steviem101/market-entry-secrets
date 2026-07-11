import { test } from "node:test";
import assert from "node:assert/strict";
import { auditPolishedSection, auditPolishedSections } from "./polishDiffAudit.ts";

test("auditPolishedSection: faithful rewording passes", () => {
  const original = "The Australian fintech market reached US$8.48 billion in 2024. Engage Enterprise Ireland for corridor support.";
  const polished = "In 2024, Australia's fintech market hit US$8.48 billion. Work with Enterprise Ireland for corridor support.";
  const res = auditPolishedSection(original, polished);
  assert.equal(res.ok, true);
  assert.deepEqual(res.new_numerals, []);
  assert.deepEqual(res.new_entities, []);
});

test("auditPolishedSection: rounding of an existing figure is allowed", () => {
  const original = "The market was worth US$8.48 billion.";
  const polished = "The market was worth roughly US$8.5 billion."; // 0.24% drift
  assert.equal(auditPolishedSection(original, polished).ok, true);
});

test("auditPolishedSection: a NEW figure introduced by polish fails", () => {
  const original = "The market is growing quickly across the region.";
  const polished = "The market is growing at 14.2% CAGR across the region.";
  const res = auditPolishedSection(original, polished);
  assert.equal(res.ok, false);
  assert.ok(res.new_numerals.some((n) => n.includes("14.2")));
});

test("auditPolishedSection: a NEW named entity introduced by polish fails", () => {
  const original = "Several major banks operate in Sydney.";
  const polished = "Several major banks operate in Sydney, including Commonwealth Bank and Westpac Group.";
  const res = auditPolishedSection(original, polished);
  assert.equal(res.ok, false);
  assert.ok(res.new_entities.some((e) => /Commonwealth Bank|Westpac Group/.test(e)));
});

test("auditPolishedSections: reverts only the drifting sections, summarises", () => {
  const originals = {
    executive_summary: "The market is large and growing. Engage Austrade early.",
    swot_analysis: "Strengths include a strong product. Weaknesses include limited local presence.",
    action_plan: "Set up a local entity within six months.",
  };
  const polished = {
    // faithful edit → kept
    executive_summary: "The market is large and growing quickly. Engage Austrade early on.",
    // introduces a fabricated figure → revert
    swot_analysis: "Strengths include a strong product with 3,200 active users. Weaknesses include limited local presence.",
    // unchanged → skipped
    action_plan: "Set up a local entity within six months.",
  };
  const { revert, summary } = auditPolishedSections(originals, polished);
  assert.deepEqual([...revert], ["swot_analysis"]);
  assert.equal(summary.checked, 2); // exec + swot changed; action_plan identical, skipped
  assert.deepEqual(summary.reverted_sections, ["swot_analysis"]);
  assert.ok(summary.details.swot_analysis.new_numerals.some((n) => n.includes("3,200")));
});

test("auditPolishedSections: empty / missing content is skipped safely", () => {
  const { revert, summary } = auditPolishedSections(
    { a: "" },
    { a: "Now with a US$5 billion figure.", b: "" },
  );
  assert.equal(revert.size, 0);
  assert.equal(summary.checked, 0);
});
