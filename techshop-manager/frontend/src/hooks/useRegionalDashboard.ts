import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { api } from '@/lib/api';

export interface SitePerformance {
  siteId: string;
  siteNom: string;
  siteVille: string;
  ca: number;
  nbVentes: number;
  nbClientsActifs: number;
  alertesStock: number;
  caVariation: number;
}

export interface ComparisonData {
  sites: SitePerformance[];
  totaux: {
    ca: number;
    nbVentes: number;
    nbClientsActifs: number;
    alertesStock: number;
  };
}

export interface RevenueChartDataset {
  site: string;
  siteId: string;
  data: number[];
  color: string;
}

export interface RevenueChartData {
  labels: string[];
  datasets: RevenueChartDataset[];
}

export interface TopProduct {
  rang: number;
  produitId: string;
  produitNom: string;
  sku: string;
  categorie: string;
  quantiteVendue: number;
  caGenere: number;
  siteLeader: string;
}

export interface TopParrain {
  rang: number;
  clientId: string;
  clientNom: string;
  clientPrenom: string;
  siteNom: string;
  nbFilleulsActives: number;
  recompenseDue: number;
  recompenseType: 'POINTS' | 'REMISE' | 'COMMISSION';
}

interface RegionalResponse {
  comparison: ComparisonData;
  revenueChart: RevenueChartData;
  topProduits: TopProduct[];
  topParrains: TopParrain[];
}

const STALE_TIME = 5 * 60 * 1000;

export function useRegionalDashboard(
  period: string,
  dateRange?: { from: Date; to: Date },
) {
  const queryClient = useQueryClient();

  const key = ['regional', 'all', period, dateRange] as const;

  const query = useQuery<RegionalResponse>({
    queryKey: key,
    queryFn: () => {
      const params = new URLSearchParams({ period });
      if (dateRange) {
        params.set('dateFrom', dateRange.from.toISOString());
        params.set('dateTo', dateRange.to.toISOString());
      }
      return api.get<RegionalResponse>(`/dashboard/regional?${params}`).then((r) => r.data);
    },
    staleTime: STALE_TIME,
    retry: 1,
  });

  const comparisonKey = ['regional', 'comparison', period, dateRange] as const;
  const revenueKey = ['regional', 'revenue', period, dateRange] as const;
  const topProductsKey = ['regional', 'top-products', period, dateRange] as const;
  const topParrainsKey = ['regional', 'top-parrains', period] as const;

  const comparison = {
    data: query.data?.comparison,
    isLoading: query.isLoading,
    error: query.error,
    queryKey: comparisonKey,
  };
  const revenueChart = {
    data: query.data?.revenueChart,
    isLoading: query.isLoading,
    error: query.error,
    queryKey: revenueKey,
  };
  const topProducts = {
    data: query.data?.topProduits,
    isLoading: query.isLoading,
    error: query.error,
    queryKey: topProductsKey,
  };
  const topParrains = {
    data: query.data?.topParrains,
    isLoading: query.isLoading,
    error: query.error,
    queryKey: topParrainsKey,
  };

  const isAnyLoading = query.isLoading;

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['regional'] });
  }, [queryClient]);

  return {
    comparison,
    revenueChart,
    topProducts,
    topParrains,
    isAnyLoading,
    refetchAll,
    error: query.error,
  };
}
