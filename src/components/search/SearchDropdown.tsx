
import { useEffect, useState, useCallback } from "react";
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Calculate dropdown position with better accuracy
  const calculateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      console.log("Position calculation:", {
        rectBottom: rect.bottom,
        rectLeft: rect.left,
        rectWidth: rect.width,
        scrollY
      });
      
      return {
        top: rect.bottom + scrollY,
        left: rect.left,
        width: rect.width
      };
    }
    return { top: 0, left: 0, width: 0 };
  }, [inputRef]);

  // Show dropdown if we have a query AND (loading OR results OR error OR completed search with no results)
  const shouldShowResults = showResults && searchQuery.trim() && (
    loading || 
    results.length > 0 || 
    error ||
    (!loading && results.length === 0)
  );

  // Update position when showing results or on scroll/resize
  useEffect(() => {
    if (shouldShowResults) {
      const updatePosition = () => setDropdownPosition(calculateDropdownPosition());
      updatePosition();

      // Use requestAnimationFrame for smoother updates
      const handleScroll = () => requestAnimationFrame(updatePosition);
      const handleResize = () => requestAnimationFrame(updatePosition);

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [shouldShowResults, calculateDropdownPosition]);

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
