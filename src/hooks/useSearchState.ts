
import { useState, useEffect } from "react";
import { useMasterSearch } from "./useMasterSearch";
import { useDebounce } from "./useDebounce";

export const useSearchState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { results, loading, error, searchAll, clearSearch } = useMasterSearch();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  console.log("useSearchState:", { 
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

  const handleInputChange = (value: string) => {
    console.log("Input changed:", value);
    setSearchQuery(value);
    
    if (value.trim() && (results.length > 0 || loading)) {
      setShowResults(true);
    }
  };

  return {
    searchQuery,
    showResults,
    results,
    loading,
    error,
    handleInputChange,
    handleClearSearch,
    handleInputFocus,
    handleResultClick
  };
};
