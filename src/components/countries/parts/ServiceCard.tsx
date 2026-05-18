import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  };
}

export const ServiceCard = ({ provider }: ServiceCardProps) => {
  const tag = provider.type || provider.services?.[0];
  return (
    <article className="bg-mes-card border border-mes-border rounded-xl p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-semibold text-mes-ink leading-snug">{provider.name}</h3>
        {tag && (
          <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-mes-border bg-mes-bg text-mes-ink-soft shrink-0">
            {tag}
          </span>
        )}
      </div>
      {provider.description && (
        <p className="mt-3 text-[14px] leading-relaxed text-mes-ink-soft">{provider.description}</p>
      )}
      <div className="mt-auto pt-4">
        <Button asChild variant="link" className="p-0 h-auto text-mes-teal-dark hover:text-mes-ink">
          <a href={provider.slug ? `/service-providers/${provider.slug}` : "/service-providers"}>
            View {provider.name} profile
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </article>
  );
};
