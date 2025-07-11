import { CheckCircle, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WithMESSectionProps {
  onGetReport: () => void;
}

export const WithMESSection = ({ onGetReport }: WithMESSectionProps) => {
  const benefits = [
    "120+ Vetted Service Providers",
    "200+ Expert Mentors",
    "100+ Premium Lead Lists", 
    "Real-time Market Intelligence",
    "50+ Monthly Events",
    "1,200+ Success Stories"
  ];

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
          <Zap className="w-8 h-8" />
          With MES
        </h3>
        <p className="text-lg text-muted-foreground">Your streamlined path to success</p>
      </div>

      {/* Main Content */}
      <div className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 rounded-3xl p-8 border border-primary/20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,theme(colors.primary.DEFAULT)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
        </div>

        {/* Hero Message */}
        <div className="relative text-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">We Take Care of That</span>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          
          <h4 className="text-2xl font-bold text-foreground mb-4">
            Everything You Need in One Platform
          </h4>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Skip the chaos and confusion. Our curated marketplace connects you with verified partners, 
            proven strategies, and actionable insights that guarantee your market entry success.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-4 bg-white/80 dark:bg-primary/5 backdrop-blur-sm rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Success Visualization */}
        <div className="relative bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 mb-8 border border-primary/20">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">90%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">6x</div>
              <div className="text-sm text-muted-foreground">Faster Entry</div>
            </div>
            <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">$50k+</div>
              <div className="text-sm text-muted-foreground">Cost Savings</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button 
            onClick={onGetReport}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Zap className="w-5 h-5 mr-2" />
            Get Your Free Market Entry Report
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Join 1,000+ companies who've successfully entered Australian markets
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent animate-float"></div>
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-primary animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};