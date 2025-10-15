import { PricingTableHeader } from "./PricingTableHeader";
import { PricingTableBody } from "./PricingTableBody";
import { PricingTableFooter } from "./PricingTableFooter";

interface PricingTableProps {
  onSelectTier: (tierId: string) => void;
}

export const PricingTable = ({ onSelectTier }: PricingTableProps) => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Desktop/Tablet Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full">
          <PricingTableHeader />
          <PricingTableBody />
          <PricingTableFooter onSelectTier={onSelectTier} />
        </div>
      </div>

      {/* Mobile Stacked Layout */}
      <div className="md:hidden space-y-6">
        {/* Starter Card */}
        <div className="bg-card border rounded-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Starter</h3>
            <div className="text-3xl font-bold mb-1">$0</div>
            <p className="text-sm text-muted-foreground">Perfect for exploring</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">Service Providers Directory</span>
              <span className="text-xs text-muted-foreground ml-auto">Basic only</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Market-Entry Content Downloads</span>
              <span className="text-xs text-muted-foreground ml-auto">3 pieces</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Success-Story Library</span>
              <span className="text-xs text-muted-foreground ml-auto">3 lite PDFs</span>
            </div>
          </div>
          <button 
            onClick={() => onSelectTier('free')}
            className="w-full py-2 px-4 border rounded-md hover:bg-accent transition-colors"
          >
            Get Started for Free
          </button>
        </div>

        {/* Growth Card */}
        <div className="bg-card border-2 border-primary rounded-lg p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </span>
          </div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Growth</h3>
            <div className="text-3xl font-bold mb-1">$99</div>
            <p className="text-sm text-muted-foreground">one-time</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">Service Providers Directory</span>
              <span className="text-xs text-muted-foreground ml-auto">Full access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Market-Entry Content Downloads</span>
              <span className="text-xs text-muted-foreground ml-auto">Unlimited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Success-Story Library</span>
              <span className="text-xs text-muted-foreground ml-auto">Full library</span>
            </div>
          </div>
          <button 
            onClick={() => onSelectTier('growth')}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Unlock Growth Access
          </button>
        </div>

        {/* Enterprise Card */}
        <div className="bg-card border rounded-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <div className="text-2xl font-bold mb-1">Custom Pricing</div>
            <p className="text-sm text-muted-foreground">Tailored to your needs</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">Service Providers Directory</span>
              <span className="text-xs text-muted-foreground ml-auto">Advanced</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Market-Entry Content Downloads</span>
              <span className="text-xs text-muted-foreground ml-auto">Unlimited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Success-Story Library</span>
              <span className="text-xs text-muted-foreground ml-auto">Full + extras</span>
            </div>
          </div>
          <button 
            onClick={() => onSelectTier('enterprise')}
            className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Talk to Our Team
          </button>
        </div>
      </div>
    </div>
  );
};
