import { useId } from "react";
import type { HeroPersona } from "./heroContent";

interface HeroJourneyFlowProps {
  activePersona: HeroPersona;
}

export const HeroJourneyFlow = ({ activePersona }: HeroJourneyFlowProps) => {
  const filterId = useId();
  const glowId = `glow-${filterId}`;
  const isInternational = activePersona === "international";

  // Paths curve from the center area downward toward left/right edges
  // Using a wider viewBox that better represents the full container width
  const leftPath = "M 240,0 C 240,30 100,40 40,60";
  const rightPath = "M 260,0 C 260,30 400,40 460,60";

  return (
    <div className="flex justify-center w-full -my-2">
      <svg
        viewBox="0 0 500 60"
        fill="none"
        className="w-full max-w-4xl h-[50px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left path (to copy column) */}
        <path
          d={leftPath}
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          strokeLinecap="round"
          className={`transition-opacity duration-300 ${
            isInternational ? "opacity-40" : "opacity-10"
          }`}
        />

        {/* Right path (to mockup column) */}
        <path
          d={rightPath}
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          strokeLinecap="round"
          className={`transition-opacity duration-300 ${
            !isInternational ? "opacity-40" : "opacity-10"
          }`}
        />

        {/* Traveling dot — only rendered for the active path */}
        <circle
          r="3"
          fill="hsl(var(--primary))"
          filter={`url(#${glowId})`}
          key={activePersona}
        >
          <animateMotion
            dur="2.5s"
            repeatCount="indefinite"
            path={isInternational ? leftPath : rightPath}
          />
        </circle>
      </svg>
    </div>
  );
};
