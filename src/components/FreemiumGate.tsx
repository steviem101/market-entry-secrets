
import { ReactNode, useEffect, useState } from 'react';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useAuth } from '@/hooks/useAuth';
import { PaywallModal } from './PaywallModal';

interface FreemiumGateProps {
  children: ReactNode;
  contentType: string;
  itemId: string;
  contentTitle?: string;
  contentDescription?: string;
  onView?: () => void;
}

export const FreemiumGate = ({
  children,
  contentType,
  itemId,
  contentTitle,
  contentDescription,
  onView
}: FreemiumGateProps) => {
  const { user, loading } = useAuth();
  const { canView, trackView, hasReachedLimit } = useUsageTracking();
  // Capture whether the user could view at the moment the component first renders after auth loads.
  // This prevents the 3rd view from flashing content then switching to the paywall.
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    // On first render after auth resolves, decide once whether this page view is allowed
    if (allowed === null) {
      if (user) {
        setAllowed(true);
        onView?.();
      } else if (canView) {
        // Allow this view and track it
        setAllowed(true);
        trackView(contentType, itemId);
        onView?.();
      } else {
        // Limit already reached — block
        setAllowed(false);
      }
    }
  }, [loading, allowed, canView, contentType, itemId, trackView, onView, user]);

  // Don't show paywall while auth is still loading — prevents flash for signed-in users
  if (loading || allowed === null) return null;

  if (!allowed) {
    return (
      <PaywallModal
        contentType={contentType}
        contentTitle={contentTitle}
        contentDescription={contentDescription}
      />
    );
  }

  return <>{children}</>;
};
