
import { Badge } from "@/components/ui/badge";

interface PricingTierBadgeProps {
  tier: 'free' | 'growth' | 'scale' | 'enterprise';
  isPopular?: boolean;
}

export const PricingTierBadge = ({ tier, isPopular }: PricingTierBadgeProps) => {
  const getTierConfig = () => {
    switch (tier) {
      case 'free':
        return {
          emoji: '🆓',
          name: 'Free Tier',
          subtitle: '(Freemium)',
          bgColor: 'bg-gray-500/10 text-gray-600 border-gray-200'
        };
      case 'growth':
        return {
          emoji: '🚀',
          name: 'Growth Tier',
          subtitle: '',
          bgColor: 'bg-blue-500/10 text-blue-600 border-blue-200'
        };
      case 'scale':
        return {
          emoji: '📈',
          name: 'Scale Tier',
          subtitle: '',
          bgColor: 'bg-purple-500/10 text-purple-600 border-purple-200'
        };
      case 'enterprise':
        return {
          emoji: '🎯',
          name: 'Enterprise & Bespoke',
          subtitle: '',
          bgColor: 'bg-orange-500/10 text-orange-600 border-orange-200'
        };
    }
  };

  const config = getTierConfig();

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{config.emoji}</span>
        <div>
          <h3 className="text-xl font-bold">{config.name}</h3>
          {config.subtitle && <span className="text-sm text-muted-foreground">{config.subtitle}</span>}
        </div>
      </div>
      {isPopular && (
        <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
          Most Popular
        </Badge>
      )}
    </div>
  );
};
