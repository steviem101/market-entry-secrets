import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseAuPresenceResponse,
  directoryPresenceEvidence,
  hostOf,
  mergePresence,
  buildPresenceReweightNote,
  buildFootprintNote,
  presenceMetadata,
  buildAuPresencePrompt,
  NONE_SIGNAL,
} from "./auPresence.ts";

test("parse: valid established with evidence", () => {
  const raw = `{"status":"established","evidence":["Sydney office at 1 George St","daon.com.au domain"],"sources":["https://daon.com/au"]}`;
  const s = parseAuPresenceResponse(raw);
  assert.equal(s.status, "established");
  assert.equal(s.evidence.length, 2);
  assert.deepEqual(s.sources, ["https://daon.com/au"]);
});

test("parse: strips ```json fences and tolerates prose wrapping", () => {
  const raw = "Here is the result:\n```json\n{\"status\":\"none\",\"evidence\":[],\"sources\":[]}\n```";
  assert.equal(parseAuPresenceResponse(raw).status, "none");
});

test("parse: established WITHOUT evidence downgrades to none (fail-closed)", () => {
  const raw = `{"status":"established","evidence":[],"sources":[]}`;
  assert.deepEqual(parseAuPresenceResponse(raw), NONE_SIGNAL);
});

test("parse: unknown status, garbage, and null all fall back to none", () => {
  assert.equal(parseAuPresenceResponse(`{"status":"maybe","evidence":["x"]}`).status, "none");
  assert.equal(parseAuPresenceResponse("not json at all").status, "none");
  assert.equal(parseAuPresenceResponse(null).status, "none");
  assert.equal(parseAuPresenceResponse("").status, "none");
});

test("parse: dedupes and caps evidence, drops non-strings", () => {
  const raw = `{"status":"established","evidence":["a","a","b",5,null,"c"],"sources":["u"]}`;
  const s = parseAuPresenceResponse(raw);
  assert.deepEqual(s.evidence, ["a", "b", "c"]);
});

test("hostOf: normalises scheme/www/path", () => {
  assert.equal(hostOf("https://www.Daon.com.au/contact"), "daon.com.au");
  assert.equal(hostOf("daon.com"), "daon.com");
  assert.equal(hostOf(""), "");
  assert.equal(hostOf(null), "");
});

test("directory: domain match wins and is labelled", () => {
  const { evidence, sources } = directoryPresenceEvidence(
    "Daon",
    "https://www.daon.com",
    [{ label: "service providers", rows: [{ name: "Some Other Co", website: "https://daon.com/au" }] }],
  );
  assert.equal(evidence.length, 1);
  assert.match(evidence[0], /service providers directory \(domain match\)/);
  assert.deepEqual(sources, ["https://daon.com/au"]);
});

test("directory: exact name match when domain differs", () => {
  const { evidence } = directoryPresenceEvidence(
    "Daon",
    "https://daon.com",
    [{ label: "innovation ecosystem", rows: [{ name: "daon", website: "https://elsewhere.io" }] }],
  );
  assert.equal(evidence.length, 1);
  assert.match(evidence[0], /name match/);
});

test("directory: no match yields nothing", () => {
  const { evidence, sources } = directoryPresenceEvidence(
    "Daon",
    "https://daon.com",
    [{ label: "service providers", rows: [{ name: "Acme", website: "https://acme.com" }] }],
  );
  assert.deepEqual(evidence, []);
  assert.deepEqual(sources, []);
});

test("merge: a directory hit LIFTS an llm 'none' to established", () => {
  const merged = mergePresence(
    { status: "none", evidence: [], sources: [] },
    { evidence: ["Listed in the ... directory (domain match)"], sources: ["https://daon.com/au"] },
  );
  assert.equal(merged.status, "established");
  assert.equal(merged.evidence.length, 1);
});

test("merge: no directory hit keeps the llm status; evidence de-duped", () => {
  const merged = mergePresence(
    { status: "entering", evidence: ["hiring first AU rep", "hiring first AU rep"], sources: ["u"] },
    { evidence: [], sources: [] },
  );
  assert.equal(merged.status, "entering");
  assert.deepEqual(merged.evidence, ["hiring first AU rep"]);
});

test("reweight note: established de-emphasises entry logistics, honours goals", () => {
  const note = buildPresenceReweightNote("established");
  assert.match(note, /ALREADY operates in Australia/);
  assert.match(note, /unless the user explicitly selected a goal/);
  assert.match(note, /entity\/company setup/);
});

test("reweight note: none is empty (today's output unchanged)", () => {
  assert.equal(buildPresenceReweightNote("none"), "");
});

test("reweight note: entering is a hybrid", () => {
  assert.match(buildPresenceReweightNote("entering"), /not yet fully established/);
});

test("footprint note: only when established with evidence", () => {
  assert.equal(buildFootprintNote({ status: "none", evidence: ["x"], sources: [] }), "");
  assert.equal(buildFootprintNote({ status: "established", evidence: [], sources: [] }), "");
  const note = buildFootprintNote({ status: "established", evidence: ["Sydney office"], sources: [] });
  assert.match(note, /CURRENT AUSTRALIAN FOOTPRINT/);
  assert.match(note, /Sydney office/);
});

test("presenceMetadata: counts only, caps sources, no raw evidence text", () => {
  const meta = presenceMetadata({
    status: "established",
    evidence: ["a", "b", "c"],
    sources: ["1", "2", "3", "4", "5", "6"],
  });
  assert.deepEqual(meta, { status: "established", evidence_count: 3, sources: ["1", "2", "3", "4", "5"] });
  assert.equal(JSON.stringify(meta).includes('"a"'), false);
});

test("prompt: includes company, truncates content, demands JSON + honest none", () => {
  const p = buildAuPresencePrompt("Daon", "https://daon.com", "x".repeat(9000), "y".repeat(9000));
  assert.match(p, /Company: Daon/);
  assert.match(p, /"none" is a valid, expected answer/);
  assert.match(p, /Require CONCRETE evidence for "established"/);
  // content truncated (scrape 6000 + search 3000 + template, well under raw 18000)
  assert.ok(p.length < 12000);
});
