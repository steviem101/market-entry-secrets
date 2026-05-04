import { ShieldCheck } from "lucide-react";

interface LastVerifiedBadgeProps {
  lastVerifiedAt: string | null | undefined;
  className?: string;
}

export const LastVerifiedBadge = ({
  lastVerifiedAt,
  className = "",
}: LastVerifiedBadgeProps) => {
  if (!lastVerifiedAt) return null;
  const date = new Date(lastVerifiedAt);
  if (Number.isNaN(date.getTime())) return null;

  const formatted = date.toLocaleDateString("en-AU", {
    month: "short",
    year: "numeric",
  });

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${className}`}
      title={`Last verified ${date.toLocaleDateString("en-AU", { day: "2-digit", month: "long", year: "numeric" })}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
      Verified {formatted}
    </span>
  );
};
