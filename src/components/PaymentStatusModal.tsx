import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { trackFunnelEvent } from '@/lib/analytics/intakeFunnel';

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'cancel';
  sessionId?: string;
  successActionLabel?: string;
}

export const PaymentStatusModal = ({ isOpen, onClose, status, sessionId, successActionLabel = 'Get Started' }: PaymentStatusModalProps) => {
  const isSuccess = status === 'success';
  const navigate = useNavigate();
  const { refetch: refetchSubscription } = useSubscription();

  // Activation is server-truth, never the URL param. `?stripe_status=success`
  // is client-settable, and — more importantly — the checkout.session.completed
  // webhook may not have upserted user_subscriptions yet when Stripe redirects.
  // So we poll the real tier (2s x 15 ≈ 30s, mirroring ReportView) and only
  // claim the upgrade once it lands. Previously this modal asserted "account
  // upgraded" straight from the URL param, showing success while the tier was
  // still 'free' until a reload (MES-192 / MES-111 AUD-011). 'free' is the
  // pre-purchase default; MES sells one-time free→paid upgrades.
  // (T5a/MES-191 attaches the `checkout_completed` funnel event here once its
  // event taxonomy lands — deliberately not forked into this fix.)
  const [activation, setActivation] = useState<'activating' | 'active' | 'timeout'>('activating');

  useEffect(() => {
    if (!isOpen || !isSuccess) return;
    setActivation('activating');
    let attempts = 0;
    let cancelled = false;
    let timerId = window.setTimeout(poll, 2000);

    async function poll() {
      if (cancelled) return;
      const tier = await refetchSubscription();
      attempts++;
      if (cancelled) return;
      if (tier && tier !== 'free') {
        setActivation('active');
      } else if (attempts < 15) {
        timerId = window.setTimeout(poll, 2000);
      } else {
        setActivation('timeout');
      }
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [isOpen, isSuccess, refetchSubscription]);

  const handleRefreshAccess = async () => {
    const tier = await refetchSubscription();
    if (tier && tier !== 'free') setActivation('active');
  };

  // T5a (MES-191): fire checkout_completed once the pricing-return activation
  // confirms server-side (never from the URL param). A Stripe return lands on
  // ONE surface, so this + ReportView never double-count a single checkout.
  // Reset per open so a later checkout in the same session can fire again.
  const completedRef = useRef(false);
  useEffect(() => { if (!isOpen) completedRef.current = false; }, [isOpen]);
  useEffect(() => {
    if (activation === 'active' && !completedRef.current) {
      completedRef.current = true;
      trackFunnelEvent('checkout_completed', { source: 'pricing' });
    }
  }, [activation]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            {!isSuccess ? (
              <>
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-orange-500" />
                </div>
                <DialogTitle className="text-2xl">Payment Cancelled</DialogTitle>
                <DialogDescription className="text-base">
                  Your payment was cancelled. No charges were made to your account. You can try again whenever you're ready.
                </DialogDescription>
              </>
            ) : activation === 'active' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <DialogTitle className="text-2xl">Payment successful!</DialogTitle>
                <DialogDescription className="text-base">
                  Thank you for your purchase. Your account has been upgraded and your premium sections are now unlocked.
                </DialogDescription>
              </>
            ) : activation === 'timeout' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-amber-500" />
                </div>
                <DialogTitle className="text-2xl">Payment received</DialogTitle>
                <DialogDescription className="text-base">
                  Your payment went through, but activation is taking a little longer than usual. It can take a moment after checkout — refresh access to check again.
                </DialogDescription>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <DialogTitle className="text-2xl">Activating your account…</DialogTitle>
                <DialogDescription className="text-base">
                  Payment received — we're unlocking your premium features. This usually takes a few seconds.
                </DialogDescription>
              </>
            )}
          </div>
        </DialogHeader>

        {isSuccess && sessionId && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm font-medium text-muted-foreground mb-2">Transaction Reference:</p>
            <code className="text-xs bg-background p-2 rounded block break-all">{sessionId}</code>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-6">
          {isSuccess && activation === 'timeout' && (
            <Button onClick={handleRefreshAccess} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh access
            </Button>
          )}
          <Button
            onClick={onClose}
            variant={isSuccess && activation === 'timeout' ? 'outline' : 'default'}
            className="w-full"
          >
            {isSuccess ? successActionLabel : 'Close'}
          </Button>
          {!isSuccess && (
            <Button variant="outline" onClick={() => { onClose(); navigate('/pricing'); }} className="w-full">
              View Pricing Plans
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
