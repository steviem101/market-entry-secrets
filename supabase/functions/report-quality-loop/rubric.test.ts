/**
 * Tests for the report-quality loop rubric (pure logic). Run: `npm test`.
 * Covers tier-awareness (Freemium not penalised for gated sections), the compact-input
 * builder (PII scrubbing), LLM-response parsing, ranking, and theme de-duping.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  expectedVisibleSections, gatedSections, tierMeets, normalizeTier, buildCompactInput, buildScoringMessages,
  parseScoring, toProposalRows, rankAndCap, rankScore, themeKey, summariseThemes,
  RUBRIC_VERSION, CATEGORIES,
} from "./rubric.ts";

// --- tier-awareness ------------------------------------------------------------------

test("sections introduced after a report's generation are not expected of it (MES-210a)", () => {
  // Pre-introduction report: case_studies_guides must not count against it.
  const before = expectedVisibleSections("free", "2026-07-01T00:00:00Z");
  assert.ok(!before.includes("case_studies_guides"));
  // Post-introduction and undated (today's set) both expect it.
  assert.ok(expectedVisibleSections("free", "2026-07-19T00:00:00Z").includes("case_studies_guides"));
  assert.ok(expectedVisibleSections("free").includes("case_studies_guides"));
});

test("free tier expects free sections (incl. swot/competitor/investor); mentor/first_customers/lead_list gated (MES-193)", () => {
  const exp = expectedVisibleSections("free");
  assert.ok(exp.includes("executive_summary"));
  assert.ok(exp.includes("service_providers"));
  assert.ok(exp.includes("events_resources"));
  assert.ok(exp.includes("action_plan"));
  assert.ok(exp.includes("setup_compliance"));
  // MES-193: swot / competitor / investor are now free for everyone
  assert.ok(exp.includes("swot_analysis"));
  assert.ok(exp.includes("competitor_landscape"));
  assert.ok(exp.includes("investor_recommendations"));
  // gated ones must NOT be expected for free
  assert.ok(!exp.includes("mentor_recommendations"));
  assert.ok(!exp.includes("first_customers"));
  assert.ok(!exp.includes("lead_list"));

  const gated = gatedSections("free");
  assert.ok(gated.includes("mentor_recommendations"));
  assert.ok(gated.includes("first_customers"));
  assert.ok(gated.includes("lead_list"));
  // MES-193: no longer gated
  assert.ok(!gated.includes("swot_analysis"));
  assert.ok(!gated.includes("competitor_landscape"));
  assert.ok(!gated.includes("investor_recommendations"));
});

test("growth tier unlocks mentors but still gates first_customers/lead_list (scale-only)", () => {
  const gated = gatedSections("growth");
  assert.ok(!gated.includes("mentor_recommendations"));
  assert.ok(!gated.includes("swot_analysis")); // free at every tier
  assert.ok(gated.includes("first_customers")); // scale-only (MES-193)
  assert.ok(gated.includes("lead_list")); // scale-only
});

test("scale and enterprise gate nothing", () => {
  assert.equal(gatedSections("scale").length, 0);
  assert.equal(gatedSections("enterprise").length, 0);
});

test("unknown tier is denied access to gated sections (fails closed)", () => {
  assert.equal(tierMeets("bogus", "growth"), false);
  assert.equal(tierMeets("free", "bogus"), false);
});

test("normalizeTier maps legacy tiers and falls back to free", () => {
  assert.equal(normalizeTier("premium"), "growth");
  assert.equal(normalizeTier("concierge"), "enterprise");
  assert.equal(normalizeTier("Premium"), "growth"); // case-insensitive
  assert.equal(normalizeTier("growth"), "growth"); // current tiers pass through
  assert.equal(normalizeTier("scale"), "scale");
  assert.equal(normalizeTier(null), "free");
  assert.equal(normalizeTier(undefined), "free");
  assert.equal(normalizeTier("bogus"), "free"); // unknown → free
});

test("a legacy 'premium' report is judged as growth-tier, not all-gated", () => {
  // Before the fix, tier='premium' failed every tierMeets() check → gatedSections = ALL,
  // so the judge could never flag a missing section. After normalizeTier it behaves as growth.
  const tier = normalizeTier("premium");
  assert.equal(tier, "growth");
  assert.ok(expectedVisibleSections(tier).includes("mentor_recommendations")); // growth-gated, now expected
  assert.ok(gatedSections(tier).includes("lead_list")); // still scale-only
  assert.ok(!gatedSections(tier).includes("swot_analysis")); // swot is free for all (MES-193)
});

// --- compact input + PII scrubbing ---------------------------------------------------

const RQ = {
  report_id: "rep-1",
  build_health: 70, report_score: 55, score_presentation: 60, score_substance: 50,
  score_coverage: 65, score_completeness: 58,
  metadata: { company: "Acme Pty" },
  utilization: { dropped: ["leads", "events"] },
  presentation: { flags: ["duplication: a~b", "no hyperlinks"] },
};
const REPORT = {
  id: "rep-1",
  tier_at_generation: "free",
  intake_form_id: "intake-1",
  report_json: {
    company_name: "Acme",
    sections: {
      executive_summary: { visible: true, content: "Acme entering Sydney market. ".repeat(20), matches: [] },
      service_providers: { visible: true, content: "Providers here.", matches: [{ id: "p1", name: "Legal Co" }, { id: "p2", name: "Tax Co" }] },
      lead_list: { visible: false, content: "Hidden leads.", matches: [{ id: "l1", name: "Lead DB" }] },
    },
    matches: { service_providers: [{ id: "p1" }, { id: "p2" }], leads: [{ id: "l1" }] },
  },
};
const INTAKE = {
  company_name: "Acme Pty",
  country_of_origin: "Singapore",
  industry_sector: ["technology"],
  target_regions: ["Sydney"],
  goal_ids: ["find_providers", "events"],
  end_buyer_industries: ["construction"],
  report_focus: "find legal help",
  additional_notes: "tight timeline",
  user_id: "should-not-appear",
  contact_email: "secret@example.com",
};

test("buildCompactInput captures inputs and scrubs PII (no email/user_id)", () => {
  const c = buildCompactInput(RQ, REPORT, INTAKE);
  assert.equal(c.tier, "free");
  assert.equal(c.company, "Acme Pty");
  assert.equal(c.inputs.country_of_origin, "Singapore");
  assert.deepEqual(c.inputs.selected_goals, ["find_providers", "events"]);
  assert.equal(c.match_counts.service_providers, 2);
  assert.equal(c.match_counts.leads, 1);

  const serialized = JSON.stringify(c);
  assert.ok(!serialized.includes("secret@example.com"), "email must not leak into compact payload");
  assert.ok(!serialized.includes("should-not-appear"), "user_id must not leak into compact payload");

  // lead_list is correctly marked gated for a free report
  const lead = c.sections.find((s) => s.key === "lead_list");
  assert.ok(lead);
  assert.equal(lead!.gated, true);
  assert.equal(lead!.visible, false);
});

test("scoring prompt tells the model not to penalise gated sections", () => {
  const c = buildCompactInput(RQ, REPORT, INTAKE);
  const { system, user } = buildScoringMessages(c);
  assert.match(system, /NEVER flag them as missing/i);
  assert.match(user, /gated_sections \(DO NOT penalise as missing\)/);
  // the gated lead_list must appear in the gated list, not as an expectation
  assert.ok(user.includes("lead_list"));
});

// --- parsing -------------------------------------------------------------------------

test("parseScoring tolerates fenced JSON and clamps values", () => {
  const raw = "```json\n" + JSON.stringify({
    relevance: 120, conciseness: -5, fidelity: 80, summary: "ok",
    findings: [
      { category: "matching/relevance", title: "Irrelevant mentors", evidence: "x", recommended_change: "tighten sector filter", impact: "high", confidence: 0.9, risk: "low" },
      { category: "bogus-cat", title: "", evidence: "", recommended_change: "", impact: "weird", confidence: 5, risk: "nope" },
    ],
  }) + "\n```";
  const p = parseScoring(raw);
  assert.equal(p.axes.relevance, 100); // clamped
  assert.equal(p.axes.conciseness, 0); // clamped
  assert.equal(p.axes.fidelity, 80);
  // second finding dropped (no title/recommended_change)
  assert.equal(p.findings.length, 1);
  assert.equal(p.findings[0].category, "matching/relevance");
  assert.equal(p.findings[0].impact, "high");
});

test("parseScoring returns empty on garbage", () => {
  const p = parseScoring("not json at all");
  assert.equal(p.findings.length, 0);
  assert.equal(p.axes.relevance, 0);
});

test("unknown category falls back to content/prompt-bulk", () => {
  const p = parseScoring(JSON.stringify({
    relevance: 50, conciseness: 50, fidelity: 50,
    findings: [{ category: "made-up", title: "T", recommended_change: "C", impact: "low", confidence: 0.3, risk: "low" }],
  }));
  assert.equal(p.findings[0].category, "content/prompt-bulk");
  assert.ok((CATEGORIES as readonly string[]).includes(p.findings[0].category));
});

// --- ranking + proposals -------------------------------------------------------------

test("rankScore orders by impact x confidence", () => {
  assert.ok(rankScore("high", 0.9) > rankScore("medium", 0.9));
  assert.ok(rankScore("high", 0.5) > rankScore("low", 0.9));
});

test("toProposalRows stamps rubric version and theme; rankAndCap sorts + caps", () => {
  const c = buildCompactInput(RQ, REPORT, INTAKE);
  const parsed = parseScoring(JSON.stringify({
    relevance: 40, conciseness: 30, fidelity: 60, summary: "padded",
    findings: [
      { category: "content/prompt-bulk", title: "Trim exec summary padding", evidence: "200w filler", recommended_change: "cap exec summary at 150w", impact: "low", confidence: 0.4, risk: "low" },
      { category: "matching/relevance", title: "Generalist providers surfaced", evidence: "Legal Co off-sector", recommended_change: "require sector_tags overlap", impact: "high", confidence: 0.9, risk: "medium" },
    ],
  }));
  const rows = toProposalRows(c, parsed);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].rubric_version, RUBRIC_VERSION);
  assert.ok(rows[0].dedup_theme.startsWith(rows[0].category + ":"));
  // PII check on emitted proposal rows
  assert.ok(!JSON.stringify(rows).includes("secret@example.com"));

  const ranked = rankAndCap(rows, 1);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].category, "matching/relevance"); // highest impact x confidence first
});

test("themeKey is stable regardless of word order/punctuation", () => {
  const a = themeKey("matching/relevance", "Irrelevant mentors surfaced!");
  const b = themeKey("matching/relevance", "mentors surfaced, irrelevant");
  assert.equal(a, b);
});

test("summariseThemes counts recurring themes", () => {
  const c = buildCompactInput(RQ, REPORT, INTAKE);
  const mk = (title: string) => toProposalRows(c, parseScoring(JSON.stringify({
    relevance: 50, conciseness: 50, fidelity: 50,
    findings: [{ category: "matching/relevance", title, recommended_change: "x", impact: "medium", confidence: 0.6, risk: "low" }],
  })));
  const rows = [...mk("Irrelevant mentors surfaced"), ...mk("mentors surfaced irrelevant"), ...mk("Bulky exec summary")];
  const themes = summariseThemes(rows);
  assert.equal(themes[0].count, 2); // the two mentor variants collapse
});
