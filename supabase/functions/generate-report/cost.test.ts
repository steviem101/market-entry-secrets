import { test } from "node:test";
import assert from "node:assert/strict";
import { computeRunCost, priceForModel, FIRECRAWL_USD_PER_OP } from "./cost.ts";

test("computeRunCost: empty run costs nothing but is well-formed", () => {
  const c = computeRunCost([], 0);
  assert.equal(c.est_total_usd, 0);
  assert.equal(c.ai_calls, 0);
  assert.equal(c.ai_input_tokens, 0);
  assert.equal(c.ai_output_tokens, 0);
  assert.equal(c.ai_usd, 0);
  assert.equal(c.firecrawl_ops, 0);
  assert.equal(c.firecrawl_usd, 0);
  assert.match(c.basis, /estimated/i);
});

test("computeRunCost: meters flash tokens at the flash rate", () => {
  // 1,000,000 in + 1,000,000 out on flash = 0.075 + 0.30 = 0.375
  const c = computeRunCost([{ model: "google/gemini-3-flash-preview", input: 1_000_000, output: 1_000_000 }], 0);
  assert.equal(c.ai_input_tokens, 1_000_000);
  assert.equal(c.ai_output_tokens, 1_000_000);
  assert.equal(c.ai_usd, 0.375);
  assert.equal(c.est_total_usd, 0.375);
  assert.equal(c.ai_calls, 1);
});

test("computeRunCost: sums multiple calls and adds Firecrawl by op count", () => {
  const c = computeRunCost(
    [
      { model: "google/gemini-3-flash-preview", input: 500_000, output: 250_000 },
      { model: "google/gemini-3-flash-preview", input: 500_000, output: 250_000 },
    ],
    10,
  );
  // AI: 1,000,000 in * 0.075 + 500,000 out * 0.30/1e6 = 0.075 + 0.15 = 0.225
  assert.equal(c.ai_usd, 0.225);
  assert.equal(c.ai_calls, 2);
  assert.equal(c.firecrawl_ops, 10);
  assert.equal(c.firecrawl_usd, Math.round(10 * FIRECRAWL_USD_PER_OP * 10000) / 10000);
  assert.equal(c.est_total_usd, Math.round((0.225 + 10 * FIRECRAWL_USD_PER_OP) * 10000) / 10000);
});

test("computeRunCost: Claude money-section model is priced higher than flash", () => {
  const flash = computeRunCost([{ model: "google/gemini-3-flash-preview", input: 100_000, output: 100_000 }], 0);
  const sonnet = computeRunCost([{ model: "claude-sonnet-5", input: 100_000, output: 100_000 }], 0);
  assert.ok(sonnet.ai_usd > flash.ai_usd, "sonnet should cost more than flash for the same tokens");
});

test("priceForModel: unknown model falls back to the flash rate", () => {
  assert.deepEqual(priceForModel("some-unlisted-model"), priceForModel("google/gemini-3-flash-preview"));
});

test("priceForModel: an anthropic/-prefixed section model prices as its bare Claude id, not flash", () => {
  assert.deepEqual(priceForModel("anthropic/claude-sonnet-5"), priceForModel("claude-sonnet-5"));
  assert.notDeepEqual(priceForModel("anthropic/claude-sonnet-5"), priceForModel("google/gemini-3-flash-preview"));
});

test("priceForModel: dated snapshot ids and bare aliases price identically (never flash)", () => {
  // The canonical config alias (claude-haiku-4-5) and the dated full id must
  // both hit the Haiku row — an alias miss silently under-prices ~13-17x.
  assert.deepEqual(priceForModel("claude-haiku-4-5"), { in: 1, out: 5 });
  assert.deepEqual(priceForModel("claude-haiku-4-5-20251001"), priceForModel("claude-haiku-4-5"));
  assert.deepEqual(priceForModel("anthropic/claude-haiku-4-5-20251001"), priceForModel("claude-haiku-4-5"));
  assert.notDeepEqual(priceForModel("claude-haiku-4-5"), priceForModel("google/gemini-3-flash-preview"));
});

test("priceForModel: opus 4-8 carries the verified $5/$25 list price", () => {
  assert.deepEqual(priceForModel("claude-opus-4-8"), { in: 5, out: 25 });
});

test("computeRunCost: is defensive against bad telemetry (NaN/negative never poison the total)", () => {
  const c = computeRunCost(
    [
      { model: "google/gemini-3-flash-preview", input: Number.NaN, output: -50 },
      { model: "google/gemini-3-flash-preview", input: 1_000_000, output: 0 },
    ],
    -5,
  );
  // Only the valid 1,000,000 input tokens count; negatives/NaN floor to 0.
  assert.equal(c.ai_input_tokens, 1_000_000);
  assert.equal(c.ai_output_tokens, 0);
  assert.equal(c.ai_usd, 0.075);
  assert.equal(c.firecrawl_ops, 0);
  assert.ok(c.est_total_usd >= 0 && Number.isFinite(c.est_total_usd));
});
