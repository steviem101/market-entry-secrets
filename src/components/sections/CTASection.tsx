
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/20" />
      
      <div className="relative container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ready to Enter
            </span>
            <br />
            <span className="text-foreground">the Australian Market?</span>
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Join thousands of successful businesses who've made Australia their new home with our expert guidance
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-2xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              Get Started Today
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-background/60 backdrop-blur-sm border-primary/30 text-foreground hover:bg-background/80 hover:border-primary/50 px-8 py-4 text-lg rounded-2xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
