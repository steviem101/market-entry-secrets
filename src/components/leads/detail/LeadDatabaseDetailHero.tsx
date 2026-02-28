import { Database, MapPin, Users, Star, Calendar, ArrowLeft, Tag, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Link } from "react-router-dom";
import type { LeadDatabase } from "@/types/leadDatabase";

interface LeadDatabaseDetailHeroProps {
  db: LeadDatabase;
}

const getTypeBadgeClass = (listType: string | null) => {
  switch (listType) {
    case 'Lead Database':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Market Data':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'TAM Map':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return '';
  }
};

export const LeadDatabaseDetailHero = ({ db }: LeadDatabaseDetailHeroProps) => {
  return (
    <section className="bg-gradient-to-br from-purple-500/5 via-purple-500/10 to-violet-500/5 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/leads" className="hover:text-primary flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Leads
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{db.title}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Icon */}
            <div className="flex-shrink-0">
              {db.provider_logo_url ? (
                <img
                  src={db.provider_logo_url}
                  alt={`${db.provider_name} logo`}
                  className="w-20 h-20 rounded-xl object-cover border border-border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Database className="w-10 h-10 text-purple-600" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {db.list_type && (
                  <Badge className={getTypeBadgeClass(db.list_type)}>
                    {db.list_type}
                  </Badge>
                )}
                {db.sector && <Badge variant="outline">{db.sector}</Badge>}
                {db.status === 'coming_soon' && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Coming Soon
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {db.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {db.record_count && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span>{db.record_count.toLocaleString()} records</span>
                  </div>
                )}
                {db.quality_score && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span>{db.quality_score}% quality score</span>
                  </div>
                )}
                {db.price_aud && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>${db.price_aud.toLocaleString()} AUD</span>
                  </div>
                )}
                {db.is_free && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                )}
                {db.last_updated && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span>Updated {new Date(db.last_updated).toLocaleDateString()}</span>
                  </div>
                )}
                {db.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span>{db.location}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button>
                  <Tag className="mr-2 w-4 h-4" />
                  Request Access
                </Button>
                <BookmarkButton
                  contentType="lead_database"
                  contentId={db.id}
                  title={db.title}
                  description={db.description || ''}
                  metadata={{
                    list_type: db.list_type,
                    sector: db.sector,
                    location: db.location,
                    price_aud: db.price_aud,
                    record_count: db.record_count,
                  }}
                  variant="outline"
                  size="default"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
