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
