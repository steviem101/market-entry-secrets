
import { SearchResult } from "@/hooks/useMasterSearch";
import { SearchResultsContainer } from "./search/SearchResultsContainer";
import { Portal } from "./ui/portal";

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
    sampleResults: results.slice(0, 3).map(r => ({ title: r.title, type: r.type }))
  });

  // Calculate if dropdown should open upward
  const viewportHeight = window.innerHeight;
  const maxDropdownHeight = Math.min(500, viewportHeight * 0.7);
  const spaceBelow = viewportHeight - position.top;
  const spaceAbove = position.top;
  
  // Open upward if there's more space above and limited space below
  const shouldOpenUpward = spaceBelow < 300 && spaceAbove > maxDropdownHeight + 20;

  const dropdownStyle = {
    position: 'fixed' as const,
    top: shouldOpenUpward ? position.top - maxDropdownHeight - 8 : position.top + 8,
    left: position.left,
    width: Math.max(position.width, 420),
    maxHeight: maxDropdownHeight,
    zIndex: 99999, // Increased z-index significantly
    overflow: 'hidden',
    // Remove hardcoded styles to let Tailwind handle them
    transform: 'translateZ(0)', // Force hardware acceleration
    willChange: 'transform', // Optimize for changes
  };

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
        style={dropdownStyle} 
        className="bg-background border border-border rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-200"
      >
        {content}
      </div>
    </Portal>
  );
};
