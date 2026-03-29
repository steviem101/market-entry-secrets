import { Star } from "lucide-react";

export const HeroSocialProof = () => {
  return (
    <div className="flex items-center gap-2 justify-center lg:justify-start">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        Trusted by 500+ companies from 12+ countries
      </span>
    </div>
  );
};
