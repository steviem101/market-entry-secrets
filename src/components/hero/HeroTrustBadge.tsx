import { Star } from "lucide-react";

export const HeroTrustBadge = () => {
  return (
    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <span className="text-sm text-white/80 font-medium">
        Trusted by 500+ companies worldwide
      </span>
    </div>
  );
};
