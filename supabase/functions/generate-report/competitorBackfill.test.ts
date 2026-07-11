import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMentionPrompt, parseMentions, BACKFILL_MAX } from "./competitorBackfill.ts";

test("buildMentionPrompt: includes company, exclusions, and the verbatim-only rule", () => {
  const p = buildMentionPrompt("Floats", "Recruitment tech / SaaS", "Human IQ is a rival. JobAdder scaled locally.", ["SourceWhale", "Floats"]);
  assert.match(p, /"Floats"/);
  assert.match(p, /Recruitment tech \/ SaaS/);
  assert.match(p, /appear VERBATIM/i);
  assert.match(p, /SourceWhale, Floats/); // exclusions listed
  assert.match(p, /Human IQ is a rival/); // research text embedded
});

test("parseMentions: extracts names, excludes covered + self, dedupes, caps", () => {
  const out = parseMentions(
    '```json\n{"competitors":["Human IQ","JobAdder","sourcewhale","Human IQ","Vincere","LiveHire","Recruitful"]}\n```',
    ["SourceWhale", "Floats"],
    BACKFILL_MAX,
  );
  // sourcewhale excluded (case-insensitive), Human IQ deduped, capped at BACKFILL_MAX(4)
  assert.equal(out.length, BACKFILL_MAX);
  assert.ok(!out.map((n) => n.toLowerCase()).includes("sourcewhale"));
  assert.deepEqual(out, ["Human IQ", "JobAdder", "Vincere", "LiveHire"]);
});

test("parseMentions: fail-open on junk / empty / wrong shape", () => {
  assert.deepEqual(parseMentions("not json", []), []);
  assert.deepEqual(parseMentions('{"competitors":[]}', []), []);
  assert.deepEqual(parseMentions('{"nope":["X"]}', []), []);
  assert.deepEqual(parseMentions("", ["a"]), []);
});

test("parseMentions: drops blanks and trims", () => {
  const out = parseMentions('{"competitors":["  Vincere  ","", "  "]}', []);
  assert.deepEqual(out, ["Vincere"]);
});
