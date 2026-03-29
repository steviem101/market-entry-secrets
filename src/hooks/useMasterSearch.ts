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

      // Sanitise input: strip characters that could inject PostgREST filter operators
      const sanitised = query.trim().toLowerCase().replace(/[,().%\\]/g, '');
      if (!sanitised) { setResults([]); return; }
      const searchTerm = `%${sanitised}%`;

      const SEARCH_LIMIT = 10;

      // Run all searches in parallel instead of sequentially
      const [
        eventsResult,
        membersResult,
        agenciesResult,
        serviceProvidersResult,
        innovationResult,
        leadsResult,
        contentResult
      ] = await Promise.all([
        Promise.resolve(supabase
          .from('events')
          .select('id, title, description, date, time, location, organizer, category, type, attendees')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},organizer.ilike.${searchTerm},category.ilike.${searchTerm},type.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT)
        ).catch(() => ({ data: null, error: true })),

        Promise.resolve(supabase
          .from('community_members')
          .select('id, name, description, title, company, location, experience, specialties, is_anonymous')
          .or(`name.ilike.${searchTerm},title.ilike.${searchTerm},description.ilike.${searchTerm},company.ilike.${searchTerm},location.ilike.${searchTerm},experience.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT)
        ).catch(() => ({ data: null, error: true })),

        Promise.resolve(supabase
          .from('trade_investment_agencies')
          .select('id, name, description, location, founded, employees, services, website, contact')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT)
        ).catch(() => ({ data: null, error: true })),

        Promise.resolve(supabase
          .from('service_providers')
          .select('id, name, description, location, founded, employees, services, website, contact')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT)
        ).catch(() => ({ data: null, error: true })),

        Promise.resolve(supabase
          .from('innovation_ecosystem')
          .select('id, name, description, location, founded, employees, services, website, contact')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm},founded.ilike.${searchTerm},basic_info.ilike.${searchTerm},why_work_with_us.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT)
        ).catch(() => ({ data: null, error: true })),

        Promise.resolve((supabase as any)
          .from('lead_databases')
          .select('id, title, slug, description, short_description, list_type, sector, location, provider_name, record_count, price_aud')
          .eq('status', 'active')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},list_type.ilike.${searchTerm},sector.ilike.${searchTerm},location.ilike.${searchTerm},provider_name.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT)
        ).catch(() => ({ data: null, error: true })),

        Promise.resolve(supabase
          .from('content_items')
          .select('id, title, slug, subtitle, meta_description, content_type, featured, read_time, publish_date, sector_tags, content_categories(name)')
          .or(`title.ilike.${searchTerm},subtitle.ilike.${searchTerm},meta_description.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT)
        ).catch(() => ({ data: null, error: true })),
      ]);

      const allResults: SearchResult[] = [];

      if (eventsResult.data) {
        (eventsResult.data as any[]).forEach(event => {
          allResults.push({
            id: event.id, title: event.title,
            description: event.description || 'Event', type: 'event', url: `/events`,
            metadata: { date: event.date, time: event.time, location: event.location, organizer: event.organizer, category: event.category, type: event.type, attendees: event.attendees }
          });
        });
      }

      if (membersResult.data) {
        (membersResult.data as any[]).forEach(member => {
          allResults.push({
            id: member.id, title: member.name,
            description: member.description || 'Community member', type: 'community_member', url: `/community`,
            metadata: { title: member.title, company: member.company, location: member.location, experience: member.experience, specialties: member.specialties, isAnonymous: member.is_anonymous }
          });
        });
      }

      if (agenciesResult.data) {
        (agenciesResult.data as any[]).forEach(agency => {
          allResults.push({
            id: agency.id, title: agency.name,
            description: agency.description || 'Government & Industry Support', type: 'content', url: `/government-support`,
            metadata: { location: agency.location, founded: agency.founded, employees: agency.employees, services: agency.services, website: agency.website, contact: agency.contact, originalType: 'trade_agency' }
          });
        });
      }

      if (serviceProvidersResult.data) {
        (serviceProvidersResult.data as any[]).forEach(provider => {
          allResults.push({
            id: provider.id, title: provider.name,
            description: provider.description || 'Service Provider', type: 'service_provider', url: `/service-providers`,
            metadata: { location: provider.location, founded: provider.founded, employees: provider.employees, services: provider.services, website: provider.website, contact: provider.contact }
          });
        });
      }

      if (innovationResult.data) {
        (innovationResult.data as any[]).forEach(hub => {
          allResults.push({
            id: hub.id, title: hub.name,
            description: hub.description || 'Innovation Hub', type: 'innovation_hub', url: `/innovation-ecosystem`,
            metadata: { location: hub.location, founded: hub.founded, employees: hub.employees, services: hub.services, website: hub.website, contact: hub.contact }
          });
        });
      }

      if (leadsResult.data) {
        (leadsResult.data as any[]).forEach((lead: any) => {
          allResults.push({
            id: lead.id, title: lead.title,
            description: lead.short_description || lead.description || 'Lead Database', type: 'lead', url: `/leads/${lead.slug}`,
            metadata: { type: lead.list_type, sector: lead.sector, location: lead.location, provider: lead.provider_name, recordCount: lead.record_count, price: lead.price_aud }
          });
        });
      }

      if (contentResult.data) {
        (contentResult.data as any[]).forEach(content => {
          allResults.push({
            id: content.id, title: content.title,
            description: content.subtitle || content.meta_description || 'Market entry content', type: 'content', url: `/content/${content.slug}`,
            metadata: { category: content.content_categories?.name, contentType: content.content_type, featured: content.featured, readTime: content.read_time, publishDate: content.publish_date, sectorTags: content.sector_tags }
          });
        });
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
