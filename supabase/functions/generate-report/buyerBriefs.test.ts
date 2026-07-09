import { test } from "node:test";
import assert from "node:assert/strict";
import { parseIcpDescription, nameMatchesDomain, buildBuyerCards, buildBuyerBriefsNote } from "./buyerBriefs.ts";

test("parseIcpDescription: title + org from the one-liner; lists; no-connector fallback", () => {
  assert.deepEqual(parseIcpDescription("head of marketing at recruitment agency"),
    { titles: ["Head of Marketing"], org_type: "recruitment agency" });
  assert.deepEqual(parseIcpDescription("CTO or Head of Data in mid-size banks").titles,
    ["CTO", "Head of Data"]);
  // no connector → org descriptor only, no invented title
  assert.deepEqual(parseIcpDescription("boutique staffing agencies"),
    { titles: [], org_type: "boutique staffing agencies" });
  assert.deepEqual(parseIcpDescription(""), { titles: [], org_type: "" });
  assert.deepEqual(parseIcpDescription(null), { titles: [], org_type: "" });
});

test("nameMatchesDomain: distinctive token must appear in host (walter page gate)", () => {
  assert.equal(nameMatchesDomain("kelly recruitment", "https://kellyservices.com.au"), true);
  assert.equal(nameMatchesDomain("Gadens", "https://gadens.com"), true);
  // wrong-company resolution: no distinctive token in host → unverified
  assert.equal(nameMatchesDomain("walter page", "https://michaelpage.com.au"), false);
  assert.equal(nameMatchesDomain("walter page", "https://walterpage.com.au"), true); // squashed host
  // all-generic name → unverifiable
  assert.equal(nameMatchesDomain("The Recruitment Group", "https://trg.com.au"), false);
  assert.equal(nameMatchesDomain("Acme", ""), false);
});

test("buildBuyerCards: verified buyers only; signal tags; failure text suppressed", () => {
  const cards = buildBuyerCards([
    { name: "Kelly", url: "https://kellyservices.com.au", description: "Staffing firm", hiring_signals: "Recruiters", tech_signals: "" },
    { name: "walter page", unverified: true },
    { name: "Ghost", url: "not-a-url", description: "Website could not be analysed." },
  ]);
  assert.deepEqual(cards.map((c) => c.name), ["Kelly", "Ghost"]);
  assert.deepEqual(cards[0].tags, ["Hiring now"]);
  assert.equal(cards[1].subtitle, undefined); // failure text never renders
  assert.equal(cards[1].website, undefined);
});

test("buildBuyerBriefsNote: embeds data, titles, unverified advisory; empty when no chips", () => {
  const note = buildBuyerBriefsNote(
    [
      { name: "Kelly", url: "https://k.com", description: "Staffing", key_info: "x", tech_signals: "Bullhorn", hiring_signals: "" },
      { name: "walter page", unverified: true },
    ],
    { titles: ["Head of Marketing"], org_type: "recruitment agency" },
    "Floats",
    "cited research blob",
  );
  assert.ok(note.includes("Your First Customers"));
  assert.ok(note.includes("Head of Marketing"));
  assert.ok(note.includes("walter page")); // unverified advisory names it
  assert.ok(note.includes("do NOT guess"));
  assert.ok(note.includes("cited research blob"));
  assert.ok(note.includes("Bullhorn")); // account data embedded
  assert.equal(buildBuyerBriefsNote([], { titles: [], org_type: "" }, "X"), "");
  assert.equal(buildBuyerBriefsNote(null, { titles: [], org_type: "" }, "X"), "");
});
