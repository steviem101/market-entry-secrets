
import { Database, Map, Users, TrendingUp, Download, Eye, Star, Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BookmarkButton } from "@/components/BookmarkButton";
import type { Lead } from "@/pages/Leads";

interface LeadCardProps {
  lead: Lead;
  onDownload: (lead: Lead) => void;
  onPreview: (lead: Lead) => void;
}

export const LeadCard = ({ lead, onDownload, onPreview }: LeadCardProps) => {
  const getTypeIcon = () => {
    switch (lead.type) {
      case 'csv_list':
        return <Database className="w-5 h-5 text-blue-600" />;
      case 'tam_map':
        return <Map className="w-5 h-5 text-green-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (lead.type) {
      case 'csv_list':
        return 'Lead Database';
      case 'tam_map':
        return 'TAM Map';
      default:
        return 'Market Data';
    }
  };

  const formatPrice = () => {
    if (!lead.price) return 'Contact for pricing';
    return `${lead.currency || 'AUD'} $${lead.price.toLocaleString()}`;
  };

  const formatLastUpdated = () => {
    if (!lead.last_updated) return 'Recently updated';
    return new Date(lead.last_updated).toLocaleDateString();
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            {getTypeIcon()}
            <Badge variant="secondary" className="text-xs">
              {getTypeLabel()}
            </Badge>
          </div>
          <BookmarkButton
            contentType="lead"
            contentId={lead.id}
            title={lead.name}
            description={lead.description}
            metadata={{
              type: lead.type,
              category: lead.category,
              industry: lead.industry,
              location: lead.location,
              price: lead.price,
              record_count: lead.record_count
            }}
            size="sm"
            variant="ghost"
          />
        </div>
        <h3 className="text-lg font-semibold text-foreground line-clamp-2">
          {lead.name}
        </h3>
        {lead.record_count && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            {lead.record_count.toLocaleString()} records
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {lead.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Tag className="w-4 h-4 mr-1" />
            <span className="truncate">{lead.industry}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">{lead.location}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Updated {formatLastUpdated()}</span>
          </div>

          {lead.data_quality_score && (
            <div className="flex items-center text-sm">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              <span className="text-muted-foreground">
                Quality: {lead.data_quality_score}%
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
        <div className="w-full space-y-3">
          <div className="text-lg font-semibold text-foreground">
            {formatPrice()}
          </div>
          
          <div className="flex gap-2 w-full">
            {lead.preview_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(lead)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onDownload(lead)}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-1" />
              {lead.type === 'tam_map' ? 'View' : 'Download'}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
