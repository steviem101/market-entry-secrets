/**
 * Unit tests for the pure semantic-match helpers.
 * Run: `npm test` (node --test, Node 22+ strips types natively) — same as the
 * other *.test.ts in this folder. No Deno globals are touched here.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMatchQueryText, groupRankedBySource } from "./semanticMatch.ts";

test("buildMatchQueryText composes the structured intake signals", () => {
  const q = buildMatchQueryText({
    industry_sector: ["Financial Services"],
    services_needed: ["Legal", "Accounting"],
    target_regions: ["New South Wales/Sydney"],
    country_of_origin: "Ireland",
    end_buyer_industries: ["Retail"],
  });
  assert.ok(q.includes("Financial Services"));
  assert.ok(q.includes("entering market: New South Wales/Sydney"));
  assert.ok(q.includes("company from Ireland"));
  assert.ok(q.includes("selling to: Retail"));
});

test("buildMatchQueryText is empty-safe", () => {
  assert.equal(buildMatchQueryText({}), "");
});

test("groupRankedBySource dedupes chunks, keeps best score first, drops unconsumed tables", () => {
  const grouped = groupRankedBySource([
    { source_table: "service_providers", source_id: "a", score: 0.9 },
    { source_table: "content_items", source_id: "c1", score: 0.8 },
    { source_table: "content_items", source_id: "c1", score: 0.7 }, // duplicate chunk → ignored
    { source_table: "investors", source_id: "v1", score: 0.6 },
    { source_table: "lead_databases", source_id: "x", score: 0.95 }, // not consumed by reports → dropped
  ]);
  assert.equal(grouped.service_providers.length, 1);
  assert.equal(grouped.content_items.length, 1);
  assert.equal(grouped.content_items[0].score, 0.8); // first (highest) kept
  assert.equal(grouped.investors[0].id, "v1");
  assert.equal(grouped.lead_databases, undefined);
});

test("groupRankedBySource falls back to similarity when score is absent", () => {
  const grouped = groupRankedBySource([
    { source_table: "events", source_id: "e1", similarity: 0.42 },
  ]);
  assert.equal(grouped.events[0].score, 0.42);
});
