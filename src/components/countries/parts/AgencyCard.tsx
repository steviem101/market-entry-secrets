import { DirectoryCard } from "@/components/directory/DirectoryCard";
import { CardCTA } from "@/components/directory/CardCTA";
import CompanyLogo from "@/components/shared/CompanyLogo";

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

export const AgencyCard = ({ agency }: AgencyCardProps) => {
  return (
    <DirectoryCard compact>
      <div className="flex items-start gap-3">
        <CompanyLogo
          existingLogoUrl={agency.logo}
          companyName={agency.name}
          className="bg-white border border-mes-border"
          fallbackClassName="bg-mes-blue-light/40 text-mes-teal-dark font-semibold tracking-wider text-[13px]"
        />
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
