import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, MapPin } from "lucide-react";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getCompanyInitials } from "@/components/company-card/CompanyCardHelpers";

interface InvestorCardProps {
  investor: {
    id: string;
    name: string;
    description: string;
    investor_type: string;
    location: string;
    website: string | null;
    logo: string | null;
    sector_focus: string[] | null;
    stage_focus: string[] | null;
    check_size_min: number | null;
    check_size_max: number | null;
  };
}

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  vc: { label: "Venture Capital", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  angel: { label: "Angel / Syndicate", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  venture_debt: { label: "Venture Debt", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  accelerator: { label: "Accelerator", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  grant: { label: "Grant", className: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" },
  other: { label: "Other", className: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300" },
};

function formatCheckSize(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

const InvestorCard = ({ investor }: InvestorCardProps) => {
  const typeConfig = TYPE_CONFIG[investor.investor_type] || TYPE_CONFIG.other;
  const checkSize = formatCheckSize(investor.check_size_min, investor.check_size_max);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-4">
          <Link
            to={`/investors/${investor.id}`}
            className="w-14 h-14 bg-white rounded-lg border flex items-center justify-center flex-shrink-0 overflow-hidden"
          >
            {investor.logo ? (
              <img
                src={investor.logo}
                alt={`${investor.name} logo`}
                className="w-full h-full object-contain p-1.5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 font-bold text-lg ${investor.logo ? 'hidden' : 'flex'}`}
              style={{ display: investor.logo ? 'none' : 'flex' }}
            >
              {getCompanyInitials(investor.name)}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link to={`/investors/${investor.id}`} className="hover:underline">
              <h3 className="font-semibold text-foreground text-base truncate">{investor.name}</h3>
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={`text-xs ${typeConfig.className}`}>
                {typeConfig.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{investor.description}</p>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>{investor.location}</span>
        </div>

        {/* Stage tags */}
        {investor.stage_focus && investor.stage_focus.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {investor.stage_focus.slice(0, 4).map((stage) => (
              <Badge key={stage} variant="outline" className="text-xs px-2 py-0">
                {stage}
              </Badge>
            ))}
          </div>
        )}

        {/* Check size + sectors */}
        <div className="flex flex-wrap gap-1">
          {checkSize && (
            <Badge variant="secondary" className="text-xs bg-violet-50 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
              {checkSize}
            </Badge>
          )}
          {investor.sector_focus?.slice(0, 2).map((sector) => (
            <Badge key={sector} variant="secondary" className="text-xs">
              {sector}
            </Badge>
          ))}
          {(investor.sector_focus?.length || 0) > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{investor.sector_focus!.length - 2}
            </Badge>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2 border-t border-border/50 flex items-center gap-2">
        {investor.website && (
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href={investor.website} target="_blank" rel="noopener noreferrer">
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              Website
            </a>
          </Button>
        )}
        <BookmarkButton
          contentType="investor"
          contentId={investor.id}
          title={investor.name}
          description={investor.description}
          metadata={{
            investor_type: investor.investor_type,
            location: investor.location,
          }}
          size="sm"
          variant="outline"
        />
      </div>
    </div>
  );
};

export default InvestorCard;
