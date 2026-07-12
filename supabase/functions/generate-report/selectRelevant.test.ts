import { test } from "node:test";
import assert from "node:assert/strict";
import {
  selectRelevantSurface,
  applyRelevanceSelection,
  SURFACE_SELECT,
  SURFACE_SELECT_IMMIGRATION,
} from "./selectRelevant.ts";
import { buildGeoMatcher, geoOriginTerms } from "./geoRelevance.ts";
import { pruneAcrossGroups } from "./matchScoring.ts";
import type { RelevanceGates } from "./scoreRelevance.ts";
import type { MatchContext } from "./matchScoring.ts";

const ctx: MatchContext = {
  userSectors: ["financial-services"],
  sellsToSectors: [],
  serviceTags: [],
  locationPatterns: ["sydney"],
  userCountry: "united kingdom",
  userIsIntl: true,
  countryTerm: "united kingdom",
};

const ukGates: RelevanceGates = {
  geoMatcher: buildGeoMatcher({ targetRegions: ["sydney"] }),
  agencyOriginTerms: geoOriginTerms("United Kingdom"),
  targetRegions: ["sydney"],
  icpTokens: ["fintech", "payments"],
  excludeImmigration: false,
};

test("agencies: hard-drops out-of-corridor + wrong-state, keeps in-corridor", () => {
  const rows = [
    { id: "1", name: "Austrade", organisation_type: "government", location_country: "australia" }, // keep
    { id: "2", name: "US Commercial Service", organisation_type: "foreign trade agency", country_iso2: "us" }, // corridor drop
    { id: "3", name: "Global Victoria", organisation_type: "state body", location_state: "VIC", location_country: "australia" }, // state drop
  ];
  const kept = selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT.trade_investment_agencies);
  assert.deepEqual(kept.map((r) => r.id), ["1"]);
});

test("leads: hard-drops off-ICP lists", () => {
  const rows = [
    { id: "a", title: "Australian Fintech Payments Companies", sector: "Fintech", tags: ["payments"] }, // keep
    { id: "b", title: "Recently Funded Startups", sector: "General", tags: ["startups"] }, // off-icp drop
  ];
  const kept = selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT.lead_databases);
  assert.deepEqual(kept.map((r) => r.id), ["a"]);
});

test("providers: chamber mismatch hard-drops; geo is floor-guarded", () => {
  const rows = [
    { id: "1", name: "Sydney FinTech Advisory", location: "Sydney, NSW", sector_tags: ["financial-services"] }, // in-market
    { id: "2", name: "American Chamber of Commerce in Australia" }, // chamber drop (hard) / no location
    { id: "3", name: "Manhattan Capital", location: "New York, NY, USA" }, // geo-foreign (soft)
    { id: "4", name: "Melbourne Advisers", location: "Melbourne, VIC" }, // in-market (ANZ)
    { id: "5", name: "Perth Group", location: "Perth, WA" }, // in-market
  ];
  const kept = selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT.service_providers);
  // With 3 in-market rows (1,4,5) the geo floor (3) is met, so the foreign row (3)
  // and the location-less chamber row (2) both drop.
  assert.ok(!kept.some((r) => r.id === "2"), "chamber/no-geo row dropped");
  assert.ok(!kept.some((r) => r.id === "3"), "foreign geo dropped (enough in-market)");
  assert.deepEqual(kept.map((r) => r.id).sort(), ["1", "4", "5"]);
});

test("providers: geo is counted BEFORE chamber (ordering fix — no extra foreign backfill)", () => {
  // The discriminating case for the hard/soft ordering: a chamber-mismatch row (D)
  // that is ALSO geo-relevant. Legacy runs geo (soft, floor 3) THEN chamber (hard),
  // so D fills the geo floor and only then drops — leaving ONE foreign backfill slot.
  // The buggy "all-hard-first" order would drop D first, freeing TWO foreign slots.
  const rows = [
    { id: "A", name: "Sydney FinTech Advisory", location: "Sydney, NSW" }, // geo-ok, non-chamber
    { id: "D", name: "American Chamber of Commerce in Australia", location: "Sydney, NSW" }, // chamber-mismatch + geo-ok
    { id: "B", name: "Manhattan Capital", location: "New York, NY, USA" }, // geo-foreign
    { id: "C", name: "Boston Ventures", location: "Boston, MA, USA" }, // geo-foreign
  ];
  const kept = selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT.service_providers);
  // geo floor 3: geo-relevant = {A, D} (2 < 3) → backfill exactly ONE weak row (B),
  // giving [A, D, B]; chamber then drops D → [A, B]. The second foreign row (C) is
  // NEVER admitted. Chamber-first would have yielded [A, B, C] (an extra foreign row).
  assert.deepEqual(kept.map((r) => r.id).sort(), ["A", "B"]);
  assert.ok(!kept.some((r) => r.id === "C"), "second foreign row not backfilled in");
});

test("mentors: immigration filter (post-dedupe config) only fires when excludeImmigration is set", () => {
  const rows = [
    { id: "1", name: "Jane Expert", title: "Fintech Advisor", specialties: ["payments"] },
    { id: "2", name: "Visa Sam", title: "Immigration & Visa Specialist", specialties: ["work visa sponsorship"] },
    { id: "3", name: "Bob Growth", title: "Growth Advisor" },
    { id: "4", name: "Amy Scale", title: "Scale Advisor" },
  ];
  // excludeImmigration false → nothing dropped.
  assert.equal(
    selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT_IMMIGRATION.community_members).length,
    4,
  );
  // excludeImmigration true, floor 3 → with 3 non-immigration rows, the visa mentor drops.
  const domestic = { ...ukGates, excludeImmigration: true };
  const kept = selectRelevantSurface(rows, ctx, domestic, SURFACE_SELECT_IMMIGRATION.community_members);
  assert.ok(!kept.some((r) => r.id === "2"), "visa mentor demoted");
  assert.equal(kept.length, 3);
});

