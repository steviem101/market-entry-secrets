
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Enter the Australian Market?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of successful businesses who've made Australia their new home
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary">
            Get Started Today
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            Schedule Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};
