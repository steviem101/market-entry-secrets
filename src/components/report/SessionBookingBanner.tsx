/**
 * Advisor-session booking banner (MES-196 / T13).
 *
 * Shown atop ReportView ONLY when the signed-in user holds an unconsumed,
 * unexpired walkthrough_call / strategy_session entitlement (granted by the
 * Stripe webhook, MES-195). Free users have no entitlement rows, so they never
 * see it. Selection + link logic lives in lib/sessionBooking.ts (tested);
 * rollback is the `session_booking_banner` flag (?booking=0).
 */
import { CalendarCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { trackFunnelEvent } from '@/lib/analytics/intakeFunnel';
import {
  selectBookableSession,
  buildBookingUrl,
  CALENDAR_FALLBACK_COPY,
} from '@/lib/sessionBooking';

export const SessionBookingBanner = () => {
  const { user } = useAuth();
  const { entitlements } = useServiceEntitlements();

  if (!isFeatureEnabled('session_booking_banner')) return null;

  const session = selectBookableSession(entitlements);
  if (!session) return null;

  const bookingUrl = buildBookingUrl(session.calendlyUrl, {
    name:
      (user?.user_metadata?.full_name as string | undefined) ||
      (user?.user_metadata?.first_name as string | undefined) ||
      null,
    email: user?.email ?? null,
  });

  const handleBookClick = () => {
    trackFunnelEvent('session_booking_opened', {
      source: 'report',
      user_id: user?.id ?? null,
      metadata: { kind: session.kind },
    });
  };

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CalendarCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{session.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{session.description}</p>
          </div>
        </div>
        <Button asChild className="shrink-0" onClick={handleBookClick}>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
            {session.buttonLabel}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{CALENDAR_FALLBACK_COPY}</p>
    </div>
  );
};
