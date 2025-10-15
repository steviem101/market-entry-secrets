import { Check, X } from "lucide-react";

interface Feature {
  name: string;
  starter: boolean | string;
  growth: boolean | string;
  enterprise: boolean | string;
}

interface PricingFeatureRowProps {
  feature: Feature;
  isEven: boolean;
}

export const PricingFeatureRow = ({ feature, isEven }: PricingFeatureRowProps) => {
  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-400 mx-auto" />
      );
    }
    return <span className="text-sm text-foreground">{value}</span>;
  };

  return (
    <div className={`grid grid-cols-4 border-b border-border ${isEven ? 'bg-muted/20' : 'bg-background'}`}>
      {/* Feature Name */}
      <div className="col-span-1 p-4 border-r border-border">
        <span className="text-sm font-medium text-foreground">{feature.name}</span>
      </div>

      {/* Starter */}
      <div className="col-span-1 p-4 border-r border-border text-center flex items-center justify-center">
        {renderCell(feature.starter)}
      </div>

      {/* Growth */}
      <div className="col-span-1 p-4 border-r border-border text-center flex items-center justify-center bg-gradient-to-b from-primary/5 to-transparent">
        {renderCell(feature.growth)}
      </div>

      {/* Enterprise */}
      <div className="col-span-1 p-4 text-center flex items-center justify-center">
        {renderCell(feature.enterprise)}
      </div>
    </div>
  );
};
