
import { ReactNode, useEffect } from 'react';
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
  const { user } = useAuth();
  const { canView, trackView, hasReachedLimit, isInitialized } = useUsageTracking();

  useEffect(() => {
    // Only track if user can view and is not signed in
    if (canView && !user && isInitialized) {
      trackView(contentType, itemId);
      onView?.();
    } else if (user && onView) {
      // Still call onView for signed-in users for any analytics
      onView();
    }
  }, [canView, contentType, itemId, trackView, onView, user, isInitialized]);

  // Show paywall immediately if reached limit and not signed in
  // No loading state needed since we initialize synchronously
  if (hasReachedLimit && !user) {
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
