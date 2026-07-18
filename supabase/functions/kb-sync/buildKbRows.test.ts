import { test } from "node:test";
import assert from "node:assert/strict";
import { buildChunkRow, buildResearchRow, type RawChunk, type RawResearch } from "./buildKbRows.ts";

function chunk(over: Partial<RawChunk> = {}): RawChunk {
  return {
    id: "chunk-1", chunk_index: 3, chunk_text: "Setting up an entity in Australia requires...",
    embedding: null, parent_kind: "document", parent_id: "doc-1",
    parent_title: "doing-business-in-australia-2020.pdf", parent_url: "https://x/doc",
    parent_content_types: ["regulatory"], ...over,
  };
}

test("document chunk resolves corridor from the seed and preserves chunk_index", () => {
  const r = buildChunkRow(chunk())!;
  assert.equal(r.source_ref, "chunk-1");
  assert.equal(r.chunk_index, 3);
  assert.equal(r.metadata.source_kind, "document");
  assert.equal(r.metadata.target_country, "Australia");
  assert.equal(r.metadata.publication_date, "2020-01-01");
  assert.equal(r.metadata.is_proprietary, false);
});

test("embedding is copied through when present, null when absent", () => {
  assert.equal(buildChunkRow(chunk({ embedding: "[0.1,0.2]" }))!.embedding, "[0.1,0.2]");
  assert.equal(buildChunkRow(chunk({ embedding: null }))!.embedding, null);
});

test("empty content is skipped", () => {
  assert.equal(buildChunkRow(chunk({ chunk_text: "   " })), null);
  assert.equal(buildChunkRow(chunk({ chunk_text: null })), null);
});

test("youtube/reddit chunks get unknown corridor (no guessing)", () => {
  const r = buildChunkRow(chunk({ parent_kind: "youtube", parent_title: "Some talk", parent_content_types: ["market"] }))!;
  assert.equal(r.metadata.target_country, null);
  assert.equal(r.metadata.origin_country, null);
  assert.deepEqual(r.metadata.countries, []);
  assert.equal(r.metadata.source_kind, "youtube");
});

test("call recordings require consent; skipped without it, proprietary when kept", () => {
  assert.equal(buildChunkRow(chunk({ parent_kind: "call", consent_confirmed: false })), null);
  assert.equal(buildChunkRow(chunk({ parent_kind: "call" })), null); // undefined consent
  const kept = buildChunkRow(chunk({ parent_kind: "call", consent_confirmed: true }))!;
  assert.equal(kept.metadata.is_proprietary, true);
});

test("podcast chunks are flagged proprietary", () => {
  assert.equal(buildChunkRow(chunk({ parent_kind: "podcast" }))!.metadata.is_proprietary, true);
});

test("research_cache row maps whole text as one unit with null corridor", () => {
  const raw: RawResearch = { id: "rc-1", query: "AU fintech licensing", research_text: "APRA regulates...", embedding: "[0.3]", content_types: ["regulatory"] };
  const r = buildResearchRow(raw)!;
  assert.equal(r.source_ref, "rc-1");
  assert.equal(r.title, "AU fintech licensing");
  assert.equal(r.chunk_index, 0);
  assert.equal(r.metadata.source_kind, "research_cache");
  assert.equal(r.embedding, "[0.3]");
  assert.equal(buildResearchRow({ ...raw, research_text: "" }), null);
});
