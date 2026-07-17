/**
 * Tests for the concierge intro allowance maths (MES-188 T9). Run: `npm test`.
 * Pure — nowMs passed in, so no clock dependency. Mirrors the server-side
 * check_concierge_intro_capacity trigger.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  grantedRemaining, openRequestCount, availableToRequest, canRequestIntro,
  introKindForEntity,
} from './conciergeIntros.ts';

const NOW = 1_800_000_000_000;
const inDays = (n: number) => new Date(NOW + n * 86_400_000).toISOString();

test('grantedRemaining sums unconsumed credits of the kind only', () => {
  const ents = [
    { kind: 'mentor_intro', granted_count: 1, consumed_count: 0, expires_at: inDays(20) },
    { kind: 'mentor_intro', granted_count: 2, consumed_count: 1, expires_at: inDays(20) },
    { kind: 'ecosystem_intro', granted_count: 3, consumed_count: 0, expires_at: inDays(20) }, // other kind
  ];
  assert.equal(grantedRemaining(ents, 'mentor_intro', NOW), 2); // (1-0)+(2-1)
  assert.equal(grantedRemaining(ents, 'ecosystem_intro', NOW), 3);
});

test('expired (or unparseable-expiry) credits are excluded', () => {
  const ents = [
    { kind: 'mentor_intro', granted_count: 1, consumed_count: 0, expires_at: inDays(-1) }, // expired
    { kind: 'mentor_intro', granted_count: 1, consumed_count: 0, expires_at: 'not-a-date' }, // fail closed
    { kind: 'mentor_intro', granted_count: 1, consumed_count: 0, expires_at: null }, // never expires
  ];
  assert.equal(grantedRemaining(ents, 'mentor_intro', NOW), 1);
});

test('fully consumed credits contribute zero (never negative)', () => {
  const ents = [{ kind: 'mentor_intro', granted_count: 2, consumed_count: 2, expires_at: inDays(20) }];
  assert.equal(grantedRemaining(ents, 'mentor_intro', NOW), 0);
});

test('openRequestCount counts only open requests of the kind', () => {
  const reqs = [
    { intro_kind: 'mentor_intro', status: 'new' },
    { intro_kind: 'mentor_intro', status: 'in_progress' },
    { intro_kind: 'mentor_intro', status: 'delivered' }, // closed
    { intro_kind: 'mentor_intro', status: 'declined' }, // closed
    { intro_kind: 'ecosystem_intro', status: 'new' }, // other kind
  ];
  assert.equal(openRequestCount(reqs, 'mentor_intro'), 2);
});

test('availableToRequest reserves against open requests (consume-on-fulfilment)', () => {
  const ents = [{ kind: 'mentor_intro', granted_count: 1, consumed_count: 0, expires_at: inDays(20) }];
  // 1 credit, 0 open → 1 available
  assert.equal(availableToRequest(ents, [], 'mentor_intro', NOW), 1);
  // 1 credit, 1 open → 0 available (the open ask reserves the slot)
  assert.equal(availableToRequest(ents, [{ intro_kind: 'mentor_intro', status: 'new' }], 'mentor_intro', NOW), 0);
  // never negative
  assert.equal(
    availableToRequest(ents, [
      { intro_kind: 'mentor_intro', status: 'new' },
      { intro_kind: 'mentor_intro', status: 'in_progress' },
    ], 'mentor_intro', NOW), 0);
});

test('canRequestIntro reflects availability', () => {
  const ents = [{ kind: 'ecosystem_intro', granted_count: 3, consumed_count: 1, expires_at: inDays(20) }];
  assert.equal(canRequestIntro(ents, [], 'ecosystem_intro', NOW), true);
  assert.equal(canRequestIntro([], [], 'ecosystem_intro', NOW), false);
  assert.equal(canRequestIntro(ents, [], 'mentor_intro', NOW), false); // no mentor credits
});

test('introKindForEntity maps entity type to allowance kind', () => {
  assert.equal(introKindForEntity('mentor'), 'mentor_intro');
  assert.equal(introKindForEntity('ecosystem'), 'ecosystem_intro');
});
