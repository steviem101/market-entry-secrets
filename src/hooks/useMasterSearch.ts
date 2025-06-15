
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

      // Search service providers
      const { data: serviceProviders, error: serviceProvidersError } = await supabase
        .from('service_providers')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`);

      if (serviceProvidersError) throw serviceProvidersError;

      // Search innovation ecosystem
      const { data: innovationHubs, error: innovationError } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`);

      if (innovationError) throw innovationError;

      // Search leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},type.ilike.${searchTerm},category.ilike.${searchTerm},industry.ilike.${searchTerm},location.ilike.${searchTerm},provider_name.ilike.${searchTerm}`);

      if (leadsError) throw leadsError;

      // Search content items
      const { data: contentItems, error: contentError } = await supabase
        .from('content_items')
        .select('*, content_categories(name)')
        .or(`title.ilike.${searchTerm},subtitle.ilike.${searchTerm},meta_description.ilike.${searchTerm}`);

      if (contentError) throw contentError;

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
            url: `/mentors`,
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

      // Add trade & investment agencies
      if (agencies) {
        agencies.forEach(agency => {
          allResults.push({
            id: agency.id,
            title: agency.name,
            description: agency.description,
            type: 'content', // For bookmarking compatibility
            url: `/trade-investment-agencies`,
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

      // Add service providers
      if (serviceProviders) {
        serviceProviders.forEach(provider => {
          allResults.push({
            id: provider.id,
            title: provider.name,
            description: provider.description,
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

      // Add innovation hubs
      if (innovationHubs) {
        innovationHubs.forEach(hub => {
          allResults.push({
            id: hub.id,
            title: hub.name,
            description: hub.description,
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

      // Add leads
      if (leads) {
        leads.forEach(lead => {
          allResults.push({
            id: lead.id,
            title: lead.name,
            description: lead.description,
            type: 'lead',
            url: `/leads`,
            metadata: {
              type: lead.type,
              category: lead.category,
              industry: lead.industry,
              location: lead.location,
              provider: lead.provider_name,
              recordCount: lead.record_count,
              price: lead.price,
              currency: lead.currency
            }
          });
        });
      }

      // Add content items
      if (contentItems) {
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
