import { test } from "node:test";
import assert from "node:assert/strict";
import { STEWARD_TABLES, stewardConfigFor, ageInDays } from "./tables.ts";

test("STEWARD_TABLES: the five advisory/supply directories, mentors flagged PII", () => {
  const names = STEWARD_TABLES.map((t) => t.table).sort();
  assert.deepEqual(names, [
    "community_members", "innovation_ecosystem", "investors", "service_providers", "trade_investment_agencies",
  ]);
  // Every config has a URL field and non-empty required fields.
  for (const c of STEWARD_TABLES) {
    assert.ok(c.urlField, `${c.table} needs a urlField`);
    assert.ok(c.requiredFields.length > 0, `${c.table} needs requiredFields`);
  }
  // Only community_members (mentors) is PII — content must never be diffed/staged.
  assert.equal(stewardConfigFor("community_members")?.pii, true);
  assert.equal(stewardConfigFor("service_providers")?.pii, false);
  assert.equal(stewardConfigFor("investors")?.pii, false);
});

test("stewardConfigFor: unknown table → undefined", () => {
  assert.equal(stewardConfigFor("user_reports"), undefined);
  assert.equal(stewardConfigFor(""), undefined);
});

test("ageInDays: measures staleness; missing/invalid → the stale fallback", () => {
  const now = Date.parse("2026-07-13T00:00:00Z");
  assert.equal(ageInDays("2026-07-03T00:00:00Z", now, 180), 10);
  assert.equal(ageInDays("2026-07-13T00:00:00Z", now, 180), 0);
  // future timestamp clamps to 0 (never negative)
  assert.equal(ageInDays("2026-08-13T00:00:00Z", now, 180), 0);
  // missing / unparseable → fully stale
  assert.equal(ageInDays(null, now, 180), 180);
  assert.equal(ageInDays(undefined, now, 180), 180);
  assert.equal(ageInDays("not-a-date", now, 180), 180);
});
