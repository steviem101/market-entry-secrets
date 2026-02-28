import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'community_member' | 'content' | 'service_provider' | 'innovation_hub' | 'lead';
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

      const searchTerm = `%${query.trim().toLowerCase()}%`;

      const allResults: SearchResult[] = [];

      // Search events
      try {
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},organizer.ilike.${searchTerm},category.ilike.${searchTerm},type.ilike.${searchTerm}`);

        if (!eventsError && events) {
          events.forEach(event => {
            allResults.push({
              id: event.id,
              title: event.title,
              description: event.description || 'Event',
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
      } catch (err) {
        // Silently continue - partial results are still useful
      }

      // Search community members
      try {
        const { data: members, error: membersError } = await supabase
          .from('community_members')
          .select('*')
          .or(`name.ilike.${searchTerm},title.ilike.${searchTerm},description.ilike.${searchTerm},company.ilike.${searchTerm},location.ilike.${searchTerm},experience.ilike.${searchTerm}`);

        if (!membersError && members) {
          members.forEach(member => {
            allResults.push({
              id: member.id,
              title: member.name,
              description: member.description || 'Community member',
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
      } catch (err) {
        // Silently continue
      }

      // Search trade & investment agencies
      try {
        const { data: agencies, error: agenciesError } = await supabase
          .from('trade_investment_agencies')
          .select('*')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`);

        if (!agenciesError && agencies) {
          agencies.forEach(agency => {
            allResults.push({
              id: agency.id,
              title: agency.name,
              description: agency.description || 'Government & Industry Support',
              type: 'content',
              url: `/government-support`,
              metadata: {
                location: agency.location,
                founded: agency.founded,
                employees: agency.employees,
                services: agency.services,
                website: agency.website,
                contact: agency.contact,
                originalType: 'trade_agency'
              }
            });
          });
        }
      } catch (err) {
        // Silently continue
      }

      // Search service providers
      try {
        const { data: serviceProviders, error: serviceProvidersError } = await supabase
          .from('service_providers')
          .select('*')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`);

        if (!serviceProvidersError && serviceProviders) {
          serviceProviders.forEach(provider => {
            allResults.push({
              id: provider.id,
              title: provider.name,
              description: provider.description || 'Service Provider',
              type: 'service_provider',
              url: `/service-providers`,
              metadata: {
                location: provider.location,
                founded: provider.founded,
                employees: provider.employees,
                services: provider.services,
                website: provider.website,
                contact: provider.contact
              }
            });
          });
        }
      } catch (err) {
        // Silently continue
      }

      // Search innovation ecosystem
      try {
        const { data: innovationHubs, error: innovationError } = await supabase
          .from('innovation_ecosystem')
          .select('*')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`);

        if (!innovationError && innovationHubs) {
          innovationHubs.forEach(hub => {
            allResults.push({
              id: hub.id,
              title: hub.name,
              description: hub.description || 'Innovation Hub',
              type: 'innovation_hub',
              url: `/innovation-ecosystem`,
              metadata: {
                location: hub.location,
                founded: hub.founded,
                employees: hub.employees,
                services: hub.services,
                website: hub.website,
                contact: hub.contact
              }
            });
          });
        }
      } catch (err) {
        // Silently continue
      }

      // Search lead databases
      try {
        const { data: leads, error: leadsError } = await (supabase as any)
          .from('lead_databases')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},list_type.ilike.${searchTerm},sector.ilike.${searchTerm},location.ilike.${searchTerm},provider_name.ilike.${searchTerm}`);

        if (!leadsError && leads) {
          leads.forEach((lead: any) => {
            allResults.push({
              id: lead.id,
              title: lead.title,
              description: lead.short_description || lead.description || 'Lead Database',
              type: 'lead',
              url: `/leads/${lead.slug}`,
              metadata: {
                type: lead.list_type,
                sector: lead.sector,
                location: lead.location,
                provider: lead.provider_name,
                recordCount: lead.record_count,
                price: lead.price_aud,
              }
            });
          });
        }
      } catch (err) {
        // Silently continue
      }

      // Search content items
      try {
        const { data: contentItems, error: contentError } = await supabase
          .from('content_items')
          .select('*, content_categories(name)')
          .or(`title.ilike.${searchTerm},subtitle.ilike.${searchTerm},meta_description.ilike.${searchTerm}`);

        if (!contentError && contentItems) {
          contentItems.forEach(content => {
            allResults.push({
              id: content.id,
              title: content.title,
              description: content.subtitle || content.meta_description || 'Market entry content',
              type: 'content',
              url: `/content/${content.slug}`,
              metadata: {
                category: content.content_categories?.name,
                contentType: content.content_type,
                featured: content.featured,
                readTime: content.read_time,
                publishDate: content.publish_date,
                sectorTags: content.sector_tags
              }
            });
          });
        }
      } catch (err) {
        // Silently continue
      }

      setResults(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
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
