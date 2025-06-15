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
    console.log("searchAll called with query:", query);
    
    if (!query.trim()) {
      console.log("Empty query, clearing results");
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Starting search...");

      const searchTerm = `%${query.trim()}%`;
      console.log("Search term:", searchTerm);
      
      // Search events
      console.log("Searching events...");
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},organizer.ilike.${searchTerm},category.ilike.${searchTerm},type.ilike.${searchTerm}`);

      if (eventsError) {
        console.error("Events search error:", eventsError);
        throw eventsError;
      }
      console.log("Events found:", events?.length || 0);

      // Search community members
      console.log("Searching community members...");
      const { data: members, error: membersError } = await supabase
        .from('community_members')
        .select('*')
        .or(`name.ilike.${searchTerm},title.ilike.${searchTerm},description.ilike.${searchTerm},company.ilike.${searchTerm},location.ilike.${searchTerm},experience.ilike.${searchTerm}`);

      if (membersError) {
        console.error("Members search error:", membersError);
        throw membersError;
      }
      console.log("Members found:", members?.length || 0);

      // Search trade & investment agencies
      console.log("Searching trade agencies...");
      const { data: agencies, error: agenciesError } = await supabase
        .from('trade_investment_agencies')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`);

      if (agenciesError) {
        console.error("Agencies search error:", agenciesError);
        throw agenciesError;
      }
      console.log("Agencies found:", agencies?.length || 0);

      // Search service providers
      console.log("Searching service providers...");
      const { data: serviceProviders, error: serviceProvidersError } = await supabase
        .from('service_providers')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`);

      if (serviceProvidersError) {
        console.error("Service providers search error:", serviceProvidersError);
        throw serviceProvidersError;
      }
      console.log("Service providers found:", serviceProviders?.length || 0);

      // Search innovation ecosystem
      console.log("Searching innovation ecosystem...");
      const { data: innovationHubs, error: innovationError } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`);

      if (innovationError) {
        console.error("Innovation ecosystem search error:", innovationError);
        throw innovationError;
      }
      console.log("Innovation hubs found:", innovationHubs?.length || 0);

      // Search leads
      console.log("Searching leads...");
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},type.ilike.${searchTerm},category.ilike.${searchTerm},industry.ilike.${searchTerm},location.ilike.${searchTerm},provider_name.ilike.${searchTerm}`);

      if (leadsError) {
        console.error("Leads search error:", leadsError);
        throw leadsError;
      }
      console.log("Leads found:", leads?.length || 0);

      // Search content items
      console.log("Searching content items...");
      const { data: contentItems, error: contentError } = await supabase
        .from('content_items')
        .select('*, content_categories(name)')
        .or(`title.ilike.${searchTerm},subtitle.ilike.${searchTerm},meta_description.ilike.${searchTerm}`);

      if (contentError) {
        console.error("Content items search error:", contentError);
        throw contentError;
      }
      console.log("Content items found:", contentItems?.length || 0);

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

      console.log("Total results compiled:", allResults.length);
      setResults(allResults);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
      console.log("Search completed");
    }
  }, []);

  const clearSearch = useCallback(() => {
    console.log("clearSearch called");
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
