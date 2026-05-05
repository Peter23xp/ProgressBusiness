import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/reports.api';
import type { ParrainageReportParams } from '@/lib/reports.api';

export function useParrainageReport(params: ParrainageReportParams) {
  return useQuery({
    queryKey: ['reports', 'parrainage', params],
    queryFn: () => reportsApi.getParrainageReport(params),
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });
}
