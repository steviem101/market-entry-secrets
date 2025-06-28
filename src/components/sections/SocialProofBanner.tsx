
import { Star, Users, Building2, TrendingUp } from "lucide-react";

export const SocialProofBanner = () => {
  return (
    <section className="relative py-8 bg-gradient-to-r from-primary/5 to-accent/5 border-y border-border/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              4.9/5 from 247+ companies
            </span>
          </div>

          {/* Separator */}
          <div className="hidden md:block w-px h-6 bg-border/30" />

          {/* Success Metric */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              89% faster market entry
            </span>
          </div>

          {/* Separator */}
          <div className="hidden md:block w-px h-6 bg-border/30" />

          {/* Trust Indicator */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Trusted by Fortune 500 companies
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
