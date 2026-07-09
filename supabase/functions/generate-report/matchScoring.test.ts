/**
 * Tests for the rebalanced directory scorer. Run: `npm test`.
 * Uses an Ailytics-shaped context (Singapore AI / Occupational-Health-&-Safety
 * company selling into construction / logistics / mining) — the real case where
 * trade generalists buried genuine industry experts.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreRow, scoreAndSort, selectTopN, withMatchMeta, mergeAndRerank, normalizePersonName, dedupeByKey, pruneAcrossGroups, preferRelevant, hasSectorRelevance, isImmigrationMentor, textMatchesAnyToken, industryTokens, leadIcpTokens, leadMatchesIcp, type MatchContext, type Scored } from "./matchScoring.ts";

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

test("over-tagged 'matches everyone' row is demoted below a focused specialist (B8)", () => {
  // ADMA-shaped: a marketing association tagged across 8 sectors (two overlap the user's).
  const adma = { id: "adma", sector_agnostic: false, sector_tags: [
    "administrative-and-support-services", "construction", "education", "entertainment-providers",
    "financial-services", "government-administration", "technology-information-and-media", "utilities",
  ] };
  const broad = scoreRow(adma, {}, CTX);
  const expert = scoreRow(aiExpert, {}, CTX);
  assert.ok(!broad.specialist, "an 8-sector row must not be flagged specialist");
  assert.ok(broad.reasons.some((r) => r.startsWith("broad sector overlap")), "match scored as broad overlap");
  assert.ok(!broad.reasons.some((r) => r.startsWith("industry match")), "no genuine industry-match breadth points");
  assert.ok(expert.score > broad.score, `focused expert ${expert.score} must beat over-tagged ${broad.score}`);
});

test("over-tag threshold: 4 sectors still specialist, 5 is demoted (B8, lowered 6→5)", () => {
  const four = { id: "4", sector_agnostic: false, sector_tags: [
    "technology-information-and-media", "construction", "education", "utilities",
  ] };
  const five = { id: "5", sector_agnostic: false, sector_tags: [
    "technology-information-and-media", "construction", "education", "utilities", "financial-services",
  ] };
  const a = scoreRow(four, {}, CTX);
  const b = scoreRow(five, {}, CTX);
  assert.ok(a.specialist, "4-tag row is still a specialist");
  assert.ok(!b.specialist, "5-tag row is now demoted (over-tagged)");
  assert.ok(a.score > b.score, `4-tag ${a.score} should outscore 5-tag ${b.score}`);
});

test("over-tag threshold: real Infact leak — AusAgritech demoted below a focused fintech body (B8)", () => {
  // Infact is a FINTECH — its own mapping includes the financial-services vertical.
  // (The file-level CTX is a construction/tech company; using it here would test the
  // wrong corridor — the banking body would then be a horizontal-only match and is
  // correctly demoted for THAT company by the HORIZONTAL_SECTORS rule.)
  const fintechCtx: MatchContext = { ...CTX, userSectors: [
    "financial-services", "professional-services", "technology-information-and-media",
  ] };
  // Verbatim tags from innovation_ecosystem. Its defining vertical is agritech
  // (farming), but it carries 3 broad umbrella tags that overlap the fintech's
  // mapped sectors — so it must NOT out-specialist a focused financial-services body.
  const ausAgritech = { id: "agri", sector_agnostic: false, sector_tags: [
    "farming-ranching-forestry", "financial-services", "professional-services",
    "technology-information-and-media", "transportation-logistics-supply-chain-and-storage",
  ] };
  // Australian Banking Association — 3 focused, genuinely-relevant tags.
  const bankingAssoc = { id: "aba", sector_agnostic: false, sector_tags: [
    "financial-services", "government-administration", "professional-services",
  ] };
  const agri = scoreRow(ausAgritech, {}, fintechCtx);
  const aba = scoreRow(bankingAssoc, {}, fintechCtx);
  assert.ok(!agri.specialist, "5-tag agritech association must not be a specialist");
  assert.ok(agri.reasons.some((r) => r.startsWith("broad sector overlap")), "scored as broad overlap");
  assert.ok(aba.specialist, "focused 3-tag banking body stays a specialist (vertical match)");
  assert.ok(aba.score > agri.score, `focused banking body ${aba.score} must beat agritech ${agri.score}`);
});

test("over-tag demotion also dampens the sells-to (buyer) surface", () => {
  const broadBuyer = { id: "bb", sector_agnostic: false, sector_tags: [
    "construction", "professional-services", "oil-gas-and-mining",
    "transportation-logistics-supply-chain-and-storage", "education", "utilities",
  ] };
  const s = scoreRow(broadBuyer, { applySellsTo: true }, CTX);
  assert.ok(s.reasons.some((r) => r.startsWith("broad sells-to overlap")), "buyer overlap scored as broad");
  assert.ok(!s.reasons.some((r) => r.startsWith("sells-to sector ×")), "no genuine sells-to breadth points");
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

test("pruneAcrossGroups: entity in a higher-priority group is removed from later groups (B10)", () => {
  const key = (r: { name?: string }) => (r.name || "").toLowerCase();
  // providers > mentors > investors. Stone & Chalk (providers+investors), Aaron (mentor+investor).
  const providers = [{ name: "Stone & Chalk" }, { name: "KPMG" }];
  const mentors = [{ name: "Aaron Birkby" }, { name: "Jane Doe" }];
  const investors = [{ name: "Stone & Chalk" }, { name: "Aaron Birkby" }, { name: "Blackbird" }];
  const [p, m, i] = pruneAcrossGroups([providers, mentors, investors], key);
  assert.deepEqual(p.map((r) => r.name), ["Stone & Chalk", "KPMG"]);           // tier 1 untouched
  assert.deepEqual(m.map((r) => r.name), ["Aaron Birkby", "Jane Doe"]);         // mentor kept (above investors)
  assert.deepEqual(i.map((r) => r.name), ["Blackbird"]);                        // both dupes pruned from investors
});

test("pruneAcrossGroups: preserves order, keeps empty-keyed rows, tolerates nulls", () => {
  const key = (r: { name?: string }) => (r.name || "").toLowerCase();
  const [a, b] = pruneAcrossGroups([
    [{ name: "X" }, { name: "" }],
    [{ name: "x" }, { name: "" }, { name: "Y" }],
  ], key);
  assert.deepEqual(a.map((r) => r.name), ["X", ""]);
  // "x" pruned (dup of X); both empty-keyed rows survive (never collapsed); Y kept
  assert.deepEqual(b.map((r) => r.name), ["", "Y"]);
  assert.deepEqual(pruneAcrossGroups([], key), []);
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

// ── B13: target-region prioritisation (Infact: Sydney target, VIC firms on top) ──
test("scoreRow: target-region provider outranks equal-fit out-of-region one (B13)", () => {
  const opts = { service: "services" } as const;
  const sydney1svc = scoreRow(
    { id: "syd", location: "Sydney, NSW", sector_agnostic: true, services: ["Advisory"] }, opts, CTX);
  const melbourne1svc = scoreRow(
    { id: "melb", location: "Melbourne, VIC", sector_agnostic: true, services: ["Advisory"] }, opts, CTX);
  // Same service fit → the in-target-region provider wins on the +2 region bonus.
  assert.ok(sydney1svc.score > melbourne1svc.score,
    `Sydney ${sydney1svc.score} should beat equal-fit Melbourne ${melbourne1svc.score}`);
  assert.ok(sydney1svc.reasons.some((r) => r.startsWith("target region")));
  assert.ok(!melbourne1svc.reasons.some((r) => r.startsWith("target region")));
});

test("scoreRow: target region offsets ~one extra service match, not more (B13 tuning)", () => {
  const opts = { service: "services" } as const;
  // Sydney firm with 1 service vs Melbourne firm with 2 — the real Infact shape.
  const sydney1svc = scoreRow(
    { id: "syd", location: "Sydney, NSW", sector_agnostic: true, services: ["Advisory"] }, opts, CTX);
  const melbourne2svc = scoreRow(
    { id: "melb", location: "Melbourne, VIC", sector_agnostic: true, services: ["Advisory", "Investment"] }, opts, CTX);
  // +2 region brings the same-region single-service firm LEVEL with the out-of-region
  // double-service firm (clusters them) rather than burying it — and doesn't overshoot.
  assert.equal(sydney1svc.score, melbourne2svc.score,
    `region bonus should tie these (got ${sydney1svc.score} vs ${melbourne2svc.score})`);
});

// ── Horizontal catch-all rule (Novade report, 7 Jul 2026) ───────────────────
test("horizontal-only overlap: off-vertical associations demoted, vertical match kept (Novade)", () => {
  // Novade — construction-tech SaaS: mapping carries the construction VERTICAL
  // plus the horizontals every tech company has.
  const novadeCtx: MatchContext = { ...CTX, userSectors: [
    "construction", "technology-information-and-media", "professional-services",
  ] };
  // Verbatim tags from innovation_ecosystem (the real leak: scored 8-9, top of the report).
  const siaa = { id: "siaa", sector_agnostic: false, sector_tags: [
    "education", "government-administration", "professional-services", "technology-information-and-media",
  ] };
  const aisa = { id: "aisa", sector_agnostic: false, sector_tags: [
    "administrative-and-support-services", "education", "professional-services", "technology-information-and-media",
  ] };
  const bluechilli = { id: "bc", sector_agnostic: false, sector_tags: [
    "construction", "technology-information-and-media",
  ] };
  const s = scoreRow(siaa, {}, novadeCtx);
  const a = scoreRow(aisa, {}, novadeCtx);
  const b = scoreRow(bluechilli, {}, novadeCtx);
  // Space/infosec associations: matched ONLY on horizontals, real verticals elsewhere → demoted.
  for (const [name, r] of [["SIAA", s], ["AISA", a]] as const) {
    assert.ok(!r.specialist, `${name} must not be a specialist for a construction-tech SaaS`);
    assert.ok(r.reasons.some((x) => x.startsWith("horizontal-only overlap")), `${name} reason is horizontal-only`);
  }
  // BlueChilli matched the construction VERTICAL → genuine specialist, ranks above both.
  assert.ok(b.specialist, "BlueChilli (construction match) stays a specialist");
  assert.ok(b.score > s.score && b.score > a.score,
    `BlueChilli ${b.score} must outrank SIAA ${s.score} / AISA ${a.score}`);
});

test("horizontal-only rule does NOT fire on a purely-horizontal row (tech mentor for a tech co)", () => {
  // aiExpert-shaped: tagged ONLY [technology] — no foreign vertical, so its focus IS
  // tech. Must keep specialist standing for a company that maps to technology.
  const mentor = { id: "cv", sector_agnostic: false, sector_tags: ["technology-information-and-media"] };
  const r = scoreRow(mentor, {}, CTX); // CTX userSectors include technology
  assert.ok(r.specialist, "pure-tech row keeps specialist standing");
  assert.ok(r.reasons.some((x) => x.startsWith("industry match")));
});

test("horizontal-only rule: banking body demoted for construction co, kept for fintech", () => {
  const aba = { id: "aba", sector_agnostic: false, sector_tags: [
    "financial-services", "government-administration", "professional-services",
  ] };
  // Construction-tech company (CTX): ABA matches only professional-services → demoted.
  const forConstruction = scoreRow(aba, {}, CTX);
  assert.ok(!forConstruction.specialist, "banking body is not a specialist for a construction co");
  assert.ok(forConstruction.reasons.some((x) => x.startsWith("horizontal-only overlap")));
  // Fintech: matches the financial-services VERTICAL → specialist.
  const fintechCtx: MatchContext = { ...CTX, userSectors: ["financial-services", "professional-services"] };
  const forFintech = scoreRow(aba, {}, fintechCtx);
  assert.ok(forFintech.specialist, "banking body stays a specialist for a fintech");
  assert.ok(forFintech.score > forConstruction.score);
});

test("isImmigrationMentor: flags visa/immigration-dominant mentors via any identity field", () => {
  assert.equal(isImmigrationMentor({ name: "Zach Zocher", title: "Head of Community, Techvisa", specialties: ["Tech Visas & Immigration", "Cross-border"] } as any), true);
  assert.equal(isImmigrationMentor({ name: "Jo", company: "Global Mobility Partners" } as any), true);
  assert.equal(isImmigrationMentor({ name: "Dan Grindrod", title: "Co-Founder, LaunchPad", specialties: ["GTM & Tech Sales"] } as any), false);
  assert.equal(isImmigrationMentor({ name: "" } as any), false);
});

test("isImmigrationMentor + preferRelevant: domestic filter drops visa mentor but keeps a thin pool", () => {
  const mentors = [
    { name: "Dan", specialties: ["GTM"] },
    { name: "Roby", specialties: ["Scaled Founder"] },
    { name: "Chris", specialties: ["Policy"] },
    { name: "Zach", title: "Techvisa", specialties: ["Visas & Immigration"] },
  ];
  // 3 non-visa >= floor 3 → visa mentor dropped
  const filtered = preferRelevant(mentors, (m: any) => !isImmigrationMentor(m), 3);
  assert.deepEqual(filtered.map((m: any) => m.name), ["Dan", "Roby", "Chris"]);
  // thin pool (only a visa mentor) → backfilled, never emptied
  const thin = preferRelevant([{ name: "Zach", title: "Techvisa" }], (m: any) => !isImmigrationMentor(m), 3);
  assert.equal(thin.length, 1);
});

test("leadIcpTokens: prefers end-buyer ICP; falls back to own sector only when no buyer signal", () => {
  // buyer signal present → own sector ignored (gate on who they SELL TO)
  assert.deepEqual(
    leadIcpTokens(["Hospitals and Health Care"], ["Recruitment Technology"]).sort(),
    industryTokens(["Hospitals and Health Care"]).sort(),
  );
  // no buyer signal → fall back to own sector (Floats: empty end-buyers)
  assert.deepEqual(
    leadIcpTokens([], ["Recruitment Technology", "SaaS"]).sort(),
    industryTokens(["Recruitment Technology", "SaaS"]).sort(),
  );
  // neither → empty (caller shows nothing; request box is the escape hatch)
  assert.deepEqual(leadIcpTokens([], []), []);
});

test("lead ICP gate: strict filter drops non-matching lists (no floor padding) — Floats case", () => {
  const tokens = leadIcpTokens([], ["Recruitment Technology", "Artificial Intelligence", "SaaS"]);
  const catalog = [
    { title: "Recruitment & HR Technology Buyers", sector: "HR Tech", tags: ["Recruitment", "Talent"] },
    { title: "Australian SaaS & Technology Companies TAM Map", sector: "SaaS", tags: ["Technology", "TAM"] },
    { title: "Recently Funded Australian Startups", sector: "Startups", tags: ["Funding", "Venture-Backed"] },
    { title: "Australian Venture Capital & PE Firms", sector: "Investors", tags: ["Venture Capital", "Private Equity"] },
  ];
  const kept = catalog.filter((l) => textMatchesAnyToken([l.sector, l.tags, l.title, l.short_description], tokens));
  const names = kept.map((l) => l.title);
  assert.ok(names.includes("Recruitment & HR Technology Buyers"));
  assert.ok(names.includes("Australian SaaS & Technology Companies TAM Map"));
  // the two the user flagged as useless are dropped, not padded in
  assert.ok(!names.includes("Recently Funded Australian Startups"));
  assert.ok(!names.includes("Australian Venture Capital & PE Firms"));
});

test("leadMatchesIcp: matches on sector/tags/title/short_description; empty tokens = pass-through", () => {
  const tokens = leadIcpTokens([], ["Recruitment Technology"]);
  assert.equal(leadMatchesIcp({ title: "Recruitment & HR Technology Buyers", sector: "HR Tech", tags: ["Recruitment"] }, tokens), true);
  assert.equal(leadMatchesIcp({ title: "Recently Funded Australian Startups", sector: "Startups", tags: ["Funding"] }, tokens), false);
  // no ICP signal → don't gate (matches overlap path's `=== 0 || pass`)
  assert.equal(leadMatchesIcp({ title: "Anything" }, []), true);
});

test("lead ICP union gate: drops an off-ICP list surfaced semantic-first, keeps ICP matches (P1-C.1)", () => {
  const tokens = leadIcpTokens([], ["Recruitment Technology", "SaaS"]);
  // simulate merged.lead_databases = semantic-first (ungated) + overlap backfill
  const merged = [
    { title: "Recently Funded Australian Startups", sector: "Startups", tags: ["Funding", "Venture-Backed"] }, // from semantic, off-ICP
    { title: "Recruitment & HR Technology Buyers", sector: "HR Tech", tags: ["Recruitment"] },
    { title: "Australian SaaS & Technology Companies TAM Map", sector: "SaaS", tags: ["Technology"] },
  ];
  const gated = merged.filter((l) => leadMatchesIcp(l, tokens));
  assert.deepEqual(gated.map((l) => l.title), [
    "Recruitment & HR Technology Buyers",
    "Australian SaaS & Technology Companies TAM Map",
  ]);
});
