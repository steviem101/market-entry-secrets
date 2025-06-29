
import { SearchResult } from "@/hooks/useMasterSearch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building, Briefcase, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { BookmarkButton } from "../BookmarkButton";
import { getTypeIcon, getTypeBadgeVariant, getTypeLabel } from "./SearchResultHelpers";

interface SearchResultCardProps {
  result: SearchResult;
  onResultClick?: () => void;
}

export const SearchResultCard = ({ result, onResultClick }: SearchResultCardProps) => {
  return (
    <Link 
      to={result.url}
      onClick={onResultClick}
      className="block w-full"
    >
      <Card className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-gray-200 dark:border-gray-600 w-full">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-start justify-between w-full">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-1 mt-1 flex-shrink-0">
                {getTypeIcon(result)}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm line-clamp-1 text-gray-900 dark:text-gray-100">
                  {result.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1 text-gray-600 dark:text-gray-300">
                  {result.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              <BookmarkButton
                contentType={result.type === 'service_provider' || result.type === 'innovation_hub' || result.type === 'lead' ? 'content' : result.type}
                contentId={result.id}
                title={result.title}
                description={result.description}
                metadata={result.metadata}
                size="sm"
                variant="ghost"
              />
              <Badge variant={getTypeBadgeVariant(result)} className="text-xs">
                {getTypeLabel(result)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        {result.metadata && (
          <CardContent className="pt-0 pb-3 px-4">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              {result.metadata.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{result.metadata.location}</span>
                </div>
              )}
              {result.metadata.company && (
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span className="truncate">{result.metadata.company}</span>
                </div>
              )}
              {result.metadata.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(result.metadata.date).toLocaleDateString()}</span>
                </div>
              )}
              {result.metadata.founded && (
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  <span>Est. {result.metadata.founded}</span>
                </div>
              )}
              {result.metadata.category && (
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span className="truncate">{result.metadata.category}</span>
                </div>
              )}
              {result.metadata.industry && (
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  <span className="truncate">{result.metadata.industry}</span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};
