/**
 * Tests for the free-vs-paid comparison split (MES-188 T5b). Run: `npm test`.
 * Pure config-driven logic — no I/O, no lucide import (fixtures mirror the real
 * reportSectionConfig shape).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitSectionsByTier, lockedByTier } from './comparisonMoments.ts';

// Mirrors the verified server split (report_templates): 8 free, mentor=growth,
// first_customers + lead_list = scale.
const ORDER = [
  'executive_summary', 'swot_analysis', 'competitor_landscape', 'first_customers',
  'service_providers', 'mentor_recommendations', 'investor_recommendations',
  'events_resources', 'action_plan', 'setup_compliance', 'lead_list',
];
const TIER_REQUIREMENTS = {
  mentor_recommendations: 'growth',
  first_customers: 'scale',
  lead_list: 'scale',
};
const LABELS = {
  executive_summary: 'Executive Summary', mentor_recommendations: 'Mentor Recommendations',
  first_customers: 'Your First Customers', lead_list: 'Lead List',
};
const TIER_LABELS = { free: 'Free', growth: 'Growth', scale: 'Scale', enterprise: 'Enterprise' };
const HIERARCHY = ['free', 'growth', 'scale', 'enterprise'];

test('splits free vs gated sections, preserving order', () => {
  const { free, locked } = splitSectionsByTier(ORDER, TIER_REQUIREMENTS, LABELS, TIER_LABELS);
  assert.equal(free.length, 8);
  assert.equal(locked.length, 3);
  // free excludes exactly the three gated keys
  const freeKeys = free.map((s) => s.key);
  assert.ok(!freeKeys.includes('mentor_recommendations'));
  assert.ok(!freeKeys.includes('lead_list'));
  assert.ok(freeKeys.includes('executive_summary'));
});

test('locked sections carry the unlocking tier + its display label', () => {
  const { locked } = splitSectionsByTier(ORDER, TIER_REQUIREMENTS, LABELS, TIER_LABELS);
  const mentor = locked.find((s) => s.key === 'mentor_recommendations');
  assert.equal(mentor?.tier, 'growth');
  assert.equal(mentor?.tierLabel, 'Growth');
  const leads = locked.find((s) => s.key === 'lead_list');
  assert.equal(leads?.tier, 'scale');
  assert.equal(leads?.tierLabel, 'Scale');
});

test('falls back to a humanised label when none is provided', () => {
  const { free } = splitSectionsByTier(['setup_compliance'], {}, {}, TIER_LABELS);
  assert.equal(free[0].label, 'Setup Compliance');
});

test('lockedByTier groups by unlocking tier in hierarchy order', () => {
  const { locked } = splitSectionsByTier(ORDER, TIER_REQUIREMENTS, LABELS, TIER_LABELS);
  const groups = lockedByTier(locked, HIERARCHY);
  assert.equal(groups.length, 2);            // growth + scale
  assert.equal(groups[0].tier, 'growth');    // growth before scale
  assert.equal(groups[1].tier, 'scale');
  assert.equal(groups[1].sections.length, 2); // first_customers + lead_list
});

test('empty gating yields all-free, no locked groups', () => {
  const { free, locked } = splitSectionsByTier(['a', 'b'], {}, {}, TIER_LABELS);
  assert.equal(free.length, 2);
  assert.equal(locked.length, 0);
  assert.deepEqual(lockedByTier(locked, HIERARCHY), []);
});
