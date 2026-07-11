import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The MES editorial section header: uppercase tracked kicker, tight display
 * heading, optional subhead. This is the shared register for landing pages
 * (countries, sectors, locations) - use it instead of hand-rolling the
 * kicker/heading block so the type scale stays consistent everywhere.
 *
 * tone="inverse" is for sections on a dark ink band (e.g. the country trade
 * snapshot).
 */
interface SectionHeadingProps {
  kicker?: string;
  title: ReactNode;
  subhead?: ReactNode;
  tone?: "default" | "inverse";
  className?: string;
}

export const SectionHeading = ({
  kicker,
  title,
  subhead,
  tone = "default",
  className,
}: SectionHeadingProps) => {
  const inverse = tone === "inverse";
  return (
    <div className={cn("max-w-3xl", className)}>
      {kicker && (
        <div
          className={cn(
            "text-[11px] uppercase tracking-[0.18em] mb-3",
            inverse ? "text-mes-blue-light" : "text-mes-teal-dark",
          )}
        >
          {kicker}
        </div>
      )}
      <h2
        className={cn(
          "text-3xl md:text-[40px] leading-[1.1] tracking-tight font-semibold",
          inverse ? "text-white" : "text-mes-ink",
        )}
      >
        {title}
      </h2>
      {subhead && (
        <p
          className={cn(
            "mt-3 text-[16px] leading-relaxed",
            inverse ? "text-white/70" : "text-mes-ink-soft",
          )}
        >
          {subhead}
        </p>
      )}
    </div>
  );
};
