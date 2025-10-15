
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PricingTierBadge } from "./PricingTierBadge";

interface PricingTier {
  id: 'free' | 'growth' | 'scale' | 'enterprise';
  price: string;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  onSelectTier: (tierId: string) => void;
}

export const PricingCard = ({ tier, onSelectTier }: PricingCardProps) => {
  const getCardClasses = () => {
    if (tier.isPopular) {
      return "relative border-primary/50 shadow-lg hover:shadow-xl bg-gradient-to-br from-primary/5 to-accent/5";
    }
    return "hover:shadow-lg hover:border-primary/30 bg-card/60 backdrop-blur-sm";
  };

  const getButtonVariant = () => {
    switch (tier.id) {
      case 'free':
        return 'outline';
      case 'growth':
      case 'scale':
        return 'default';
      case 'enterprise':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className={`${getCardClasses()} transition-all duration-300 h-full`}>
      <CardContent className="p-6 flex flex-col h-full">
        <PricingTierBadge tier={tier.id} isPopular={tier.isPopular} />
        
        <div className="text-center mb-6">
          <div className="text-3xl font-bold mb-1">
            {tier.price === 'Custom Pricing' ? (
              <span className="text-2xl">Custom Pricing</span>
            ) : (
              <>
                <span>{tier.price}</span>
                {tier.price !== '$0' && <span className="text-sm font-normal text-muted-foreground"> one-time</span>}
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{tier.description}</p>
        </div>

        <div className="flex-1 mb-6">
          <ul className="space-y-3">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button 
          onClick={() => onSelectTier(tier.id)}
          variant={getButtonVariant()}
          size="lg"
          className="w-full"
        >
          {tier.cta}
        </Button>
      </CardContent>
    </Card>
  );
};
