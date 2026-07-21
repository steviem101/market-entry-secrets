import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dedupKey, isPastEvent, buildArchiveEventProposals, filterNewProposals,
  getEnabledChecks, DEFAULT_BATCH_CAP, extractDomain, buildLogoDevUrl, buildSetLogoProposals,
  nextLinkCheckCounters, shouldProposeDeadLink, checkedRecently, buildDeadLinkProposal,
  DEAD_LINK_THRESHOLD, LINK_RECHECK_AFTER_DAYS,
  type EventRow, type ProposalInsert, type LogoCandidate,
} from "./contentRefresh.ts";

const TODAY = "2026-07-20";

test("getEnabledChecks defaults to archive_event, parses env, drops unknowns", () => {
  assert.deepEqual(getEnabledChecks(undefined), ["archive_event"]);
  assert.deepEqual(getEnabledChecks("archive_event, set_logo_url"), ["archive_event", "set_logo_url"]);
  assert.deepEqual(getEnabledChecks("set_logo_url,bogus_check"), ["set_logo_url"]); // unknown dropped
  assert.deepEqual(getEnabledChecks(""), ["archive_event"]);       // empty falls back
  assert.deepEqual(getEnabledChecks("nonsense"), ["archive_event"]); // all-unknown falls back
  assert.equal(DEFAULT_BATCH_CAP, 50);
});

test("extractDomain strips scheme + www, tolerates bare hosts, rejects junk", () => {
  assert.equal(extractDomain("https://www.Example.com/path"), "example.com");
  assert.equal(extractDomain("example.com"), "example.com");
  assert.equal(extractDomain("http://sub.foo.com.au"), "sub.foo.com.au");
  assert.equal(extractDomain(""), null);
  assert.equal(extractDomain(null), null);
  assert.equal(extractDomain("not a url"), null);
});

test("buildLogoDevUrl is an https logo.dev url for the domain", () => {
  const u = buildLogoDevUrl("example.com");
  assert.ok(u.startsWith("https://img.logo.dev/example.com?"));
  assert.match(u, /token=pk_/);
});

test("buildSetLogoProposals emits auto_approved logo proposals, skips rows with no derivable domain", () => {
  const rows: LogoCandidate[] = [
    { id: "s1", website: "https://acme.com", name: "Acme" },
    { id: "s2", website: "not a url", name: "Bad" },   // no domain -> skipped
    { id: "s3", website: null, name: "None" },          // null -> skipped
  ];
  const props = buildSetLogoProposals(rows, "investors", "logo", "run-1");
  assert.equal(props.length, 1);
  assert.equal(props[0].target_id, "s1");
  assert.equal(props[0].action_type, "set_logo_url");
  assert.equal(props[0].status, "auto_approved");
  assert.equal(props[0].target_table, "investors");
  assert.equal(props[0].dedup_key, "set_logo_url:investors:s1");
  assert.equal((props[0].payload as { logo_field: string }).logo_field, "logo");
  assert.match(String((props[0].payload as { logo_url: string }).logo_url), /^https:\/\/img\.logo\.dev\/acme\.com/);
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

test("nextLinkCheckCounters increments on failure, resets to 0 on success", () => {
  assert.deepEqual(nextLinkCheckCounters({ consecutive_failures: 1 }, { ok: false, status: 500 }),
    { consecutive_failures: 2, last_status: 500, last_ok: false });
  assert.deepEqual(nextLinkCheckCounters({ consecutive_failures: 3 }, { ok: true, status: 200 }),
    { consecutive_failures: 0, last_status: 200, last_ok: true });
  assert.deepEqual(nextLinkCheckCounters(null, { ok: false, status: null }),
    { consecutive_failures: 1, last_status: null, last_ok: false }); // first-ever check, no response
});

test("shouldProposeDeadLink only at the 2-consecutive-failure threshold", () => {
  assert.equal(DEAD_LINK_THRESHOLD, 2);
  assert.equal(shouldProposeDeadLink(1), false); // a single (transient) failure never proposes
  assert.equal(shouldProposeDeadLink(2), true);
  assert.equal(shouldProposeDeadLink(3), true);
});

test("checkedRecently skips URLs inside the recheck window, rechecks older/never", () => {
  const now = Date.parse("2026-07-20T00:00:00Z");
  const dayMs = 24 * 60 * 60 * 1000;
  assert.equal(checkedRecently(new Date(now - 1 * dayMs).toISOString(), now), true);  // 1 day ago -> skip
  assert.equal(checkedRecently(new Date(now - (LINK_RECHECK_AFTER_DAYS + 1) * dayMs).toISOString(), now), false); // stale -> recheck
  assert.equal(checkedRecently(null, now), false);        // never checked -> check
  assert.equal(checkedRecently("garbage", now), false);   // unparseable -> check
});

test("buildDeadLinkProposal is a pending (non-auto) flag with url + failure evidence", () => {
  const p = buildDeadLinkProposal("service_providers", "sp1", "https://dead.example", 2, 503, "run-9");
  assert.equal(p.action_type, "flag_dead_link");
  assert.equal(p.status, "pending"); // never auto-approved
  assert.equal(p.target_table, "service_providers");
  assert.equal(p.target_id, "sp1");
  assert.equal(p.dedup_key, "flag_dead_link:service_providers:sp1");
  assert.deepEqual(p.payload, { url: "https://dead.example", consecutive_failures: 2, last_status: 503, health: 0 });
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
