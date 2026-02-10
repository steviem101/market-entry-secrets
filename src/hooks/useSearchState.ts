
import { useState, useEffect, useMemo } from "react";
import { useMasterSearch, SearchResult } from "./useMasterSearch";
import { useDebounce } from "./useDebounce";

export type SearchCategory = 'all' | 'companies' | 'people' | 'events' | 'locations';

const CATEGORY_TYPE_MAP: Record<SearchCategory, SearchResult['type'][] | null> = {
  all: null,
  companies: ['service_provider', 'innovation_hub'],
  people: ['community_member'],
  events: ['event'],
  locations: ['lead', 'content'],
};

interface UseSearchStateOptions {
  category?: SearchCategory;
}

export const useSearchState = (options?: UseSearchStateOptions) => {
  const category = options?.category || 'all';
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { results: rawResults, loading, error, searchAll, clearSearch } = useMasterSearch();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const results = useMemo(() => {
    const allowedTypes = CATEGORY_TYPE_MAP[category];
    if (!allowedTypes) return rawResults;
    return rawResults.filter((r) => allowedTypes.includes(r.type));
  }, [rawResults, category]);

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
