
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthButton } from './AuthButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackMessage?: string;
  requireAdmin?: boolean;
  requireModerator?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  fallbackMessage = "Please sign in to access this content.",
  requireAdmin = false,
  requireModerator = false 
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isModerator } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>{fallbackMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AuthButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>You need administrator privileges to access this content.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (requireModerator && !isModerator()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Moderator Access Required</CardTitle>
            <CardDescription>You need moderator privileges to access this content.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
