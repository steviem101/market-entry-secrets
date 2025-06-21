
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSectorBySlug } from "@/hooks/useSectors";

export const useSectorServiceProviders = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);
  
  return useQuery({
    queryKey: ['sector-service-providers', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];
      
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (error) throw error;

      // Filter based on sector keywords
      return data.filter(provider => {
        const searchText = `${provider.name} ${provider.description} ${provider.services?.join(' ')}`.toLowerCase();
        return sectorConfig.service_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

export const useSectorEvents = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);
  
  return useQuery({
    queryKey: ['sector-events', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      // Filter based on sector keywords
      return data.filter(event => {
        const searchText = `${event.title} ${event.description} ${event.category}`.toLowerCase();
        return sectorConfig.event_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

export const useSectorLeads = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);
  
  return useQuery({
    queryKey: ['sector-leads', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on sector keywords and industries
      return data.filter(lead => {
        const searchText = `${lead.name} ${lead.description} ${lead.industry} ${lead.category}`.toLowerCase();
        return sectorConfig.lead_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        ) || sectorConfig.industries.some(industry =>
          lead.industry?.toLowerCase().includes(industry.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

export const useSectorCommunityMembers = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);
  
  return useQuery({
    queryKey: ['sector-community-members', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];
      
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on sector keywords
      return data.filter(member => {
        const searchText = `${member.name} ${member.title} ${member.description} ${member.specialties?.join(' ')} ${member.experience}`.toLowerCase();
        return sectorConfig.keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

export const useSectorInnovationEcosystem = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);
  
  return useQuery({
    queryKey: ['sector-innovation-ecosystem', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];
      
      const { data, error } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .order('name');

      if (error) throw error;

      // Filter based on sector keywords
      return data.filter(entity => {
        const searchText = `${entity.name} ${entity.description} ${entity.services?.join(' ')}`.toLowerCase();
        return sectorConfig.keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

export const useSectorTradeAgencies = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);
  
  return useQuery({
    queryKey: ['sector-trade-agencies', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];
      
      const { data, error } = await supabase
        .from('trade_investment_agencies')
        .select('*')
        .order('name');

      if (error) throw error;

      // Filter based on sector keywords
      return data.filter(agency => {
        const searchText = `${agency.name} ${agency.description} ${agency.services?.join(' ')}`.toLowerCase();
        return sectorConfig.keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

export const useSectorContent = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);
  
  return useQuery({
    queryKey: ['sector-content', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];
      
      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          content_categories (
            name,
            icon,
            color
          )
        `)
        .eq('status', 'published')
        .order('publish_date', { ascending: false });

      if (error) throw error;

      // Filter based on sector tags or keywords in title/subtitle
      return data.filter(content => {
        // Check sector_tags array first
        if (content.sector_tags?.includes(sectorSlug)) {
          return true;
        }
        
        // Fallback to keyword matching in title and subtitle
        const searchText = `${content.title} ${content.subtitle || ''}`.toLowerCase();
        return sectorConfig.content_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

// Main hook that combines all sector data
export const useSectorData = (sectorId: string | undefined) => {
  const sectorSlug = sectorId || '';
  const { data: sector, isLoading: sectorLoading } = useSectorBySlug(sectorSlug);
  
  const { data: serviceProviders = [] } = useSectorServiceProviders(sectorSlug);
  const { data: events = [] } = useSectorEvents(sectorSlug);
  const { data: leads = [] } = useSectorLeads(sectorSlug);
  const { data: communityMembers = [] } = useSectorCommunityMembers(sectorSlug);
  const { data: innovationEcosystem = [] } = useSectorInnovationEcosystem(sectorSlug);
  const { data: tradeAgencies = [] } = useSectorTradeAgencies(sectorSlug);
  const { data: contentItems = [] } = useSectorContent(sectorSlug);

  return {
    sector,
    serviceProviders,
    events,
    leads,
    communityMembers,
    innovationEcosystem,
    tradeAgencies,
    contentItems,
    isLoading: sectorLoading
  };
};
