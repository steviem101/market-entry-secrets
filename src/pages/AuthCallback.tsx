
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { consumeAuthReturnPath } from '@/lib/authReturnPath';
import { NoIndex } from '@/components/common/NoIndex';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Resume on the page that initiated sign-in (e.g. /report-creator?v2=1
    // for the intake flow). Falls back to home for legacy entry points.
    const returnPath = consumeAuthReturnPath() ?? '/';

    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error.message);
          toast.error('Authentication failed: ' + error.message);
          navigate(returnPath);
          return;
        }

        if (data.session) {
          toast.success('Email verified successfully! Welcome to Market Entry Secrets.');
          navigate(returnPath);
        } else {
          // Check if there are auth parameters in URL query params or hash fragment
          // Supabase may use either depending on the flow (OAuth, magic link, etc.)
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            // Set the session manually if needed
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Session error:', sessionError.message);
              toast.error('Failed to verify email');
            } else {
              toast.success('Email verified successfully!');
            }
          }

          navigate(returnPath);
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error instanceof Error ? error.message : 'Unknown error');
        toast.error('An unexpected error occurred');
        navigate(returnPath);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <NoIndex />
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
