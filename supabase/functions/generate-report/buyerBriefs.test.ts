import { test } from "node:test";
import assert from "node:assert/strict";
import { parseIcpDescription, nameMatchesDomain, buildBuyerCards, buildBuyerBriefsNote, buildIcpGuidanceNote } from "./buyerBriefs.ts";

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
    "cited research blob [1] with markers [12]",
  );
  assert.ok(note.includes("Your First Customers"));
  // Perplexity's own [N] markers are stripped — they'd renumber against the wrong
  // sources if the model copied them into prose (the [Cost Data] failure class).
  assert.ok(note.includes("cited research blob  with markers"));
  assert.ok(!/\[\d+\]/.test(note.split("ACCOUNT RESEARCH")[1].split("ACCOUNT DATA")[0]));
  assert.ok(note.includes("Head of Marketing"));
  assert.ok(note.includes("walter page")); // unverified advisory names it
  assert.ok(note.includes("do NOT guess"));
  assert.ok(note.includes("cited research blob"));  // content survives the strip
  assert.ok(note.includes("Bullhorn")); // account data embedded
  assert.equal(buildBuyerBriefsNote([], { titles: [], org_type: "" }, "X"), "");
  assert.equal(buildBuyerBriefsNote(null, { titles: [], org_type: "" }, "X"), "");
});

test("buildBuyerBriefsNote: 5-chip intake with 3 briefed surfaces the cap honestly", () => {
  const buyers = [
    { name: "A", url: "https://a.com", description: "x", key_info: "" },
    { name: "B", url: "https://b.com", description: "y", key_info: "" },
    { name: "C", url: "https://c.com", description: "z", key_info: "" },
  ];
  const note = buildBuyerBriefsNote(buyers, { titles: [], org_type: "" }, "Floats", undefined, 5);
  assert.ok(note.includes("named 5 accounts; the first 3 are briefed"));
  // equal counts → no cap sentence
  const noCap = buildBuyerBriefsNote(buyers, { titles: [], org_type: "" }, "Floats", undefined, 3);
  assert.ok(!noCap.includes("are briefed here"));
});

test("buildIcpGuidanceNote: emits the three stable labels, anchors on ICP titles, grounds sector", () => {
  const note = buildIcpGuidanceNote({ titles: ["Head of Marketing"], org_type: "recruitment agencies" }, "Floats", "Recruitment Technology");
  assert.match(note, /\*\*Target Roles:\*\*/);
  assert.match(note, /\*\*Sector Focus:\*\*/);
  assert.match(note, /\*\*Opening Angle:\*\*/);
  assert.match(note, /Head of Marketing/);
  assert.match(note, /recruitment agencies/);
  assert.match(note, /Recruitment Technology/);
  assert.match(note, /never (invent|name)/i);
});

test("buildIcpGuidanceNote: no ICP titles → no anchor clause, still emits the block", () => {
  const note = buildIcpGuidanceNote({ titles: [], org_type: "" }, "Acme", "");
  assert.doesNotMatch(note, /Anchor the roles/);
  assert.match(note, /\*\*Target Roles:\*\*/);
});
