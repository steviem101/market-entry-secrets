import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  location: string;
  type: string;
  category: string;
  attendees: number;
  description: string;
  organizer: string;
  event_logo_url?: string | null;
  sector?: string | null;
  website_url?: string | null;
  registration_url?: string | null;
  organizer_email?: string | null;
  organizer_website?: string | null;
  price?: string | null;
  is_featured: boolean;
  tags?: string[] | null;
  image_url?: string | null;
}

export const useEvents = (personaFilter?: string | null) => {
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

      if (personaFilter && personaFilter !== 'all') {
        queryBuilder = queryBuilder.or(
          `target_personas.cs.{${personaFilter}},target_personas.eq.{}`
        );
      }

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
  }, [personaFilter]);

  // Split events into upcoming and past
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcoming: Event[] = [];
    const past: Event[] = [];

    events.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    // Upcoming: nearest first
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Past: most recent first
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, personaFilter]);

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      return;
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
    upcomingEvents,
    pastEvents,
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
