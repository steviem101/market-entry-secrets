/**
 * Route rules for the onboarding modal (MES-187 A2). Pure + tested so the
 * suppression logic can't silently regress. The modal must never interrupt the
 * report flow or a checkout return; report-flow signups already had their
 * profile derived from the intake (A1), so onboarding_completed is true for
 * them anyway — this is the belt-and-braces guard for every other case.
 */
export function shouldShowOnboarding(
  pathname: string,
  search: string,
  needsOnboarding: boolean,
): boolean {
  if (!needsOnboarding) return false;
  // `/report-creator` and `/report/*` both start with `/report`; `/my-reports`
  // (the dashboard list, not the flow) does not, so onboarding may still show
  // there.
  const onReportFlow = pathname.startsWith('/report');
  const onStripeReturn = new URLSearchParams(search).has('stripe_status');
  return !(onReportFlow || onStripeReturn);
}

/**
 * MES-187 A4: onboarding is a dismissible card, not a blocking modal. Same
 * route rules as the modal had, plus a per-session dismissal — dismissing hides
 * the card for this browser session without touching the profile (the user
 * remains onboarding-incomplete, so the card returns next session), whereas
 * "Skip for now" persists the skipped profile and retires it permanently.
 */
export function shouldShowOnboardingCard(
  pathname: string,
  search: string,
  needsOnboarding: boolean,
  dismissedThisSession: boolean,
): boolean {
  if (dismissedThisSession) return false;
  return shouldShowOnboarding(pathname, search, needsOnboarding);
}
