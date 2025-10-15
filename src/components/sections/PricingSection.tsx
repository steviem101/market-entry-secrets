import { PricingTable } from "@/components/pricing/PricingTable";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useState } from 'react';
import { AuthDialog } from "@/components/auth/AuthDialog";
import { supabase } from "@/integrations/supabase/client";

export const PricingSection = () => {
  const { user, session } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);


  const handleSelectTier = async (tierId: string) => {
    // console.log('Selected tier:', tierId);
    switch (tierId) {
      case 'free': {
        if (user) {
          window.location.href = '/dashboard';
          toast.success('Welcome! You already have free access.');
        } else {
          setShowAuthDialog(true);
        }
        break;
      }
      case 'growth': {
        if (!user || !session?.access_token) {
          toast.error("Please login or register first in order to subscribe to a plan.");
          setShowAuthDialog(true)
          return;
        }

        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            tier: tierId,
            supabase_user_id: user.id, // required
          }
        });

        if (!error && data?.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error || "Unable to start checkout");
        }
        break;
      }
      case 'enterprise': {
        toast.success('Redirecting to contact our enterprise team...');
        setTimeout(() => {
          window.location.href = '/contact';
        }, 1000);
        break;
      }
      default: {
        // handle unknown tier
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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Market Entry</span> Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From free exploration to enterprise-grade support, find the perfect plan to accelerate your Australian market entry
          </p>
        </div>

        {/* Pricing Table */}
        <PricingTable onSelectTier={handleSelectTier} />
      </div>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        defaultTab="signup"
      />
    </section>
  );
};
