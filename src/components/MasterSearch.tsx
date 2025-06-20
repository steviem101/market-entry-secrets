
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const { results, loading, error, searchAll, clearSearch } = useMasterSearch();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  console.log("MasterSearch render:", { 
    searchQuery, 
    debouncedSearchQuery, 
    results: results.length, 
    loading, 
    showResults 
  });

  // Calculate dropdown position based on input position
  const calculateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      setDropdownPosition({
        top: rect.bottom + scrollY + 8, // 8px margin
        left: rect.left + scrollX,
        width: rect.width
      });
    }
  };

  // Update position when showing results
  useEffect(() => {
    if (showResults) {
      calculateDropdownPosition();
    }
  }, [showResults]);

  // Handle window resize and scroll
  useEffect(() => {
    const handleResize = () => {
      if (showResults) {
        calculateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (showResults) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showResults]);

  // Perform search when debounced query changes
  useEffect(() => {
    console.log("Search effect triggered:", { debouncedSearchQuery });
    if (debouncedSearchQuery.trim()) {
      console.log("Performing search for:", debouncedSearchQuery);
      searchAll(debouncedSearchQuery);
    } else {
      console.log("Clearing search - empty query");
      clearSearch();
      setShowResults(false);
    }
  }, [debouncedSearchQuery, searchAll, clearSearch]);

  // Show results when we have a query and results are available
  useEffect(() => {
    console.log("Results effect:", { 
      hasQuery: searchQuery.trim().length > 0,
      hasResults: results.length > 0, 
      loading 
    });
    
    if (searchQuery.trim() && (results.length > 0 || loading || error)) {
      console.log("Setting showResults to true");
      setShowResults(true);
    } else {
      console.log("Setting showResults to false");
      setShowResults(false);
    }
  }, [results, searchQuery, loading, error]);

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
    if (searchQuery.trim() && (results.length > 0 || loading || error)) {
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
    
    // Show results immediately if we have a query and existing results
    if (value.trim() && (results.length > 0 || loading)) {
      setShowResults(true);
    }
  };

  // Determine if we should show the results dropdown
  const shouldShowResults = showResults && searchQuery.trim() && (loading || results.length > 0 || error);
  
  console.log("Should show results:", shouldShowResults, {
    showResults,
    hasQuery: !!searchQuery.trim(),
    loading,
    resultsCount: results.length,
    error: !!error
  });

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div ref={searchRef} className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            ref={inputRef}
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

        {shouldShowResults && (
          <MasterSearchResults
            results={results}
            loading={loading}
            error={error}
            onResultClick={handleResultClick}
            position={dropdownPosition}
          />
        )}
      </div>
    </div>
  );
};
