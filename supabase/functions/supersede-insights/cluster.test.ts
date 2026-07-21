import { test } from "node:test";
import assert from "node:assert/strict";
import { computeClusterDiff, summariseClusters, type CardField, type Edge } from "./cluster.ts";

function card(id: string, over: Partial<CardField> = {}): CardField {
  return { id, publicationDate: null, claimLen: 100, clusterId: null, isCanonical: true, ...over };
}
const edge = (a: string, b: string, sim = 0.95): Edge => ({ id_a: a, id_b: b, sim });

test("transitive edges collapse into one cluster (A-B, B-C => {A,B,C})", () => {
  const cards = [card("a"), card("b"), card("c"), card("d")];
  const diff = computeClusterDiff(cards, [edge("a", "b"), edge("b", "c")]);
  // a,b,c clustered (all emitted since fresh cards default to cluster_id=null); d untouched.
  const ids = new Set(diff.map((x) => x.id));
  assert.ok(ids.has("a") && ids.has("b") && ids.has("c"));
  assert.ok(!ids.has("d"), "singleton d needs no write");
  const clusterIds = new Set(diff.map((x) => x.cluster_id));
  assert.equal(clusterIds.size, 1, "all three share one cluster_id");
  assert.equal(diff.filter((x) => x.is_canonical).length, 1, "exactly one canonical");
});

test("canonical = freshest publication_date", () => {
  const cards = [
    card("old", { publicationDate: "2016-01-01" }),
    card("new", { publicationDate: "2021-06-01" }),
    card("mid", { publicationDate: "2020-01-01" }),
  ];
  const diff = computeClusterDiff(cards, [edge("old", "new"), edge("new", "mid")]);
  const canonical = diff.find((x) => x.is_canonical);
  assert.equal(canonical?.id, "new");
  assert.equal(canonical?.cluster_id, "new", "cluster_id is the canonical card's id");
  for (const x of diff) assert.equal(x.cluster_id, "new");
});

test("tiebreak: equal dates -> longest claim; equal length -> smallest id", () => {
  const sameDate = "2020-01-01";
  // longest claim wins
  let diff = computeClusterDiff(
    [card("a", { publicationDate: sameDate, claimLen: 50 }), card("b", { publicationDate: sameDate, claimLen: 90 })],
    [edge("a", "b")],
  );
  assert.equal(diff.find((x) => x.is_canonical)?.id, "b");
  // fully tied -> smallest id
  diff = computeClusterDiff(
    [card("y", { publicationDate: sameDate, claimLen: 50 }), card("x", { publicationDate: sameDate, claimLen: 50 })],
    [edge("y", "x")],
  );
  assert.equal(diff.find((v) => v.is_canonical)?.id, "x");
});

test("null publication_date sorts oldest (a dated sibling wins canonical)", () => {
  const diff = computeClusterDiff(
    [card("undated", { publicationDate: null }), card("dated", { publicationDate: "2018-01-01" })],
    [edge("undated", "dated")],
  );
  assert.equal(diff.find((x) => x.is_canonical)?.id, "dated");
});

test("fresh run: singletons get no write; clustered cards all get written", () => {
  const cards = [card("a"), card("b"), card("solo")];
  const diff = computeClusterDiff(cards, [edge("a", "b")]);
  assert.equal(diff.length, 2, "only a,b written; solo (singleton == default) skipped");
  assert.ok(!diff.some((x) => x.id === "solo"));
});

test("idempotent: re-run on already-assigned data writes nothing", () => {
  // Post-write state: a canonical of its own cluster, b a non-canonical member of a's cluster.
  const cards = [
    card("a", { clusterId: "a", isCanonical: true }),
    card("b", { clusterId: "a", isCanonical: false }),
  ];
  const diff = computeClusterDiff(cards, [edge("a", "b")]);
  assert.deepEqual(diff, [], "stable data -> zero writes");
});

test("reset: a card that dropped out of its cluster is reset to (null, true)", () => {
  // b was previously clustered under a, but there is no longer an edge -> b is now a singleton.
  const cards = [
    card("a", { clusterId: "a", isCanonical: true }),
    card("b", { clusterId: "a", isCanonical: false }),
  ];
  const diff = computeClusterDiff(cards, []); // no edges this run
  const byId = new Map(diff.map((x) => [x.id, x]));
  assert.deepEqual(byId.get("a"), { id: "a", cluster_id: null, is_canonical: true });
  assert.deepEqual(byId.get("b"), { id: "b", cluster_id: null, is_canonical: true });
});

test("edges referencing a filtered-out card are ignored, not crash", () => {
  const cards = [card("a"), card("b")];
  const diff = computeClusterDiff(cards, [edge("a", "ghost"), edge("a", "b")]);
  assert.equal(diff.filter((x) => x.is_canonical).length, 1);
  assert.ok(!diff.some((x) => x.id === "ghost"));
});

test("summariseClusters reports multi-member clusters + largest, ignoring singletons", () => {
  const cards = [card("a"), card("b"), card("c"), card("d"), card("e"), card("solo")];
  // one cluster of 3 (a,b,c), one of 2 (d,e), one singleton
  const s = summariseClusters(cards, [edge("a", "b"), edge("b", "c"), edge("d", "e")]);
  assert.equal(s.totalCards, 6);
  assert.equal(s.clusters, 2);
  assert.equal(s.cardsClustered, 5);
  assert.equal(s.largest[0].size, 3);
  assert.equal(s.largest[1].size, 2);
});
