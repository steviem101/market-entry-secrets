
import { useRef, useEffect } from "react";
import { SearchInput } from "./search/SearchInput";
import { SimpleSearchDropdown } from "./search/SimpleSearchDropdown";
import { useSearchState } from "@/hooks/useSearchState";
import { cn } from "@/lib/utils";

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

  // Close dropdown when clicking outside the search container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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
          inputRef={inputRef}
        />
      </div>
    </div>
  );
};
