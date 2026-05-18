import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgencyCardProps {
  agency: {
    id: string;
    name: string;
    description?: string | null;
    location?: string | null;
    services?: string[] | null;
    role?: string | null;
    logo?: string | null;
    slug?: string | null;
  };
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const AgencyCard = ({ agency }: AgencyCardProps) => {
  return (
    <article className="bg-mes-card border border-mes-border rounded-xl p-5 flex flex-col">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-mes-blue-light/40 border border-mes-blue-light text-mes-teal-dark flex items-center justify-center font-semibold tracking-wider text-[13px]">
          {initials(agency.name)}
        </div>
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-mes-ink leading-snug">{agency.name}</h3>
          {agency.role && (
            <div className="text-[11px] font-mono uppercase tracking-wider text-mes-ink-muted mt-1">
              {agency.role}
            </div>
          )}
        </div>
      </div>
      {agency.description && (
        <p className="mt-4 text-[14px] leading-relaxed text-mes-ink-soft">{agency.description}</p>
      )}
      <div className="mt-auto pt-4">
        <Button asChild variant="link" className="p-0 h-auto text-mes-teal-dark hover:text-mes-ink">
          <a href={agency.slug ? `/agencies/${agency.slug}` : "#"}>
            View {agency.name} profile
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </article>
  );
};
