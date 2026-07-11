import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildJudgePrompt,
  parseJudgeResponse,
  compareToBaseline,
  summarizeScores,
  sectionMean,
  type SectionScores,
  type BaselineFile,
} from "./judge.ts";

const golden = {
  golden_id: "test-golden",
  description: "test",
  intake: {
    company_name: "Acme",
    country_of_origin: "Ireland",
    industry_sector: ["Fintech"],
    company_stage: "Series A-B",
    target_regions: ["Sydney/NSW"],
    end_buyer_industries: ["banking"],
    report_focus: "understand competitors",
    key_challenges: "Pricing",
    raw_input: { persona: "international" },
  },
};

const s = (g: number, sp: number, p: number, d: number): SectionScores =>
  ({ grounding: g, specificity: sp, personalisation: p, duplication: d });

test("buildJudgePrompt embeds intake summary and every section", () => {
  const prompt = buildJudgePrompt(golden, [
    { name: "executive_summary", content: "Summary prose." },
    { name: "action_plan", content: "Plan prose." },
  ]);
  assert.match(prompt, /test-golden/);
  assert.match(prompt, /"company_name": "Acme"/);
  assert.match(prompt, /=== SECTION: executive_summary ===/);
  assert.match(prompt, /=== SECTION: action_plan ===/);
  assert.match(prompt, /Return ONLY a JSON array/);
});

test("parseJudgeResponse: valid reply round-trips; every expected section required", () => {
  const raw = '[{"section":"executive_summary","grounding":4,"specificity":3,"personalisation":5,"duplication":4,"notes":"ok"}]';
  const parsed = parseJudgeResponse(raw, ["executive_summary"]);
  assert.ok(parsed);
  assert.equal(parsed!.executive_summary.grounding, 4);
  // missing a section → reject
  assert.equal(parseJudgeResponse(raw, ["executive_summary", "action_plan"]), null);
  // out-of-range / non-integer scores → reject
  assert.equal(
    parseJudgeResponse('[{"section":"executive_summary","grounding":6,"specificity":3,"personalisation":5,"duplication":4}]', ["executive_summary"]),
    null,
  );
  assert.equal(parseJudgeResponse("not json", ["executive_summary"]), null);
  // prose-wrapped array is salvaged to the outermost brackets
  const salvaged = parseJudgeResponse(
    'Here are the scores: [{"section":"executive_summary","grounding":4,"specificity":4,"personalisation":4,"duplication":4}] — done.',
    ["executive_summary"],
  );
  assert.ok(salvaged);
  assert.equal(salvaged!.executive_summary.grounding, 4);
  // uppercase code fence is stripped
  assert.ok(parseJudgeResponse('```JSON\n[{"section":"executive_summary","grounding":3,"specificity":3,"personalisation":3,"duplication":3}]\n```', ["executive_summary"]));
  // unexpected section name → reject
  assert.equal(
    parseJudgeResponse('[{"section":"mystery","grounding":4,"specificity":3,"personalisation":5,"duplication":4}]', ["executive_summary"]),
    null,
  );
});

test("compareToBaseline flags only >=1.0 mean drops; new sections/goldens pass", () => {
  const baseline: BaselineFile = {
    goldens: {
      "test-golden": {
        executive_summary: s(4, 4, 4, 4), // mean 4.0
        action_plan: s(5, 5, 5, 5),       // mean 5.0
      },
    },
  };
  const regressions = compareToBaseline(
    "test-golden",
    {
      executive_summary: s(4, 3, 3, 3), // mean 3.25 → -0.75, tolerated
      action_plan: s(4, 4, 4, 4),       // mean 4.0 → -1.0, fails
      new_section: s(1, 1, 1, 1),       // no baseline → ignored
    },
    baseline,
  );
  assert.equal(regressions.length, 1);
  assert.equal(regressions[0].section, "action_plan");
  assert.equal(regressions[0].delta, -1);
  // unknown golden or missing baseline file → no regressions
  assert.deepEqual(compareToBaseline("unknown", { a: s(1, 1, 1, 1) }, baseline), []);
  assert.deepEqual(compareToBaseline("test-golden", { a: s(1, 1, 1, 1) }, null), []);
});

test("summarizeScores + sectionMean", () => {
  assert.equal(sectionMean(s(4, 4, 4, 4)), 4);
  const summary = summarizeScores({
    a: s(4, 4, 4, 4),
    b: s(2, 2, 2, 2),
  });
  assert.equal(summary.overall, 3);
  assert.deepEqual(summary.per_section, { a: 4, b: 2 });
});
