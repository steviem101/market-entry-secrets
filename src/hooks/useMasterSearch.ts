
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'community_member' | 'content';
  url: string;
  metadata?: Record<string, any>;
}

export const useMasterSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAll = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchTerm = `%${query.trim()}%`;
      
      // Search events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},organizer.ilike.${searchTerm},category.ilike.${searchTerm}`);

      if (eventsError) throw eventsError;

      // Search community members
      const { data: members, error: membersError } = await supabase
        .from('community_members')
        .select('*')
        .or(`name.ilike.${searchTerm},title.ilike.${searchTerm},description.ilike.${searchTerm},company.ilike.${searchTerm},location.ilike.${searchTerm}`);

      if (membersError) throw membersError;

      // Combine results
      const allResults: SearchResult[] = [];

      // Add events
      if (events) {
        events.forEach(event => {
          allResults.push({
            id: event.id,
            title: event.title,
            description: event.description,
            type: 'event',
            url: `/events`,
            metadata: {
              date: event.date,
              location: event.location,
              organizer: event.organizer,
              category: event.category,
              attendees: event.attendees
            }
          });
        });
      }

      // Add community members
      if (members) {
        members.forEach(member => {
          allResults.push({
            id: member.id,
            title: member.name,
            description: member.description,
            type: 'community_member',
            url: `/community`,
            metadata: {
              title: member.title,
              company: member.company,
              location: member.location,
              specialties: member.specialties
            }
          });
        });
      }

      // Add static content results (mock for now, could be moved to database later)
      const staticContent = [
        {
          id: 'slack-australian-market-entry',
          title: 'How Slack Entered the Australian Enterprise Market',
          description: 'Step-by-step guide on how Slack successfully entered and dominated the Australian enterprise market',
          type: 'content' as const,
          url: '/content/slack-australian-market-entry'
        },
        {
          id: 'australian-business-registration-guide',
          title: 'Complete Guide to Australian Business Registration',
          description: 'Everything you need to know about registering your business in Australia',
          type: 'content' as const,
          url: '/content/australian-business-registration-guide'
        },
        {
          id: 'australian-consumer-behavior',
          title: 'Understanding Australian Consumer Behavior',
          description: 'Deep dive into Australian consumer preferences and market behavior',
          type: 'content' as const,
          url: '/content/australian-consumer-behavior'
        }
      ];

      // Filter static content based on search query
      const filteredStaticContent = staticContent.filter(content =>
        content.title.toLowerCase().includes(query.toLowerCase()) ||
        content.description.toLowerCase().includes(query.toLowerCase())
      );

      allResults.push(...filteredStaticContent);

      setResults(allResults);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchAll,
    clearSearch
  };
};
