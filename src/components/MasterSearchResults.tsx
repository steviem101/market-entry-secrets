
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
    results: results.slice(0, 3)
  });

  // Calculate if dropdown should open upward - be more conservative
  const viewportHeight = window.innerHeight;
  const maxDropdownHeight = Math.min(400, viewportHeight * 0.7);
  const spaceBelow = viewportHeight - position.top;
  const spaceAbove = position.top;
  
  // Only open upward if there's significantly more space above AND very little space below
  const shouldOpenUpward = spaceBelow < 200 && spaceAbove > maxDropdownHeight + 50;

  console.log("Dropdown positioning:", {
    viewportHeight,
    maxDropdownHeight,
    spaceBelow,
    spaceAbove,
    shouldOpenUpward,
    positionTop: position.top
  });

  const dropdownStyle = {
    position: 'fixed' as const,
    top: shouldOpenUpward ? position.top - maxDropdownHeight - 8 : position.top,
    left: position.left,
    width: Math.max(position.width, 400),
    maxHeight: maxDropdownHeight,
    zIndex: 9999
  };

  console.log("Final dropdown style:", dropdownStyle);

  if (loading) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
        style={dropdownStyle}
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
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
        style={dropdownStyle}
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
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
        style={dropdownStyle}
      >
        <div className="text-gray-500 text-center py-4 text-sm">
          No results found
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
      style={dropdownStyle}
    >
      <SearchResultsContainer results={results} onResultClick={onResultClick} />
    </div>
  );
};
