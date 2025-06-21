
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from './AuthDialog';
import { UserDropdown } from './UserDropdown';

export const AuthButton = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (user) {
    return <UserDropdown />;
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setShowAuthDialog(true)}>
        <LogIn className="mr-2 h-4 w-4" />
        Sign In
      </Button>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
};
