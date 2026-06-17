import { useState, useCallback, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { isEventPast } from '@/lib/eventDate';

import type { DatePrecision } from "@/lib/eventDate";

export interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  date_precision?: DatePrecision | null;
  typical_month?: string | null;
  time?: string | null;
  location: string;
  city?: string | null;
  type: string;
  category: string;
  attendees: number;
  description: string;
  organizer?: string | null;
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
  event_format?: string | null;
  source?: string | null;
  source_platform?: string | null;
  persona?: string | null;
  target_personas?: string[] | null;
}

const fetchEvents = async (query?: string): Promise<Event[]> => {
  let queryBuilder = supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })
    .limit(500);

  if (query && query.trim()) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,organizer.ilike.%${query}%`
    );
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw error;
  }

  return (data || []) as any;
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
    // Keep the current results on screen while a new search loads, so the page
    // never blanks to the full-page skeleton (which collapsed height and yanked
    // scroll to the top on every search).
    placeholderData: keepPreviousData,
  });

  // Split events into upcoming and past. Approximate-date events (month / tbc) are
  // always treated as upcoming because their stored date is a sort key, not a real schedule.
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const upcoming: Event[] = [];
    const past: Event[] = [];

    events.forEach(event => {
      if (isEventPast(event)) {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    });

    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
