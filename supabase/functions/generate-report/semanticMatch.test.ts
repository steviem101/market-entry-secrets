/**
 * Tests for the pure helpers in semanticMatch.ts. Run: `npm test`.
 * The I/O (embedText, match_knowledge RPC, hydration) lives in index.ts and is
 * not covered here; this guards the config shape + the two pure functions.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SEMANTIC_CFG, buildMatchQueryText, groupRankedBySource } from "./semanticMatch.ts";

test("SEMANTIC_CFG: service_providers select has no phantom columns", () => {
  const sel = SEMANTIC_CFG.service_providers.select;
  for (const phantom of ["website_url", "is_verified", "tagline", "logo_url", "category_slug"]) {
    assert.ok(!sel.includes(phantom), `select must not include phantom column ${phantom}`);
  }
  assert.ok(sel.includes("website"), "should still select the real `website` column");
});

test("SEMANTIC_CFG: community_members links to a real profile route, not /community", () => {
  const cfg = SEMANTIC_CFG.community_members;
  // slug + flags must be selected so index.ts can build the link and filter seeds
  for (const col of ["slug", "is_anonymous", "is_active"]) {
    assert.ok(cfg.select.includes(col), `community_members select should include ${col}`);
  }
  const withSlug = cfg.decorate({ name: "X", slug: "jane-doe", specialties: [] });
  assert.equal(withSlug.link, "/mentors/experts/jane-doe");
  const noSlug = cfg.decorate({ name: "X", specialties: [] });
  assert.equal(noSlug.link, "/mentors");
});

test("buildMatchQueryText composes a compact query from intake fields", () => {
  const q = buildMatchQueryText({
    industry_sector: ["Cybersecurity", "FinTech"],
    goal_ids: ["find_providers"],
    target_regions: ["Sydney/NSW"],
    country_of_origin: "Singapore",
    end_buyer_industries: ["Banking"],
  });
  assert.ok(q.includes("Cybersecurity, FinTech"));
  assert.ok(q.includes("services needed:"));
  assert.ok(q.includes("entering market: Sydney/NSW"));
  assert.ok(q.includes("company from Singapore"));
  assert.ok(q.includes("selling to: Banking"));
  assert.ok(q.length <= 1000);
});

test("buildMatchQueryText is resilient to empty/missing fields", () => {
  assert.equal(buildMatchQueryText({}), "");
  assert.doesNotThrow(() => buildMatchQueryText({ industry_sector: null, goal_ids: null }));
});

test("groupRankedBySource dedupes by source_id, drops unknown tables, preserves order", () => {
  const grouped = groupRankedBySource([
    { source_table: "service_providers", source_id: "a", score: 0.9 },
    { source_table: "service_providers", source_id: "a", score: 0.5 }, // dup → dropped
    { source_table: "service_providers", source_id: "b", score: 0.8 },
    { source_table: "content_items", source_id: "c", score: 0.7 },
    { source_table: "not_a_report_table", source_id: "z", score: 0.99 }, // dropped (lead_databases / leads / lemlist_contacts not consumed by reports)
  ]);
  assert.deepEqual(grouped.service_providers.map((x) => x.id), ["a", "b"]);
  assert.equal(grouped.service_providers[0].score, 0.9);
  assert.deepEqual(grouped.content_items.map((x) => x.id), ["c"]);
  assert.ok(!("not_a_report_table" in grouped));
});

test("groupRankedBySource falls back to similarity when score absent", () => {
  const grouped = groupRankedBySource([
    { source_table: "investors", source_id: "i1", similarity: 0.42 },
  ]);
  assert.equal(grouped.investors[0].score, 0.42);
});
