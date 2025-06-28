
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketEntryReport {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  report_type: 'market_analysis' | 'competitor_research' | 'regulatory_guide' | 'opportunity_assessment';
  status: 'draft' | 'in_progress' | 'completed' | 'delivered';
  created_by_team_member: string | null;
  file_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
}

export const useMarketEntryReports = () => {
  const [reports, setReports] = useState<MarketEntryReport[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('market_entry_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedReports: MarketEntryReport[] = (data || []).map(report => ({
        id: report.id,
        user_id: report.user_id,
        title: report.title,
        description: report.description,
        report_type: report.report_type as MarketEntryReport['report_type'],
        status: report.status as MarketEntryReport['status'],
        created_by_team_member: report.created_by_team_member,
        file_url: report.file_url,
        metadata: typeof report.metadata === 'object' ? report.metadata : {},
        created_at: report.created_at,
        updated_at: report.updated_at,
        delivered_at: report.delivered_at,
      }));
      
      setReports(transformedReports);
    } catch (error) {
      console.error('Error fetching market entry reports:', error);
      toast({
        title: "Error",
        description: "Failed to load market entry reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'market_analysis':
        return 'Market Analysis';
      case 'competitor_research':
        return 'Competitor Research';
      case 'regulatory_guide':
        return 'Regulatory Guide';
      case 'opportunity_assessment':
        return 'Opportunity Assessment';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return {
    reports,
    loading,
    fetchReports,
    getReportTypeLabel,
    getStatusColor,
  };
};
