
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchEvents = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      console.log('Fetching events...');
      
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

      console.log('Fetched events:', data);
      console.log('Total events count:', data?.length);
      
      // Log event types to debug
      if (data) {
        const eventTypes = data.map(event => event.type);
        console.log('Event types found:', eventTypes);
        const uniqueTypes = Array.from(new Set(eventTypes));
        console.log('Unique event types:', uniqueTypes);
      }

      setEvents(data || []);
      setSearchQuery(query || "");
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const searchEvents = useCallback((query: string) => {
    fetchEvents(query);
  }, [fetchEvents]);

  const clearSearch = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { 
    events, 
    loading, 
    error, 
    refetch: fetchEvents,
    searchEvents,
    clearSearch,
    isSearching: !!searchQuery
  };
};
