import { Database, Map, Users, TrendingUp, Eye, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Link } from "react-router-dom";
import { getSectorGradient, getSectorMeta } from "@/constants/sectorTaxonomy";
import type { LeadDatabase } from "@/types/leadDatabase";

interface LeadCardProps {
  lead: LeadDatabase;
  onPreview?: (lead: LeadDatabase) => void;
  onCheckout?: (lead: LeadDatabase) => void;
}

const getTypeIcon = (listType: string | null) => {
  switch (listType) {
    case 'Lead Database':
      return <Database className="w-5 h-5 text-white/90" />;
    case 'TAM Map':
      return <Map className="w-5 h-5 text-white/90" />;
    case 'Market Data':
      return <TrendingUp className="w-5 h-5 text-white/90" />;
    default:
      return <Database className="w-5 h-5 text-white/90" />;
  }
};

const getTypeBadgeClass = (listType: string | null) => {
  switch (listType) {
    case 'Lead Database':
      return 'bg-white/20 text-white border-white/30 backdrop-blur-sm';
    case 'Market Data':
      return 'bg-white/20 text-white border-white/30 backdrop-blur-sm';
    case 'TAM Map':
      return 'bg-white/20 text-white border-white/30 backdrop-blur-sm';
    default:
      return 'bg-white/20 text-white border-white/30 backdrop-blur-sm';
  }
};

const truncateDescription = (text: string | null, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
};

export const LeadCard = ({ lead, onPreview, onCheckout }: LeadCardProps) => {
  const formatLastUpdated = () => {
    if (!lead.last_updated) return 'Recently updated';
    return new Date(lead.last_updated).toLocaleDateString('en-AU', {
      month: 'short',
      year: 'numeric',
    });
  };

  const gradient = getSectorGradient(lead.sector);
  const sectorMeta = getSectorMeta(lead.sector);

  const ctaLabel = lead.is_free
    ? 'Get Free Access'
    : lead.price_aud
      ? `Buy Now — $${lead.price_aud.toLocaleString()}`
      : 'Get Instant Access';

  return (
    <Link to={`/leads/${lead.slug}`} className="block h-full group">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
        {/* Gradient/Image Header */}
        <div
          className={`relative h-28 bg-gradient-to-br ${gradient} flex items-end p-4`}
          style={lead.cover_image_url ? {
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${lead.cover_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          {/* SVG pattern overlay for non-image headers */}
          {!lead.cover_image_url && (
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`pattern-${lead.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#pattern-${lead.id})`} />
              </svg>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {getTypeIcon(lead.list_type)}
            {lead.list_type && (
              <Badge className={getTypeBadgeClass(lead.list_type)}>
                {lead.list_type}
              </Badge>
            )}
          </div>

          {/* Bookmark button */}
          <div className="absolute top-3 right-3">
            <BookmarkButton
              contentType="lead_database"
              contentId={lead.id}
              title={lead.title}
              description={lead.description || ''}
              metadata={{
                list_type: lead.list_type,
                sector: lead.sector,
                location: lead.location,
                price_aud: lead.price_aud,
                record_count: lead.record_count,
              }}
              size="sm"
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/20"
            />
          </div>

          {/* Record count overlay */}
          {lead.record_count && (
            <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
              <Users className="w-4 h-4" />
              {lead.record_count.toLocaleString()} records
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="flex-1 p-5 flex flex-col">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
            {lead.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-1">
            {truncateDescription(lead.short_description || lead.description)}
          </p>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            {lead.sector && (
              <Badge variant="secondary" className="text-xs font-normal">
                {sectorMeta.label}
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatLastUpdated()}
            </span>
          </div>

          {/* View details affordance */}
          <div className="mt-auto pt-2 text-xs text-muted-foreground/60 group-hover:text-primary transition-colors flex items-center gap-1">
            View details <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card Footer CTAs */}
        <div className="px-5 pb-5 pt-0">
          <div className="flex gap-2 w-full">
            {lead.preview_available && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPreview?.(lead);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCheckout?.(lead);
              }}
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};
