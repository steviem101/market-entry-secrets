import { DirectoryCard } from "@/components/directory/DirectoryCard";
import { CardCTA } from "@/components/directory/CardCTA";

interface ServiceCardProps {
  provider: {
    id: string;
    name: string;
    description?: string | null;
    location?: string | null;
    services?: string[] | null;
    website?: string | null;
    logo?: string | null;
    slug?: string | null;
    type?: string | null;
    blurb?: string | null;
  };
}

export const ServiceCard = ({ provider }: ServiceCardProps) => {
  const tag = provider.type || provider.services?.[0];
  return (
    <DirectoryCard compact>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-semibold text-mes-ink leading-snug">{provider.name}</h3>
        {tag && (
          <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-mes-border bg-mes-bg text-mes-ink-soft shrink-0">
            {tag}
          </span>
        )}
      </div>
      {provider.blurb ? (
        <p className="mt-3 text-[13.5px] leading-relaxed text-mes-ink-soft border-l-2 border-mes-blue-light pl-3">
          {provider.blurb}
        </p>
      ) : (
        provider.description && (
          <p className="mt-3 text-[14px] leading-relaxed text-mes-ink-soft">{provider.description}</p>
        )
      )}
      <div className="mt-auto pt-4">
        <CardCTA
          entity="service_provider"
          target={{ entity: "service_provider", id: provider.id, name: provider.name }}
          secondaryHref={provider.slug ? `/service-providers/${provider.slug}` : "/service-providers"}
        />
      </div>
    </DirectoryCard>
  );
};
