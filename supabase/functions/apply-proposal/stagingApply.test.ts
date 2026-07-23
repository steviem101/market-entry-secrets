import { test } from "node:test";
import assert from "node:assert/strict";
import {
  enabledStagingSources, isStagingSource, planStewardApply, planEnrichmentApply,
  isStagingRefusal, STAGING_FIELD_ALLOWLIST,
} from "./stagingApply.ts";

// ---- env gating ----
test("enabledStagingSources parses csv, ignores unknowns, defaults empty", () => {
  assert.equal(enabledStagingSources(undefined).size, 0);
  assert.equal(enabledStagingSources("").size, 0);
  const s = enabledStagingSources("directory_steward_staging, bogus , trade_agencies_enrichment_staging");
  assert.ok(s.has("directory_steward_staging") && s.has("trade_agencies_enrichment_staging"));
  assert.equal(s.has("bogus"), false);
  assert.equal(s.size, 2);
});

test("isStagingSource recognises the three E1 sources, not content", () => {
  assert.ok(isStagingSource("directory_steward_staging"));
  assert.ok(isStagingSource("innovation_ecosystem_enrichment_staging"));
  assert.equal(isStagingSource("agent_content_proposals"), false);
});

test("the field allowlist contains NO people tables (organisations only)", () => {
  assert.equal("community_members" in STAGING_FIELD_ALLOWLIST, false);
  assert.equal("profiles" in STAGING_FIELD_ALLOWLIST, false);
});

// ---- steward CAS ----
const stewardRow = (field_diffs: unknown, status = "approved") => ({ status, field_diffs });

test("steward applies a field only when live still equals before (CAS hit)", () => {
  const r = planStewardApply(
    stewardRow({ website: { before: "https://old.example", after: null } }),
    "innovation_ecosystem",
    { website: "https://old.example" },
  );
  assert.ok(!isStagingRefusal(r) && r.op === "update");
  if (!isStagingRefusal(r)) {
    assert.deepEqual(r.set, { website: null });
    assert.deepEqual(r.appliedFields, ["website"]);
  }
});

test("steward skips a field whose live value drifted since proposal (CAS miss)", () => {
  const r = planStewardApply(
    stewardRow({ website: { before: "https://old.example", after: null } }),
    "innovation_ecosystem",
    { website: "https://edited-since.example" },
  );
  assert.ok(!isStagingRefusal(r) && r.op === "noop");
  if (!isStagingRefusal(r)) {
    assert.equal(r.appliedFields.length, 0);
    assert.match(r.skipped[0].reason, /CAS mismatch/);
    assert.equal(r.allSatisfied, false); // a genuine mismatch must NOT resolve the row
  }
});

test("steward treats null/empty/missing live value as equal for CAS", () => {
  const r = planStewardApply(
    stewardRow({ location: { before: "", after: "Sydney" } }),
    "service_providers",
    { location: null },
  );
  assert.ok(!isStagingRefusal(r) && r.op === "update");
  if (!isStagingRefusal(r)) assert.deepEqual(r.set, { location: "Sydney" });
});

test("steward marks allSatisfied when live already equals after (idempotent)", () => {
  const r = planStewardApply(
    stewardRow({ website: { before: "https://x", after: null } }),
    "service_providers",
    { website: null },
  );
  assert.ok(!isStagingRefusal(r) && r.op === "noop");
  if (!isStagingRefusal(r)) assert.equal(r.allSatisfied, true);
});

test("steward refuses prose fields and non-allowlisted fields", () => {
  const r = planStewardApply(
    stewardRow({ description: { before: "a", after: "b" }, secret_col: { before: 1, after: 2 } }),
    "service_providers",
    { description: "a", secret_col: 1 },
  );
  assert.ok(!isStagingRefusal(r) && r.op === "noop");
  if (!isStagingRefusal(r)) {
    assert.equal(r.appliedFields.length, 0);
    assert.ok(r.skipped.some((s) => s.field === "description" && /prose/.test(s.reason)));
    assert.ok(r.skipped.some((s) => s.field === "secret_col" && /allowlist/.test(s.reason)));
  }
});

test("steward refuses a non-organisation target table", () => {
  const r = planStewardApply(stewardRow({ website: { before: "a", after: null } }), "community_members", { website: "a" });
  assert.ok(isStagingRefusal(r) && /allowlist/.test(r.reason));
});

test("steward refuses when target row is gone or status not approved", () => {
  assert.ok(isStagingRefusal(planStewardApply(stewardRow({}), "service_providers", null)));
  const notApproved = planStewardApply(stewardRow({ website: { before: "a", after: null } }, "new"), "service_providers", { website: "a" });
  assert.ok(isStagingRefusal(notApproved) && /not applyable/.test(notApproved.reason));
});

test("steward rejects array-typed value on a text field (type guard)", () => {
  const r = planStewardApply(
    stewardRow({ website: { before: "a", after: ["not", "a", "string"] } }),
    "service_providers",
    { website: "a" },
  );
  assert.ok(!isStagingRefusal(r) && r.op === "noop");
  if (!isStagingRefusal(r)) assert.match(r.skipped[0].reason, /wrong type/);
});

test("steward applies an array field when types line up", () => {
  const r = planStewardApply(
    stewardRow({ sector_tags: { before: [], after: ["fintech", "saas"] } }),
    "service_providers",
    { sector_tags: [] },
  );
  assert.ok(!isStagingRefusal(r) && r.op === "update");
  if (!isStagingRefusal(r)) assert.deepEqual(r.set, { sector_tags: ["fintech", "saas"] });
});

// ---- enrichment fill-empty ----
const enrichRow = (enrichment: unknown, status = "approved") => ({ status, enrichment });

test("enrichment fills only empty fact fields, never overwrites", () => {
  const r = planEnrichmentApply(
    enrichRow({ website: "https://new.example", location: "Melbourne" }),
    "trade_investment_agencies",
    { website: "https://existing.example", location: null },
  );
  assert.ok(!isStagingRefusal(r) && r.op === "update");
  if (!isStagingRefusal(r)) {
    assert.deepEqual(r.set, { location: "Melbourne" });          // website skipped (populated)
    assert.ok(r.skipped.some((s) => s.field === "website" && /fill-empty/.test(s.reason)));
  }
});

test("enrichment refuses prose + unknown fields, empty proposed values", () => {
  const r = planEnrichmentApply(
    enrichRow({ description: "nice copy", website: "   ", mystery: "x" }),
    "innovation_ecosystem",
    {},
  );
  assert.ok(!isStagingRefusal(r) && r.op === "noop");
  if (!isStagingRefusal(r)) {
    assert.ok(r.skipped.some((s) => s.field === "description" && /prose/.test(s.reason)));
    assert.ok(r.skipped.some((s) => s.field === "website" && /empty/.test(s.reason)));
    assert.ok(r.skipped.some((s) => s.field === "mystery" && /allowlist/.test(s.reason)));
  }
});

test("enrichment is allSatisfied when the only field already matches", () => {
  const r = planEnrichmentApply(
    enrichRow({ website: "https://x" }),
    "innovation_ecosystem",
    { website: "https://x" },
  );
  assert.ok(!isStagingRefusal(r) && r.op === "noop");
  if (!isStagingRefusal(r)) assert.equal(r.allSatisfied, true);
});

test("enrichment refuses malformed payload + non-org table", () => {
  assert.ok(isStagingRefusal(planEnrichmentApply(enrichRow(null), "innovation_ecosystem", {})));
  assert.ok(isStagingRefusal(planEnrichmentApply(enrichRow({ website: "x" }), "community_members", {})));
});
