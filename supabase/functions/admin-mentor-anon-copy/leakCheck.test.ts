/**
 * Tests for the server-side identity-leak lint (MES-208). Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { leakTerms, findLeak, lintDraft, tileCompanyNames } from "./leakCheck.ts";

test("leakTerms: full strings and significant words, stopwords dropped", () => {
  const terms = leakTerms(["Jane Macallister", "Redwood Advisory Group"]);
  assert.ok(terms.includes("jane macallister"));
  assert.ok(terms.includes("macallister"));
  assert.ok(terms.includes("redwood"));
  // "advisory" and "group" are generic company stopwords
  assert.ok(!terms.includes("advisory"));
  assert.ok(!terms.includes("group"));
  // "jane" is only 4 chars — significant words need length >= 4, so it IS a term
  assert.ok(terms.includes("jane"));
});

test("leakTerms: country words never become leak terms", () => {
  const terms = leakTerms(["Enterprise Singapore", "New Zealand Trade Board"]);
  assert.ok(!terms.includes("singapore"));
  assert.ok(!terms.includes("zealand"));
  assert.ok(terms.includes("enterprise"));
  assert.ok(terms.includes("trade board") === false); // only full string + words
});

test("findLeak: token-aware, no substring false positives", () => {
  const terms = leakTerms(["Aaron Birkby"]);
  assert.equal(findLeak("Mentored startups across Queensland", terms), null);
  assert.equal(findLeak("Formerly at Birkby & Co", terms), "birkby");
  // Substring inside a longer word must not fire
  assert.equal(findLeak("The barkbyre facility", terms), null);
});

test("lintDraft: flags every field containing a term, tile companies included", () => {
  const terms = leakTerms(["Jane Smithfield", "Acme Dynamics", "Startmate"]);
  const flags = lintDraft(
    {
      alias: "UK Robotics Founder",
      headline: "Scaled Acme Dynamics into three markets",
      bio: "Backed by Startmate and others.",
      company_label: null,
    },
    terms,
  );
  assert.deepEqual(
    flags.map((f) => f.field).sort(),
    ["bio", "headline"],
  );
});

test("lintDraft: sector words inside a company name flag conservatively", () => {
  // "Acme Robotics" makes "robotics" a leak term — deliberately conservative,
  // matching the client guard: the retry prompt steers the model away from it,
  // and an unresolved hit stores the draft as `flagged` for human eyes.
  const terms = leakTerms(["Jane Smithfield", "Acme Robotics"]);
  const flags = lintDraft({ alias: "UK Robotics Founder" }, terms);
  assert.deepEqual(flags, [{ field: "alias", term: "robotics" }]);
});

test("lintDraft: clean generalised copy passes", () => {
  const terms = leakTerms(["Jane Smithfield", "Acme Dynamics"]);
  const flags = lintDraft(
    {
      alias: "UK Robotics Founder",
      headline: "Founder who scaled a B2B robotics company into three markets",
      bio: "Founded and scaled a UK robotics company. Best for early-stage hardware founders.",
    },
    terms,
  );
  assert.deepEqual(flags, []);
});

test("tileCompanyNames: extracts names, tolerates junk shapes", () => {
  assert.deepEqual(
    tileCompanyNames([{ name: "Acme" }, { name: "Globex", logo: "x" }, {}, null, "str"]),
    ["Acme", "Globex"],
  );
  assert.deepEqual(tileCompanyNames(null), []);
  assert.deepEqual(tileCompanyNames("not an array"), []);
});
