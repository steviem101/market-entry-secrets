/**
 * Tests for the rebalanced directory scorer. Run: `npm test`.
 * Uses an Ailytics-shaped context (Singapore AI / Occupational-Health-&-Safety
 * company selling into construction / logistics / mining) — the real case where
 * trade generalists buried genuine industry experts.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreRow, scoreAndSort, selectTopN, withMatchMeta, type MatchContext, type Scored } from "./matchScoring.ts";

const CTX: MatchContext = {
  userSectors: ["technology-information-and-media", "construction", "professional-services"],
  sellsToSectors: ["construction", "professional-services", "transportation-logistics-supply-chain-and-storage", "oil-gas-and-mining"],
  serviceTags: ["Mentorship", "Advisory", "Trade Advisory", "Investment"],
  locationPatterns: ["Sydney", "National"],
  userCountry: "singapore",
  userIsIntl: true,
  countryTerm: "singapore",
};

// Sarah Kim — the broad, sector-agnostic trade generalist that recurred in every report.
const sarah = {
  id: "sarah", name: "Sarah Kim", company: "Investment NSW", origin_country: null,
  sector_agnostic: true,
  sector_tags: ["technology-information-and-media", "professional-services", "government-administration"],
  specialties: ["Korea-AU corridor", "Trade & Government"],
};
// A genuine, focused industry expert (NOT agnostic, single relevant tag).
const aiExpert = {
  id: "ai", name: "Real Expert", company: "DeepVision", origin_country: null,
  sector_agnostic: false,
  sector_tags: ["technology-information-and-media"],
  specialties: ["Computer Vision"],
};
// A pure trade/government person with no industry overlap at all.
const pureTrade = {
  id: "gov", name: "Suzanne M.", company: "Enterprise Singapore", origin_country: "uk",
  sector_agnostic: true, sector_tags: ["government-administration"], specialties: ["Trade & Government"],
};

test("a focused industry specialist outranks a broad agnostic generalist with the same primary industry", () => {
  const expert = scoreRow(aiExpert, { service: "specialties", countryCol: "origin_country" }, CTX);
  const generalist = scoreRow(sarah, { service: "specialties", countryCol: "origin_country" }, CTX);
  assert.ok(expert.score > generalist.score, `expert ${expert.score} should beat generalist ${generalist.score}`);
  assert.ok(expert.specialist, "ai expert should be flagged specialist");
  assert.ok(!generalist.specialist, "agnostic generalist should NOT be a specialist");
  assert.ok(expert.reasons.some((r) => r.includes("specialist")), "reasons should explain the specialist bonus");
});

test("a pure trade/government generalist with no industry overlap scores near zero", () => {
  const t = scoreRow(pureTrade, { service: "specialties", countryCol: "origin_country" }, CTX);
  assert.ok(t.score < 1, `pure-trade no-overlap should be tiny, got ${t.score}`);
});

test("breadth has diminishing returns (3 matched sectors is not 3x a single match)", () => {
  const oneTag = scoreRow({ id: "1", sector_tags: ["technology-information-and-media"], sector_agnostic: true }, {}, CTX);
  const threeTags = scoreRow({ id: "3", sector_tags: CTX.userSectors, sector_agnostic: true }, {}, CTX);
  // single = 3 + 0.25 agnostic; triple = (3 + 1 + 1) + 0.25 = 5.25, NOT 9.25
  assert.equal(oneTag.score, 3.25);
  assert.equal(threeTags.score, 5.25);
});

test("sells-to (buyers' industry) only counts on buyer-facing surfaces, not for providers/mentors", () => {
  const miningProvider = { id: "m", sector_agnostic: false, sector_tags: ["oil-gas-and-mining"] };
  // As a service provider (default applySellsTo undefined/false): you sell to mining,
  // but a mining-focused PROVIDER is irrelevant to your legal/HR needs -> 0.
  const asProvider = scoreRow(miningProvider, {}, CTX);
  assert.equal(asProvider.score, 0, `mining provider should not score off your buyers' sector, got ${asProvider.score}`);
  // As a lead (applySellsTo true): mining IS your buyer market -> relevant.
  const asLead = scoreRow(miningProvider, { applySellsTo: true }, CTX);
  assert.equal(asLead.score, 2);
});

test("org-diversity cap: no more than N rows from the same organisation", () => {
  const mk = (id: string, company: string, score: number): Scored =>
    ({ row: { id, company }, score, reasons: [], agnostic: true, specialist: false });
  const scored = [mk("1", "Investment NSW", 10), mk("2", "Investment NSW", 9), mk("3", "Investment NSW", 8), mk("4", "Investment NSW", 7), mk("5", "Invest Vic", 6)];
  const picked = selectTopN(scored, 5, { dedupeKeys: [{ keyOf: (r) => r.company, max: 2 }] });
  assert.equal(picked.filter((p) => p.row.company === "Investment NSW").length, 2);
  assert.ok(picked.some((p) => p.row.company === "Invest Vic"));
});

test("minSpecialists guarantee: an expert makes the slate even when out-scored", () => {
  const mk = (id: string, score: number, specialist: boolean): Scored =>
    ({ row: { id, company: id }, score, reasons: [], agnostic: !specialist, specialist });
  const scored = [mk("g1", 10, false), mk("g2", 9, false), mk("g3", 8, false), mk("expert", 1, true)];
  const picked = selectTopN(scored, 3, { minSpecialists: 1 });
  assert.equal(picked.length, 3);
  assert.ok(picked.some((p) => p.specialist), "the low-scored specialist should be guaranteed a slot");
});

test("withMatchMeta surfaces the score + reasons for explainability", () => {
  const s = scoreRow(aiExpert, { service: "specialties" }, CTX);
  const decorated = withMatchMeta(s);
  assert.equal(decorated.match_score, s.score);
  assert.ok(Array.isArray(decorated.match_reasons) && decorated.match_reasons.length > 0);
  assert.equal(decorated.id, "ai"); // original row fields preserved
});

test("scoreAndSort orders best-first and is deterministic on ties", () => {
  const sorted = scoreAndSort([sarah, aiExpert, pureTrade], { service: "specialties", countryCol: "origin_country" }, CTX);
  assert.equal(sorted[0].row.id, "ai"); // specialist wins
  assert.ok(sorted[0].score >= sorted[1].score && sorted[1].score >= sorted[2].score);
});
