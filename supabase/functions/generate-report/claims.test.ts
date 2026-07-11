import { test } from "node:test";
import assert from "node:assert/strict";
import {
  claimsFromKeyMetrics,
  buildClaimsExtractionPrompt,
  parseClaimsResponse,
  dedupeClaims,
  renumberClaims,
  claimsEvidenceBlock,
} from "./claims.ts";

test("claimsFromKeyMetrics: converts metrics to claims and resolves [N] citations", () => {
  const claims = claimsFromKeyMetrics(
    [
      { label: "Market Size", value: "$8.48B [2]", context: "2024 estimate" },
      { label: "CAGR", value: "5.1%", context: "2024-2030 projected", estimated: true },
    ],
    ["https://a.example/one", "https://b.example/two"],
  );
  assert.equal(claims.length, 2);
  assert.equal(claims[0].claim_id, "c1");
  assert.equal(claims[0].stage, "metrics");
  assert.equal(claims[0].source_url, "https://b.example/two");
  assert.equal(claims[0].confidence, "high"); // cited, not estimated
  assert.equal(claims[1].confidence, "low"); // model-flagged estimate
  assert.equal(claims[1].source_url, null);
});

test("claimsFromKeyMetrics: skips empty values and tolerates empty input", () => {
  assert.deepEqual(claimsFromKeyMetrics([], []), []);
  const claims = claimsFromKeyMetrics(
    [{ label: "Ghost", value: "  ", context: "" }],
    [],
  );
  assert.equal(claims.length, 0);
});

test("parseClaimsResponse: accepts a valid array (with markdown fences) and assigns ids", () => {
  const raw = '```json\n[{"statement":"The Australian fintech market was worth $45B in 2024.","value":"$45B","unit":"AUD","confidence":"high","as_of":"2024"}]\n```';
  const claims = parseClaimsResponse(raw, 3);
  assert.ok(claims);
  assert.equal(claims!.length, 1);
  assert.equal(claims![0].claim_id, "c3");
  assert.equal(claims![0].stage, "research");
  assert.equal(claims![0].value, "$45B");
});

test("parseClaimsResponse: rejects malformed payloads (caller retries once)", () => {
  assert.equal(parseClaimsResponse("not json at all", 1), null);
  assert.equal(parseClaimsResponse('{"statement":"an object, not an array"}', 1), null);
  // schema violations: statement too short / bad confidence / wrong value type
  assert.equal(parseClaimsResponse('[{"statement":"x","confidence":"high"}]', 1), null);
  assert.equal(parseClaimsResponse('[{"statement":"long enough statement","confidence":"certain"}]', 1), null);
  assert.equal(parseClaimsResponse('[{"statement":"long enough statement","confidence":"high","value":42}]', 1), null);
});

test("dedupeClaims + renumberClaims: metrics-first wins, ids stay contiguous", () => {
  const metrics = claimsFromKeyMetrics([{ label: "Market Size", value: "$8.48B", context: "2024" }], []);
  const extracted = parseClaimsResponse(
    '[{"statement":"Market Size — 2024","value":"$8.48B","confidence":"medium"},{"statement":"Employer superannuation is 12% from July 2025.","value":"12%","confidence":"high"}]',
    2,
  )!;
  const merged = renumberClaims(dedupeClaims([...metrics, ...extracted]));
  assert.equal(merged.length, 2); // duplicate market-size claim dropped
  assert.equal(merged[0].stage, "metrics"); // metrics copy won
  assert.deepEqual(merged.map((c) => c.claim_id), ["c1", "c2"]);
});

test("buildClaimsExtractionPrompt: includes non-empty streams only", () => {
  const prompt = buildClaimsExtractionPrompt([
    { name: "landscape", text: "The market is large." },
    { name: "grants", text: "  " },
  ]);
  assert.match(prompt, /SOURCE STREAM: landscape/);
  assert.doesNotMatch(prompt, /SOURCE STREAM: grants/);
  assert.match(prompt, /Return ONLY a JSON array/);
});

test("claimsEvidenceBlock: renders numbered evidence lines", () => {
  const claims = claimsFromKeyMetrics([{ label: "CAGR", value: "5.1%", context: "2024-2030" }], []);
  const block = claimsEvidenceBlock(claims);
  assert.match(block, /^c1\. CAGR — 2024-2030 \[value: 5\.1%\]$/);
  assert.equal(claimsEvidenceBlock([]), "");
});
