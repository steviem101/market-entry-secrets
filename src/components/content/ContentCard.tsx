
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, TrendingUp, Users, FileText, Play, Star } from "lucide-react";

const iconMap: Record<string, any> = {
  TrendingUp,
  BookOpen,
  Users,
  FileText,
  Play,
  Star
};

interface ContentCardProps {
  content: any;
  featured?: boolean;
}

export const ContentCard = ({ content, featured = false }: ContentCardProps) => {
  const IconComponent = iconMap[content.content_categories?.icon] || BookOpen;
  const categoryColor = content.content_categories?.color || "teal";

  return (
    <Link to={`/content/${content.slug}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        {/* Thumbnail */}
        <div className={`relative w-full ${featured ? 'h-48' : 'h-40'} overflow-hidden`}>
          {content.thumbnail_url ? (
            <img
              src={content.thumbnail_url}
              alt={content.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-${categoryColor}-500/20 to-${categoryColor}-600/10 flex items-center justify-center`}>
              <IconComponent className={`w-12 h-12 text-${categoryColor}-500/40`} />
            </div>
          )}
          {content.featured && (
            <Badge className="absolute top-3 right-3">Featured</Badge>
          )}
        </div>

        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs"
            >
              <IconComponent className="w-3 h-3" />
              {content.content_categories?.name}
            </Badge>
          </div>

          <h3 className={`font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors ${featured ? 'text-xl' : 'text-base line-clamp-2'}`}>
            {content.title}
          </h3>

          {content.subtitle && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {content.subtitle}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(content.publish_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {content.read_time} min
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
