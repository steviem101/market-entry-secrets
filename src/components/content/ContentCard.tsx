
import { memo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, BookOpen, TrendingUp, Users, FileText, Play, Star, Download } from "lucide-react";

const iconMap: Record<string, any> = {
  TrendingUp,
  BookOpen,
  Users,
  FileText,
  Play,
  Star
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  guide: "Guide",
  article: "Article",
  success_story: "Success Story",
  case_study: "Case Study",
};

// Fixed color classes to avoid Tailwind dynamic class purging
const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  teal: { bg: "from-teal-500/20 to-teal-600/10", icon: "text-teal-500/60" },
  cyan: { bg: "from-cyan-500/20 to-cyan-600/10", icon: "text-cyan-500/60" },
  blue: { bg: "from-blue-500/20 to-blue-600/10", icon: "text-blue-500/60" },
  green: { bg: "from-green-500/20 to-green-600/10", icon: "text-green-500/60" },
  purple: { bg: "from-purple-500/20 to-purple-600/10", icon: "text-purple-500/60" },
  orange: { bg: "from-orange-500/20 to-orange-600/10", icon: "text-orange-500/60" },
  red: { bg: "from-red-500/20 to-red-600/10", icon: "text-red-500/60" },
  yellow: { bg: "from-yellow-500/20 to-yellow-600/10", icon: "text-yellow-500/60" },
};

interface ContentCardProps {
  content: any;
  featured?: boolean;
  attachmentCount?: number;
}

export const ContentCard = memo(({ content, featured = false, attachmentCount = 0 }: ContentCardProps) => {
  const IconComponent = iconMap[content.content_categories?.icon] || BookOpen;
  const categoryColor = content.content_categories?.color || "teal";
  const colors = CATEGORY_COLORS[categoryColor] || CATEGORY_COLORS.teal;
  const typeLabel = CONTENT_TYPE_LABELS[content.content_type] || content.content_type;

  return (
    <Link to={`/content/${content.slug}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group h-full">
        {/* Thumbnail */}
        <div className={`relative w-full ${featured ? 'h-48' : 'h-40'} overflow-hidden`}>
          {content.thumbnail_url ? (
            <img
              loading="lazy"
              src={content.thumbnail_url}
              alt={content.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
              <IconComponent className={`w-12 h-12 ${colors.icon}`} />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {content.featured && (
              <Badge className="bg-primary text-primary-foreground text-xs">Featured</Badge>
            )}
          </div>
          {attachmentCount > 0 && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-white/90 text-foreground">
                <Download className="w-3 h-3" />
                {attachmentCount === 1 ? "PDF" : `${attachmentCount} files`}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            {content.content_categories?.name && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs"
              >
                <IconComponent className="w-3 h-3" />
                {content.content_categories.name}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {typeLabel}
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
            {content.publish_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(content.publish_date).toLocaleDateString()}
              </div>
            )}
            {content.read_time != null && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {content.read_time} min
              </div>
            )}
            {content.view_count > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {content.view_count}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

ContentCard.displayName = "ContentCard";
