
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from './AuthDialog';
import { UserDropdown } from './UserDropdown';

interface AuthButtonProps {
  onReportModalOpen?: () => void;
}

export const AuthButton = ({ onReportModalOpen }: AuthButtonProps) => {
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
    return <UserDropdown onReportModalOpen={onReportModalOpen} />;
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
