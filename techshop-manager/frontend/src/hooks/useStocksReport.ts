import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/reports.api';
import type { StocksReportParams } from '@/lib/reports.api';

export function useStocksReport(params: StocksReportParams = {}) {
  return useQuery({
    queryKey: ['reports', 'stocks', params],
    queryFn: () => reportsApi.getStocksReport(params),
    staleTime: 10 * 60 * 1000,
  });
}
