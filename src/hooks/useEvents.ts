
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  category: string;
  attendees: number;
  description: string;
  organizer: string;
  event_logo_url?: string;
  sector?: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchEvents = useCallback(async (query?: string, isSearch = false) => {
    try {
      if (isSearch) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      
      let queryBuilder = supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      // Add search functionality
      if (query && query.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,organizer.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      setEvents(data || []);
      console.log('Events fetched:', data?.slice(0, 2)); // Debug: check first 2 events
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      if (isSearch) {
        setSearchLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      return; // Don't search if debounce hasn't finished
    }
    
    if (debouncedSearchQuery.trim()) {
      fetchEvents(debouncedSearchQuery, true);
    } else if (searchQuery === "") {
      fetchEvents("", false);
    }
  }, [debouncedSearchQuery, fetchEvents]);

  const setSearchTerm = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return { 
    events, 
    loading, 
    searchLoading,
    error, 
    refetch: fetchEvents,
    setSearchTerm,
    clearSearch,
    searchQuery,
    isSearching: !!debouncedSearchQuery
  };
};
