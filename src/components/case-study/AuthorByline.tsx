import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LastVerifiedBadge } from "./LastVerifiedBadge";

interface AuthorBylineProps {
  researchedBy: string | null | undefined;
  avatarUrl: string | null | undefined;
  lastVerifiedAt: string | null | undefined;
  className?: string;
}

export const AuthorByline = ({
  researchedBy,
  avatarUrl,
  lastVerifiedAt,
  className = "",
}: AuthorBylineProps) => {
  if (!researchedBy && !lastVerifiedAt) return null;

  const initials = researchedBy
    ? researchedBy
        .split(/\s+/)
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {researchedBy && (
        <>
          <Avatar className="h-6 w-6 border">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={researchedBy} />}
            <AvatarFallback className="text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            Researched by{" "}
            <span className="font-medium text-foreground">{researchedBy}</span>
          </span>
        </>
      )}
      {lastVerifiedAt && (
        <>
          {researchedBy && <span className="text-muted-foreground">·</span>}
          <LastVerifiedBadge lastVerifiedAt={lastVerifiedAt} />
        </>
      )}
    </div>
  );
};
