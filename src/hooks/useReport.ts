import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/lib/api/reportApi';
import { useAuth } from '@/hooks/useAuth';

export const useReport = (reportId: string | undefined) => {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportApi.fetchReport(reportId!),
    // Don't fire the query until auth has settled — otherwise RLS sees
    // auth.uid() as null and returns no rows, causing "Report Not Found".
    enabled: !!reportId && !authLoading && !!user,
    // Auto-refresh every 5s while the report is still processing
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'processing' ? 5000 : false;
    },
  });
  return query;
};

export const useSharedReport = (shareToken: string | undefined) => {
  return useQuery({
    queryKey: ['shared-report', shareToken],
    queryFn: () => reportApi.fetchSharedReport(shareToken!),
    enabled: !!shareToken,
  });
};

export const useMyReports = () => {
  return useQuery({
    queryKey: ['my-reports'],
    queryFn: () => reportApi.fetchMyReports(),
  });
};
