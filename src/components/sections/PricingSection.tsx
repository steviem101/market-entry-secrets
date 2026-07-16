import { PricingCard } from "@/components/pricing/PricingCard";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useCheckout } from "@/hooks/useCheckout";
import { setPendingCheckout, consumePendingCheckout } from "@/lib/pendingCheckout";
import { useSectionPersona } from "@/hooks/useSectionPersona";
import { PERSONA_CONTENT } from "@/config/personaContent";
import { Clock, DollarSign, ArrowRight, ShieldCheck } from "lucide-react";

export const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startCheckout } = useCheckout();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const persona = useSectionPersona();
  const content = PERSONA_CONTENT[persona].pricing;
  const pricingTiers = content.tiers;

  // Auto-resume a checkout that was interrupted by auth. Covers both
  // same-page sign-in (email/password closes the dialog, user state updates)
  // and OAuth / magic-link (full round-trip back here via /auth/callback with
  // returnTo — the pending tier survives in localStorage).
  useEffect(() => {
    if (!user) return;
    const pendingTier = consumePendingCheckout();
    if (pendingTier) {
      setShowAuthDialog(false);
      void startCheckout({ tier: pendingTier, returnUrl: window.location.pathname });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSelectTier = async (tierId: string) => {
    switch (tierId) {
      case 'free': {
        if (user) {
          toast.success('Welcome! You already have free access.');
          navigate('/dashboard');
        } else {
          setShowAuthDialog(true);
        }
        break;
      }
      case 'growth':
      case 'scale': {
        const result = await startCheckout({
          tier: tierId as 'growth' | 'scale',
          returnUrl: window.location.pathname,
        });
        if (result?.needsAuth) {
          setPendingCheckout(tierId as 'growth' | 'scale');
          setShowAuthDialog(true);
        }
        break;
      }
      case 'enterprise': {
        toast.success('Redirecting to contact our enterprise team...');
        navigate('/contact');
        break;
      }
      default: {
        toast.error("Unknown tier selected");
        break;
      }
    }
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />
      <div className="absolute inset-0 gradient-overlay" />

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 transition-all duration-300">
            {content.heading}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {content.headingAccent}
            </span>{" "}
            Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-300">
            {content.subtitle}
          </p>
        </div>

        {/* Comparison Anchor */}
        <div className="max-w-2xl mx-auto mb-12 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4 text-red-400" />
            <span>Traditional consulting: <strong className="text-foreground">$15,000–$50,000</strong></span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>MES Growth plan: <strong className="text-primary">$99 in 3 minutes</strong></span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              onSelectTier={handleSelectTier}
            />
          ))}
        </div>

        {/* Purchase-confidence microcopy (T3 / MES-194): trust signals at the
            checkout moment. Only claims that are true today — MES bills one-time
            (no subscriptions, CLAUDE.md §8) and checkout runs through Stripe. The
            GST/tax-invoice wording is held for the Stripe cutover. */}
        <p className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>Secure checkout via Stripe · One-time payment · No subscription</span>
        </p>
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="signup"
        returnTo={typeof window !== 'undefined' ? window.location.pathname : '/pricing'}
      />
    </section>
  );
};
