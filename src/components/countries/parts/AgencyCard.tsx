import { DirectoryCard } from "@/components/directory/DirectoryCard";
import { CardCTA } from "@/components/directory/CardCTA";

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
    blurb?: string | null;
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
    <DirectoryCard compact>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-mes-blue-light/40 border border-mes-blue-light text-mes-teal-dark flex items-center justify-center font-semibold tracking-wider text-[13px]">
          {initials(agency.name)}
        </div>
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-mes-ink leading-snug">{agency.name}</h3>
          {agency.role && (
            <div className="text-[11px] uppercase tracking-wider text-mes-ink-muted mt-1">
              {agency.role}
            </div>
          )}
        </div>
      </div>
      {agency.blurb ? (
        <p className="mt-4 text-[13.5px] leading-relaxed text-mes-ink-soft border-l-2 border-mes-blue-light pl-3">
          {agency.blurb}
        </p>
      ) : (
        agency.description && (
          <p className="mt-4 text-[14px] leading-relaxed text-mes-ink-soft">{agency.description}</p>
        )
      )}
      <div className="mt-auto pt-4">
        <CardCTA
          entity="agency"
          target={{ entity: "agency", id: agency.id, name: agency.name }}
          secondaryHref={agency.slug ? `/government-support/${agency.slug}` : undefined}
        />
      </div>
    </DirectoryCard>
  );
};