test("providers immigration (post-dedupe config): floor 4, demotes immigration provider for domestic", () => {
  const domestic = { ...ukGates, excludeImmigration: true };
  const rows = [
    { id: "1", name: "Alpha Advisory", tags: ["strategy"] },
    { id: "2", name: "Beta Legal", tags: ["legal"] },
    { id: "3", name: "Gamma Finance", tags: ["finance"] },
    { id: "4", name: "Delta Ops", tags: ["operations"] },
    { id: "5", name: "TechVisa", tags: ["business immigration", "visa sponsorship"], description: "immigration and visa services" },
  ];
  // floor 4: 4 non-immigration rows exist, so the immigration provider (5) drops.
  const kept = selectRelevantSurface(rows, ctx, domestic, SURFACE_SELECT_IMMIGRATION.service_providers);
  assert.ok(!kept.some((r) => r.id === "5"), "immigration provider demoted");
  assert.equal(kept.length, 4);
});

test("applyRelevanceSelection: runs every pre-dedupe surface, leaves unconfigured pools untouched", () => {
  const pools = {
    trade_investment_agencies: [
      { id: "1", name: "Austrade", organisation_type: "government", location_country: "australia" },
      { id: "2", name: "US Commercial Service", organisation_type: "foreign trade agency", country_iso2: "us" },
    ],
    events: [{ id: "e1", title: "Some Event" }], // not a relevance surface — untouched
  };
  const out = applyRelevanceSelection(pools, ctx, ukGates);
  assert.deepEqual(out.trade_investment_agencies.map((r: any) => r.id), ["1"]);
  assert.deepEqual(out.events, pools.events); // untouched
});

test("applyRelevanceSelection with the immigration config touches ONLY its surfaces", () => {
  const domestic = { ...ukGates, excludeImmigration: true };
  const pools = {
    community_members: [
      { id: "m1", name: "Growth Advisor A" },
      { id: "m2", name: "Growth Advisor B" },
      { id: "m3", name: "Growth Advisor C" },
      { id: "v", name: "Visa Sam", title: "Immigration & Visa Specialist", specialties: ["work visa sponsorship"] },
    ],
    // pre-dedupe surface that must NOT be gated by the immigration pass:
    lead_databases: [{ id: "l1", title: "Recently Funded Startups", sector: "General", tags: ["startups"] }],
  };
  const out = applyRelevanceSelection(pools, ctx, domestic, SURFACE_SELECT_IMMIGRATION);
  assert.ok(!out.community_members.some((r: any) => r.id === "v"), "visa mentor demoted");
  assert.deepEqual(out.lead_databases, pools.lead_databases); // off-ICP list untouched by immigration pass
});

// ── Integration: pre-select → cross-section dedupe → immigration-select ──────
// Locks in the ordering fix. The immigration floor MUST run on the dedupe's far
// side: a mentor kept only to satisfy the floor must not then be deduped below it.
const entityKey = (r: { name?: unknown; title?: unknown; company_name?: unknown }) =>
  String(r?.name || r?.title || r?.company_name || "").toLowerCase().trim();

test("ordering: immigration floor runs AFTER dedupe, so the mentors section keeps its floor", () => {
  const domestic = { ...ukGates, excludeImmigration: true };
  // "Dupe Advisor" appears in BOTH the provider pool and the mentors pool, so dedupe
  // (providers win) removes it from mentors. A visa mentor is also present.
  const providerPool = [{ id: "p", name: "Dupe Advisor" }];
  const mentors = [
    { id: "dup", name: "Dupe Advisor" }, // pruned by dedupe (also a provider)
    { id: "m2", name: "Growth Advisor B" },
    { id: "m3", name: "Growth Advisor C" },
    { id: "v", name: "Visa Sam", title: "Immigration & Visa Specialist", specialties: ["work visa sponsorship"] },
  ];

  // FIXED order: dedupe FIRST, then the immigration floor.
  const [, dedupMentors] = pruneAcrossGroups([providerPool, mentors, []], entityKey);
  assert.equal(dedupMentors.length, 3, "dedupe removed the duplicated mentor");
  const out = applyRelevanceSelection({ community_members: dedupMentors }, ctx, domestic, SURFACE_SELECT_IMMIGRATION);
  // After dedupe only [m2, m3] are non-immigration (2 < floor 3), so the visa mentor
  // is BACKFILLED to keep the section at its floor — it must survive.
  assert.equal(out.community_members.length, 3, "mentors held at floor 3 post-dedupe");
  assert.ok(out.community_members.some((r: any) => r.id === "v"), "visa mentor backfilled after dedupe thinned the pool");
  // (The buggy pre-dedupe order would have dropped the visa mentor while 3
  // non-immigration rows still existed, then dedupe would drop one → only 2 left.)
});

test("empty / missing pools are safe", () => {
  assert.deepEqual(selectRelevantSurface([], ctx, ukGates, SURFACE_SELECT.lead_databases), []);
  const out = applyRelevanceSelection({}, ctx, ukGates);
  assert.deepEqual(out, {});
  const outImm = applyRelevanceSelection({}, ctx, ukGates, SURFACE_SELECT_IMMIGRATION);
  assert.deepEqual(outImm, {});
});
