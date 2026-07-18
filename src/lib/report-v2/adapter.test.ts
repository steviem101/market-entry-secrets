import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adaptPipelineReport,
  domainTier,
  mapPlan,
  sanitizeContractPath,
  toParagraphs,
} from "./adapter.ts";

const noop = () => {};

test("sanitizeContractPath allows only platform-relative paths", () => {
  const logged: string[] = [];
  const log = (_p: string, issue: string) => logged.push(issue);
  assert.equal(sanitizeContractPath("/investors/aura-ventures", "x", log), "/investors/aura-ventures");
  assert.equal(sanitizeContractPath("https://evil.example", "x", log), "");
  assert.equal(sanitizeContractPath("javascript:alert(1)", "x", log), "");
  assert.equal(sanitizeContractPath("//evil.example", "x", log), "");
  assert.equal(sanitizeContractPath("", "x", log), "");
  assert.equal(logged.length, 3);
});

test("domainTier: regulator, analyst, unknown→vendor; no substring false positives", () => {
  assert.equal(domainTier("https://www.ato.gov.au/some/page"), "regulator");
  assert.equal(domainTier("https://www.ibisworld.com/au/industry/x"), "analyst");
  assert.equal(domainTier("https://someblog.example.com/post"), "vendor");
  // Agency-name alternatives are label-anchored, so these are NOT regulators.
  assert.equal(domainTier("https://mercato.com/x"), "vendor");
  assert.equal(domainTier("https://cato.org/x"), "vendor");
  assert.equal(domainTier("https://basic.com.au/x"), "vendor");
});

test("toParagraphs: heading is its own paragraph, in-range citation → chip, lists stripped", () => {
  const out = toParagraphs("## Market\nValued at $3B [1, 2].\n\n- point one\n- point two", "p", noop, 2);
  assert.deepEqual(out, ["**Market**", "Valued at $3B {chip:sourced}.", "point one point two"]);
});

test("toParagraphs: citation with no matching source is dropped, no chip minted", () => {
  const logged: string[] = [];
  const log = (_p: string, issue: string) => logged.push(issue);
  assert.deepEqual(toParagraphs("Grew fast [3].", "p", log, 0), ["Grew fast."]);
  assert.deepEqual(toParagraphs("Grew fast [9].", "p", noop, 3), ["Grew fast."]);
  assert.ok(logged.some((i) => i.includes("no matching source")));
});

test("toParagraphs: a citation inside a bold span is moved out so it renders as a chip", () => {
  assert.deepEqual(toParagraphs("**$2.2B in funding [3]** across.", "p", noop, 3), [
    "**$2.2B in funding** {chip:sourced} across.",
  ]);
});

test("toParagraphs: numbered list markers are stripped and logged", () => {
  const logged: string[] = [];
  const log = (_p: string, issue: string) => logged.push(issue);
  assert.deepEqual(toParagraphs("1. Register\n2. Bank\n3. Director", "p", log), ["Register Bank Director"]);
  assert.ok(logged.some((i) => i.includes("list markers stripped")));
});

test("mapPlan: paid tiers → scale, unknown/empty fail closed to free", () => {
  assert.equal(mapPlan("scale", noop), "scale");
  assert.equal(mapPlan("enterprise", noop), "scale");
  assert.equal(mapPlan("growth", noop), "scale");
  assert.equal(mapPlan("premium", noop), "scale");
  assert.equal(mapPlan("free", noop), "free");
  assert.equal(mapPlan("trial", noop), "free");
  assert.equal(mapPlan(undefined, noop), "free");
});

