import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { LeadDatabase } from '@/types/leadDatabase';

interface LeadCheckoutResult {
  success?: boolean;
  needsAuth?: boolean;
}

export const useLeadCheckout = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);

  const startLeadCheckout = async (lead: LeadDatabase): Promise<LeadCheckoutResult> => {
    if (!user || !session?.access_token) {
      return { needsAuth: true };
    }

    if (lead.is_free) {
      // TODO: For free databases, record access directly via Supabase
      // and redirect to the detail page or trigger download
      toast.success('Access granted! You can now view the full database.');
      return { success: true };
    }

    if (!lead.stripe_price_id) {
      // Fallback: Stripe price not yet configured for this database
      toast.info(
        'This database is coming soon. Contact us for early access.',
        { duration: 5000 }
      );
      return { success: false };
    }

    setLoading(true);
    try {
      const fullReturnUrl = `${window.location.origin}/leads/${lead.slug}`;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          price_id: lead.stripe_price_id,
          supabase_user_id: user.id,
          return_url: fullReturnUrl,
          metadata: { lead_database_id: lead.id },
        },
      });

      if (error) {
        console.error('[useLeadCheckout] Edge function error:', error);
        toast.error('Unable to start checkout. Please try again.');
        return { success: false };
      }

      if (data?.url) {
        if (window.self !== window.top) {
          try {
            window.top!.location.href = data.url;
          } catch {
            window.open(data.url, '_blank');
          }
        } else {
          window.location.href = data.url;
        }
        return { success: true };
      } else {
        console.error('[useLeadCheckout] No checkout URL returned:', data);
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

  return { startLeadCheckout, loading, isAuthenticated: !!user };
};
