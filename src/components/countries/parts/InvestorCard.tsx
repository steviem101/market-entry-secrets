import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvestorCardProps {
  investor: {
    id: string;
    name: string;
    description?: string | null;
    location?: string | null;
    investor_type?: string | null;
    slug?: string | null;
    sector_focus?: string[] | null;
    stage_focus?: string[] | null;
    check_size_min?: number | null;
    check_size_max?: number | null;
  };
}

const formatCheque = (min: number | null | undefined, max: number | null | undefined) => {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return `${n}`;
  };
  if (min && max) return `A$ ${fmt(min)} to ${fmt(max)}`;
  if (max) return `up to A$ ${fmt(max)}`;
  return `from A$ ${fmt(min!)}`;
};

export const InvestorCard = ({ investor }: InvestorCardProps) => {
  const cheque = formatCheque(investor.check_size_min, investor.check_size_max);
  return (
    <article className="bg-mes-card border border-mes-border rounded-xl p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-semibold text-mes-ink leading-snug">{investor.name}</h3>
        {investor.investor_type && (
          <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-mes-blue-light bg-mes-blue-light/40 text-mes-teal-dark shrink-0">
            {investor.investor_type}
          </span>
        )}
      </div>
      {investor.stage_focus && investor.stage_focus.length > 0 && (
        <div className="mt-3 text-[12px] uppercase tracking-wider text-mes-ink-muted">
          Stage &middot; {investor.stage_focus.slice(0, 3).join(", ")}
        </div>
      )}
      {cheque && (
        <div className="mt-1 text-[13px] text-mes-ink-soft tabular-nums">Cheque {cheque}</div>
      )}
      {investor.description && (
        <p className="mt-3 text-[14px] leading-relaxed text-mes-ink-soft line-clamp-3">
          {investor.description}
        </p>
      )}
      <div className="mt-auto pt-4">
        <Button asChild variant="link" className="p-0 h-auto text-mes-teal-dark hover:text-mes-ink">
          <a href={investor.slug ? `/investors/${investor.slug}` : "/investors"}>
            See {investor.name} portfolio
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </article>
  );
};
