import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { reportsApi } from '@/lib/reports.api';
import type { VentesDetailParams } from '@/lib/reports.api';

export function useSalesDetailReport(params: VentesDetailParams) {
  return useQuery({
    queryKey: ['reports', 'sales-detail', params],
    queryFn: () => reportsApi.getVentesDetail(params),
    staleTime: 3 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: true,
  });
}
