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
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier,
          supabase_user_id: user.id,
          return_url: returnUrl,
        },
      });

      if (!error && data?.url) {
        // If inside an iframe (e.g. Lovable preview), open in new tab
        // because Stripe blocks iframe embedding via X-Frame-Options
        if (window.self !== window.top) {
          window.open(data.url, '_blank');
        } else {
          window.location.href = data.url;
        }
        return { success: true };
      } else {
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
