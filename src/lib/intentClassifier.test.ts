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

test('rawIntent is capped at 200 chars (bounds marker + analytics metadata)', () => {
  const r = classifyIntent('x'.repeat(300));
  assert.equal(r.rawIntent.length, 200);
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

// --- Regression tests for the wave-review classifier fixes ---

test('tax variants (taxes/taxation) map to service providers (#9 stem fix)', () => {
  assert.ok(classifyIntent('help with my taxes').goalIds.includes('find_providers'));
  assert.ok(classifyIntent('corporate taxation advice').goalIds.includes('find_providers'));
  // singular still works
  assert.ok(classifyIntent('need a tax advisor').goalIds.includes('find_providers'));
});

test('bare "capital"/"raisins" no longer misfire the investor rule (#7 over-match fix)', () => {
  const r = classifyIntent('capital equipment suppliers');
  assert.ok(!r.goalIds.includes('investors'), 'equipment capital is not fundraising');
  assert.ok(!classifyIntent('best raisins for baking').goalIds.includes('investors'));
  // genuine fundraising intents still classify
  assert.ok(classifyIntent('raising a seed round').goalIds.includes('investors'));
  assert.ok(classifyIntent('find angel investors').goalIds.includes('investors'));
});

test('startup-persona shared-vocab intents remap to their startup twins (#8 remap fix)', () => {
  // find_providers -> growth_providers under startup
  const hiring = classifyIntent('hiring help for my startup');
  assert.equal(hiring.persona, 'startup');
  assert.ok(hiring.goalIds.includes('growth_providers'));
  assert.equal(hiring.confidence, 'high');
  // guides -> guides_startup under startup
  const guides = classifyIntent('growth playbooks for my startup');
  assert.equal(guides.persona, 'startup');
  assert.ok(guides.goalIds.includes('guides_startup'));
});

test('a persona-valid shared goal is not starved by soon-to-be-dropped goals (#10 ordering fix)', () => {
  // international persona; investors + accelerators are startup-only (dropped),
  // grants is shared and must survive even though it is matched by a later rule.
  const r = classifyIntent('lawyer investors accelerators grants');
  assert.equal(r.persona, 'international');
  assert.ok(r.goalIds.includes('find_providers'));
  assert.ok(r.goalIds.includes('grants'), 'shared goal survives the cap');
  assert.ok(!r.goalIds.includes('investors'));
  assert.ok(r.goalIds.length <= 3);
});
