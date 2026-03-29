import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface ScoreRingProps {
  label: string;
  score: number;
  total: number;
  variant: "weak" | "strong";
  animate: boolean;
}

export const ScoreRing = ({ label, score, total, variant, animate }: ScoreRingProps) => {
  const animatedScore = useAnimatedCounter(score, 1200, animate);
  const pct = (score / total) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animate
    ? circumference - (circumference * pct) / 100
    : circumference;

  const isStrong = variant === "strong";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="6"
            className={isStrong ? "stroke-primary/15" : "stroke-muted"}
          />
          {/* Animated fill ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className={
              isStrong
                ? "stroke-primary"
                : score >= 3
                  ? "stroke-amber-400"
                  : "stroke-destructive/60"
            }
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-2xl sm:text-3xl font-bold ${
              isStrong
                ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                : "text-muted-foreground"
            }`}
          >
            {animatedScore}/{total}
          </span>
        </div>
      </div>
      <span
        className={`text-xs sm:text-sm font-semibold tracking-wide uppercase ${
          isStrong ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
};
