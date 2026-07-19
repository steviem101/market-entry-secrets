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
          content: "Floats is scaling into a ready market. Timing favours you [1].\n\nSecond paragraph.\n\nThird paragraph.",
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
  // Cover owns paragraph 1 (headline = sentence 1, scope = the rest); §01
  // narrative starts at paragraph 2, so the opening thesis is never repeated.
  assert.equal(report.exec.narrative.length, 2);
  assert.deepEqual(report.exec.narrative, ["Second paragraph.", "Third paragraph."]);
  assert.match(report.cover.scope, /\{chip:sourced\}/);
  assert.equal(report.exec.highlights[0].url, "/investors/aura-ventures");
  assert.equal(report.metrics.tiles[0].chip, "est");
  // Off-platform competitor link rejected, not rendered raw.
  assert.equal(report.competitors.rows[0].url, "");
  assert.equal(report.providers.ourRead.length, 1);
  assert.equal(report.providers.ourRead[0].rank, 1);
  assert.equal(report.mentors.primary[0].url, "/mentors/experts/jane-citizen");
  assert.equal(report.leads.dataset?.records, 360);
  // A single flat phase from prose (no longer padded to 3 empty columns).
  assert.equal(report.actionPlan.phases.length, 1);
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

test("SWOT prose is parsed into quadrant items with leads + chips", () => {
  const { report } = adaptPipelineReport(
    {
      sections: {
        swot_analysis: {
          content:
            "### **Strengths**\n\n*   **Trade Advantage:** Duty-free access under AUSFTA [1].\n*   **Local Presence:** Sydney office since 2014.\n\n### Weaknesses\n\n*   **Payroll Overheads:** High mandatory super contributions.\n\n## Opportunities\n\n*   **AI Demand:** Personalisation is growing fast.\n\n### Threats\n\n*   **Vertical Rivals:** Local players own niches.",
        },
      },
      metadata: { perplexity_citations: ["https://ato.gov.au/x"] },
    },
    {}
  );
  assert.equal(report.swot.strengths.length, 2);
  assert.equal(report.swot.strengths[0].lead, "Trade Advantage");
  assert.match(report.swot.strengths[0].text, /\{chip:sourced\}/);
  assert.equal(report.swot.weaknesses.length, 1);
  assert.equal(report.swot.opportunities.length, 1);
  assert.equal(report.swot.threats.length, 1);
});

test("match descriptions ignore raw enriched_description scrape and error pages", () => {
  const { report } = adaptPipelineReport(
    {
      matches: {
        service_providers: [
          {
            name: "Junk Co",
            link: "/service-providers/junk",
            description: "A tidy commercial firm helping tech companies enter Australia.",
            enriched_description:
              "[Skip to content](https://junk.co/#content)\n\n## HOW WE HELP\n\n![logo](https://junk.co/logo.png)",
          },
          {
            name: "Error Co",
            link: "/service-providers/error",
            description: "# 403\n\n## Forbidden\n\nAccess to this resource on the server is denied!",
          },
        ],
        investors: [
          { name: "Solo Angel", link: "/investors/solo", tags: ["N/A (individual entry)"], description: "Angel investor (ID 22). This entry represents an individual, not a fund." },
        ],
      },
    },
    {}
  );
  // Curated description used; no markdown/scrape artifacts.
  assert.equal(report.providers.all[0].description, "A tidy commercial firm helping tech companies enter Australia.");
  // Error-page description dropped to empty.
  assert.equal(report.providers.all[1].description, "");
  // Placeholder "N/A (…)" tag suppressed; curation notes stripped.
  assert.equal(report.investors.all[0].stageTag, "");
  assert.ok(!/\(ID 22\)|This entry represents/.test(report.investors.all[0].description));
});

test("metric captions drop [n] markers and slug labels", () => {
  const { report } = adaptPipelineReport(
    {
      metadata: {
        key_metrics: [{ label: "Australia-CRM-software market size", value: "AUD 2.60B", context: "2024 estimate for national CRM software market[1]", estimated: true }],
        perplexity_citations: ["https://ibisworld.com/x"],
      },
    },
    {}
  );
  assert.equal(report.metrics.tiles[0].caption, "2024 estimate for national CRM software market");
  assert.ok(!/\[\d+\]/.test(report.metrics.tiles[0].caption));
});

