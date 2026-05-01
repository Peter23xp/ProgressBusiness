import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SiteOption {
  id: string;
  nom: string;
  ville: string;
  actif: boolean;
}

export function useSites() {
  const { data, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () =>
      api.get<{ data: SiteOption[] }>('/sites').then(r => r.data),
    staleTime: 10 * 60_000,
  });
  const sites = (data?.data ?? []).filter(s => s.actif !== false);
  return { sites, isLoading };
}
