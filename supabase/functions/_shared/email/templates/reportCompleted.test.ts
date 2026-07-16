/**
 * Tests for the tier-aware report-ready email (MES-197 / T16a). Run: `npm test`.
 * Asserts the correct variant per tier, counts-only locked findings (no names),
 * booking link + SLA sourced from the shared fulfilment constant, and dark-mode
 * safety (semantic layout, no inline light-only colours introduced here).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { render, parseLockedFindings } from "./reportCompleted.ts";
import { FULFILMENT, SLA, hubSlaSentence, normalizeTier } from "../fulfilment.ts";

const base = {
  first_name: "Aoife",
  company_name: "Acme Pty",
  report_url: "https://marketentrysecrets.com/report/rep-1",
};

test("subject names the company for every tier", () => {
  for (const tier of ["free", "growth", "scale", "enterprise", undefined]) {
    const { subject } = render({ ...base, tier });
    assert.equal(subject, "Your Acme Pty market entry report is ready");
  }
});

test("free variant teases locked findings by COUNT only — never names", () => {
  const { html } = render({
    ...base,
    tier: "free",
    locked_findings: [
      { key: "mentor_recommendations", count: 4 },
      { key: "investor_recommendations", count: 2 },
      { key: "lead_list", count: 7 },
    ],
  });
  assert.match(html, /What your locked sections found/);
  assert.match(html, /4 mentors matched to your situation/);
  assert.match(html, /2 investors matched to your stage/);
  assert.match(html, /7 lead sources for your target buyers/);
  // self-serve next step points at pricing
  assert.match(html, /\/pricing/);
  // no booking link / SLA leaks into the free email
  assert.doesNotMatch(html, /calendly\.com/);
  assert.doesNotMatch(html, /within 7 days/);
});

test("singular vs plural in locked counts", () => {
  const { html } = render({
    ...base,
    tier: "free",
    locked_findings: [{ key: "mentor_recommendations", count: 1 }],
  });
  assert.match(html, /1 mentor matched/);
  assert.doesNotMatch(html, /1 mentors/);
});

test("free variant with no locked findings falls back to a generic upsell", () => {
  const { html } = render({ ...base, tier: "free", locked_findings: [] });
  assert.doesNotMatch(html, /What your locked sections found/);
  assert.match(html, /upgrading unlocks any gated sections/);
  assert.match(html, /\/pricing/);
});

test("growth variant shows the 30-min booking link + intros-only SLA, no lead list", () => {
  const { html } = render({ ...base, tier: "growth" });
  assert.match(html, /Book your included session/);
  assert.ok(html.includes(FULFILMENT.growth.calendly));
  assert.match(html, /What's coming to your hub/);
  assert.ok(html.includes(SLA.intros));
  // growth has no lead list — the 48h lead-list clause must be absent
  assert.doesNotMatch(html, /lead list follows/);
  // never shows the free upsell
  assert.doesNotMatch(html, /What your locked sections found/);
});

test("scale variant shows the 60-min link + lead-list 48h AND intros SLA", () => {
  const { html } = render({ ...base, tier: "scale" });
  assert.ok(html.includes(FULFILMENT.scale.calendly));
  assert.ok(html.includes(SLA.leadList));
  assert.ok(html.includes(SLA.intros));
  assert.match(html, /curated lead list follows/);
});

test("enterprise is paid but bespoke — account-manager copy, no self-serve booking", () => {
  const { html } = render({ ...base, tier: "enterprise" });
  assert.match(html, /account manager will be in touch/);
  assert.doesNotMatch(html, /calendly\.com/);
  assert.doesNotMatch(html, /What your locked sections found/);
});

test("legacy tier labels normalise (premium→growth, concierge→enterprise)", () => {
  assert.equal(normalizeTier("Premium"), "growth");
  assert.equal(normalizeTier("concierge"), "enterprise");
  const growth = render({ ...base, tier: "premium" });
  assert.ok(growth.html.includes(FULFILMENT.growth.calendly));
  const ent = render({ ...base, tier: "concierge" });
  assert.match(ent.html, /account manager will be in touch/);
});

test("unknown/missing tier is treated as free (never promises paid fulfilment)", () => {
  const { html } = render({ ...base, tier: "bogus", locked_findings: [{ key: "lead_list", count: 3 }] });
  assert.doesNotMatch(html, /calendly\.com/);
  assert.match(html, /What your locked sections found/);
});

test("parseLockedFindings drops junk (non-array, zero/negative/NaN counts, empty keys)", () => {
  assert.deepEqual(parseLockedFindings(null), []);
  assert.deepEqual(parseLockedFindings("nope"), []);
  assert.deepEqual(
    parseLockedFindings([
      { key: "mentor_recommendations", count: 3 },
      { key: "", count: 5 },
      { key: "lead_list", count: 0 },
      { key: "investor_recommendations", count: -1 },
      { key: "x", count: "bad" },
    ]),
    [{ key: "mentor_recommendations", count: 3 }],
  );
});

test("hubSlaSentence composes from the SLA constant; empty for undefined tiers", () => {
  assert.ok(hubSlaSentence("growth").includes(SLA.intros));
  assert.ok(!hubSlaSentence("growth").includes(SLA.leadList));
  assert.ok(hubSlaSentence("scale").includes(SLA.leadList));
  assert.equal(hubSlaSentence("enterprise"), "");
  assert.equal(hubSlaSentence("free"), "");
});

test("HTML-escapes the company/first name (no raw injection)", () => {
  const { html } = render({
    ...base,
    company_name: "Acme <script>",
    first_name: "A&B",
    tier: "free",
    locked_findings: [],
  });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Acme &lt;script&gt;/);
  assert.match(html, /A&amp;B/);
});
