
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

  console.log("MasterSearch render:", { 
    searchQuery, 
    debouncedSearchQuery, 
    results: results.length, 
    loading, 
    showResults 
  });

  // Perform search when debounced query changes
  useEffect(() => {
    console.log("Search effect triggered:", { debouncedSearchQuery });
    if (debouncedSearchQuery.trim()) {
      console.log("Performing search for:", debouncedSearchQuery);
      searchAll(debouncedSearchQuery);
      setShowResults(true);
    } else {
      console.log("Clearing search - empty query");
      clearSearch();
      setShowResults(false);
    }
  }, [debouncedSearchQuery, searchAll, clearSearch]);

  // Show results when we have them and query is not empty
  useEffect(() => {
    console.log("Results effect:", { 
      hasResults: results.length > 0, 
      hasQuery: searchQuery.trim().length > 0,
      loading 
    });
    
    if (searchQuery.trim() && results.length > 0 && !loading) {
      console.log("Setting showResults to true");
      setShowResults(true);
    } else if (!searchQuery.trim()) {
      console.log("Setting showResults to false - no query");
      setShowResults(false);
    }
  }, [results, searchQuery, loading]);

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
    console.log("Clearing search manually");
    setSearchQuery("");
    clearSearch();
    setShowResults(false);
  };

  const handleInputFocus = () => {
    console.log("Input focused:", { searchQuery, resultsLength: results.length });
    if (searchQuery.trim() && results.length > 0) {
      setShowResults(true);
    }
  };

  const handleResultClick = () => {
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Input changed:", value);
    setSearchQuery(value);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div ref={searchRef} className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="pl-12 pr-12 py-4 text-lg rounded-full border-2 bg-background/80 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none w-full"
          />
          {searchQuery ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-accent/50"
            >
              <X className="w-4 h-4" />
            </Button>
          ) : null}
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
    </div>
  );
};
