
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge 
            variant={featured ? "secondary" : "outline"} 
            className="flex items-center gap-1"
          >
            <IconComponent className="w-3 h-3" />
            {content.content_categories?.name}
          </Badge>
          {content.featured && <Badge>Featured</Badge>}
        </div>
        
        <h3 className={`font-semibold mb-2 text-foreground ${featured ? 'text-xl' : 'text-lg line-clamp-2'}`}>
          {content.title}
        </h3>
        
        {content.subtitle && (
          <p className={`text-muted-foreground mb-4 ${featured ? '' : 'line-clamp-2'}`}>
            {content.subtitle}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(content.publish_date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {content.read_time} min read
          </div>
        </div>
        
        <Link to={`/content/${content.slug}`}>
          <Button variant={featured ? "default" : "outline"} className="w-full">
            {featured ? "Read Success Story" : "Read More"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
