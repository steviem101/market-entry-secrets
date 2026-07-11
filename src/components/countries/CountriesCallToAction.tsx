import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

const CountriesCallToAction = () => {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Expand to Australia?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get personalised market entry guidance based on your country of origin. Our experts understand the unique opportunities and challenges for businesses from your region.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/report-creator?source=countries">
              <FileText className="mr-2 h-4 w-4" />
              Generate your market entry report
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/case-studies">
              Browse success stories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CountriesCallToAction;