test("adaptPipelineReport maps a realistic pipeline JSON without throwing and logs gaps", () => {
  const { report, mismatches } = adaptPipelineReport(
    {
      company_name: "Floats",
      sections: {
        executive_summary: {
          content: "Floats is scaling into a ready market [1]. Timing favours you.\n\nSecond paragraph.",
          visible: true,
          matches: [{ name: "Aura Ventures", link: "/investors/aura-ventures" }],
        },
        competitor_landscape: {
          content: "Competitors...",
          visible: true,
          matches: [{ name: "JobAdder", link: "https://jobadder.com", tags: ["ATS"] }],
        },
        action_plan: { content: "Do things first.\n\nThen more things.", visible: true },
      },
      matches: {
        service_providers: [
          { name: "LegalVision", link: "/service-providers/legalvision", subtitle: "Sydney · law firm", tags: ["Legal"], description: "Commercial firm." },
        ],
        community_members: [
          { name: "Jane Citizen", link: "/mentors/experts/jane-citizen", subtitle: "CEO, Example", description: "Recruitment operator." },
        ],
        events: [{ name: "SaaS Connect", link: "/events/saas-connect", date: "2026-08-01", location: "Sydney" }],
        // The pipeline stores lead datasets under the `leads` key (renamed from
        // lead_databases before persistence); the adapter must read that key.
        leads: [{ name: "Agencies list", link: "/leads/agencies", record_count: 360, description: "Recruitment agencies." }],
      },
      metadata: {
        perplexity_citations: ["https://www.ato.gov.au/x", "https://www.ibisworld.com/y", "https://blog.example.com/z"],
        key_metrics: [{ label: "Market size", value: "$3.1B", context: "AU, 2026", estimated: true }],
      },
    },
    { tier: "scale", keyQuestion: "Seed investors", date: "2026-07-18", location: "Melbourne, VIC" }
  );

  // Structural validity — required keys exist, nothing thrown.
  assert.equal(report.meta.customer, "Floats");
  assert.equal(report.meta.plan, "scale");
  assert.equal(report.meta.sourceCount, 3);
  assert.equal(report.cover.headline, "Floats is scaling into a ready market.");
  assert.equal(report.exec.narrative.length, 2);
  assert.match(report.exec.narrative[0], /\{chip:sourced\}/);
  assert.equal(report.exec.highlights[0].url, "/investors/aura-ventures");
  assert.equal(report.metrics.tiles[0].chip, "est");
  // Off-platform competitor link rejected, not rendered raw.
  assert.equal(report.competitors.rows[0].url, "");
  assert.equal(report.providers.ourRead.length, 1);
  assert.equal(report.providers.ourRead[0].rank, 1);
  assert.equal(report.mentors.primary[0].url, "/mentors/experts/jane-citizen");
  assert.equal(report.leads.dataset?.records, 360);
  assert.equal(report.actionPlan.phases.length, 3);
  assert.deepEqual(report.sources.regulator, ["ato.gov.au"]);
  assert.deepEqual(report.sources.analyst, ["ibisworld.com"]);
  assert.deepEqual(report.sources.vendor, ["blog.example.com"]);
  // Gaps are logged, not silent.
  assert.ok(mismatches.some((m) => m.path === "meta.archetype"));
  assert.ok(mismatches.some((m) => m.path.startsWith("competitors.rows[0]")));
  assert.ok(mismatches.some((m) => m.path === "swot"));
});

test("headline skips heading-only leads but keeps in-sentence bold", () => {
  const { report } = adaptPipelineReport(
    { sections: { executive_summary: { content: "## Executive Summary\n\n**lemlist** is ready to scale [1]. More prose." } } },
    {}
  );
  assert.equal(report.cover.headline, "lemlist is ready to scale.");
});

test("R11 relevance gate drops non-commercial competitor matches and logs", () => {
  const { report, mismatches } = adaptPipelineReport(
    {
      sections: {
        competitor_landscape: {
          content: "x",
          matches: [
            { name: "Clay Aiken", link: "https://clayaiken.com", subtitle: "American singer and entertainer." },
            { name: "Apollo.io", link: "https://apollo.io", subtitle: "Sales intelligence platform." },
          ],
        },
      },
    },
    {}
  );
  assert.deepEqual(report.competitors.rows.map((r) => r.name), ["Apollo.io"]);
  assert.ok(mismatches.some((m) => m.issue.includes('R11 relevance gate dropped "Clay Aiken"')));
});

test("account status chips are mapped from pipeline tags; hero stat is not duplicated", () => {
  const { report } = adaptPipelineReport(
    {
      company_name: "X",
      sections: {
        first_customers: {
          matches: [{ name: "Adecco", link: "/x", subtitle: "Global", tags: ["Hiring now", "Tech identified"], description: "d" }],
        },
      },
      metadata: { key_metrics: [{ label: "Market", value: "$3B" }] },
    },
    {}
  );
  assert.deepEqual(report.accounts.briefed[0].statusChips, ["hiring", "tech"]);
  // key_metrics[0] renders as tile 1, so it must NOT also be reused as the hero.
  assert.equal(report.exec.heroStat.value, "");
  assert.equal(report.metrics.tiles[0].value, "$3B");
});

test("adaptPipelineReport survives an empty report_json", () => {
  const { report, mismatches } = adaptPipelineReport({}, {});
  assert.equal(report.meta.customer, "");
  assert.equal(report.meta.plan, "free");
  assert.equal(report.actionPlan.phases.length, 3);
  assert.ok(mismatches.length > 0);
});
