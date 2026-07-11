import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSectionModel, sectionModelMap, FLASH_MODEL } from "./sectionModel.ts";

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
