import { HERO_FLAGS } from "./heroContent";

export const HeroSocialProof = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        {HERO_FLAGS.map((flag, i) => (
          <span
            key={i}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 border border-white/20 text-sm -ml-1.5 first:ml-0"
          >
            {flag}
          </span>
        ))}
      </div>
      <span className="text-sm text-white/60">
        Companies from 12+ countries
      </span>
    </div>
  );
};
