
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSectorConfig } from "@/config/sectors";

export const useSectorServiceProviders = (sectorId: string) => {
  const sectorConfig = getSectorConfig(sectorId);
  
  return useQuery({
    queryKey: ['sector-service-providers', sectorId],
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
        return sectorConfig.serviceKeywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

export const useSectorEvents = (sectorId: string) => {
  const sectorConfig = getSectorConfig(sectorId);
  
  return useQuery({
    queryKey: ['sector-events', sectorId],
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
        return sectorConfig.eventKeywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

export const useSectorLeads = (sectorId: string) => {
  const sectorConfig = getSectorConfig(sectorId);
  
  return useQuery({
    queryKey: ['sector-leads', sectorId],
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
        return sectorConfig.leadKeywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        ) || sectorConfig.industries.some(industry =>
          lead.industry?.toLowerCase().includes(industry.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};

export const useSectorCommunityMembers = (sectorId: string) => {
  const sectorConfig = getSectorConfig(sectorId);
  
  return useQuery({
    queryKey: ['sector-community-members', sectorId],
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

export const useSectorInnovationEcosystem = (sectorId: string) => {
  const sectorConfig = getSectorConfig(sectorId);
  
  return useQuery({
    queryKey: ['sector-innovation-ecosystem', sectorId],
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

export const useSectorTradeAgencies = (sectorId: string) => {
  const sectorConfig = getSectorConfig(sectorId);
  
  return useQuery({
    queryKey: ['sector-trade-agencies', sectorId],
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
