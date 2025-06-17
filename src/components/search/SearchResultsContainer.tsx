
import { SearchResult } from "@/hooks/useMasterSearch";
import { SearchResultCard } from "./SearchResultCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResultsContainerProps {
  results: SearchResult[];
  onResultClick?: () => void;
}

export const SearchResultsContainer = ({ results, onResultClick }: SearchResultsContainerProps) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Search Results</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {results.length} result{results.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <ScrollArea className="h-[600px] w-full">
        <div className="space-y-2 pr-4">
          {results.slice(0, 15).map((result) => (
            <SearchResultCard
              key={`${result.type}-${result.id}`}
              result={result}
              onResultClick={onResultClick}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
