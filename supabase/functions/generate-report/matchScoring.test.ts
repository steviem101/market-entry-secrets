/**
 * Tests for the rebalanced directory scorer. Run: `npm test`.
 * Uses an Ailytics-shaped context (Singapore AI / Occupational-Health-&-Safety
 * company selling into construction / logistics / mining) — the real case where
 * trade generalists buried genuine industry experts.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreRow, scoreAndSort, selectTopN, withMatchMeta, mergeAndRerank, normalizePersonName, dedupeByKey, preferRelevant, hasSectorRelevance, textMatchesAnyToken, industryTokens, type MatchContext, type Scored } from "./matchScoring.ts";

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

// Regression: the minSpecialists swap must not violate the diversity caps it shares the
// function with. Old code did `picked[i] = spec` blindly, re-creating a 3rd-from-one-org
// or a duplicate person — the exact thing the caps prevent.
test("minSpecialists swap never exceeds the org-diversity cap", () => {
  const mk = (id: string, company: string, specialist: boolean): Scored =>
    ({ row: { id, company, name: id }, score: specialist ? 1 : 10, reasons: [], agnostic: !specialist, specialist });
  // Greedy fills the org cap with 2 Acme generalists + 1 Other; the only specialists are also Acme.
  const scored = [mk("g1", "Acme", false), mk("g2", "Acme", false), mk("o1", "Other", false), mk("s1", "Acme", true), mk("s2", "Acme", true)];
  const picked = selectTopN(scored, 3, { dedupeKeys: [{ keyOf: (r) => r.company, max: 2 }], minSpecialists: 2 });
  assert.ok(picked.filter((p) => p.row.company === "Acme").length <= 2, "org cap must hold even under minSpecialists pressure");
  assert.ok(picked.some((p) => p.row.company === "Other"), "the diverse 'Other' row must not be evicted to force same-org specialists");
});

test("minSpecialists swap never reintroduces a person the dedupe cap excluded", () => {
  const mk = (id: string, name: string, specialist: boolean): Scored =>
    ({ row: { id, name, company: id }, score: specialist ? 1 : 10, reasons: [], agnostic: !specialist, specialist });
  // 'Dr. Sarah Chen' (specialist) is the same person as the already-picked generalist 'Sarah Chen'.
  const scored = [mk("g-sarah", "Sarah Chen", false), mk("g-bob", "Bob Jones", false), mk("spec-sarah", "Dr. Sarah Chen", true)];
  const picked = selectTopN(scored, 2, { dedupeKeys: [{ keyOf: (r) => normalizePersonName(r.name), max: 1 }], minSpecialists: 1 });
  const names = picked.map((p) => normalizePersonName(p.row.name));
  assert.equal(new Set(names).size, names.length, "no duplicate person (Sarah Chen / Dr. Sarah Chen) in the slate");
});

test("selectTopN returns rows in best-first order even after specialist swaps", () => {
  const mk = (id: string, score: number, specialist: boolean): Scored =>
    ({ row: { id, company: id }, score, reasons: [], agnostic: !specialist, specialist });
  // Two swaps (s1@7 then s2@6) would otherwise leave [10, 6, 7]; the final sort fixes order.
  const scored = [mk("g1", 10, false), mk("g2", 9, false), mk("g3", 8, false), mk("s1", 7, true), mk("s2", 6, true)];
  const picked = selectTopN(scored, 3, { minSpecialists: 2 });
  for (let i = 1; i < picked.length; i++) {
    assert.ok(picked[i - 1].score >= picked[i].score, `score order broken at ${i}: ${picked[i - 1].score} < ${picked[i].score}`);
  }
  assert.equal(picked.filter((p) => p.specialist).length, 2, "both specialists present");
});

test("dedupeByKey keeps the first occurrence per key and preserves order; empty keys are never collapsed", () => {
  const rows = [
    { id: "a", name: "Enterprise Ireland" },   // provider pool
    { id: "b", name: "DeepVision" },
    { id: "c", name: "enterprise ireland" },   // same org from the agency pool (different case)
    { id: "d", name: "" },                       // empty key — kept
    { id: "e", name: "" },                       // empty key — kept (not merged with d)
  ];
  const out = dedupeByKey(rows, (r) => r.name.toLowerCase().trim());
  assert.deepEqual(out.map((r) => r.id), ["a", "b", "d", "e"]);
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

test("mergeAndRerank: a specialist from the semantic pool beats a generalist from the overlap pool", () => {
  // The core override fix: overlap (primary) surfaced the broad trade generalist;
  // semantic (secondary) surfaced the genuine expert. The expert must still win.
  const result = mergeAndRerank([sarah], [aiExpert], { service: "specialties", countryCol: "origin_country" }, CTX, 5);
  assert.equal(result[0].id, "ai", "the specialist should rank first regardless of which path found it");
  assert.ok(result[0].match_reasons.some((r: string) => r.includes("specialist")));
});

test("mergeAndRerank dedupes by id (primary wins) and unions the rest", () => {
  const dupPrimary = { id: "ai", name: "Primary AI", sector_agnostic: false, sector_tags: ["technology-information-and-media"] };
  const dupSecondary = { id: "ai", name: "Secondary AI", sector_agnostic: false, sector_tags: ["technology-information-and-media"] };
  const result = mergeAndRerank([dupPrimary], [dupSecondary, pureTrade], {}, CTX, 5);
  assert.equal(result.find((r: { id: string }) => r.id === "ai").name, "Primary AI");
  assert.equal(result.length, 2); // deduped ai + pureTrade
});

test("mergeAndRerank applies org-diversity + specialist guarantee over the union", () => {
  const mk = (id: string, company: string, tags: string[], agnostic: boolean) =>
    ({ id, name: id, company, sector_tags: tags, sector_agnostic: agnostic, origin_country: null });
  const primary = [
    mk("g1", "Investment NSW", ["technology-information-and-media", "professional-services"], true),
    mk("g2", "Investment NSW", ["technology-information-and-media", "professional-services"], true),
    mk("g3", "Investment NSW", ["technology-information-and-media", "professional-services"], true),
  ];
  const secondary = [mk("e1", "DeepVision", ["technology-information-and-media"], false)]; // specialist
  const result = mergeAndRerank(primary, secondary, { countryCol: "origin_country" }, CTX, 5, {
    dedupeKeys: [{ keyOf: (m: { company?: string }) => (m.company || "").toLowerCase(), max: 2 }],
    minSpecialists: 1,
  });
  assert.ok(result.filter((r: { company: string }) => r.company === "Investment NSW").length <= 2, "org cap respected");
  assert.ok(result.some((r: { id: string }) => r.id === "e1"), "specialist guaranteed in the slate");
});

test("normalizePersonName collapses honorifics + punctuation", () => {
  assert.equal(normalizePersonName("Dr. Sarah Chen"), "sarah chen");
  assert.equal(normalizePersonName("Sarah Chen"), "sarah chen");
  assert.equal(normalizePersonName("Prof Anne-Marie O'Brien"), "annemarie obrien");
});

// ── Relevance gate (report-quality loop refs d6a6ce3d events / b29b88c1 leads) ──

test("hasSectorRelevance reads the explainable match_reasons", () => {
  assert.equal(hasSectorRelevance({ match_reasons: ["industry match ×1 (+3)", "location (+1)"] }), true);
  assert.equal(hasSectorRelevance({ match_reasons: ["sells-to sector ×2 (+3)"] }), true);
  // agnostic / location-only matches are NOT genuine sector relevance
  assert.equal(hasSectorRelevance({ match_reasons: ["eligible for all sectors (+0.25)", "location (+1)"] }), false);
  assert.equal(hasSectorRelevance({ match_reasons: [] }), false);
  assert.equal(hasSectorRelevance({}), false);
});

test("preferRelevant drops weak rows when enough relevant exist", () => {
  const rows = [
    { id: "a", rel: true }, { id: "b", rel: true }, { id: "c", rel: true },
    { id: "d", rel: false }, { id: "e", rel: false },
  ];
  const out = preferRelevant(rows, (r) => r.rel, 3);
  assert.deepEqual(out.map((r) => r.id), ["a", "b", "c"], "weak fitness/accounting-style rows dropped");
});

test("preferRelevant backfills to minKeep when too few are relevant (never empties)", () => {
  const rows = [
    { id: "a", rel: true }, { id: "b", rel: false }, { id: "c", rel: false }, { id: "d", rel: false },
  ];
  const out = preferRelevant(rows, (r) => r.rel, 3);
  assert.deepEqual(out.map((r) => r.id), ["a", "b", "c"], "1 relevant + 2 backfilled, order preserved");
});

test("preferRelevant with zero relevant keeps the original ranked head (fallback)", () => {
  const rows = [{ id: "a", rel: false }, { id: "b", rel: false }];
  assert.deepEqual(preferRelevant(rows, (r) => r.rel, 5).map((r) => r.id), ["a", "b"]);
  assert.deepEqual(preferRelevant([], (r: any) => r.rel, 5), []);
});

test("industryTokens + textMatchesAnyToken match a lead by its sector/tags text", () => {
  const tokens = industryTokens(["Software Development", "Cybersecurity"]);
  // full-label and salient-word tokens present; noise words excluded
  assert.ok(tokens.includes("cybersecurity"));
  assert.ok(tokens.includes("software"));
  assert.ok(tokens.includes("development"));

  const cyberLead = { sector: "Cybersecurity", tags: ["enterprise", "infosec"], title: "Top AU security buyers", short_description: "" };
  const fitnessLead = { sector: "Health & Fitness", tags: ["gyms"], title: "Gym operators", short_description: "" };
  assert.equal(textMatchesAnyToken([cyberLead.sector, cyberLead.tags, cyberLead.title, cyberLead.short_description], tokens), true);
  assert.equal(textMatchesAnyToken([fitnessLead.sector, fitnessLead.tags, fitnessLead.title, fitnessLead.short_description], tokens), false);
});

test("textMatchesAnyToken ignores sub-3-char tokens and empty haystacks", () => {
  assert.equal(textMatchesAnyToken([null, [], ""], ["software"]), false);
  assert.equal(textMatchesAnyToken(["AI consulting"], ["ai"]), false, "2-char token must not match");
});
