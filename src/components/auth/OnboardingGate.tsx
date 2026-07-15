import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingDialog } from '@/components/auth/OnboardingDialog';
import { shouldShowOnboarding } from '@/lib/onboardingGate';

/**
 * Renders the onboarding modal only where it's appropriate (MES-187 A2).
 *
 * Must live INSIDE the Router (AuthProvider is mounted above BrowserRouter, so
 * it can't read the route). The modal is suppressed on the report flow and on
 * Stripe returns so it never interrupts generation or checkout — for those
 * users the profile is derived from their intake (A1) and onboarding_completed
 * is already true; for anyone else it simply defers to their next visit to a
 * non-report route (e.g. the Member Hub).
 */
export const OnboardingGate = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  const needsOnboarding =
    !loading && user !== null && profile !== null && profile.onboarding_completed === false;

  const open = shouldShowOnboarding(location.pathname, location.search, needsOnboarding);

  return (
    <OnboardingDialog
      open={open}
      onOpenChange={() => {
        // Closes when updateProfile flips onboarding_completed = true.
      }}
    />
  );
};
