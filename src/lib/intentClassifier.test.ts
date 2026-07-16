/**
 * Tests for the hero-intent classifier (MES-158 V1). Run: `npm test`.
 * Deterministic rule-based mapping — no I/O.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyIntent, toReportFocus, INTENT_CHIPS } from './intentClassifier.ts';

// Goal ids mirrored from GOALS in intakeSchema.v2 (the test runner can't resolve
// the @/ alias for a runtime value import). + per-persona validity for assertions.
const ALL_GOAL_IDS = new Set([
  'find_providers', 'trade_agencies', 'case_studies', 'guides', 'market_research',
  'associations', 'events', 'mentors_intl', 'lead_lists_intl', 'compliance',
  'investors', 'accelerators', 'mentors_startup', 'growth_providers', 'spaces',
  'grants', 'lead_lists_startup', 'founders', 'guides_startup',
]);
const STARTUP_ONLY = new Set(['investors', 'accelerators', 'mentors_startup', 'growth_providers', 'spaces', 'lead_lists_startup', 'founders', 'guides_startup']);
const INTERNATIONAL_ONLY = new Set(['find_providers', 'trade_agencies', 'case_studies', 'guides', 'associations', 'mentors_intl', 'lead_lists_intl', 'compliance']);
const validForPersona = (id: string, persona: string) =>
  persona === 'startup' ? !INTERNATIONAL_ONLY.has(id) : !STARTUP_ONLY.has(id);
const goalIds = ALL_GOAL_IDS;

test('maps a lawyer intent to service providers, international persona', () => {
  const r = classifyIntent('I need a startup lawyer');
  assert.ok(r.goalIds.includes('find_providers'));
  assert.equal(r.persona, 'international');
  assert.equal(r.confidence, 'high');
});

test('maps an investor intent to investors, startup persona', () => {
  const r = classifyIntent('find investors for my climate tech startup');
  assert.ok(r.goalIds.includes('investors'));
  assert.equal(r.persona, 'startup');
});

test('mentor intent maps to the persona-appropriate mentor goal', () => {
  assert.ok(classifyIntent('find a fintech mentor', 'startup').goalIds.includes('mentors_startup'));
  assert.ok(classifyIntent('find an experienced mentor', 'international').goalIds.includes('mentors_intl'));
});

test('every returned goal id is valid, and valid for the resolved persona', () => {
  for (const intent of ['find investors', 'find a lawyer', 'find grants', 'find events']) {
    const r = classifyIntent(intent);
    for (const id of r.goalIds) {
      assert.ok(goalIds.has(id), `${id} is a real goal`);
      assert.ok(validForPersona(id, r.persona), `${id} valid for ${r.persona}`);
    }
  }
});

test('caps at 3 goals', () => {
  const r = classifyIntent('lawyer accountant investor mentor events grants leads');
  assert.ok(r.goalIds.length <= 3);
});

test('unmatched intent is low confidence with no goals (form will ask to refine)', () => {
  const r = classifyIntent('asdfghjkl qwerty');
  assert.deepEqual(r.goalIds, []);
  assert.equal(r.confidence, 'low');
  assert.equal(r.rawIntent, 'asdfghjkl qwerty');
});

test('blank / whitespace intent is low confidence, empty', () => {
  assert.equal(classifyIntent('   ').confidence, 'low');
  assert.equal(classifyIntent('').goalIds.length, 0);
});

test('explicit persona override wins over keyword hints', () => {
  const r = classifyIntent('find investors', 'international');
  assert.equal(r.persona, 'international');
  // investors is startup-only, so it's dropped for an international override
  assert.ok(!r.goalIds.includes('investors'));
});

test('toReportFocus trims and caps at 200 chars', () => {
  assert.equal(toReportFocus('  hi  '), 'hi');
  assert.equal(toReportFocus('x'.repeat(300)).length, 200);
});

test('every INTENT_CHIP classifies to at least one valid goal', () => {
  for (const chip of INTENT_CHIPS) {
    const r = classifyIntent(chip.intent, chip.persona);
    assert.ok(r.goalIds.length > 0, `chip "${chip.label}" should match a goal`);
    for (const id of r.goalIds) assert.ok(goalIds.has(id));
  }
});
