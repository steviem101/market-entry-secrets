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

export const useMyMentorMatches = () => {
  return useQuery({
    queryKey: ['my-mentor-matches'],
    queryFn: () => reportApi.fetchMyMentorMatches(),
  });
};

/** ADMIN: every report across all users, with quality scores merged. */
export const useAllReportsAdmin = () => {
  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => reportApi.fetchAllReportsAdmin(),
  });
};

/** ADMIN: a single report with full ungated content for quality review. */
export const useAdminReport = (reportId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-report', reportId],
    queryFn: () => reportApi.fetchAdminReport(reportId!),
    enabled: !!reportId,
  });
};
