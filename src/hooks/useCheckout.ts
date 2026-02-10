import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CheckoutOptions {
  tier: 'growth' | 'scale';
  returnUrl?: string;
}

export const useCheckout = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);

  const startCheckout = async ({ tier, returnUrl }: CheckoutOptions) => {
    if (!user || !session?.access_token) {
      toast.error('Please login or register first in order to subscribe to a plan.');
      return { needsAuth: true };
    }

    setLoading(true);
    try {
      // Send full URL (origin + path) so Stripe redirects back to the
      // exact domain the user is on (Lovable preview vs published app)
      const fullReturnUrl = returnUrl
        ? `${window.location.origin}${returnUrl}`
        : undefined;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier,
          supabase_user_id: user.id,
          return_url: fullReturnUrl,
        },
      });

      if (error) {
        console.error('[useCheckout] Edge function error:', error);
        toast.error('Unable to start checkout. Please try again.');
        return { success: false };
      }

      if (data?.url) {
        // If inside an iframe (e.g. Lovable preview), navigate the
        // parent window. Opening a new tab doesn't work because browser
        // storage partitioning gives the new tab a separate localStorage
        // (no auth session), causing "Report Not Found" after redirect.
        if (window.self !== window.top) {
          try {
            window.top!.location.href = data.url;
          } catch {
            // Cross-origin restriction — fall back to new tab
            window.open(data.url, '_blank');
          }
        } else {
          window.location.href = data.url;
        }
        return { success: true };
      } else {
        console.error('[useCheckout] No checkout URL returned:', data);
        toast.error(data?.error || 'Unable to start checkout');
        return { success: false };
      }
    } catch (err) {
      toast.error('Something went wrong starting checkout');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { startCheckout, loading, isAuthenticated: !!user };
};
