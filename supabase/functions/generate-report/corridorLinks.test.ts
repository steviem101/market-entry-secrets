/**
 * Tests for the MES-233 AC3 curated-corridor boost. Run: `npm test`.
 *
 * AC: curated corridor rows are measurably boosted in the matched slate — higher
 * match_score, a "Curated <country> corridor" reason, and lifted to the front — while
 * non-curated rows keep their relative order and no new entity is ever introduced.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { applyCorridorBoost, corridorIdSets } from "./corridorLinks.ts";

test("corridorIdSets: keeps approved mentor/agency ids only", () => {
  const links = [
    { entity_type: "mentor", entity_id: "m1", status: "approved" },
    { entity_type: "mentor", entity_id: "m2", status: "rejected" }, // dropped
    { entity_type: "agency", entity_id: "a1", status: "approved" },
    { entity_type: "agency", entity_id: 7, status: "approved" },     // non-string dropped
    { entity_type: "event", entity_id: "e1", status: "approved" },   // unknown type ignored
  ];
  const { mentorIds, agencyIds } = corridorIdSets(links);
  assert.deepEqual([...mentorIds], ["m1"]);
  assert.deepEqual([...agencyIds], ["a1"]);
  const empty = corridorIdSets(null);
  assert.equal(empty.mentorIds.size, 0);
  assert.equal(empty.agencyIds.size, 0);
});

test("applyCorridorBoost: lifts curated rows to the front with a bonus + reason (MES-233 AC3)", () => {
  const slate = [
    { id: "x", name: "Non-curated A", match_score: 9, match_reasons: ["Sector match"] },
    { id: "c1", name: "Curated 1", match_score: 3, match_reasons: ["Sector match"] },
    { id: "y", name: "Non-curated B", match_score: 8, match_reasons: [] },
    { id: "c2", name: "Curated 2", match_score: 2 },
  ];
  const { rows, boostedCount } = applyCorridorBoost(slate, new Set(["c1", "c2"]), "Ireland", 5);
  assert.equal(boostedCount, 2);
  // Curated rows lead the slate, in their original relative order.
  assert.deepEqual(rows.map((r) => r.id), ["c1", "c2", "x", "y"]);
  // Boosted: score raised + reason added (measurably boosted).
  const c1 = rows.find((r) => r.id === "c1")!;
  assert.equal(c1.match_score, 8); // 3 + 5
  assert.ok((c1.match_reasons as string[]).includes("Curated Ireland corridor"));
  const c2 = rows.find((r) => r.id === "c2")!;
  assert.equal(c2.match_score, 7); // 2 + 5; c2 had no match_reasons array — one is created
  assert.ok((c2.match_reasons as string[]).includes("Curated Ireland corridor"));
  // Non-curated rows keep their own relative order + untouched scores.
  assert.equal(rows.find((r) => r.id === "x")!.match_score, 9);
});

test("applyCorridorBoost: no curated ids, empty slate, or missing ids → unchanged", () => {
  const slate = [{ id: "a", match_score: 1 }, { id: "b", match_score: 2 }];
  assert.deepEqual(applyCorridorBoost(slate, new Set(), "Ireland").rows.map((r) => r.id), ["a", "b"]);
  assert.deepEqual(applyCorridorBoost(slate, null, "Ireland").rows.map((r) => r.id), ["a", "b"]);
  assert.equal(applyCorridorBoost(null, new Set(["a"]), "Ireland").boostedCount, 0);
  // A curated id not present in the slate boosts nothing (never injects).
  assert.equal(applyCorridorBoost(slate, new Set(["zzz"]), "Ireland").boostedCount, 0);
});

test("applyCorridorBoost: the reason is not duplicated on re-application", () => {
  const slate = [{ id: "c1", match_score: 3, match_reasons: ["Curated Ireland corridor"] }];
  const { rows } = applyCorridorBoost(slate, new Set(["c1"]), "Ireland", 5);
  const reasons = rows[0].match_reasons as string[];
  assert.equal(reasons.filter((r) => r === "Curated Ireland corridor").length, 1);
});

test("applyCorridorBoost: a row with no match_score starts from 0 before the bonus", () => {
  const slate = [{ id: "c1", name: "no score" }];
  const { rows } = applyCorridorBoost(slate, new Set(["c1"]), "United Kingdom", 5);
  assert.equal((rows[0] as { match_score?: number }).match_score, 5); // 0 + 5
});
