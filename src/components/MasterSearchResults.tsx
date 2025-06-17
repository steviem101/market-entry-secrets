
import { SearchResult } from "@/hooks/useMasterSearch";
import { SearchResultsContainer } from "./search/SearchResultsContainer";

interface MasterSearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  onResultClick?: () => void;
  position: { top: number; left: number; width: number };
}

export const MasterSearchResults = ({ 
  results, 
  loading, 
  error, 
  onResultClick,
  position 
}: MasterSearchResultsProps) => {
  console.log("MasterSearchResults render:", { 
    resultsLength: results.length, 
    loading, 
    error,
    position,
    results: results.slice(0, 3) // Log first 3 results for debugging
  });

  if (loading) {
    return (
      <div 
        className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${Math.max(position.width, 400)}px`,
          minHeight: '80px'
        }}
      >
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground text-sm">Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${Math.max(position.width, 400)}px`,
          minHeight: '80px'
        }}
      >
        <div className="text-red-500 text-center py-4 text-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div 
        className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${Math.max(position.width, 400)}px`,
          minHeight: '80px'
        }}
      >
        <div className="text-gray-500 text-center py-4 text-sm">
          No results found
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${Math.max(position.width, 400)}px`,
        maxHeight: '70vh'
      }}
    >
      <SearchResultsContainer results={results} onResultClick={onResultClick} />
    </div>
  );
};
