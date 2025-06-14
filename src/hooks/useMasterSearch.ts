
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
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},organizer.ilike.${searchTerm},category.ilike.${searchTerm},type.ilike.${searchTerm}`);

      if (eventsError) throw eventsError;

      // Search community members
      const { data: members, error: membersError } = await supabase
        .from('community_members')
        .select('*')
        .or(`name.ilike.${searchTerm},title.ilike.${searchTerm},description.ilike.${searchTerm},company.ilike.${searchTerm},location.ilike.${searchTerm},experience.ilike.${searchTerm}`);

      if (membersError) throw membersError;

      // Search trade & investment agencies
      const { data: agencies, error: agenciesError } = await supabase
        .from('trade_investment_agencies')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`);

      if (agenciesError) throw agenciesError;

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
              time: event.time,
              location: event.location,
              organizer: event.organizer,
              category: event.category,
              type: event.type,
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
              experience: member.experience,
              specialties: member.specialties,
              isAnonymous: member.is_anonymous
            }
          });
        });
      }

      // Add trade & investment agencies as content type for bookmarking purposes
      if (agencies) {
        agencies.forEach(agency => {
          allResults.push({
            id: agency.id,
            title: agency.name,
            description: agency.description,
            type: 'content', // Changed from 'trade_agency' to 'content' to match BookmarkButton expectations
            url: `/trade-investment-agencies`,
            metadata: {
              location: agency.location,
              founded: agency.founded,
              employees: agency.employees,
              services: agency.services,
              website: agency.website,
              contact: agency.contact,
              originalType: 'trade_agency' // Keep track of original type in metadata
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
