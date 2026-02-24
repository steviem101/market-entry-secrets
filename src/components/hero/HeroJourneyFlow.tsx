import type { HeroPersona } from "./heroContent";

interface HeroJourneyFlowProps {
  activePersona: HeroPersona;
}

export const HeroJourneyFlow = ({ activePersona }: HeroJourneyFlowProps) => {
  const isInternational = activePersona === "international";

  // Left path: curves from center-left down to the left column
  const leftPath = "M 200,0 C 200,25 120,35 80,60";
  // Right path: curves from center-right down to the right column
  const rightPath = "M 280,0 C 280,25 360,35 400,60";

  return (
    <div className="hidden lg:flex justify-center w-full max-w-2xl mx-auto -my-1">
      <svg
        viewBox="0 0 480 60"
        fill="none"
        className="w-full h-[60px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Glow filter for the traveling dot */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
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
          className={`transition-opacity duration-400 ${
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
          className={`transition-opacity duration-400 ${
            !isInternational ? "opacity-40" : "opacity-10"
          }`}
        />

        {/* Traveling dot on left path */}
        <circle
          r="3"
          fill="hsl(var(--primary))"
          filter="url(#glow)"
          className={`transition-opacity duration-400 ${
            isInternational ? "opacity-100" : "opacity-0"
          }`}
        >
          <animateMotion
            dur="2.5s"
            repeatCount="indefinite"
            path={leftPath}
          />
        </circle>

        {/* Traveling dot on right path */}
        <circle
          r="3"
          fill="hsl(var(--primary))"
          filter="url(#glow)"
          className={`transition-opacity duration-400 ${
            !isInternational ? "opacity-100" : "opacity-0"
          }`}
        >
          <animateMotion
            dur="2.5s"
            repeatCount="indefinite"
            path={rightPath}
          />
        </circle>
      </svg>
    </div>
  );
};
