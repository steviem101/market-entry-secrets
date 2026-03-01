import { PricingCard } from "@/components/pricing/PricingCard";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useCheckout } from "@/hooks/useCheckout";
import { useSectionPersona } from "@/hooks/useSectionPersona";
import { PERSONA_CONTENT } from "@/config/personaContent";
import { Clock, DollarSign, ArrowRight } from "lucide-react";

export const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startCheckout } = useCheckout();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const persona = useSectionPersona();
  const content = PERSONA_CONTENT[persona].pricing;
  const pricingTiers = content.tiers;

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
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="signup"
      />
    </section>
  );
};
