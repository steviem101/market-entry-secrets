/**
 * Tests for the Wave 8 report-lint (pure logic). Run: `npm test`.
 * Covers truncation (section prose + match blurbs), missing intros, inconsistent
 * figures, and the clean/negative cases so it doesn't over-flag good reports.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { lintReport, lintSummary } from "./reportLint.ts";

const section = (content: string, visible = true) => ({ visible, content });

test("clean report → no findings", () => {
  const rj = {
    sections: {
      competitor_landscape: section(
        "The Australian recruitment technology landscape is currently dominated by broad all-in-one platforms, leaving a clear gap for specialised marketing-led tools.\n\n- Loxo: a talent CRM."
      ),
      service_providers: section(
        "These providers were matched to the specific goals and questions you raised in your intake form, prioritised by relevance to your stage.\n\n- NextGen"
      ),
    },
    matches: {
      service_providers: [{ name: "NextGen", description: "A growth engine for ANZ market entry." }],
    },
  };
  const r = lintReport(rj);
  assert.equal(r.findings.length, 0, JSON.stringify(r.findings));
  assert.equal(lintSummary(r), "");
});

test("section prose ending mid-clause is flagged as truncation", () => {
  const rj = {
    sections: {
      executive_summary: section(
        "Market conditions favour the company now because agencies are under margin pressure and are actively seeking tools that make their consultants faster and their submissions more compelling to"
      ),
    },
  };
  const r = lintReport(rj);
  assert.equal(r.counts.truncation, 1);
  assert.equal(r.findings[0].where, "executive_summary");
});

test("section prose ending on terminal punctuation is NOT truncation", () => {
  const rj = {
    sections: {
      executive_summary: section(
        "Market conditions favour the company now. Agencies are under margin pressure and actively seek faster tooling for their consultants and more compelling candidate submissions today."
      ),
    },
  };
  assert.equal(lintReport(rj).counts.truncation, 0);
});

test("a dangling bold lead-in label with no content after it is truncation (real Floats artifact)", () => {
  const rj = {
    sections: {
      executive_summary: section(
        "The recommended approach is a focused Sydney-first motion that converts named agency clients into referenceable case studies with measurable ROI. **Who from your matches can help with this:**"
      ),
    },
  };
  assert.equal(lintReport(rj).counts.truncation, 1);
});

test("a citation marker after the final period does not mask a clean ending", () => {
  const rj = {
    sections: {
      executive_summary: section(
        "The Australian recruitment technology market is large and growing, with strong demand for AI-forward hiring tools across Sydney and NSW [3]."
      ),
    },
  };
  assert.equal(lintReport(rj).counts.truncation, 0);
});

test("truncated match blurb (…39…) is flagged; clean tagline is not", () => {
  const rj = {
    sections: {},
    matches: {
      community_members: [
        { name: "Randstad", description: "Randstad is the world's leading talent company operating in 39…" },
        { name: "NextGen", description: "A technology services group for the ANZ market" },
      ],
    },
  };
  const r = lintReport(rj);
  assert.equal(r.counts.truncation, 1);
  assert.match(r.findings[0].where, /^match:community_members$/);
});

test("a card-bearing section with no lead paragraph is flagged missing_intro", () => {
  const rj = {
    sections: {
      investor_recommendations: section("- Potentia Capital\n- Carthona Capital\n- Grok Ventures"),
    },
    matches: { investors: [{ name: "Potentia Capital" }] },
  };
  const r = lintReport(rj);
  assert.equal(r.counts.missing_intro, 1);
  assert.equal(r.findings[0].where, "investor_recommendations");
});

test("inconsistent figures: same context, divergent magnitudes", () => {
  const rj = {
    sections: {
      competitor_landscape: section(
        "The Australian recruitment platforms market is valued at USD 700 million today. Analysts note the recruitment platforms market is valued at USD 775 million on a five-year view."
      ),
    },
  };
  const r = lintReport(rj);
  assert.equal(r.counts.inconsistent_figures, 1);
  assert.match(r.findings.find((f) => f.code === "inconsistent_figures")!.detail, /700 m vs 775 m|775 m vs 700 m/);
});

test("genuinely different metrics (different context) do NOT false-positive", () => {
  const rj = {
    sections: {
      competitor_landscape: section(
        "The ATS software niche sits at AUD 250 million while the online recruitment platforms market is valued at USD 700 million."
      ),
    },
  };
  assert.equal(lintReport(rj).counts.inconsistent_figures, 0);
});

test("long content with many trailing citations strips cleanly and fast (bounded strip)", () => {
  const body = "The Australian recruitment technology market is large and growing across Sydney and NSW. ".repeat(60);
  const rj = { sections: { executive_summary: section(body + "It remains a strong opportunity[1][2][3].") } };
  const t0 = Date.now();
  const r = lintReport(rj);
  assert.ok(Date.now() - t0 < 200, "bounded strip should be fast");
  assert.equal(r.counts.truncation, 0); // ends on "." after the stripped citations
});

test("failed report / empty shape → empty result, never throws", () => {
  assert.deepEqual(lintReport({}).findings, []);
  assert.deepEqual(lintReport(null).findings, []);
  assert.equal(lintSummary(null), "");
});

test("hidden sections are ignored", () => {
  const rj = {
    sections: {
      competitor_landscape: section("- Loxo\n- Gem", false), // hidden → no missing_intro
    },
  };
  assert.equal(lintReport(rj).findings.length, 0);
});
