import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adaptPipelineReport,
  domainTier,
  mapPlan,
  matchHasSectorRelevance,
  parseAccountBriefs,
  accountNamesMatch,
  parseCompetitorProse,
  parseIcpGuidance,
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

test("Phase 3b: competitor strengths join with '·'; company_strengths populate the you-row", () => {
  const { report } = adaptPipelineReport(
    {
      company_name: "Floats",
      sections: {
        competitor_landscape: {
          content: "x",
          matches: [
            { name: "Attio", link: "https://attio.com", subtitle: "CRM.", strengths: ["Modern UI", "Automations"] },
          ],
        },
      },
      metadata: { company_strengths: ["  AU-native ", "", "Vertical focus"] },
    },
    {}
  );
  assert.equal(report.competitors.rows[0].strengths, "Modern UI · Automations");
  // you-row strengths derived from metadata.company_strengths (trimmed, empties dropped)
  assert.equal(report.competitors.you.strengths, "AU-native · Vertical focus");
  // "where you differ" stays a Phase-B comparative output — empty for now
  assert.equal(report.competitors.rows[0].differs, "");
  assert.equal(report.competitors.you.differs, "");
});

test("Phase 3b: no strengths anywhere → empty strengths + logged column-omitted signal", () => {
  const { report, mismatches } = adaptPipelineReport(
    {
      sections: {
        competitor_landscape: {
          content: "x",
          matches: [{ name: "Apollo.io", link: "https://apollo.io", subtitle: "Sales platform." }],
        },
      },
    },
    {}
  );
  assert.equal(report.competitors.rows[0].strengths, "");
  assert.equal(report.competitors.you.strengths, "");
  assert.ok(mismatches.some((m) => m.path === "competitors.rows" && /Strengths column omitted/.test(m.issue)));
});

test("Phase 3c: competitor `differs` maps through; company_positioning fills the you-row", () => {
  const { report } = adaptPipelineReport(
    {
      company_name: "Floats",
      sections: {
        competitor_landscape: {
          content: "x",
          matches: [
            { name: "Attio", link: "https://attio.com", subtitle: "CRM.", differs: "  Horizontal CRM — Floats is recruitment-specific  " },
          ],
        },
      },
      metadata: { company_positioning: "  Built for reverse marketing  " },
    },
    {}
  );
  assert.equal(report.competitors.rows[0].differs, "Horizontal CRM — Floats is recruitment-specific");
  assert.equal(report.competitors.you.differs, "Built for reverse marketing");
});

