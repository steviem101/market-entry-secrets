
import { useEffect, useState } from "react";
import { MasterSearchResults } from "@/components/MasterSearchResults";
import { SearchResult } from "@/hooks/useMasterSearch";

interface SearchDropdownProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  showResults: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onResultClick: () => void;
}

export const SearchDropdown = ({
  results,
  loading,
  error,
  searchQuery,
  showResults,
  inputRef,
  onResultClick
}: SearchDropdownProps) => {
  // Show dropdown if we have a query AND (loading OR results OR error OR completed search with no results)
  const shouldShowResults = showResults && searchQuery.trim() && (
    loading || 
    results.length > 0 || 
    error ||
    (!loading && results.length === 0) // This handles the "no results found" case
  );

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      
      console.log("Position calculation:", {
        rectBottom: rect.bottom,
        rectLeft: rect.left,
        rectWidth: rect.width
      });
      
      return {
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      };
    }
    return { top: 0, left: 0, width: 0 };
  };

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Update position when showing results
  useEffect(() => {
    if (shouldShowResults) {
      setDropdownPosition(calculateDropdownPosition());
    }
  }, [shouldShowResults]);

  // Handle window resize and scroll
  useEffect(() => {
    const handleResize = () => {
      if (shouldShowResults) {
        setDropdownPosition(calculateDropdownPosition());
      }
    };

    const handleScroll = () => {
      if (shouldShowResults) {
        setDropdownPosition(calculateDropdownPosition());
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [shouldShowResults]);

  console.log("Should show results:", shouldShowResults, {
    showResults,
    hasQuery: !!searchQuery.trim(),
    loading,
    resultsCount: results.length,
    error: !!error,
    dropdownPosition
  });

  if (!shouldShowResults) {
    return null;
  }

  return (
    <MasterSearchResults
      results={results}
      loading={loading}
      error={error}
      onResultClick={onResultClick}
      position={dropdownPosition}
    />
  );
};
