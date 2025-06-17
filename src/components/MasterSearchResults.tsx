
import { SearchResult } from "@/hooks/useMasterSearch";
import { SearchResultsContainer } from "./search/SearchResultsContainer";

interface MasterSearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  onResultClick?: () => void;
}

export const MasterSearchResults = ({ results, loading, error, onResultClick }: MasterSearchResultsProps) => {
  console.log("MasterSearchResults render:", { 
    resultsLength: results.length, 
    loading, 
    error,
    results: results.slice(0, 3) // Log first 3 results for debugging
  });

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl mt-2 p-4 z-[100] w-full">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground text-sm">Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl mt-2 p-4 z-[100] w-full">
        <div className="text-red-500 text-center py-4 text-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl mt-2 z-[100] w-full max-h-[700px] overflow-hidden">
      <SearchResultsContainer results={results} onResultClick={onResultClick} />
    </div>
  );
};
