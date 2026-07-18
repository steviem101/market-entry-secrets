import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingCard } from '@/components/auth/OnboardingCard';
import { shouldShowOnboardingCard } from '@/lib/onboardingGate';

const DISMISS_KEY = 'mes_onboarding_card_dismissed';

const readDismissed = (): boolean => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * Renders the onboarding capture only where it's appropriate (MES-187 A2) and
 * as a dismissible card, never a blocking modal (A4).
 *
 * Must live INSIDE the Router (AuthProvider is mounted above BrowserRouter, so
 * it can't read the route). The card is suppressed on the report flow and on
 * Stripe returns so it never interrupts generation or checkout — for those
 * users the profile is derived from their intake (A1) and onboarding_completed
 * is already true. Dismissing hides it for the session only; completing or
 * skipping retires it via the profile write, exactly as the modal did.
 */
export const OnboardingGate = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(readDismissed);

  const needsOnboarding =
    !loading && user !== null && profile !== null && profile.onboarding_completed === false;

  const open = shouldShowOnboardingCard(
    location.pathname,
    location.search,
    needsOnboarding,
    dismissed,
  );

  if (!open) return null;

  return (
    <OnboardingCard
      onDismiss={() => {
        setDismissed(true);
        try {
          sessionStorage.setItem(DISMISS_KEY, '1');
        } catch {
          /* private mode — in-memory state still hides it for this render tree */
        }
      }}
    />
  );
};
