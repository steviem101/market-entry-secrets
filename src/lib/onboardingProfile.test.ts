/**
 * Tests for the streamlined onboarding write-path helpers (MES-187 A3).
 * The load-bearing invariant: target_market is ALWAYS Australia — on complete
 * and on skip — because the question was removed from the UI. Run: `npm test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ONBOARDING_TARGET_MARKET,
  normaliseWebsite,
  buildOnboardingProfile,
  buildSkippedOnboardingProfile,
  isOnboardingComplete,
} from './onboardingProfile.ts';

test('completed profile always stamps target_market = Australia (never from input)', () => {
  const p = buildOnboardingProfile({ use_case: 'founder', company_name: 'Acme', country: 'Singapore' });
  assert.equal(p.target_market, ONBOARDING_TARGET_MARKET);
  assert.equal(p.target_market, 'Australia');
  assert.equal(p.onboarding_completed, true);
  assert.equal(p.use_case, 'founder');
  assert.equal(p.company_name, 'Acme');
  assert.equal(p.country, 'Singapore');
});

test('skipped profile still stamps Australia + completed, nothing else', () => {
  const p = buildSkippedOnboardingProfile();
  assert.deepEqual(p, { target_market: 'Australia', onboarding_completed: true });
});

test('blank/whitespace fields are omitted (never overwrite good values with blanks)', () => {
  const p = buildOnboardingProfile({ use_case: '  ', company_name: '', country: '   ', website: '' });
  assert.deepEqual(Object.keys(p).sort(), ['onboarding_completed', 'target_market']);
});

test('website is normalised into the payload; junk is dropped', () => {
  assert.equal(buildOnboardingProfile({ website: 'acme.com' }).website, 'https://acme.com');
  assert.equal(buildOnboardingProfile({ website: 'https://acme.com/' }).website, 'https://acme.com');
  assert.equal('website' in buildOnboardingProfile({ website: 'not a url' }), false);
});

test('normaliseWebsite prepends https, strips trailing slash, rejects schemeless junk', () => {
  assert.equal(normaliseWebsite('acme.com'), 'https://acme.com');
  assert.equal(normaliseWebsite('http://acme.com/path/'), 'http://acme.com/path');
  assert.equal(normaliseWebsite('  Acme.Com  '), 'https://acme.com'); // host lowercased by URL()
  assert.equal(normaliseWebsite(''), '');
  assert.equal(normaliseWebsite(null), '');
  assert.equal(normaliseWebsite('localhost'), ''); // no dot → not a real host
  assert.equal(normaliseWebsite('nonsense'), '');
});

test('completion needs persona AND an identity (website OR name); country optional', () => {
  assert.equal(isOnboardingComplete({}), false);
  assert.equal(isOnboardingComplete({ use_case: 'founder' }), false); // no identity
  assert.equal(isOnboardingComplete({ use_case: 'founder', company_name: 'Acme' }), true);
  assert.equal(isOnboardingComplete({ use_case: 'founder', website: 'acme.com' }), true);
  assert.equal(isOnboardingComplete({ company_name: 'Acme', website: 'acme.com' }), false); // no persona
  // a website that normalises to '' is not an identity
  assert.equal(isOnboardingComplete({ use_case: 'founder', website: 'nonsense' }), false);
});
