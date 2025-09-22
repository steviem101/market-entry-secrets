import { SearchResult } from "@/hooks/useMasterSearch";
import { SearchResultsContainer } from "./SearchResultsContainer";
import { Portal } from "@/components/ui/portal";

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
  inputRef
}: SimpleSearchDropdownProps) => {
  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!inputRef.current) return { top: 0, left: 0, width: 300 };
    
    const rect = inputRef.current.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    return {
      top: rect.bottom + scrollY + 8,
      left: rect.left,
      width: rect.width
    };
  };
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

  const position = getDropdownPosition();

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
    <Portal>
      <div 
        data-search-dropdown
        className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl max-h-[500px] overflow-hidden"
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          width: position.width,
          zIndex: 50
        }}
      >
        {content}
      </div>
    </Portal>
  );
};