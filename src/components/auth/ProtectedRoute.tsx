
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthButton } from './AuthButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { NoIndex } from '@/components/common/NoIndex';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackMessage?: string;
  requireAdmin?: boolean;
  requireModerator?: boolean;
}

/**
 * Any route behind auth is private by definition, so it must never be indexed
 * (MES-81 / SEO-05). NoIndex is emitted here — outside the auth branching — so
 * the directive is present in every state: the loading skeleton, the sign-in
 * fallback a logged-out crawler actually sees, and the authenticated content.
 * (A crawler is always logged-out, so a noindex placed inside the children
 * would never render for it.)
 */
export const ProtectedRoute = (props: ProtectedRouteProps) => (
  <>
    <NoIndex />
    <ProtectedRouteContent {...props} />
  </>
);

const ProtectedRouteContent = ({
  children,
  fallbackMessage = "Please sign in to access this content.",
  requireAdmin = false,
  requireModerator = false
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isModerator } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
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
