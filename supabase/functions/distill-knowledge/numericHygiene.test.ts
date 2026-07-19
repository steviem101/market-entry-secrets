import { test } from "node:test";
import assert from "node:assert/strict";
import { hasDatedFigure, mentionsSpecificYear } from "./numericHygiene.ts";

test("catches currency amounts", () => {
  assert.ok(hasDatedFigure("the payroll tax threshold is $25,000 per year"));
  assert.ok(hasDatedFigure("registration costs AUD 1,000"));
  assert.ok(hasDatedFigure("a fee of A$500 applies"));
  assert.ok(hasDatedFigure("about US$2m in capital"));
});

test("catches explicit percentage rates", () => {
  assert.ok(hasDatedFigure("the company tax rate is 30%"));
  assert.ok(hasDatedFigure("GST of 10 per cent applies"));
});

test("catches 'threshold/fee of N'", () => {
  assert.ok(hasDatedFigure("a threshold of 75,000 for GST registration"));
  assert.ok(hasDatedFigure("minimum of 100 employees"));
});

test("catches money amounts written out with a currency word", () => {
  assert.ok(hasDatedFigure("the deposit is 25,000 dollars"));
  assert.ok(hasDatedFigure("a bond of 1,000 AUD is required"));
});

test("passes durable, generalised statements", () => {
  assert.ok(!hasDatedFigure("Australia applies payroll tax with state-level thresholds"));
  assert.ok(!hasDatedFigure("GST registration is required once turnover exceeds a set threshold"));
  assert.ok(!hasDatedFigure("companies must register for a business number before trading"));
  // A bare grouped number with no currency word must NOT trip the written-out-money rule.
  assert.ok(!hasDatedFigure("the market spans more than 25,000 businesses across the region"));
  assert.ok(!hasDatedFigure(""));
});

test("mentionsSpecificYear flags pinned years", () => {
  assert.ok(mentionsSpecificYear("as of 2016 the rules changed"));
  assert.ok(!mentionsSpecificYear("the rules have been stable for years"));
});
