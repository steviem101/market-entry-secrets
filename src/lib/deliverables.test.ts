/**
 * Tests for the deliverables hub normalisation (MES-188 T15). Run: `npm test`.
 * Pure — nowMs is passed in, so no clock dependency.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDeliverables, entitlementToDeliverable, leadRequestToDeliverable } from './deliverables.ts';

const NOW = 1_800_000_000_000; // fixed reference
const inDays = (n: number) => new Date(NOW + n * 86_400_000).toISOString();

test('available entitlement shows remaining + expiry', () => {
  const d = entitlementToDeliverable(
    { kind: 'mentor_intro', granted_count: 2, consumed_count: 1, expires_at: inDays(20) }, NOW);
  assert.equal(d.status, 'available');
  assert.equal(d.label, 'Mentor introduction');
  assert.match(d.detail!, /1 of 2 available/);
  assert.match(d.detail!, /expires in 20 days/);
});

test('fully consumed entitlement is used', () => {
  const d = entitlementToDeliverable(
    { kind: 'strategy_session', granted_count: 1, consumed_count: 1, expires_at: inDays(10) }, NOW);
  assert.equal(d.status, 'used');
});

test('past-expiry entitlement is expired regardless of remaining', () => {
  const d = entitlementToDeliverable(
    { kind: 'ecosystem_intro', granted_count: 3, consumed_count: 0, expires_at: inDays(-1) }, NOW);
  assert.equal(d.status, 'expired');
});

test('lead request status maps + carries report cross-link', () => {
  assert.equal(leadRequestToDeliverable({ id: 'a', report_id: 'r1', status: 'delivered' }).status, 'delivered');
  assert.equal(leadRequestToDeliverable({ id: 'b', report_id: null, status: 'new' }).status, 'in_progress');
  assert.equal(leadRequestToDeliverable({ id: 'c', report_id: 'r2', status: 'delivered' }).reportId, 'r2');
});

test('buildDeliverables drops zero-grant entitlements and orders active-first', () => {
  const items = buildDeliverables(
    [
      { kind: 'mentor_intro', granted_count: 0, consumed_count: 0, expires_at: null }, // dropped
      { kind: 'walkthrough_call', granted_count: 1, consumed_count: 1, expires_at: inDays(5) }, // used
      { kind: 'strategy_session', granted_count: 1, consumed_count: 0, expires_at: inDays(5) }, // available
    ],
    [
      { id: 'x', report_id: null, status: 'delivered' },
      { id: 'y', report_id: null, status: 'new' }, // in_progress
    ],
    NOW,
  );
  assert.equal(items.length, 4); // mentor_intro(0) dropped
  // available first, then in_progress, then delivered, then used
  assert.deepEqual(items.map((i) => i.status), ['available', 'in_progress', 'delivered', 'used']);
});

test('unknown entitlement kind falls back to a humanised label', () => {
  const d = entitlementToDeliverable({ kind: 'concierge_call', granted_count: 1, consumed_count: 0, expires_at: null }, NOW);
  assert.equal(d.label, 'concierge call');
});

test('two entitlements of the same kind get distinct ids and both survive (#6)', () => {
  // A repeat buyer holds two mentor_intro rows (uniqueness is source_purchase+kind,
  // not user+kind). Keying on the row id keeps them from colliding into one.
  const items = buildDeliverables(
    [
      { id: 'p1', kind: 'mentor_intro', granted_count: 1, consumed_count: 0, expires_at: inDays(30) },
      { id: 'p2', kind: 'mentor_intro', granted_count: 1, consumed_count: 0, expires_at: inDays(10) },
    ],
    [],
    NOW,
  );
  assert.equal(items.length, 2, 'both grants surface');
  const ids = items.map((i) => i.id);
  assert.equal(new Set(ids).size, 2, 'ids are unique (no React key collision)');
  assert.deepEqual(ids.sort(), ['ent:p1', 'ent:p2']);
});
