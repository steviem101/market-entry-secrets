import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared shell every directory card renders inside. Centralises the standard
 * card tokens (2xl radius, soft shadow + hover lift, theme surface/border) so
 * provider/mentor/investor/agency/lead/event/content cards share one look.
 * Content stays in each entity's adapter (logos, tiles, badges, etc.).
 */
export interface DirectoryCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Use the denser padding for compact grids (country/sector tabs). */
  compact?: boolean;
}

export const DirectoryCard = forwardRef<HTMLDivElement, DirectoryCardProps>(
  ({ className, compact, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group flex h-full flex-col overflow-hidden bg-card text-card-foreground",
        "rounded-2xl border border-border shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        compact ? "p-5" : "p-6",
        className,
      )}
      {...props}
    />
  ),
);
DirectoryCard.displayName = "DirectoryCard";
