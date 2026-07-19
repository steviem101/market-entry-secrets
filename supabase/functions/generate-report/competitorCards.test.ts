import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCompetitorCards, competitorDedupeKey } from "./competitorCards.ts";

test("buildCompetitorCards: maps name/description/url into external cards", () => {
  const cards = buildCompetitorCards([
    { name: "Acme Pay", url: "https://acme.com", description: "Payments platform" },
  ]);
  assert.equal(cards.length, 1);
  assert.deepEqual(cards[0], {
    name: "Acme Pay",
    subtitle: "Payments platform",
    website: "https://acme.com",
    link: "https://acme.com",
    linkLabel: "Visit site",
    source: "web",
    tags: [],
  });
});

test("buildCompetitorCards: drops unnamed rows and dedupes by name", () => {
  const cards = buildCompetitorCards([
    { name: "", url: "https://x.com" },
    { name: "Acme", url: "https://acme.com" },
    { name: "acme", url: "https://acme.io" }, // dup (case-insensitive) → dropped
  ]);
  assert.deepEqual(cards.map((c) => c.name), ["Acme"]);
});

test("buildCompetitorCards: parenthetical-variant name collapses to one card (Floats2 N1)", () => {
  const cards = buildCompetitorCards([
    { name: "Juicebox", url: "https://juicebox.ai", description: "AI sourcing" },
    { name: "Juicebox (formerly PeopleGPT)", url: "https://juicebox.ai", description: "AI sourcing engine" },
  ]);
  assert.deepEqual(cards.map((c) => c.name), ["Juicebox"]); // first wins, dup dropped
});

test("competitorDedupeKey: strips a trailing parenthetical + normalises case/space", () => {
  assert.equal(competitorDedupeKey("Juicebox (formerly PeopleGPT)"), "juicebox");
  assert.equal(competitorDedupeKey("Juicebox"), "juicebox");
  assert.equal(competitorDedupeKey("  Loxo  "), "loxo");
  // a parenthetical in the MIDDLE is not a suffix — left intact (distinct product)
  assert.equal(competitorDedupeKey("Acme (US) Corp"), "acme (us) corp");
});

test("buildCompetitorCards: non-http url yields no link button", () => {
  const cards = buildCompetitorCards([{ name: "NoSite", url: "not-a-url", description: "x" }]);
  assert.equal(cards[0].website, undefined);
  assert.equal(cards[0].link, undefined);
  assert.equal(cards[0].linkLabel, "");
});

test("buildCompetitorCards: real au_presence becomes a tag; 'none evident' does not", () => {
  const cards = buildCompetitorCards([
    { name: "A", url: "https://a.com", au_presence: "Sydney office, .com.au domain" },
    { name: "B", url: "https://b.com", au_presence: "No Australian presence evident on their site" },
  ]);
  assert.deepEqual(cards[0].tags, ["AU presence"]);
  assert.deepEqual(cards[1].tags, []);
});

test("buildCompetitorCards: caps output and tolerates null input", () => {
  assert.deepEqual(buildCompetitorCards(null), []);
  assert.deepEqual(buildCompetitorCards(undefined), []);
  const many = Array.from({ length: 10 }, (_, i) => ({ name: `Co ${i}`, url: `https://c${i}.com` }));
  assert.equal(buildCompetitorCards(many, 6).length, 6);
});

test("buildCompetitorCards: scrape-failure fallback text never renders as a subtitle (Novade/Hammertech)", () => {
  const cards = buildCompetitorCards([
    { name: "Hammertech", url: "not-a-url", description: "Website could not be analysed." },
    { name: "Ghost Co", url: "https://ghost.co", description: "Could not extract competitor intelligence." },
    { name: "Real Co", url: "https://real.co", description: "A genuine construction platform" },
  ]);
  assert.equal(cards[0].subtitle, undefined); // name-only card, no error text
  assert.equal(cards[1].subtitle, undefined);
  assert.equal(cards[2].subtitle, "A genuine construction platform");
});

test("buildCompetitorCards: carries up to 3 grounded strengths, clipped and de-emptied (Phase 3b)", () => {
  const cards = buildCompetitorCards([
    {
      name: "Attio",
      url: "https://attio.com",
      strengths: ["  Modern UI  ", "", "Powerful automations", "Strong API", "Native integrations"],
    },
  ]);
  // clipped/trimmed, empties dropped, capped at 3
  assert.deepEqual(cards[0].strengths, ["Modern UI", "Powerful automations", "Strong API"]);
});

test("buildCompetitorCards: no strengths key omits the field entirely (column-suppress signal)", () => {
  const cards = buildCompetitorCards([{ name: "Plain Co", url: "https://plain.co" }]);
  assert.equal("strengths" in cards[0], false);
});

test("buildCompetitorCards: empty or all-blank strengths array omits the field", () => {
  const cards = buildCompetitorCards([
    { name: "A", url: "https://a.co", strengths: [] },
    { name: "B", url: "https://b.co", strengths: ["", "   "] },
    { name: "C", url: "https://c.co", strengths: "not-an-array" },
  ]);
  assert.equal("strengths" in cards[0], false);
  assert.equal("strengths" in cards[1], false);
  assert.equal("strengths" in cards[2], false);
});

test("buildCompetitorCards: carries a grounded differentiation contrast as `differs` (Phase 3c)", () => {
  const cards = buildCompetitorCards([
    { name: "Salesforce", url: "https://salesforce.com", differentiation: "  Enterprise-first — we serve SMB self-serve  " },
  ]);
  assert.equal(cards[0].differs, "Enterprise-first — we serve SMB self-serve");
});

test("buildCompetitorCards: empty/missing differentiation omits the differs field", () => {
  const cards = buildCompetitorCards([
    { name: "A", url: "https://a.co" },
    { name: "B", url: "https://b.co", differentiation: "" },
    { name: "C", url: "https://c.co", differentiation: "   " },
    { name: "D", url: "https://d.co", differentiation: 42 },
  ]);
  for (const card of cards) assert.equal("differs" in card, false);
});

test("buildCompetitorCards: differs is clipped to 120 chars", () => {
  const long = "x".repeat(200);
  const cards = buildCompetitorCards([{ name: "A", url: "https://a.co", differentiation: long }]);
  assert.equal(cards[0].differs!.length, 120);
});
