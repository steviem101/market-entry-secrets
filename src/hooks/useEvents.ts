import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  target_personas?: string[] | null;
}

const fetchEvents = async (query?: string): Promise<Event[]> => {
  let queryBuilder = supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (query && query.trim()) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,organizer.ilike.%${query}%`
    );
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw error;
  }

  return data || [];
};

export const useEvents = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: events = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', debouncedSearchQuery],
    queryFn: () => fetchEvents(debouncedSearchQuery || undefined),
  });

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

  // searchLoading: true when the user has typed but debounce hasn't settled,
  // or when a search-triggered fetch is in flight (but not the initial load)
  const searchLoading = (searchQuery !== debouncedSearchQuery && !!searchQuery.trim()) ||
    (isFetching && !!debouncedSearchQuery && !isLoading);

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
    loading: isLoading,
    searchLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch events') : null,
    refetch,
    setSearchTerm,
    clearSearch,
    searchQuery,
    isSearching: !!debouncedSearchQuery
  };
};
