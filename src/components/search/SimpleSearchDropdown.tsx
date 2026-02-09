import { SearchResult } from "@/hooks/useMasterSearch";
import { SearchResultsContainer } from "./SearchResultsContainer";

interface SimpleSearchDropdownProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  showResults: boolean;
  onResultClick: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const SimpleSearchDropdown = ({
  results,
  loading,
  error,
  searchQuery,
  showResults,
  onResultClick,
}: SimpleSearchDropdownProps) => {
  // Show dropdown if we have a query AND (loading OR results OR error OR completed search with no results)
  const shouldShowResults = showResults && searchQuery.trim() && (
    loading ||
    results.length > 0 ||
    error ||
    (!loading && results.length === 0)
  );

  if (!shouldShowResults) {
    return null;
  }

  const content = (() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground text-sm">Searching across all databases...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 text-center py-8 px-4">
          <div className="text-sm font-medium mb-1">Search Error</div>
          <div className="text-xs text-red-400">{error}</div>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="text-center py-8 px-4">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No results found</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Try adjusting your search terms or browse our categories</div>
        </div>
      );
    }

    return <SearchResultsContainer results={results} onResultClick={onResultClick} />;
  })();

  return (
    <div
      data-search-dropdown
      className="absolute left-0 right-0 top-full mt-2 z-[9999] bg-background border border-border rounded-xl shadow-2xl max-h-[500px] overflow-y-auto"
    >
      {content}
    </div>
  );
};
