
import { ReactNode } from 'react';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useAuth } from '@/hooks/useAuth';
import { PaywallModal } from './PaywallModal';

interface ListingPageGateProps {
  children: ReactNode;
  contentType: string;
}

export const ListingPageGate = ({ children, contentType }: ListingPageGateProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();

  if (authLoading || (!hasReachedLimit || user)) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div
        className="max-h-[600px] overflow-hidden pointer-events-none select-none relative"
        aria-hidden="true"
      >
        <div className="blur-sm opacity-65">
          {children}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-b from-transparent via-background/80 to-background z-[1]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-[2]">
        <PaywallModal contentType={contentType} />
      </div>
    </div>
  );
};
