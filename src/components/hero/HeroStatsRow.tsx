import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { HERO_STATS } from "./heroContent";

interface HeroStatsRowProps {
  isVisible: boolean;
}

const StatItem = ({
  value,
  suffix,
  label,
  isVisible,
}: {
  value: number;
  suffix: string;
  label: string;
  isVisible: boolean;
}) => {
  const count = useAnimatedCounter(value, 2000, isVisible);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white">
        {count}
        {suffix}
      </div>
      <div className="text-xs text-white/50 uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
};

export const HeroStatsRow = ({ isVisible }: HeroStatsRowProps) => {
  return (
    <div className="flex items-center gap-6 md:gap-8 flex-wrap">
      {HERO_STATS.map((stat, i) => (
        <div key={stat.label} className="flex items-center gap-6 md:gap-8">
          {i > 0 && (
            <div className="w-px h-8 bg-white/10 -ml-6 md:-ml-8 hidden sm:block" />
          )}
          <StatItem
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
            isVisible={isVisible}
          />
        </div>
      ))}
    </div>
  );
};
