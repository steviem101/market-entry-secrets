
import { useState, useEffect } from "react";
import { useMasterSearch } from "./useMasterSearch";
import { useDebounce } from "./useDebounce";

export const useSearchState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { results, loading, error, searchAll, clearSearch } = useMasterSearch();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchAll(debouncedSearchQuery);
    } else {
      clearSearch();
      setShowResults(false);
    }
  }, [debouncedSearchQuery, searchAll, clearSearch]);

  // Show results when we have a query and any of: results, loading, or error
  useEffect(() => {
    if (searchQuery.trim() && (loading || results.length > 0 || error)) {
      setShowResults(true);
    } else if (searchQuery.trim() && !loading && results.length === 0 && !error) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [results, searchQuery, loading, error]);

  const handleClearSearch = () => {
    setSearchQuery("");
    clearSearch();
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && (results.length > 0 || loading || error)) {
      setShowResults(true);
    }
  };

  const handleResultClick = () => {
    setShowResults(false);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
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
    handleResultClick,
    setShowResults
  };
};
