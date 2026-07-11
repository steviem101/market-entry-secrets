import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MasterSearch } from "@/components/MasterSearch";

export const SearchSection = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore the platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search the vetted providers, mentors, investors, events, and market
              insights that power every report.
            </p>
          </div>

          {/* Search Interface */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <MasterSearch activeCategory="all" />
          </div>

          <div className="text-center mt-6">
            <Link
              to="/service-providers"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Browse the full directory
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
