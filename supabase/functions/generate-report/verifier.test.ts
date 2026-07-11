import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeNumeral,
  extractNumerals,
  buildEvidenceCorpus,
  numeralIsSupported,
  extractCandidateEntities,
  entityIsSupported,
  verifySections,
  flaggedItemsOf,
  buildAdjudicationPrompt,
  parseAdjudication,
  buildRegenerationNote,
} from "./verifier.ts";
import { claimsFromKeyMetrics } from "./claims.ts";

test("normalizeNumeral: currencies, magnitudes, percents, comma groups", () => {
  assert.equal(normalizeNumeral("US$8.48B"), 8.48e9);
  assert.equal(normalizeNumeral("$8.48 billion"), 8.48e9);
  assert.equal(normalizeNumeral("A$3,000"), 3000);
  assert.equal(normalizeNumeral("5.1%"), 5.1);
  assert.equal(normalizeNumeral("2,400+"), 2400);
  assert.equal(normalizeNumeral("€400k"), 400e3);
  assert.equal(normalizeNumeral("no digits"), null);
});

test("extractNumerals: finds figures, skips citation markers, URLs and years", () => {
  const text =
    "The market reached US$8.48B in 2024 [3], growing at 5.1% CAGR. " +
    "See [pricing](https://example.com/p?id=99999) for details. " +
    "There are 2,400+ registered companies.";
  const raws = extractNumerals(text).map((n) => n.raw);
  assert.ok(raws.some((r) => r.includes("8.48B")));
  assert.ok(raws.some((r) => r.includes("5.1%")));
  assert.ok(raws.some((r) => r.includes("2,400+")));
  // the [3] marker, the URL's 99999 and the bare year 2024 are not extracted
  assert.ok(!raws.includes("3"));
  assert.ok(!raws.includes("99999"));
  assert.ok(!raws.includes("2024"));
});

test("numeralIsSupported: exact, tolerance-rounded, and fabricated figures", () => {
  const corpus = buildEvidenceCorpus(
    ["Market size was estimated at $8.48 billion in 2024, CAGR 5.1%."],
    [],
    [],
  );
  const [supported] = extractNumerals("The opportunity is worth US$8.5 billion.");
  assert.equal(numeralIsSupported(supported, corpus), true); // 0.24% rounding drift
  const [fabricated] = extractNumerals("The market is worth $11.2 billion.");
  assert.equal(numeralIsSupported(fabricated, corpus), false);
});

test("numeralIsSupported: claims registry counts as evidence", () => {
  const claims = claimsFromKeyMetrics([{ label: "CAGR", value: "7.2%", context: "" }], []);
  const corpus = buildEvidenceCorpus([], [], claims);
  const [m] = extractNumerals("Growth is projected at 7.2% annually.");
  assert.equal(numeralIsSupported(m, corpus), true);
});

test("extractCandidateEntities: multi-word proper nouns, minus headings/stop-leads/allowlist", () => {
  const text =
    "### Executive Summary\n" +
    "Engage Enterprise Ireland early. The Department of Home Affairs oversees visas. " +
    "Consider talking to KPMG Australia. This Section covers costs in New South Wales.";
  const entities = extractCandidateEntities(text);
  assert.ok(entities.includes("Enterprise Ireland"));
  assert.ok(entities.includes("Department of Home Affairs"));
  assert.ok(entities.includes("KPMG Australia"));
  assert.ok(!entities.some((e) => e.includes("Executive Summary"))); // heading stripped
  assert.ok(!entities.includes("New South Wales")); // builtin allowlist
});

test("entityIsSupported: directory names, corpus mentions and near-name matches pass", () => {
  const corpus = buildEvidenceCorpus(
    ["Recent coverage notes the Australian Trade Commission expanded its program."],
    ["Enterprise Ireland", "Stone & Chalk"],
    [],
  );
  assert.equal(entityIsSupported("Enterprise Ireland", corpus), true);
  assert.equal(entityIsSupported("Australian Trade Commission", corpus), true);
  assert.equal(entityIsSupported("Enterprise Ireland Sydney", corpus), true); // superstring of known name
  assert.equal(entityIsSupported("Acme Fabricated Advisory", corpus), false);
});

test("verifySections: totals + per-section flags; empty sections skipped", () => {
  const corpus = buildEvidenceCorpus(
    ["The niche was worth $2.1 billion in 2024. Austrade and Enterprise Ireland support entrants."],
    ["Enterprise Ireland"],
    [],
  );
  const sections = {
    executive_summary: { content: "The market is worth $2.1 billion. Work with Enterprise Ireland." },
    swot_analysis: { content: "A $9.9 billion revenue pool awaits, per Quantum Ledger Analytics." },
    lead_list: { content: "" },
  };
  const result = verifySections(sections, ["executive_summary", "swot_analysis", "lead_list"], corpus);
  assert.equal(result.sections.length, 2); // empty lead_list skipped
  const exec = result.sections[0];
  assert.equal(exec.unverified_numerals.length, 0);
  assert.equal(exec.unverified_entities.length, 0);
  const swot = result.sections[1];
  assert.equal(swot.unverified_numerals.length, 1);
  assert.deepEqual(swot.unverified_entities, ["Quantum Ledger Analytics"]);
  assert.equal(result.totals.unverified_numerals, 1);
  assert.equal(result.totals.unverified_entities, 1);
});

test("flaggedItemsOf + buildAdjudicationPrompt + parseAdjudication round-trip", () => {
  const corpus = buildEvidenceCorpus([""], [], []);
  const result = verifySections(
    { s1: { content: "Worth $3.7 billion, says Quantum Ledger Analytics." } },
    ["s1"],
    corpus,
  );
  const flagged = flaggedItemsOf(result);
  assert.equal(flagged.length, 2);
  const prompt = buildAdjudicationPrompt(flagged);
  assert.match(prompt, /"\$3\.7 billion"/);
  assert.match(prompt, /Quantum Ledger Analytics/);

  const verdicts = parseAdjudication(
    '[{"index":1,"fabricated":true,"reason":"figure absent from evidence"},{"index":2,"fabricated":false,"reason":"generic"}]',
    flagged.length,
  );
  assert.ok(verdicts);
  assert.equal(verdicts!.length, 2);
  assert.equal(verdicts![0].fabricated, true);
  // malformed replies are rejected, not partially applied
  assert.equal(parseAdjudication('[{"index":9,"fabricated":true}]', flagged.length), null);
  assert.equal(parseAdjudication("garbage", flagged.length), null);
});

test("buildRegenerationNote: lists only the section's own flagged items", () => {
  const note = buildRegenerationNote(
    [
      { section: "swot_analysis", kind: "numeral", text: "$9.9 billion", context: "" },
      { section: "action_plan", kind: "entity", text: "Acme Advisory", context: "" },
    ],
    "swot_analysis",
  );
  assert.match(note, /VERIFICATION FAILURE/);
  assert.match(note, /\$9\.9 billion/);
  assert.doesNotMatch(note, /Acme Advisory/);
  assert.equal(buildRegenerationNote([], "swot_analysis"), "");
});
