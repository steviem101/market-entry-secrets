/**
 * Tests for the session-booking selection logic (MES-196 / T13). Run: `npm test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  selectBookableSession,
  buildBookingUrl,
  SESSION_KINDS,
  type EntitlementRow,
} from './sessionBooking.ts';

const NOW = new Date('2026-07-16T12:00:00Z');
const FUTURE = '2026-08-15T00:00:00Z';
const PAST = '2026-07-01T00:00:00Z';

const row = (overrides: Partial<EntitlementRow>): EntitlementRow => ({
  kind: 'walkthrough_call',
  granted_count: 1,
  consumed_count: 0,
  expires_at: FUTURE,
  ...overrides,
});

test('no rows / null → nothing bookable (free users never see the banner)', () => {
  assert.equal(selectBookableSession([], NOW), null);
  assert.equal(selectBookableSession(null, NOW), null);
  assert.equal(selectBookableSession(undefined, NOW), null);
});

test('growth walkthrough_call entitlement is bookable with the 30min link', () => {
  const cfg = selectBookableSession([row({})], NOW);
  assert.ok(cfg);
  assert.equal(cfg!.kind, 'walkthrough_call');
  assert.match(cfg!.calendlyUrl, /calendly\.com\/stephen-marketentrysecrets\/30min$/);
});

test('scale strategy_session entitlement is bookable with the 60-minute link', () => {
  const cfg = selectBookableSession([row({ kind: 'strategy_session' })], NOW);
  assert.ok(cfg);
  assert.equal(cfg!.kind, 'strategy_session');
  assert.match(cfg!.calendlyUrl, /60-minute-meeting$/);
});

test('consumed entitlement hides the banner', () => {
  assert.equal(selectBookableSession([row({ consumed_count: 1 })], NOW), null);
});

test('expired entitlement hides the banner', () => {
  assert.equal(selectBookableSession([row({ expires_at: PAST })], NOW), null);
});

test('null expires_at never expires', () => {
  assert.ok(selectBookableSession([row({ expires_at: null })], NOW));
});

test('unparseable expires_at fails closed (treated as expired, not never-expires)', () => {
  assert.equal(selectBookableSession([row({ expires_at: 'not-a-date' })], NOW), null);
});

test('intro kinds are never bookable sessions', () => {
  const intros: EntitlementRow[] = [
    row({ kind: 'mentor_intro', granted_count: 2 }),
    row({ kind: 'ecosystem_intro', granted_count: 3 }),
  ];
  assert.equal(selectBookableSession(intros, NOW), null);
});

test('holding both kinds offers the strategy session (highest value first)', () => {
  const cfg = selectBookableSession(
    [row({}), row({ kind: 'strategy_session' })],
    NOW,
  );
  assert.equal(cfg!.kind, 'strategy_session');
  // and the ordering source of truth is the exported constant
  assert.deepEqual([...SESSION_KINDS], ['strategy_session', 'walkthrough_call']);
});

test('a consumed strategy_session falls back to an unconsumed walkthrough_call', () => {
  const cfg = selectBookableSession(
    [row({ kind: 'strategy_session', consumed_count: 1 }), row({})],
    NOW,
  );
  assert.equal(cfg!.kind, 'walkthrough_call');
});

test('buildBookingUrl prefills name and email, skips blanks, survives bad input', () => {
  const url = buildBookingUrl('https://calendly.com/x/30min', {
    name: 'Acme Pty',
    email: 'user@example.com',
  });
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('name'), 'Acme Pty');
  assert.equal(parsed.searchParams.get('email'), 'user@example.com');

  assert.equal(
    buildBookingUrl('https://calendly.com/x/30min', {}),
    'https://calendly.com/x/30min',
  );
  // malformed base falls back to the input rather than throwing
  assert.equal(buildBookingUrl('not a url', { name: 'x' }), 'not a url');
});
