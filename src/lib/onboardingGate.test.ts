import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowOnboarding } from './onboardingGate.ts';

test('onboardingGate: hidden when onboarding is not needed', () => {
  assert.equal(shouldShowOnboarding('/dashboard', '', false), false);
  assert.equal(shouldShowOnboarding('/report-creator', '', false), false);
});

test('onboardingGate: shown on a normal route when needed', () => {
  assert.equal(shouldShowOnboarding('/dashboard', '', true), true);
  assert.equal(shouldShowOnboarding('/mentors', '?foo=1', true), true);
  assert.equal(shouldShowOnboarding('/member-hub', '', true), true);
});

test('onboardingGate: suppressed across the whole report flow', () => {
  assert.equal(shouldShowOnboarding('/report-creator', '', true), false);
  assert.equal(shouldShowOnboarding('/report/abc123', '', true), false);
  assert.equal(shouldShowOnboarding('/report/shared/tok', '', true), false);
});

test('onboardingGate: suppressed on a Stripe return anywhere', () => {
  assert.equal(shouldShowOnboarding('/pricing', '?stripe_status=success', true), false);
  assert.equal(shouldShowOnboarding('/pricing', '?stripe_status=cancel', true), false);
});

test('onboardingGate: /my-reports (dashboard list, not the flow) still shows it', () => {
  assert.equal(shouldShowOnboarding('/my-reports', '', true), true);
});
