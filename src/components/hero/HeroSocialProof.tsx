import { Star } from "lucide-react";
import { HERO_FLAGS } from "./heroContent";

export const HeroSocialProof = () => {
  return (
    <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <div className="flex items-center">
        {HERO_FLAGS.map((flag, i) => (
          <span
            key={i}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/5 border border-primary/15 text-sm -ml-1.5 first:ml-0"
          >
            {flag}
          </span>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        Trusted by hundreds of companies from 12+ countries
      </span>
    </div>
  );
};
