import { Database, Map, Users, TrendingUp, Eye, Star, Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Link } from "react-router-dom";
import type { LeadDatabase } from "@/types/leadDatabase";

interface LeadCardProps {
  lead: LeadDatabase;
}

const getTypeIcon = (listType: string | null) => {
  switch (listType) {
    case 'Lead Database':
      return <Database className="w-5 h-5 text-blue-600" />;
    case 'TAM Map':
      return <Map className="w-5 h-5 text-green-600" />;
    case 'Market Data':
      return <TrendingUp className="w-5 h-5 text-purple-600" />;
    default:
      return <Database className="w-5 h-5 text-blue-600" />;
  }
};

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

export const LeadCard = ({ lead }: LeadCardProps) => {
  const formatLastUpdated = () => {
    if (!lead.last_updated) return 'Recently updated';
    return new Date(lead.last_updated).toLocaleDateString();
  };

  return (
    <Link to={`/leads/${lead.slug}`} className="block h-full">
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(lead.list_type)}
              {lead.list_type && (
                <Badge className={getTypeBadgeClass(lead.list_type)}>
                  {lead.list_type}
                </Badge>
              )}
            </div>
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
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">
            {lead.title}
          </h3>
          {lead.record_count && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              {lead.record_count.toLocaleString()} records
            </div>
          )}
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {lead.short_description || lead.description}
          </p>

          <div className="space-y-2">
            {lead.sector && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="w-4 h-4 mr-1" />
                <span className="truncate">{lead.sector}</span>
              </div>
            )}

            {lead.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="truncate">{lead.location}</span>
              </div>
            )}

            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Updated {formatLastUpdated()}</span>
            </div>

            {lead.quality_score && (
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                <span className="text-muted-foreground">
                  Quality: {lead.quality_score}%
                </span>
              </div>
            )}
          </div>

          {lead.tags && lead.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-1">
                {lead.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {lead.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{lead.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {lead.provider_name && (
            <div className="mt-3 text-xs text-muted-foreground">
              Provided by {lead.provider_name}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            {lead.preview_available && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => e.preventDefault()}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => e.preventDefault()}
            >
              Request Access
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
