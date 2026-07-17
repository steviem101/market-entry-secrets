/**
 * Tests for the hero-intent → report prefill bridge (MES-158). Run: `npm test`.
 * Only the pure draft-shaping is exercised here; writeIntentPrefill /
 * readHeroIntentMarker are storage side-effects guarded to no-op without a
 * `window`, so they aren't asserted in the (DOM-less) node runner.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrefillDraft, mergeIntentDraft } from './heroIntentPrefill.ts';
import { classifyIntent } from './intentClassifier.ts';

test('carries persona + goals + capped focus from a classified intent', () => {
  const draft = buildPrefillDraft(classifyIntent('find investors for my startup'));
  assert.equal(draft.persona, 'startup');
  assert.ok(draft.goal_ids?.includes('investors'));
  assert.equal(draft.report_focus, 'find investors for my startup');
});

test('omits goal_ids on an unmatched (low-confidence) intent, still sets focus', () => {
  const draft = buildPrefillDraft(classifyIntent('asdfghjkl qwerty'));
  assert.equal(draft.goal_ids, undefined);
  assert.equal(draft.report_focus, 'asdfghjkl qwerty');
  assert.equal(draft.persona, 'international'); // safe default
});

test('report_focus is trimmed and capped at 200 chars', () => {
  const draft = buildPrefillDraft(classifyIntent(`  ${'x'.repeat(300)}  `));
  assert.equal(draft.report_focus?.length, 200);
});

test('goal_ids is a fresh copy (no shared reference into the intent)', () => {
  const intent = classifyIntent('find a lawyer');
  const draft = buildPrefillDraft(intent);
  assert.notEqual(draft.goal_ids, intent.goalIds);
  assert.deepEqual(draft.goal_ids, intent.goalIds);
});

// --- mergeIntentDraft: don't persist a persona/goal-inconsistent draft (#11) ---

test('a persona change without new goals drops the stale goal_ids', () => {
  const existing = { persona: 'startup' as const, goal_ids: ['investors', 'mentors_startup'] };
  const patch = { persona: 'international' as const, report_focus: 'expanding into Australia' };
  const merged = mergeIntentDraft(existing, patch);
  assert.equal(merged.persona, 'international');
  assert.equal(merged.goal_ids, undefined, 'startup goals not carried under international');
  assert.equal(merged.report_focus, 'expanding into Australia');
});

test('a persona change WITH new goals keeps the new goals', () => {
  const existing = { persona: 'international' as const, goal_ids: ['find_providers'] };
  const patch = { persona: 'startup' as const, goal_ids: ['investors'] };
  assert.deepEqual(mergeIntentDraft(existing, patch).goal_ids, ['investors']);
});

test('same persona keeps the existing in-progress goals', () => {
  const existing = { persona: 'startup' as const, goal_ids: ['investors'] };
  const patch = { persona: 'startup' as const, report_focus: 'seed round' };
  assert.deepEqual(mergeIntentDraft(existing, patch).goal_ids, ['investors']);
});

test('a fresh draft (no existing persona) just applies the patch', () => {
  const merged = mergeIntentDraft({}, { persona: 'startup' as const, report_focus: 'x' });
  assert.equal(merged.persona, 'startup');
  assert.equal(merged.goal_ids, undefined);
});
