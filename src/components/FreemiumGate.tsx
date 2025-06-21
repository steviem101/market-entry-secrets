
import { ReactNode, useEffect } from 'react';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useAuth } from '@/hooks/useAuth';
import { PaywallModal } from './PaywallModal';

interface FreemiumGateProps {
  children: ReactNode;
  contentType: string;
  itemId: string;
  onView?: () => void;
}

export const FreemiumGate = ({ children, contentType, itemId, onView }: FreemiumGateProps) => {
  const { user } = useAuth();
  const { canView, trackView, hasReachedLimit } = useUsageTracking();

  useEffect(() => {
    if (canView) {
      trackView(contentType, itemId);
      onView?.();
    }
  }, [canView, contentType, itemId, trackView, onView]);

  if (!canView && !user) {
    return <PaywallModal contentType={contentType} />;
  }

  return <>{children}</>;
};
