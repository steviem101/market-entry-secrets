import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dedupKey, isPastEvent, buildArchiveEventProposals, filterNewProposals,
  ENABLED_CHECKS, DEFAULT_BATCH_CAP, type EventRow, type ProposalInsert,
} from "./contentRefresh.ts";

const TODAY = "2026-07-20";

test("pilot enables only archive_event", () => {
  assert.deepEqual([...ENABLED_CHECKS], ["archive_event"]);
  assert.equal(DEFAULT_BATCH_CAP, 50);
});

test("isPastEvent prefers event_date, falls back to date, ignores null", () => {
  assert.equal(isPastEvent({ id: "1", status: "approved", event_date: "2026-07-19T10:00:00Z", date: "2099-01-01" }, TODAY), true);
  assert.equal(isPastEvent({ id: "2", status: "approved", date: "2026-07-19" }, TODAY), true);
  assert.equal(isPastEvent({ id: "3", status: "approved", date: "2026-07-20" }, TODAY), false); // today = not past
  assert.equal(isPastEvent({ id: "4", status: "approved", event_date: "2026-08-01T00:00:00Z" }, TODAY), false);
  assert.equal(isPastEvent({ id: "5", status: "approved", date: null, event_date: null }, TODAY), false); // undated never archived
});

test("dedupKey is stable per action+table+id", () => {
  assert.equal(dedupKey("archive_event", "events", "e1"), "archive_event:events:e1");
});

test("buildArchiveEventProposals emits auto_approved event proposals with dedup keys", () => {
  const events: EventRow[] = [
    { id: "e1", title: "Past Summit", status: "approved", date: "2026-06-01" },
    { id: "e2", title: null, status: "needs_review", event_date: "2026-05-01T09:00:00Z" },
  ];
  const props = buildArchiveEventProposals(events, "run-1");
  assert.equal(props.length, 2);
  for (const p of props) {
    assert.equal(p.action_type, "archive_event");
    assert.equal(p.target_table, "events");
    assert.equal(p.loop_name, "content-refresh");
    assert.equal(p.status, "auto_approved");
    assert.equal(p.run_id, "run-1");
    assert.equal(p.payload && typeof p.payload, "object");
  }
  assert.equal(props[0].dedup_key, "archive_event:events:e1");
  assert.match(props[0].reason, /2026-06-01/);
  assert.match(props[1].reason, /2026-05-01/); // event_date sliced to date
});

test("filterNewProposals drops candidates that already have an open proposal", () => {
  const candidates: ProposalInsert[] = buildArchiveEventProposals(
    [{ id: "e1", status: "approved", date: "2026-01-01" }, { id: "e2", status: "approved", date: "2026-01-02" }],
    null,
  );
  const existing = new Set(["archive_event:events:e1"]);
  const fresh = filterNewProposals(candidates, existing);
  assert.equal(fresh.length, 1);
  assert.equal(fresh[0].target_id, "e2");
});
