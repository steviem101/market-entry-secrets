
import { useState, useEffect } from "react";
import { useTimerTrigger } from "@/hooks/useTimerTrigger";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface LeadGenPopupProviderProps {
  children: React.ReactNode;
}

// Check once at mount whether the user is returning from Stripe checkout.
// This provider sits outside BrowserRouter so we use window.location directly.
const isStripeReturn = () =>
  new URLSearchParams(window.location.search).has('stripe_status');

export const LeadGenPopupProvider = ({ children }: LeadGenPopupProviderProps) => {
  const [showPromo, setShowPromo] = useState(false);

  const { user, loading } = useAuth();

  // Don't start timer while auth is still loading (user appears null
  // during the async getSession() call) or when returning from Stripe.
  const { triggered } = useTimerTrigger({
    delay: 15000, // 15 seconds
    enabled: !user && !loading && !isStripeReturn()
  });

  useEffect(() => {
    // Show popup only after auth has settled and user is genuinely not signed in
    if (triggered && !user && !loading) {
      const hasSeenPromo = localStorage.getItem('reportCreatorPromoShown');
      if (!hasSeenPromo) {
        setShowPromo(true);
      }
    }
  }, [triggered, user, loading]);

  const handleClose = () => {
    setShowPromo(false);
    localStorage.setItem('reportCreatorPromoShown', 'true');
  };

  const handleNavigate = () => {
    handleClose();
    // Must use window.location because this provider is outside BrowserRouter
    window.location.href = '/report-creator';
  };

  const benefits = [
    "Personalised market analysis for your industry",
    "Matched with vetted Australian service providers",
    "Actionable step-by-step market entry plan",
  ];

  return (
    <>
      {children}
      <Dialog open={showPromo} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-primary to-accent px-6 pt-8 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Get Your Free Market Entry Report
            </h3>
            <p className="text-white/80 text-sm">
              Tailored insights for your Australian market entry
            </p>
          </div>

          {/* Benefits */}
          <div className="px-6 py-6 space-y-4">
            <ul className="space-y-3">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              onClick={handleNavigate}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white py-3 text-base rounded-xl group"
              size="lg"
            >
              Create Your Free Report
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              No credit card required. Takes under 5 minutes.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
