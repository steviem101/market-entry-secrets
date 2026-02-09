import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { useLocation } from 'react-router-dom';
import { AuthDialog } from '@/components/auth/AuthDialog';

interface ReportGatedSectionProps {
  id: string;
  title: string;
  requiredTier: string;
}

const tierLabels: Record<string, string> = {
  growth: 'Growth',
  scale: 'Scale',
  enterprise: 'Enterprise',
};

const tierPrices: Record<string, string> = {
  growth: '$99',
  scale: '$999',
};

export const ReportGatedSection = ({ id, title, requiredTier }: ReportGatedSectionProps) => {
  const { startCheckout, loading, isAuthenticated } = useCheckout();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const location = useLocation();

  const handleUpgradeClick = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (requiredTier === 'enterprise') {
      window.location.href = '/contact';
      return;
    }

    const checkoutTier = requiredTier as 'growth' | 'scale';
    await startCheckout({
      tier: checkoutTier,
      returnUrl: location.pathname,
    });
  };

  return (
    <section id={id} className="scroll-mt-20">
      <Card className="relative overflow-hidden border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Blurred placeholder content */}
          <div className="filter blur-md select-none space-y-3 mb-6 pointer-events-none">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/5" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>

          {/* Upgrade overlay */}
          <div className="absolute inset-0 top-16 flex items-center justify-center bg-gradient-to-t from-background via-background/90 to-transparent">
            <div className="text-center px-6 py-8">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Upgrade to {tierLabels[requiredTier] || requiredTier}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                Unlock the {title} section and get deeper insights for your market entry strategy.
              </p>
              <Button
                className="gap-2"
                onClick={handleUpgradeClick}
                disabled={loading}
              >
                <Lock className="w-4 h-4" />
                {loading
                  ? 'Starting checkout...'
                  : tierPrices[requiredTier]
                    ? `Upgrade for ${tierPrices[requiredTier]}`
                    : 'Contact Us'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="signup"
      />
    </section>
  );
};
