
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Eye, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { AuthDialog } from './auth/AuthDialog';

export const UsageBanner = () => {
  const { user } = useAuth();
  const { remainingViews, hasReachedLimit, isInitialized } = useUsageTracking();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Don't show banner for signed-in users
  if (user) return null;

  // Don't show if not initialized yet (prevents flash)
  if (!isInitialized) return null;

  // Don't show if user hasn't started viewing yet
  if (remainingViews === 3) return null;

  if (hasReachedLimit) {
    return (
      <>
        <Alert className="mb-4 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="flex items-center justify-between">
            <span>You've reached your limit of 3 free views. Sign up to continue browsing.</span>
            <Button 
              onClick={() => setShowAuthDialog(true)}
              size="sm"
              className="ml-4"
            >
              Sign Up Free
            </Button>
          </AlertDescription>
        </Alert>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </>
    );
  }

  return (
    <>
      <Alert className="mb-4 border-primary/50 bg-primary/10">
        <Eye className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            {remainingViews} free {remainingViews === 1 ? 'view' : 'views'} remaining. 
            Sign up for unlimited access.
          </span>
          <Button 
            onClick={() => setShowAuthDialog(true)}
            size="sm"
            variant="outline"
            className="ml-4"
          >
            Sign Up Free
          </Button>
        </AlertDescription>
      </Alert>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
};
