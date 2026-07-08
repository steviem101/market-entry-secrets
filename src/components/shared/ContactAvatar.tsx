import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

interface ContactAvatarProps {
  /** Used for alt text and the initials fallback. */
  name?: string | null;
  /** Avatar image URL; empty/null renders the initials fallback. */
  src?: string | null;
  /** Size/appearance overrides (defaults to w-14 h-14). */
  className?: string;
  /** Optional fallback override, e.g. an icon for anonymous mentors. */
  fallback?: ReactNode;
}

/**
 * Shared avatar for any contact/person tile. Renders the real photo when present
 * and falls back to the person's initials (Radix swaps automatically when the
 * image is missing or fails to load — no onError handler needed).
 */
export function ContactAvatar({ name, src, className, fallback }: ContactAvatarProps) {
  const clean = src && src.trim() ? src : undefined;
  return (
    <Avatar className={cn("w-14 h-14", className)}>
      {clean ? <AvatarImage src={clean} alt={name ?? ""} loading="lazy" /> : null}
      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
        {fallback ?? getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
