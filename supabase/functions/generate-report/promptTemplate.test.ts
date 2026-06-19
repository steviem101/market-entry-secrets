/**
 * Tests for report-template rendering. Run: `npm test` / `node --test`.
 * Focus: the conditional-block gate must treat a stringified-empty JSON array/object
 * ("[]" / "{}") as empty, and variable substitution must be `$`-safe.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { isEmptyTemplateValue, renderConditionalBlocks, substituteVariables, renderTemplate } from "./promptTemplate.ts";

test("isEmptyTemplateValue treats blank, 'Not specified', and empty JSON as empty", () => {
  for (const v of ["", "   ", undefined, null, "Not specified", "[]", " [] ", "{}"]) {
    assert.equal(isEmptyTemplateValue(v as string), true, `${JSON.stringify(v)} should be empty`);
  }
  for (const v of ['[{"id":1}]', "real text", '{"a":1}']) {
    assert.equal(isEmptyTemplateValue(v), false, `${JSON.stringify(v)} should be non-empty`);
  }
});

test("conditional block is DROPPED when the variable is a stringified-empty array (the #4 bug)", () => {
  const tmpl = "Intro.{{#agencies}}\n### Trade & Government Support\nUse: {{agencies}}{{/agencies}}\nOutro.";
  const out = renderConditionalBlocks(tmpl, { agencies: JSON.stringify([]) }); // "[]"
  assert.ok(!out.includes("Trade & Government Support"), "empty [] must not render the subsection heading");
  assert.equal(out, "Intro.\nOutro.");
});

test("conditional block is KEPT when the variable is a non-empty array", () => {
  const tmpl = "Intro.{{#agencies}}\n### Trade & Government Support\nUse: {{agencies}}{{/agencies}}\nOutro.";
  const vars = { agencies: JSON.stringify([{ name: "Enterprise Ireland" }]) };
  const out = renderConditionalBlocks(tmpl, vars);
  assert.ok(out.includes("Trade & Government Support"), "non-empty list must render the subsection");
});

test("multiple independent blocks each gate on their own variable", () => {
  const tmpl = "{{#a}}A:{{a}}{{/a}}|{{#b}}B:{{b}}{{/b}}";
  const out = renderConditionalBlocks(tmpl, { a: "[]", b: '[{"x":1}]' });
  assert.equal(out, "|B:{{b}}"); // a dropped (empty), b kept (substitution happens later)
});

test("substituteVariables does not interpret `$` sequences in values as replacement patterns", () => {
  // $&, $$, $1 in scraped/research text must survive verbatim, not be expanded by String.replace.
  const tricky = "Price is $5 and 10$$ — see $& and $1 refs";
  const out = substituteVariables("Note: {{note}}", { note: tricky });
  assert.equal(out, `Note: ${tricky}`);
});

test("renderTemplate drops empty blocks then substitutes the rest", () => {
  const tmpl = "For {{company}}.{{#agencies}} Agencies: {{agencies}}.{{/agencies}}{{#innovation}} Hubs: {{innovation}}.{{/innovation}}";
  const out = renderTemplate(tmpl, {
    company: "Nory",
    agencies: JSON.stringify([{ name: "Enterprise Ireland" }]),
    innovation: JSON.stringify([]), // empty -> block dropped
  });
  assert.ok(out.startsWith("For Nory."));
  assert.ok(out.includes('Agencies: [{"name":"Enterprise Ireland"}].'));
  assert.ok(!out.includes("Hubs:"), "empty innovation block must be dropped");
});
