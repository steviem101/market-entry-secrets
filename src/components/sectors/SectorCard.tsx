
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Building2, Calendar, FileText, Users, ArrowRight, Star } from "lucide-react";

interface SectorCardProps {
  sector: {
    id: string;
    name: string;
    slug: string;
    description: string;
    industries: string[];
    featured?: boolean;
  };
  featured?: boolean;
  compact?: boolean;
}

const SectorCard = ({ sector, featured = false, compact = false }: SectorCardProps) => {
  if (compact && featured) {
    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
          
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {sector.name}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {sector.description}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          {/* Key Industries - Compact */}
          <div>
            <div className="flex flex-wrap gap-1.5">
              {sector.industries.slice(0, 3).map((industry) => (
                <Badge
                  key={industry}
                  variant="outline"
                  className="text-xs bg-secondary/50 hover:bg-secondary transition-colors border-secondary/60"
                >
                  {industry}
                </Badge>
              ))}
              {sector.industries.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
                  +{sector.industries.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Available Resources - Compact */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <div className="p-1 rounded bg-blue-100">
                <Building2 className="h-3 w-3 text-blue-600" />
              </div>
              <span className="font-medium">Providers</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <div className="p-1 rounded bg-green-100">
                <Calendar className="h-3 w-3 text-green-600" />
              </div>
              <span className="font-medium">Events</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <div className="p-1 rounded bg-purple-100">
                <FileText className="h-3 w-3 text-purple-600" />
              </div>
              <span className="font-medium">Content</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <div className="p-1 rounded bg-orange-100">
                <Users className="h-3 w-3 text-orange-600" />
              </div>
              <span className="font-medium">Experts</span>
            </div>
          </div>

          <Link to={`/sectors/${sector.slug}`} className="block">
            <Button className="w-full h-9 group/btn">
              <span>Explore Sector</span>
              <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  // Regular card layout for non-compact mode
  const cardSize = featured ? "lg:col-span-2" : "";
  
  return (
    <Card className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50/50 ${cardSize}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className={`font-bold text-foreground group-hover:text-primary transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
                {sector.name}
              </h3>
              {featured && (
                <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Featured Sector
                </Badge>
              )}
            </div>
          </div>
          {!featured && sector.featured && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              Featured
            </Badge>
          )}
        </div>
        
        <p className={`text-muted-foreground leading-relaxed ${featured ? 'text-lg mt-3' : 'mt-2'}`}>
          {sector.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Industries */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-3 tracking-wide uppercase">
            Key Industries
          </h4>
          <div className="flex flex-wrap gap-2">
            {sector.industries.slice(0, featured ? 6 : 4).map((industry) => (
              <Badge
                key={industry}
                variant="outline"
                className="bg-secondary/50 hover:bg-secondary transition-colors border-secondary/60"
              >
                {industry}
              </Badge>
            ))}
            {sector.industries.length > (featured ? 6 : 4) && (
              <Badge variant="outline" className="text-muted-foreground border-dashed">
                +{sector.industries.length - (featured ? 6 : 4)} more
              </Badge>
            )}
          </div>
        </div>

        {/* Available Resources */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-3 tracking-wide uppercase">
            Available Resources
          </h4>
          <div className={`grid gap-3 ${featured ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <div className="p-1.5 rounded-md bg-blue-100">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="font-medium">Service Providers</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <div className="p-1.5 rounded-md bg-green-100">
                <Calendar className="h-3.5 w-3.5 text-green-600" />
              </div>
              <span className="font-medium">Events</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <div className="p-1.5 rounded-md bg-purple-100">
                <FileText className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <span className="font-medium">Content</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <div className="p-1.5 rounded-md bg-orange-100">
                <Users className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <span className="font-medium">Experts</span>
            </div>
          </div>
        </div>

        <Link to={`/sectors/${sector.slug}`} className="block">
          <Button className={`w-full group/btn ${featured ? 'h-12 text-lg' : 'h-10'}`}>
            <span>Explore {sector.name}</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default SectorCard;
