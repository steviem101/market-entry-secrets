import { Link } from "react-router-dom";
import { MapPin, Globe, ArrowLeft, ChevronRight, DollarSign, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getCompanyInitials } from "@/components/company-card/CompanyCardHelpers";

interface InvestorHeroProps {
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
  vc: { label: "Venture Capital", className: "bg-blue-100 text-blue-700" },
  angel: { label: "Angel / Syndicate", className: "bg-amber-100 text-amber-700" },
  venture_debt: { label: "Venture Debt", className: "bg-emerald-100 text-emerald-700" },
  accelerator: { label: "Accelerator", className: "bg-orange-100 text-orange-700" },
  grant: { label: "Grant", className: "bg-teal-100 text-teal-700" },
  other: { label: "Other", className: "bg-gray-100 text-gray-700" },
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

export const InvestorHero = ({ investor }: InvestorHeroProps) => {
  const typeConfig = TYPE_CONFIG[investor.investor_type] || TYPE_CONFIG.other;
  const checkSize = formatCheckSize(investor.check_size_min, investor.check_size_max);

  return (
    <section className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/investors" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Investors
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate">{investor.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Logo / Initials */}
          <div className="w-28 h-28 bg-white rounded-xl shadow-sm border flex items-center justify-center flex-shrink-0 overflow-hidden">
            {investor.logo ? (
              <img
                src={investor.logo}
                alt={`${investor.name} logo`}
                className="w-full h-full object-contain p-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 font-bold text-3xl ${investor.logo ? 'hidden' : 'flex'}`}
              style={{ display: investor.logo ? 'none' : 'flex' }}
            >
              {getCompanyInitials(investor.name)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {investor.name}
              </h1>
              <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {investor.location}
              </div>
              {checkSize && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {checkSize}
                </div>
              )}
              {investor.stage_focus && investor.stage_focus.length > 0 && (
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {investor.stage_focus.join(", ")}
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-6 max-w-2xl line-clamp-2">
              {investor.description}
            </p>

            <div className="flex flex-wrap gap-3">
              {investor.website && (
                <Button asChild>
                  <a href={investor.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
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
                size="default"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
