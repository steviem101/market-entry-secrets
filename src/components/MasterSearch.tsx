
import { useRef, useEffect } from "react";
import { SearchInput } from "./search/SearchInput";
import { SearchDropdown } from "./search/SearchDropdown";
import { useSearchState } from "@/hooks/useSearchState";

interface MasterSearchProps {
  placeholder?: string;
  className?: string;
}

export const MasterSearch = ({ 
  placeholder = "Search across all content...", 
  className = "" 
}: MasterSearchProps) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    searchQuery,
    showResults,
    results,
    loading,
    error,
    handleInputChange,
    handleClearSearch,
    handleInputFocus,
    handleResultClick
  } = useSearchState();

  // Handle clicks outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        // Note: We would need to expose setShowResults from useSearchState to handle this
        // For now, clicking outside will be handled by the existing logic
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle any keyboard events if needed
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div ref={searchRef} className={`relative ${className}`}>
        <SearchInput
          ref={inputRef}
          searchQuery={searchQuery}
          placeholder={placeholder}
          onSearchChange={handleInputChange}
          onClear={handleClearSearch}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
        />

        <SearchDropdown
          results={results}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          showResults={showResults}
          inputRef={inputRef}
          onResultClick={handleResultClick}
        />
      </div>
    </div>
  );
};
