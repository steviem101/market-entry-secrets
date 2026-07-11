import { test } from "node:test";
import assert from "node:assert/strict";
import { serviceTokens, countServiceMatches } from "./serviceMatch.ts";

// Goal tags come from goalServiceTags.ts — the real vocabulary.
const TAGS = ["Legal", "Tax", "HR", "Accounting", "Advisory", "Consulting"];

test("serviceTokens: lowercases, folds hyphens, drops stopwords/junk, de-pluralises", () => {
  assert.deepEqual([...serviceTokens("Deal Advisory & Infrastructure")], ["deal", "advisory", "infrastructure"]);
  assert.deepEqual([...serviceTokens("Co-working Spaces")], ["coworking", "space"]);
  assert.deepEqual([...serviceTokens("Business Services")], []); // pure filler
  assert.deepEqual([...serviceTokens("HR")], ["hr"]);            // short-token allowance
  assert.deepEqual([...serviceTokens("Events")], ["event"]);     // de-pluralised
  assert.deepEqual([...serviceTokens(null)], []);
});

test("countServiceMatches: real provider labels now earn the fit they deserve (B-labels from live data)", () => {
  // Verbatim labels from KPMG / EY / Grant Thornton / MinterEllison cards.
  assert.equal(countServiceMatches(["Deal Advisory & Infrastructure"], TAGS), 1);   // Advisory
  assert.equal(countServiceMatches(["Corporate Advisory"], TAGS), 1);               // Advisory
  assert.equal(countServiceMatches(["Tax Consulting Services"], TAGS), 1);          // Tax + Consulting (one label)
  assert.equal(countServiceMatches(["Global Immigration"], ["Immigration"]), 1);
  // Multiple matching labels count separately (scoreRow caps at 2 itself).
  assert.equal(countServiceMatches(["Corporate Advisory", "Audit & Assurance", "Legal Services"], TAGS), 2); // Advisory + Legal
});

test("countServiceMatches: exact equality still matches (superset of old behaviour)", () => {
  for (const tag of TAGS) {
    assert.equal(countServiceMatches([tag], TAGS) >= 1, true, `exact "${tag}" must still match`);
  }
});

test("countServiceMatches: stopwords fence off everything-matches-everything", () => {
  // "Business Services" shares only filler with "Legal"/"Advisory" — no match.
  assert.equal(countServiceMatches(["Business Services"], TAGS), 0);
  assert.equal(countServiceMatches(["Global Support Solutions"], TAGS), 0);
  // Unrelated real labels stay unmatched.
  assert.equal(countServiceMatches(["Events & Venue Hire", "Growth Programs"], TAGS), 0);
});

test("countServiceMatches: plural/singular and hyphen variants meet", () => {
  assert.equal(countServiceMatches(["Event Management"], ["Events", "Networking"]), 1);
  assert.equal(countServiceMatches(["Coworking Spaces"], ["Co-working", "Innovation Hub"]), 1);
  assert.equal(countServiceMatches(["Grant Writing"], ["Grants", "Government", "Funding"]), 1);
});

test("countServiceMatches: multi-token tags require the WHOLE phrase (tag ⊆ label)", () => {
  // "Trade & Government" shares only "trade" with "Trade Advisory" — NOT a match.
  // (Any-shared-token here re-inflated the trade-generalist profile the scorer
  // rebalance demoted — caught by the existing matchScoring regression tests.)
  assert.equal(countServiceMatches(["Trade & Government"], ["Trade Advisory"]), 0);
  assert.equal(countServiceMatches(["Working Capital Finance"], ["Venture Capital"]), 0);
  assert.equal(countServiceMatches(["Market Entry Strategy"], ["Market Research"]), 0);
  // ...but the full phrase (in any order/with extras) does match.
  assert.equal(countServiceMatches(["Trade Advisory Services"], ["Trade Advisory"]), 1);
  assert.equal(countServiceMatches(["Australian British Chamber of Commerce"], ["Chamber of Commerce"]), 1);
  assert.equal(countServiceMatches(["Early-stage Venture Capital"], ["Venture Capital"]), 1);
});

test("countServiceMatches: empty/null inputs are safe zeros", () => {
  assert.equal(countServiceMatches([], TAGS), 0);
  assert.equal(countServiceMatches(null, TAGS), 0);
  assert.equal(countServiceMatches(["Legal Services"], []), 0);
  assert.equal(countServiceMatches(["Legal Services"], null), 0);
});

test("CRITICAL: every tag in the goal vocabulary survives tokenization and self-matches", async () => {
  // A goal tag whose tokens are all stopworded would silently never match
  // anything again — pin the whole live vocabulary against that regression.
  const { GOAL_SERVICE_TAGS_BY_ID, GOAL_SERVICE_TAGS_BY_LABEL } = await import("./goalServiceTags.ts");
  const allTags = new Set([
    ...Object.values(GOAL_SERVICE_TAGS_BY_ID).flat(),
    ...Object.values(GOAL_SERVICE_TAGS_BY_LABEL).flat(),
  ]);
  for (const tag of allTags) {
    assert.ok(serviceTokens(tag).size > 0, `tag "${tag}" lost all tokens to stopwords`);
    assert.equal(countServiceMatches([tag], [tag]), 1, `tag "${tag}" must self-match`);
  }
});
