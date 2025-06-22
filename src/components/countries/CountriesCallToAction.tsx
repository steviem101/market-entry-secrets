
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

const CountriesCallToAction = () => {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Expand to Australia?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get personalized market entry guidance based on your country of origin. Our experts understand the unique opportunities and challenges for businesses from your region.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            <Mail className="mr-2 h-4 w-4" />
            Get Market Entry Consultation
          </Button>
          <Button variant="outline" size="lg">
            Browse Success Stories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CountriesCallToAction;
