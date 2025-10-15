export const PricingTableHeader = () => {
  return (
    <div className="grid grid-cols-4 border-b-2 border-border bg-muted/30">
      {/* Features Column */}
      <div className="col-span-1 p-6 border-r border-border">
        <h3 className="text-lg font-bold text-foreground uppercase">Features</h3>
      </div>

      {/* Starter Column */}
      <div className="col-span-1 p-6 border-r border-border text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">Starter</h3>
        <div className="text-3xl font-bold text-foreground mb-1">$0</div>
        <p className="text-sm text-muted-foreground">Perfect for exploring</p>
      </div>

      {/* Growth Column - Popular */}
      <div className="col-span-1 p-6 border-r border-border text-center bg-gradient-to-b from-primary/5 to-transparent relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
            POPULAR
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 mt-2">Growth</h3>
        <div className="text-3xl font-bold text-foreground mb-1">$99</div>
        <p className="text-sm text-muted-foreground">one-time</p>
      </div>

      {/* Enterprise Column */}
      <div className="col-span-1 p-6 text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">Enterprise</h3>
        <div className="text-2xl font-bold text-foreground mb-1">Custom Pricing</div>
        <p className="text-sm text-muted-foreground">Tailored to your needs</p>
      </div>
    </div>
  );
};
