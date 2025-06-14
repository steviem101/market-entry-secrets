
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMasterSearch } from "@/hooks/useMasterSearch";
import { MasterSearchResults } from "./MasterSearchResults";
import { useDebounce } from "@/hooks/useDebounce";

interface MasterSearchProps {
  placeholder?: string;
  className?: string;
}

export const MasterSearch = ({ 
  placeholder = "Search across all content...", 
  className = "" 
}: MasterSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { results, loading, error, searchAll, clearSearch } = useMasterSearch();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchAll(debouncedSearchQuery);
      setShowResults(true);
    } else {
      clearSearch();
      setShowResults(false);
    }
  }, [debouncedSearchQuery, searchAll, clearSearch]);

  // Handle clicks outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    clearSearch();
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && results.length > 0) {
      setShowResults(true);
    }
  };

  const handleResultClick = () => {
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-12 pr-12 py-4 text-lg rounded-full border-2 bg-background/80 backdrop-blur-sm"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showResults && (
        <MasterSearchResults
          results={results}
          loading={loading}
          error={error}
          onResultClick={handleResultClick}
        />
      )}
    </div>
  );
};
