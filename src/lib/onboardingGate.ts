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
