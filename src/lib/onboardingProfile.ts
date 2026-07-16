/**
 * Pure helpers for the streamlined welcome/onboarding modal (MES-187 A3).
 *
 * The modal no longer asks "Target Market" — MES only serves the Australian/ANZ
 * corridor, so the answer is always Australia. To keep every downstream consumer
 * (report-creator prefill, dashboard personalisation, analytics) working, the
 * write path ALWAYS persists `target_market = 'Australia'` — on completion AND on
 * skip — rather than leaving it null. That invariant lives here so it is tested
 * once and can never be forgotten at a call site.
 */

/** The only meaningful target market — persisted on every onboarding write. */
export const ONBOARDING_TARGET_MARKET = 'Australia';

export interface OnboardingModalState {
  use_case: string;
  website: string;
  company_name: string;
  country: string;
}

/**
 * Normalise a user-entered website to a stored form: prepend https:// when the
 * scheme is missing, drop a trailing slash. Returns '' for blank/unparseable
 * input (so we simply don't persist a website rather than storing junk).
 */
export function normaliseWebsite(raw: string | null | undefined): string {
  const t = (raw ?? '').trim();
  if (!t) return '';
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes('.')) return '';
    return `${u.protocol}//${u.host}${u.pathname}`.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

/**
 * Build the `profiles` upsert payload for a COMPLETED modal. `target_market` is
 * always Australia — never read from user input (the field is gone). Only
 * non-empty fields are included so we never overwrite a good value with a blank.
 */
export function buildOnboardingProfile(
  state: Partial<OnboardingModalState>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    target_market: ONBOARDING_TARGET_MARKET,
    onboarding_completed: true,
  };
  if (state.use_case?.trim()) payload.use_case = state.use_case.trim();
  if (state.country?.trim()) payload.country = state.country.trim();
  if (state.company_name?.trim()) payload.company_name = state.company_name.trim();
  const website = normaliseWebsite(state.website);
  if (website) payload.website = website;
  return payload;
}

/**
 * Build the payload for a SKIPPED modal. Still stamps the always-Australia
 * default + onboarding_completed, so a skipping user never leaves a null
 * target_market for downstream consumers to trip over.
 */
export function buildSkippedOnboardingProfile(): Record<string, unknown> {
  return { target_market: ONBOARDING_TARGET_MARKET, onboarding_completed: true };
}

/**
 * Completion gate for the streamlined modal: persona is the highest-signal
 * question, and we need at least a company identity (a website OR a name).
 * Country is optional — it is inferred elsewhere and should not block.
 */
export function isOnboardingComplete(state: Partial<OnboardingModalState>): boolean {
  const hasPersona = !!state.use_case?.trim();
  const hasIdentity = !!normaliseWebsite(state.website) || !!state.company_name?.trim();
  return hasPersona && hasIdentity;
}
