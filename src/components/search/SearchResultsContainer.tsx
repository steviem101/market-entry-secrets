
import { SearchResult } from "@/hooks/useMasterSearch";
import { SearchResultCard } from "./SearchResultCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResultsContainerProps {
  results: SearchResult[];
  onResultClick?: () => void;
}

export const SearchResultsContainer = ({ results, onResultClick }: SearchResultsContainerProps) => {
  console.log("SearchResultsContainer rendering:", { 
    resultsCount: results.length,
    resultIds: results.map(r => ({ id: r.id, type: r.type, title: r.title }))
  });

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Search Results</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
          {results.length > 6 && (
            <span className="text-xs text-primary">Scroll for more</span>
          )}
        </div>
      </div>
      
      <ScrollArea className="w-full max-h-[400px]">
        <div className="space-y-1.5 pr-3">
          {results.slice(0, 20).map((result, index) => {
            const uniqueKey = `${result.type}-${result.id}-${index}`;
            console.log("Rendering result:", { uniqueKey, title: result.title, type: result.type });
            
            return (
              <SearchResultCard
                key={uniqueKey}
                result={result}
                onResultClick={onResultClick}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
