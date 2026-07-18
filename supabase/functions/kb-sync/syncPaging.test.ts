import { test } from "node:test";
import assert from "node:assert/strict";
import { NIL_ID, normalizeTs, maxTs, keysetOr } from "./syncPaging.ts";

test("normalizeTs swaps the date/time space for T and preserves microseconds", () => {
  assert.equal(normalizeTs("2026-02-16 00:55:29.942246+00"), "2026-02-16T00:55:29.942246+00");
  assert.equal(normalizeTs("2026-02-16T00:55:29.942246+00:00"), "2026-02-16T00:55:29.942246+00:00"); // idempotent
});

test("maxTs never regresses across mixed space/T formats", () => {
  // space-form and T-form of the SAME instant must compare equal-ish (T wins, same value)
  assert.equal(maxTs("2026-02-16 00:55:29.942246+00", "1970-01-01T00:00:00+00"), "2026-02-16T00:55:29.942246+00");
  // a later stored watermark is not dragged backward by an older processed ts
  assert.equal(maxTs("2026-05-01 12:00:00+00", "2026-02-16T00:55:29+00"), "2026-05-01T12:00:00+00");
});

test("keysetOr builds the compound (ts,id) filter with normalised ts", () => {
  assert.equal(
    keysetOr("created_at", "id", "2026-02-16 00:55:29.942246+00", NIL_ID),
    "created_at.gt.2026-02-16T00:55:29.942246+00,and(created_at.eq.2026-02-16T00:55:29.942246+00,id.gt.00000000-0000-0000-0000-000000000000)",
  );
});

test("keysetOr works for the linkedin view's text id column", () => {
  assert.equal(
    keysetOr("synced_at", "source_ref", "2026-02-15T21:53:12.1+00", "abc"),
    "synced_at.gt.2026-02-15T21:53:12.1+00,and(synced_at.eq.2026-02-15T21:53:12.1+00,source_ref.gt.abc)",
  );
});