test("Phase 3c: no contrast anywhere → empty differs + logged Where-differs-omitted signal", () => {
  const { report, mismatches } = adaptPipelineReport(
    {
      sections: {
        competitor_landscape: {
          content: "x",
          matches: [{ name: "Apollo.io", link: "https://apollo.io", subtitle: "Sales platform." }],
        },
      },
    },
    {}
  );
  assert.equal(report.competitors.rows[0].differs, "");
  assert.equal(report.competitors.you.differs, "");
  assert.ok(mismatches.some((m) => m.path === "competitors.rows" && /Where-differs column omitted/.test(m.issue)));
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

test("action plan keeps distinct groups when a phase repeats a sub-block title", () => {
  const { report } = adaptPipelineReport(
    {
      sections: {
        action_plan: {
          content:
            "### Phase 1 — Foundation (Months 1–2): x\n\n**Notes**\n- First note\n\n**Notes**\n- Second note",
        },
      },
    },
    {}
  );
  const groups = report.actionPlan.phases[0].groups ?? [];
  assert.equal(groups.length, 2);
  assert.match(groups[0].body, /First note/); // not wiped by the second same-titled block
  assert.match(groups[1].body, /Second note/);
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

test("scale-view section prose maps to §04/§07/§13 intros, skipping R5 intake guidance", () => {
  const { report } = adaptPipelineReport(
    {
      sections: {
        first_customers: {
          content:
            "To unlock per-account briefs, please provide a list of specific target company names in your intake.\n\n### Strategic Targeting\n\nYour focus should shift to the **Enterprise SaaS** sector [1].",
          matches: [],
        },
        mentor_recommendations: {
          content:
            "Deepening your presence requires enterprise engagement.\n\n### Strategic Mentors\n\n* **Jane** — advisor.",
        },
        lead_list: {
          content:
            "### Datasets\n\nWe did not find a matching pre-built dataset for your industry.\n\n* **Request:** custom list.",
        },
      },
      matches: { community_members: [{ name: "Jane", link: "/mentors/experts/jane" }] },
      metadata: { perplexity_citations: ["https://ato.gov.au/x"] },
    },
    {}
  );
  // §04 skips the intake-guidance opener (R5) and uses the strategic paragraph.
  assert.ok(!/provide a list|in your intake/i.test(report.accounts.intro));
  assert.match(report.accounts.intro, /Enterprise SaaS/);
  // §07 uses the strategic lead paragraph, not the card-duplicating list.
  assert.match(report.mentors.intro, /Deepening your presence/);
  // §13 uses the grounded gap explanation, not the generic fallback.
  assert.match(report.leads.gapCopy ?? "", /did not find a matching pre-built dataset/);
});

test("adaptPipelineReport survives an empty report_json", () => {
  const { report, mismatches } = adaptPipelineReport({}, {});
  assert.equal(report.meta.customer, "");
  assert.equal(report.meta.plan, "free");
  // No content → no phases (empty section is suppressed, not padded).
  assert.equal(report.actionPlan.phases.length, 0);
  assert.ok(mismatches.length > 0);
});

test("t20 matchHasSectorRelevance: true only for genuine industry / sells-to sector reasons", () => {
  assert.equal(matchHasSectorRelevance({ match_reasons: ["industry match ×1 (+3)", "location (+1)"] }), true);
  assert.equal(matchHasSectorRelevance({ match_reasons: ["sells-to sector (+2)"] }), true);
  // agnostic / goal / region fallbacks are NOT sector relevance ("all sectors" ≠ sector hit)
  assert.equal(matchHasSectorRelevance({ match_reasons: ["eligible for all sectors (+0.25)", "target region (+2)"] }), false);
  assert.equal(matchHasSectorRelevance({ match_reasons: ["service/skill fit ×2 (+4)"] }), false);
  assert.equal(matchHasSectorRelevance({}), false);
});

test("t20 coverage note: all-fallback mentor set gets an honest caption; a sector hit suppresses it", () => {
  const fallback = adaptPipelineReport(
    {
      company_name: "Sortd",
      matches: {
        community_members: [
          { name: "Colm Dolan", link: "/mentors/experts/colm-dolan", subtitle: "CEO",
            match_reasons: ["service/skill fit ×2 (+4)", "eligible for all sectors (+0.25)"] },
        ],
      },
    },
    {}
  );
  assert.equal(fallback.report.mentors.coverageNote, "Matched on your goals and stage rather than your specific industry.");
  assert.ok(fallback.mismatches.some((m) => m.path === "mentors.coverageNote"));

  const tailored = adaptPipelineReport(
    {
      matches: {
        community_members: [
          { name: "Sector Specialist", link: "/mentors/experts/x", match_reasons: ["industry match ×1 (+3)"] },
          { name: "Generalist", link: "/mentors/experts/y", match_reasons: ["eligible for all sectors (+0.25)"] },
        ],
      },
    },
    {}
  );
  assert.equal(tailored.report.mentors.coverageNote, undefined);
});

test("t20 coverage note: absent when the section has no matches at all (nothing to caption)", () => {
  const { report } = adaptPipelineReport({ matches: {} }, {});
  assert.equal(report.mentors.coverageNote, undefined);
  assert.equal(report.providers.coverageNote, undefined);
  assert.equal(report.investors.coverageNote, undefined);
});

test("t20 coverage note: providers with an industry match are NOT captioned (Sortd/NEXTGEN case)", () => {
  const { report } = adaptPipelineReport(
    {
      matches: {
        service_providers: [
          { name: "NEXTGEN", link: "/service-providers/nextgen", subtitle: "Sydney",
            match_reasons: ["industry match ×1 (+3)", "industry specialist (+2)"] },
        ],
        investors: [
          { name: "Some Fund", link: "/investors/some-fund", match_reasons: ["target region (+2)"] },
        ],
      },
    },
    {}
  );
  assert.equal(report.providers.coverageNote, undefined);
  // investors here are pure fallback → captioned on stage/funding basis
  assert.equal(report.investors.coverageNote, "Matched on your stage and funding need rather than your specific industry.");
});

test("parseCompetitorProse: pulls lead-in + gaps + positioning; ignores the competitor table blocks", () => {
  const content = [
    "The Australian CRM landscape is mature [1].",
    "",
    "### Top Competitors in the Australian Market",
    "* **Salesforce** — the leader.",
    "",
    "### HubSpot's Strategic Advantages",
    "* Unified data vs fragmented ecosystems.",
    "",
    "### Market Gaps and Opportunities",
    "* **Managed Services Surge:** projected 15.8% CAGR [1].",
    "* **SME-to-Enterprise:** a gap for a platform that scales.",
    "",
    "### Strategic Positioning Recommendation",
    "HubSpot should position as the \"Frictionless Enterprise Alternative\" [1].",
  ].join("\n");
  const out = parseCompetitorProse(content, 1, () => {});
  assert.equal(out.intro, "The Australian CRM landscape is mature {chip:sourced}.");
  // gaps drawn from the Market Gaps block, not the Strategic Advantages block
  assert.match(out.gaps, /Managed Services Surge/);
  assert.match(out.gaps, /SME-to-Enterprise/);
  assert.doesNotMatch(out.gaps, /Unified data/);
  // positioning anchored on "positioning" — never grabs "Strategic Advantages"
  assert.match(out.positioningRead, /Frictionless Enterprise Alternative/);
  assert.doesNotMatch(out.positioningRead, /Unified data/);
});

test("parseCompetitorProse: empty/headingless prose degrades to empty gaps/positioning", () => {
  assert.deepEqual(parseCompetitorProse("", 0, () => {}), { intro: "", gaps: "", positioningRead: "" });
  const noHeadings = parseCompetitorProse("Just a flat paragraph about rivals.", 0, () => {});
  assert.equal(noHeadings.intro, "Just a flat paragraph about rivals.");
  assert.equal(noHeadings.gaps, "");
  assert.equal(noHeadings.positioningRead, "");
});

test("parseCompetitorProse: wired through adaptPipelineReport into §03 boxes", () => {
  const { report } = adaptPipelineReport(
    {
      sections: {
        competitor_landscape: {
          content: "Lead line.\n\n### Market Gaps\n* A real gap.\n\n### Positioning\nGo premium.",
        },
      },
    },
    {}
  );
  assert.equal(report.competitors.intro, "Lead line.");
  assert.match(report.competitors.gaps, /A real gap/);
  assert.equal(report.competitors.positioningRead, "Go premium.");
});

test("parseIcpGuidance: parses the three labels; roles split + de-qualified", () => {
  const content = [
    "Strategic guidance about targeting.",
    "",
    "**Target Roles:** Head of Sales, Sales Operations Manager, or Growth Lead at Australian SaaS organisations.",
    "**Sector Focus:** The Marketing Automation segment, growing 14.8% [1].",
    "**Opening Angle:** Position lemlist as a way to increase CRM efficiency [1].",
  ].join("\n");
  const icp = parseIcpGuidance(content, 1, () => {});
  assert.ok(icp);
  assert.deepEqual(icp.targetRoles, ["Head of Sales", "Sales Operations Manager", "Growth Lead"]);
  assert.match(icp.sectorFocus, /Marketing Automation/);
  assert.match(icp.sectorFocus, /\{chip:sourced\}/);
  assert.match(icp.angle, /Position lemlist/);
});

test("parseIcpGuidance: incomplete block (missing angle) → undefined, never a lopsided card", () => {
  const content = "**Target Roles:** CMO, CRO\n**Sector Focus:** Enterprise SaaS.";
  assert.equal(parseIcpGuidance(content, 0, () => {}), undefined);
  assert.equal(parseIcpGuidance("no labels here", 0, () => {}), undefined);
  assert.equal(parseIcpGuidance("", 0, () => {}), undefined);
});

test("parseIcpGuidance: wired into §04 accounts.icpGuidance", () => {
  const { report } = adaptPipelineReport(
    {
      sections: {
        first_customers: {
          content: "Lead paragraph.\n\n**Target Roles:** Head of Ops, COO\n**Sector Focus:** Hospitality groups.\n**Opening Angle:** Lead with labour-cost savings.",
        },
      },
    },
    {}
  );
  assert.deepEqual(report.accounts.icpGuidance?.targetRoles, ["Head of Ops", "COO"]);
  assert.equal(report.accounts.icpGuidance?.angle, "Lead with labour-cost savings.");
});

test("D1 parseAccountBriefs: parses the real CreditLogic-shaped block (pre-tightening label variants)", () => {
  const content = [
    "This section identifies entry points within target accounts.",
    "",
    "### [Commonwealth Bank (Commbank)](https://www.commbank.com.au)",
    "",
    "**Who they are:** Australia's largest retail bank and a leader in digital transformation.",
    "",
    "**Signals:** Record cash profit of **A$10.25 billion**; 70% of home loan applications automated.",
    "",
    "**Why they fit CreditLogic:** Their high application volume aligns with your automated processing.",
    "",
    "**Who to approach:** Head of Lending, Chief Digital Officer, Head of Mortgage Innovation.",
    "",
    "### [Westpac](https://www.westpac.com.au)",
    "",
    "**Who they are:** A Big Four bank serving 13 million customers.",
    "",
    "**Signals:** Pledged nearly $60 million in refunds.",
    "",
    "**Who to approach:** Head of Remediation, Chief Risk Officer.",
    "",
    "Securing these customers requires local investor backing.",
  ].join("\n");
  const briefs = parseAccountBriefs(content, 0, () => {});
  assert.equal(briefs.length, 2);
  assert.equal(briefs[0].name, "Commonwealth Bank (Commbank)");
  assert.equal(briefs[0].url, "https://www.commbank.com.au");
  assert.match(briefs[0].signals, /A\$10\.25 billion/);
  assert.match(briefs[0].fit, /automated processing/); // "Why they fit CreditLogic:" variant
  assert.deepEqual(briefs[0].approach, ["Head of Lending", "Chief Digital Officer", "Head of Mortgage Innovation"]);
  // the trailing paragraph after Westpac's last label is NOT swallowed into a field
  assert.doesNotMatch(briefs[1].approach.join(" "), /Securing these customers/);
  assert.equal(briefs[1].approach.length, 2);
});

test("D1 accountNamesMatch: card short-name matches prose long-name; unrelated names don't", () => {
  assert.equal(accountNamesMatch("Commbank", "Commonwealth Bank (Commbank)"), true);
  assert.equal(accountNamesMatch("Macquarie Group", "Macquarie Group"), true);
  assert.equal(accountNamesMatch("Westpac", "Macquarie Group"), false);
});

test("D1 briefed merge: prose brief fills signals/fit/approach/angle, meta=who, url adopted; no duplication", () => {
  const { report } = adaptPipelineReport(
    {
      company_name: "CreditLogic",
      sections: {
        first_customers: {
          content: [
            "Intro paragraph.",
            "",
            "### [Commonwealth Bank (Commbank)](https://www.commbank.com.au)",
            "**Who they are:** Australia's largest retail bank.",
            "**Signals:** Record profit; hiring AI and data roles.",
            "**Stack:** OpenAI partnership evident.",
            "**Why they fit:** High application volume.",
            "**Who to approach:** Head of Lending, Chief Digital Officer.",
            "**Opening angle:** Lead with automated hardship processing.",
          ].join("\n"),
          matches: [
            { name: "Commbank", tags: ["Tech identified"], subtitle: "Commonwealth Bank (CommBank) is Australia's leading provider of integrated financial services" },
          ],
        },
      },
    },
    {}
  );
  const a = report.accounts.briefed[0];
  assert.equal(a.signals, "Record profit; hiring AI and data roles.");
  assert.equal(a.stack, "OpenAI partnership evident.");
  assert.equal(a.fit, "High application volume.");
  assert.deepEqual(a.approach, ["Head of Lending", "Chief Digital Officer"]);
  assert.equal(a.angle, "Lead with automated hardship processing.");
  assert.equal(a.url, "https://www.commbank.com.au");
  assert.equal(a.meta, "AUSTRALIA'S LARGEST RETAIL BANK.");
  assert.deepEqual(a.statusChips, ["tech"]);
});

test("D1 degrade: no prose briefs → signals=description once, duplicated meta suppressed", () => {
  const { report, mismatches } = adaptPipelineReport(
    {
      sections: {
        first_customers: {
          content: "Just a strategy paragraph, no per-account blocks.",
          matches: [
            { name: "Westpac", subtitle: "One of Australia's Big Four banks, providing a comprehensive range of consumer services" },
          ],
        },
      },
    },
    {}
  );
  const a = report.accounts.briefed[0];
  // signals carries the description; the meta line (same text) is suppressed, not printed twice
  assert.match(a.signals, /Big Four/);
  assert.equal(a.meta, "");
  assert.equal(a.stack, "");
  assert.ok(mismatches.some((m) => m.issue.includes("no structured briefs in prose")));
});
