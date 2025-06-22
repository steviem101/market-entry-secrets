
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const LocationsCallToAction = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Enter the Australian Market?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get personalized advice on the best locations for your business expansion. Our experts can help you navigate local regulations, find partners, and accelerate your market entry.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="group">
                Get Expert Consultation
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link to="/service-providers">
              <Button variant="outline" size="lg" className="group">
                <MessageCircle className="mr-2 h-4 w-4" />
                Find Local Partners
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
