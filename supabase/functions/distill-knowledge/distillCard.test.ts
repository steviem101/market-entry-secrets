import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDistillPrompt, parseDistillResponse, isTooThin, MIN_CHUNK_CHARS, DISTILLER_VERSION, type ChunkInput } from "./distillCard.ts";
import { GENERAL_SECTOR } from "../_shared/kbTaxonomy.ts";

const LONG = "Setting up a company in Australia involves registering for a business number and, depending on turnover, for the goods and services tax. Employers must also meet state-based payroll obligations.";

function chunk(over: Partial<ChunkInput> = {}): ChunkInput {
  return {
    id: "chunk-abc",
    content: LONG,
    metadata: {
      content_types: ["Regulatory & Legal"], origin_country: "United Kingdom", target_country: "Australia",
      countries: ["United Kingdom", "Australia"], sectors: ["technology"], source_kind: "document",
      is_proprietary: false, publication_date: "2020-01-01",
    },
    ...over,
  };
}

test("prompt carries lanes, intents menu, sectors, corridor, guards, and delimits the source", () => {
  const { system, user } = buildDistillPrompt(chunk());
  assert.match(system, /regulatory, market, playbook, cost, funding/);
  assert.match(system, /AUDIENCE: only extract insights useful to a company ENTERING/); // inbound-relevance guard
  assert.match(system, /NON-OBVIOUS/);            // non-obviousness rule
  assert.match(user, /entity_setup:/);            // intent menu present
  assert.match(user, /technology, financial-services/); // sector menu present
  assert.match(user, new RegExp(`"${GENERAL_SECTOR}"`)); // general sentinel offered
  assert.match(user, /United Kingdom -> Australia/); // corridor hint
  assert.match(user, /<<</); assert.match(user, />>>/); // source delimiters
});

test("valid response yields a card with carried-through metadata + stable ref", () => {
  const resp = JSON.stringify({ cards: [
    { claim: "Companies entering Australia must register for a business number and may need to register for the goods and services tax once turnover passes a set threshold.",
      topic_lane: "regulatory", answers_intents: ["entity_setup", "regulatory_compliance"], reasoning: "durable setup rule" },
  ]});
  const { cards, skip } = parseDistillResponse(resp, chunk());
  assert.equal(skip, null);
  assert.equal(cards.length, 1);
  const c = cards[0];
  assert.equal(c.insight_ref, "chunk-abc:0");
  assert.equal(c.metadata.topic_lane, "regulatory");
  assert.deepEqual(c.metadata.answers_intents, ["entity_setup", "regulatory_compliance"]);
  assert.equal(c.metadata.target_country, "Australia");
  assert.deepEqual(c.metadata.source_chunk_ids, ["chunk-abc"]);
  assert.equal(c.metadata.distiller_version, DISTILLER_VERSION);
  assert.equal(c.metadata.is_canonical, true);
});

test("numeric-hygiene backstop drops a card with a dated figure", () => {
  const resp = JSON.stringify({ cards: [
    { claim: "The GST registration threshold in Australia is $75,000 in annual turnover.", topic_lane: "regulatory", answers_intents: ["regulatory_compliance"] },
  ]});
  const { cards, skip } = parseDistillResponse(resp, chunk());
  assert.equal(cards.length, 0);
  assert.equal(skip, "no_durable_claim"); // all cards dropped -> chunk logged as no_durable_claim
});

test("hallucinated intents are coerced away; invalid lane falls back to content_types", () => {
  const resp = JSON.stringify({ cards: [
    { claim: "Employers in Australia have state-based payroll obligations they must plan for when hiring.",
      topic_lane: "not_a_lane", answers_intents: ["hiring_talent", "teleportation"] },
  ]});
  const { cards } = parseDistillResponse(resp, chunk());
  assert.equal(cards.length, 1);
  assert.equal(cards[0].metadata.topic_lane, "regulatory"); // fell back to content_types lane
  assert.deepEqual(cards[0].metadata.answers_intents, ["hiring_talent"]); // teleportation dropped
});

test("too-thin chunk skips before calling the model logic", () => {
  const { cards, skip } = parseDistillResponse("{}", chunk({ content: "short" }));
  assert.equal(cards.length, 0);
  assert.equal(skip, "too_thin");
});

test("distiller-assigned sectors are validated: junk dropped and >2 canonical capped at 2", () => {
  const resp = JSON.stringify({ cards: [
    { claim: "Foreign entrants to Australia must appoint a locally resident director for a proprietary company.",
      topic_lane: "regulatory", sectors: ["financial-services", "teleportation", "healthcare", "retail"], answers_intents: [] },
  ]});
  const { cards } = parseDistillResponse(resp, chunk());
  assert.equal(cards.length, 1);
  assert.deepEqual(cards[0].metadata.sectors, ["financial-services", "healthcare"]); // teleportation dropped; 3 canonical capped to 2
});

test("distiller mixing 'general' with a specific sector keeps only the specific (specifics win)", () => {
  const resp = JSON.stringify({ cards: [
    { claim: "Fintech entrants to Australia face licensing obligations administered by the financial regulator.",
      topic_lane: "regulatory", sectors: [GENERAL_SECTOR, "financial-services"], answers_intents: [] },
  ]});
  const { cards } = parseDistillResponse(resp, chunk());
  assert.deepEqual(cards[0].metadata.sectors, ["financial-services"]); // never the contradictory ["general","financial-services"]
});

test("title-cased distiller sector is normalised, not dropped-then-mislabelled", () => {
  const resp = JSON.stringify({ cards: [
    { claim: "Healthcare entrants to Australia must navigate a national therapeutic-goods approval regime.",
      topic_lane: "regulatory", sectors: ["Healthcare"], answers_intents: [] },
  ]});
  const { cards } = parseDistillResponse(resp, chunk()); // chunk metadata sectors = ["technology"]
  assert.deepEqual(cards[0].metadata.sectors, ["healthcare"]); // NOT the fallback ["technology"]
});

test("no distiller sectors -> falls back to the chunk's own sector tags", () => {
  const resp = JSON.stringify({ cards: [
    { claim: "New entrants to Australia should plan for a self-assessment tax system with lodgement obligations.",
      topic_lane: "regulatory", answers_intents: [] },
  ]});
  const { cards } = parseDistillResponse(resp, chunk()); // chunk metadata sectors = ["technology"]
  assert.deepEqual(cards[0].metadata.sectors, ["technology"]);
});

test("isTooThin pre-filter mirrors the parse-time backstop", () => {
  assert.ok(isTooThin("short"));
  assert.ok(isTooThin(null));
  assert.ok(isTooThin(undefined));
  assert.ok(isTooThin("x".repeat(MIN_CHUNK_CHARS - 1)));
  assert.ok(!isTooThin("x".repeat(MIN_CHUNK_CHARS)));
  assert.ok(!isTooThin(LONG));
});

test("empty cards array -> off_topic; malformed json -> error", () => {
  assert.equal(parseDistillResponse(JSON.stringify({ cards: [] }), chunk()).skip, "off_topic");
  assert.equal(parseDistillResponse("not json at all", chunk()).skip, "error");
});

test("handles ```json fenced responses", () => {
  const resp = "```json\n" + JSON.stringify({ cards: [
    { claim: "Australia uses a self-assessment tax system that new entrants should prepare for.", topic_lane: "regulatory", answers_intents: [] },
  ]}) + "\n```";
  const { cards, skip } = parseDistillResponse(resp, chunk());
  assert.equal(skip, null);
  assert.equal(cards.length, 1);
});
