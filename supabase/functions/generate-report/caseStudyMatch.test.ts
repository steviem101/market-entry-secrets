import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreCaseStudy, selectCaseStudies, hasCorridorReason, type CaseStudyContext, type CaseStudyRow } from "./caseStudyMatch.ts";

const ctx: CaseStudyContext = {
  userCountryKey: "ireland",
  userSectors: ["technology-information-and-media"],
  sellsToSectors: ["financial-services"],
  targetRegionTokens: ["sydney", "new south wales"],
};

const row = (over: Partial<CaseStudyRow> = {}): CaseStudyRow => ({
  id: over.id ?? "1",
  title: "Case",
  slug: "case",
  sector_tags: [],
  sector_agnostic: false,
  publish_date: "2026-01-01",
  profile: {},
  ...over,
});

test("origin corridor is the strongest signal and folds case/underscore variants", () => {
  const s = scoreCaseStudy(row({ profile: { origin_country: "IRELAND" } }), ctx);
  assert.equal(s.score, 3);
  assert.ok(s.reasons[0].includes("Same origin market"));
  // alias-mapped variants agree too (uk ← United Kingdom)
  const ukCtx = { ...ctx, userCountryKey: "uk" };
  const uk = scoreCaseStudy(row({ profile: { origin_country: "United Kingdom" } }), ukCtx);
  assert.equal(uk.score, 3);
});

test("sector overlap scores on own sectors first, sells-to as fallback", () => {
  const own = scoreCaseStudy(row({ sector_tags: ["technology-information-and-media"] }), ctx);
  assert.equal(own.score, 2);
  const sellsTo = scoreCaseStudy(row({ sector_tags: ["financial-services"] }), ctx);
  assert.equal(sellsTo.score, 1);
});

test("profile industry free-text rolls up through the alias map", () => {
  const s = scoreCaseStudy(row({ profile: { industry: "SaaS" } }), ctx);
  assert.equal(s.score, 1);
  assert.ok(s.reasons[0].includes("Similar industry"));
});

test("target market and positive outcome each add a point; negative outcome does not", () => {
  const good = scoreCaseStudy(row({ profile: { target_market: "Sydney, Australia", outcome: "successful" } }), ctx);
  assert.equal(good.score, 2);
  const failed = scoreCaseStudy(row({ profile: { target_market: "Sydney, Australia", outcome: "failed" } }), ctx);
  assert.equal(failed.score, 1);
});

test("target-market tokens match on word boundaries, not substrings", () => {
  const actCtx: CaseStudyContext = { ...ctx, targetRegionTokens: ["act", "australian capital territory"] };
  // 'act' inside 'manufacturing' must NOT match…
  const noHit = scoreCaseStudy(row({ profile: { target_market: "Advanced manufacturing hub, Melbourne" } }), actCtx);
  assert.equal(noHit.score, 0);
  // …but a genuine ACT reference must.
  const hit = scoreCaseStudy(row({ profile: { target_market: "Canberra, ACT" } }), actCtx);
  assert.equal(hit.score, 1);
});

test("hasCorridorReason distinguishes corridor matches from outcome-only rows", () => {
  const outcomeOnly = scoreCaseStudy(row({ profile: { outcome: "successful" } }), ctx);
  assert.equal(outcomeOnly.score, 1);
  assert.equal(hasCorridorReason(outcomeOnly.reasons), false);
  const corridor = scoreCaseStudy(row({ profile: { origin_country: "Ireland", outcome: "successful" } }), ctx);
  assert.equal(hasCorridorReason(corridor.reasons), true);
  assert.equal(hasCorridorReason([]), false);
  assert.equal(hasCorridorReason(null), false);
});

test("full like-for-like stacks all signals", () => {
  const s = scoreCaseStudy(
    row({
      sector_tags: ["technology-information-and-media"],
      profile: { origin_country: "Ireland", industry: "Software Development", target_market: "Sydney", outcome: "acquired" },
    }),
    ctx,
  );
  assert.equal(s.score, 8);
});

test("selectCaseStudies ranks by score then recency and caps", () => {
  const rows = [
    row({ id: "a", profile: { origin_country: "Ireland" } }),                       // 3
    row({ id: "b", sector_tags: ["technology-information-and-media"] }),            // 2
    row({ id: "c", profile: { outcome: "successful" }, publish_date: "2026-02-01" }), // 1, newer
    row({ id: "d", profile: { outcome: "scaling" }, publish_date: "2025-01-01" }),  // 1, older
    row({ id: "e" }),                                                               // 0
  ];
  const picked = selectCaseStudies(rows, ctx, 3);
  assert.deepEqual(picked.map((p) => p.row.id), ["a", "b", "c"]);
});

test("selectCaseStudies backfills newest rows when nothing scores (never empty)", () => {
  const rows = [
    row({ id: "old", publish_date: "2024-01-01" }),
    row({ id: "new", publish_date: "2026-05-01" }),
    row({ id: "mid", publish_date: "2025-05-01" }),
  ];
  const noSignalCtx: CaseStudyContext = { userCountryKey: "", userSectors: [], sellsToSectors: [], targetRegionTokens: [] };
  const picked = selectCaseStudies(rows, noSignalCtx, 4, 2);
  assert.deepEqual(picked.map((p) => p.row.id), ["new", "mid"]);
  assert.ok(picked.every((p) => p.score === 0));
});
