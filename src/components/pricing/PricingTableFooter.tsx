import { Button } from "@/components/ui/button";

interface PricingTableFooterProps {
  onSelectTier: (tierId: string) => void;
}

export const PricingTableFooter = ({ onSelectTier }: PricingTableFooterProps) => {
  return (
    <div className="grid grid-cols-4 border-b border-border bg-muted/30">
      {/* Empty Features Column */}
      <div className="col-span-1 p-6 border-r border-border"></div>

      {/* Starter CTA */}
      <div className="col-span-1 p-6 border-r border-border text-center">
        <Button 
          onClick={() => onSelectTier('free')}
          variant="outline"
          size="lg"
          className="w-full"
        >
          Get Started for Free
        </Button>
      </div>

      {/* Growth CTA */}
      <div className="col-span-1 p-6 border-r border-border text-center bg-gradient-to-b from-primary/5 to-transparent">
        <Button 
          onClick={() => onSelectTier('growth')}
          variant="default"
          size="lg"
          className="w-full"
        >
          Unlock Growth Access
        </Button>
      </div>

      {/* Enterprise CTA */}
      <div className="col-span-1 p-6 text-center">
        <Button 
          onClick={() => onSelectTier('enterprise')}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          Talk to Our Team
        </Button>
      </div>
    </div>
  );
};
