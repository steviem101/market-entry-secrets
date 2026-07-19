/**
 * Tests for the anon-copy prompt contract (MES-208). Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  buildRetryPrompt,
  parseDraft,
  type MentorSourceRecord,
} from "./prompt.ts";

const record: MentorSourceRecord = {
  archetype: "International Founder",
  origin_country: "uk",
  description: "Founded Acme Robotics and scaled it to Australia.",
  experience: "15+ years",
  specialties: ["Sales / GTM"],
  sector_tags: ["technology"],
  persona_fit: ["international_entrant"],
  market_corridors: ["uk-to-australia"],
  tile_companies: ["Acme Robotics", "Globex"],
  real_name: "Jane Smithfield",
  real_company: "Acme Robotics",
};

test("system prompt carries the non-negotiables", () => {
  for (const marker of [
    "Never include the mentor's name",
    "company TYPE",
    "ONLY the record supplied",
    "Australian English",
    "Best for",
    "claims",
  ]) {
    assert.ok(SYSTEM_PROMPT.includes(marker), `system prompt must mention: ${marker}`);
  }
});

test("user prompt includes record, exemplars, and the never-echo list", () => {
  const p = buildUserPrompt(record);
  assert.ok(p.includes("UK Govtech Founder"), "few-shot exemplars present");
  assert.ok(p.includes("Founded Acme Robotics and scaled it to Australia."), "record description present");
  assert.ok(p.includes("NEVER-ECHO LIST"), "never-echo list present");
  assert.ok(p.includes("Jane Smithfield"));
  assert.ok(p.includes("Globex"));
});

test("retry prompt names the offending terms", () => {
  const p = buildRetryPrompt(["acme", "smithfield"]);
  assert.ok(p.includes('"acme"'));
  assert.ok(p.includes('"smithfield"'));
});

test("parseDraft: strict JSON, fenced JSON, and junk", () => {
  const json = JSON.stringify({
    alias: "UK Robotics Founder",
    headline: "h",
    company_label: "",
    bio: "b",
    best_for: "Best for x.",
    claims: [{ claim: "15+ years", source: "experience" }, { bad: true }],
  });
  const parsed = parseDraft(json);
  assert.ok(parsed);
  assert.equal(parsed.alias, "UK Robotics Founder");
  assert.equal(parsed.company_label, null, "empty company_label normalises to null");
  assert.equal(parsed.claims.length, 1, "malformed claims dropped");

  const fenced = parseDraft("```json\n" + json + "\n```");
  assert.ok(fenced && fenced.alias === "UK Robotics Founder");

  assert.equal(parseDraft("no json here"), null);
  assert.equal(parseDraft('{"alias": 5, "bio": "b"}'), null);
});
