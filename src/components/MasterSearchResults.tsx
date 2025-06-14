
import { SearchResult } from "@/hooks/useMasterSearch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText, MapPin, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { BookmarkButton } from "./BookmarkButton";

interface MasterSearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  onResultClick?: () => void;
}

export const MasterSearchResults = ({ results, loading, error, onResultClick }: MasterSearchResultsProps) => {
  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg mt-2 p-4 z-50">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg mt-2 p-4 z-50">
        <div className="text-red-500 text-center py-4">
          Error: {error}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'community_member':
        return <Users className="w-4 h-4" />;
      case 'content':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'event':
        return 'default';
      case 'community_member':
        return 'secondary';
      case 'content':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg mt-2 max-h-96 overflow-y-auto z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Search Results</h3>
          <span className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="space-y-2">
          {results.map((result) => (
            <Link 
              key={`${result.type}-${result.id}`} 
              to={result.url}
              onClick={onResultClick}
              className="block"
            >
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="flex items-center gap-1 mt-0.5">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm line-clamp-1">{result.title}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mt-1">
                          {result.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <BookmarkButton
                        contentType={result.type}
                        contentId={result.id}
                        title={result.title}
                        description={result.description}
                        metadata={result.metadata}
                        size="sm"
                        variant="ghost"
                      />
                      <Badge variant={getTypeBadgeVariant(result.type)} className="text-xs">
                        {result.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                {result.metadata && (
                  <CardContent className="pt-0 pb-3 px-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                    </div>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
