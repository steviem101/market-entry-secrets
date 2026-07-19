import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDistillPrompt, parseDistillResponse, isTooThin, MIN_CHUNK_CHARS, DISTILLER_VERSION, type ChunkInput } from "./distillCard.ts";

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

test("prompt carries lanes, intents menu, corridor, and delimits the source", () => {
  const { system, user } = buildDistillPrompt(chunk());
  assert.match(system, /regulatory, market, playbook, cost, funding/);
  assert.match(user, /entity_setup:/);            // intent menu present
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
