import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { QuickFact } from "@/lib/case-study/types";

interface QuickFactsStripProps {
  facts: QuickFact[] | null | undefined;
  className?: string;
}

function resolveIcon(name: string | undefined): LucideIcon | null {
  if (!name) return null;
  const lookup = Icons as unknown as Record<string, LucideIcon>;
  return lookup[name] ?? null;
}

export const QuickFactsStrip = ({
  facts,
  className = "",
}: QuickFactsStripProps) => {
  const cleaned = (facts ?? []).filter((f) => f && f.label && f.value);
  if (cleaned.length === 0) return null;

  return (
    <div
      aria-label="Quick facts"
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${Math.min(
        cleaned.length,
        6,
      )} gap-3 mb-8 ${className}`}
    >
      {cleaned.map((fact, i) => {
        const Icon = resolveIcon(fact.icon);
        return (
          <div
            key={`${fact.label}-${i}`}
            className="rounded-lg border border-border bg-card p-3 flex items-start gap-2.5"
          >
            {Icon && (
              <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden />
            )}
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">
                {fact.label}
              </div>
              <div className="text-sm sm:text-base font-semibold text-foreground leading-tight">
                {fact.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
