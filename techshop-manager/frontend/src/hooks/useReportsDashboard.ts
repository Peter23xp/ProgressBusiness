import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { reportsApi, type VentesReportParams, type VentesReportResponse } from '@/lib/reports.api';
import { getGranulariteFromRange, type DateRange } from '@/lib/dateRange.utils';
import { toISODate } from '@/lib/dateRange.utils';

export interface UseReportsDashboardParams {
  siteId?: string;
  dateRange: DateRange;
}

export function useReportsDashboard({ siteId, dateRange }: UseReportsDashboardParams) {
  const granularite = getGranulariteFromRange(dateRange);
  const dateDebut = toISODate(dateRange.from);
  const dateFin   = toISODate(dateRange.to);

  const params: VentesReportParams = {
    siteId,
    dateDebut,
    dateFin,
    granularite,
  };

  const query = useQuery<VentesReportResponse>({
    queryKey: ['reports', 'dashboard', params],
    queryFn: () => reportsApi.getVentesReport(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!dateDebut && !!dateFin,
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    granularite,
  };
}
