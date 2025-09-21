
import { useRef, useEffect } from "react";
import { SearchInput } from "./search/SearchInput";
import { SearchDropdown } from "./search/SearchDropdown";
import { SimpleSearchDropdown } from "./search/SimpleSearchDropdown";
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
    handleResultClick,
    setShowResults
  } = useSearchState();

  // Enhanced click-outside handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the search container
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        // Also check if click is not on the dropdown (which is now portaled)
        const target = event.target as Element;
        const isClickOnDropdown = target.closest('[data-search-dropdown]');
        
        if (!isClickOnDropdown) {
          setShowResults(false);
        }
      }
    };

    if (showResults) {
      // Add slight delay to prevent immediate closure on initial show
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showResults, setShowResults]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && showResults) {
      setShowResults(false);
      inputRef.current?.blur();
    }
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

        <SimpleSearchDropdown
          results={results}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          showResults={showResults}
          onResultClick={handleResultClick}
        />
      </div>
    </div>
  );
};
