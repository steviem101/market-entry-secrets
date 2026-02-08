import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/lib/api/reportApi';

export const useReport = (reportId: string | undefined) => {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportApi.fetchReport(reportId!),
    enabled: !!reportId,
  });
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
