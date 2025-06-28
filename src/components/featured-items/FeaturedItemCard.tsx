
import { Calendar, MapPin, Users, Building2, Briefcase, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeaturedItem } from "@/hooks/useFeaturedItems";

interface FeaturedItemCardProps {
  item: FeaturedItem;
  onViewDetails: (item: FeaturedItem) => void;
}

export const FeaturedItemCard = ({ item, onViewDetails }: FeaturedItemCardProps) => {
  const getTypeIcon = () => {
    switch (item.type) {
      case 'service_provider':
        return <Briefcase className="w-5 h-5" />;
      case 'event':
        return <Calendar className="w-5 h-5" />;
      case 'innovation_hub':
        return <Zap className="w-5 h-5" />;
      case 'trade_agency':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'service_provider':
        return 'Service Provider';
      case 'event':
        return 'Event';
      case 'innovation_hub':
        return 'Innovation Hub';
      case 'trade_agency':
        return 'Trade Agency';
      default:
        return 'Directory Item';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'service_provider':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'event':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'innovation_hub':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'trade_agency':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-500 border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 hover:-translate-y-2 h-full">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header with type badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className={`${getTypeColor()} border`}>
            <div className="flex items-center gap-1">
              {getTypeIcon()}
              <span className="text-xs font-medium">{getTypeLabel()}</span>
            </div>
          </Badge>
          {item.logo && (
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {item.name}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {item.description}
          </p>

          {/* Location and additional info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
            </div>
            
            {item.employees && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{item.employees} employees</span>
              </div>
            )}

            {item.date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(item.date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Services or category tags */}
          {(item.services && item.services.length > 0) && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.services.slice(0, 2).map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
              {item.services.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.services.length - 2} more
                </Badge>
              )}
            </div>
          )}

          {item.category && (
            <div className="mb-4">
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Footer with action button */}
        <div className="pt-4 border-t border-border/20">
          <Button 
            onClick={() => onViewDetails(item)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            size="sm"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
