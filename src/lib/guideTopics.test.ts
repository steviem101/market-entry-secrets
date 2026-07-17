import { test } from "node:test";
import assert from "node:assert/strict";
import { GUIDE_TOPICS, GUIDE_TOPIC_VALUES, guideTopicLabel } from "./guideTopics.ts";

test("vocabulary is the 8 approved MES-182 slugs, in order", () => {
  assert.deepEqual(GUIDE_TOPIC_VALUES, [
    "registration-structure",
    "tax-finance",
    "employment-visas",
    "ip-legal",
    "regulation-compliance",
    "funding-grants-equity",
    "strategy-gtm",
    "sector-corridor-playbooks",
  ]);
});

test("slugs are unique, kebab-case, and trimmed", () => {
  assert.equal(new Set(GUIDE_TOPIC_VALUES).size, GUIDE_TOPICS.length);
  for (const value of GUIDE_TOPIC_VALUES) {
    assert.match(value, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad slug: ${value}`);
  }
});

test("every topic has a non-empty label distinct from its slug", () => {
  for (const { value, label } of GUIDE_TOPICS) {
    assert.ok(label.trim().length > 0, `empty label for ${value}`);
    assert.notEqual(label, value);
    assert.equal(guideTopicLabel(value), label);
  }
});

test("unknown slugs fall back to humanised text, never raw kebab-case", () => {
  assert.equal(guideTopicLabel("future-topic"), "Future Topic");
});
