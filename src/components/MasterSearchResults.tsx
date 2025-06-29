
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
    sampleResults: results.slice(0, 3).map(r => ({ title: r.title, type: r.type }))
  });

  // Calculate if dropdown should open upward
  const viewportHeight = window.innerHeight;
  const maxDropdownHeight = Math.min(480, viewportHeight * 0.8);
  const spaceBelow = viewportHeight - position.top;
  const spaceAbove = position.top;
  
  // Only open upward if there's significantly more space above AND very little space below
  const shouldOpenUpward = spaceBelow < 200 && spaceAbove > maxDropdownHeight + 50;

  const dropdownStyle = {
    position: 'fixed' as const,
    top: shouldOpenUpward ? position.top - maxDropdownHeight - 8 : position.top,
    left: position.left,
    width: Math.max(position.width, 420),
    maxHeight: maxDropdownHeight,
    zIndex: 50,
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  };

  if (loading) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        style={dropdownStyle}
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground text-sm">Searching across all databases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        style={dropdownStyle}
      >
        <div className="text-red-500 text-center py-8 px-4">
          <div className="text-sm font-medium mb-1">Search Error</div>
          <div className="text-xs text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        style={dropdownStyle}
      >
        <div className="text-center py-8 px-4">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No results found</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Try adjusting your search terms or browse our categories</div>
        </div>
      </div>
    );
  }

  return (
    <div style={dropdownStyle} className="dark:bg-gray-800 dark:border-gray-700">
      <SearchResultsContainer results={results} onResultClick={onResultClick} />
    </div>
  );
};
