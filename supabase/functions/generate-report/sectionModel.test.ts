import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSectionModel, sectionModelMap, FLASH_MODEL, isAnthropicModel, anthropicModelId, shouldFallbackToFlash } from "./sectionModel.ts";

test("isAnthropicModel: claude ids (bare or anthropic/-prefixed) route to Anthropic", () => {
  assert.equal(isAnthropicModel("claude-sonnet-5"), true);
  assert.equal(isAnthropicModel("claude-sonnet-4-6"), true);
  assert.equal(isAnthropicModel("anthropic/claude-sonnet-5"), true);
  assert.equal(isAnthropicModel("  claude-haiku-4-5  "), true);
  // gateway / other models are NOT Anthropic
  assert.equal(isAnthropicModel("google/gemini-3-flash-preview"), false);
  assert.equal(isAnthropicModel(FLASH_MODEL), false);
  assert.equal(isAnthropicModel(""), false);
  assert.equal(isAnthropicModel(null), false);
});

test("anthropicModelId: strips an optional anthropic/ prefix to the bare id", () => {
  assert.equal(anthropicModelId("anthropic/claude-sonnet-5"), "claude-sonnet-5");
  assert.equal(anthropicModelId("claude-sonnet-4-6"), "claude-sonnet-4-6");
  assert.equal(anthropicModelId("  claude-haiku-4-5 "), "claude-haiku-4-5");
});

test("shouldFallbackToFlash: config-resolved Anthropic sections fall back; eval overrides + gateway models do not", () => {
  // A section promoted via report_templates.model = claude-* on a REAL report → fall back.
  assert.equal(shouldFallbackToFlash("claude-sonnet-4-6", false), true);
  assert.equal(shouldFallbackToFlash("anthropic/claude-sonnet-5", false), true);
  // Same model, but it came from an eval A/B override → do NOT fall back (stay loud for the guard).
  assert.equal(shouldFallbackToFlash("claude-sonnet-4-6", true), false);
  // Gateway/flash models never need a flash fallback.
  assert.equal(shouldFallbackToFlash(FLASH_MODEL, false), false);
  assert.equal(shouldFallbackToFlash("google/gemini-3-flash-preview", false), false);
});

test("resolveSectionModel: row override wins, then env default, then flash", () => {
  assert.equal(resolveSectionModel("claude-sonnet-4-6", "x"), "claude-sonnet-4-6");
  assert.equal(resolveSectionModel(null, "env-model"), "env-model");
  assert.equal(resolveSectionModel(undefined, undefined), FLASH_MODEL);
});

test("resolveSectionModel: blank/whitespace values are treated as unset", () => {
  assert.equal(resolveSectionModel("   ", "env-model"), "env-model");
  assert.equal(resolveSectionModel("", ""), FLASH_MODEL);
  assert.equal(resolveSectionModel("  ", "  "), FLASH_MODEL);
});

test("sectionModelMap: builds a per-section map, honouring overrides + default", () => {
  const map = sectionModelMap(
    [
      { section_name: "executive_summary", model: "claude-sonnet-4-6" },
      { section_name: "service_providers", model: null },
      { section_name: "lead_list" },
    ],
    null,
  );
  assert.deepEqual(map, {
    executive_summary: "claude-sonnet-4-6",
    service_providers: FLASH_MODEL,
    lead_list: FLASH_MODEL,
  });
});

test("sectionModelMap: env default applies to unset rows only", () => {
  const map = sectionModelMap(
    [
      { section_name: "a", model: "row-model" },
      { section_name: "b", model: null },
    ],
    "env-default",
  );
  assert.deepEqual(map, { a: "row-model", b: "env-default" });
});
