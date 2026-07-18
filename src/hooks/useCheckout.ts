import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { trackFunnelEvent } from '@/lib/analytics/intakeFunnel';

function checkoutSource(): string {
  const p = typeof window !== 'undefined' ? window.location.pathname : '';
  if (p.startsWith('/report')) return 'report';
  if (p.startsWith('/pricing')) return 'pricing';
  return 'other';
}

// Attribution source names are free text but keep them short + stable — they
// become Stripe session metadata and land in payment_webhook_logs, so renaming
// one breaks conversion reporting continuity. Clamped defensively below.
const sanitiseSource = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40) || 'other';

interface CheckoutOptions {
  tier: 'growth' | 'scale';
  returnUrl?: string;
  /** Which surface initiated this checkout (e.g. 'report_gated_section',
   * 'pricing_page'). Falls back to a pathname-derived coarse source. Flows to
   * Stripe session metadata so completed purchases are attributable. */
  source?: string;
}

export const useCheckout = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);

  const startCheckout = async ({ tier, returnUrl, source }: CheckoutOptions) => {
    if (!user || !session?.access_token) {
      toast.info('Sign in to continue — checkout will resume automatically afterwards.');
      return { needsAuth: true };
    }

    setLoading(true);
    try {
      // Send full URL (origin + path) so Stripe redirects back to the
      // exact domain the user is on (Lovable preview vs published app)
      const fullReturnUrl = returnUrl
        ? `${window.location.origin}${returnUrl}`
        : undefined;

      // Conversion attribution: carried via create-checkout's metadata
      // passthrough into the Stripe session (tier/supabase_user_id are
      // server-enforced AFTER the spread, so this can never escalate — AUD-005),
      // then retained in payment_webhook_logs' stored payload on completion.
      const attributionSource = sanitiseSource(source ?? checkoutSource());

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier,
          supabase_user_id: user.id,
          return_url: fullReturnUrl,
          metadata: { source: attributionSource },
        },
      });

      if (error) {
        toast.error('Unable to start checkout. Please try again.');
        return { success: false };
      }

      if (data?.url) {
        // T5a (MES-191): the checkout intent succeeded and we're about to
        // redirect to Stripe. Fire-and-forget; never blocks the redirect.
        trackFunnelEvent('checkout_started', {
          source: attributionSource,
          user_id: user.id,
          metadata: { tier },
        });
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