test("exec key-question subsection is split into its own box", () => {
  const { report } = adaptPipelineReport(
    {
      sections: {
        executive_summary: {
          content:
            "## Executive Summary\n\nThesis sentence one. Continuation two.\n\nMore body prose.\n\n---\n\n### Your Key Question — Answered\n\n> \"find grants and funding\"\n\nThe direct answer: grants are limited but tax incentives help.",
        },
      },
    },
    {}
  );
  assert.match(report.exec.keyQuestionAnswer, /The direct answer: grants are limited/);
  // The question blockquote and heading do not leak into the narrative.
  assert.ok(!report.exec.narrative.some((p) => /Your Key Question|find grants and funding|^-{3,}$/.test(p)));
});

test("action plan prose is parsed into structured phases with grouped sub-blocks", () => {
  const { report } = adaptPipelineReport(
    {
      sections: {
        action_plan: {
          content:
            "## Phased Action Plan\n\n### Phase 1 — Foundation (Months 1–2): Legal & Funding\n\n**Legal Entity**\n- Choose a Pty Ltd [1]\n- Appoint a resident director\n\n**Tax & GST**\n- Register for GST at $75,000\n\n### Phase 2 — Establish (Months 2–4): Team\n\n**Hiring**\n- Benchmark salaries",
        },
      },
      metadata: { perplexity_citations: ["https://ato.gov.au/x"] },
    },
    {}
  );
  assert.equal(report.actionPlan.phases.length, 2);
  assert.equal(report.actionPlan.phases[0].period, "Months 1–2");
  assert.equal(report.actionPlan.phases[0].title, "Foundation");
  assert.equal(report.actionPlan.phases[0].groups?.length, 2);
  assert.equal(report.actionPlan.phases[0].groups?.[0].title, "Legal Entity");
  assert.match(report.actionPlan.phases[0].groups?.[0].body ?? "", /Choose a Pty Ltd \{chip:sourced\} · Appoint a resident director/);
  // §14 arriveWith derives from the action-plan group titles.
  assert.deepEqual(report.close.arriveWith, ["Legal Entity", "Tax & GST", "Hiring"]);
});

test("action plan with no phase headings falls back to one flat phase", () => {
  const { report } = adaptPipelineReport(
    { sections: { action_plan: { content: "Do the first thing.\n\nThen the second thing." } } },
    {}
  );
  assert.equal(report.actionPlan.phases.length, 1);
  assert.equal(report.actionPlan.phases[0].groups?.length ?? 0, 0);
  assert.match(report.actionPlan.phases[0].body ?? "", /Do the first thing/);
});

test("compliance prose is parsed into a lead intro + checklist", () => {
  const { report } = adaptPipelineReport(
    {
      sections: {
        setup_compliance: {
          content:
            "This guide outlines the requirements.\n\n### Company Structure\n\n- **Resident Director:** Appoint one Australian resident.\n- **ABN:** Register with **ASIC** first.\n\n### Tax\n\n- **GST:** Mandatory at **A$75,000**.",
        },
      },
    },
    {}
  );
  assert.match(report.compliance.intro, /This guide outlines the requirements/);
  assert.equal(report.compliance.checklist.length, 3);
  assert.equal(report.compliance.checklist[0].lead, "Resident Director");
  assert.match(report.compliance.checklist[1].text, /\*\*ASIC\*\*/); // grammar preserved for Rich
  assert.equal(report.compliance.table.length, 0); // exposure table stays Phase-B
});

test("adaptPipelineReport survives an empty report_json", () => {
  const { report, mismatches } = adaptPipelineReport({}, {});
  assert.equal(report.meta.customer, "");
  assert.equal(report.meta.plan, "free");
  // No content → no phases (empty section is suppressed, not padded).
  assert.equal(report.actionPlan.phases.length, 0);
  assert.ok(mismatches.length > 0);
});
