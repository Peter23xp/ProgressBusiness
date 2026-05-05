import { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { portalApi } from '@/lib/portal.api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export type PurchasePeriod = 'month' | '3months' | 'all';

export function usePortalPurchases() {
  const user = useAuthStore((s) => s.user);
  const clientId = user?.id ?? null;
  const [period, setPeriod] = useState<PurchasePeriod>('month');

  const query = useInfiniteQuery({
    queryKey: ['portal', 'purchases', clientId, period],
    queryFn: ({ pageParam = 1 }) =>
      portalApi.getPurchases({ period, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    staleTime: 2 * 60_000,
    enabled: !!clientId,
  });

  const achatsByMonth = useMemo(() => {
    const all = query.data?.pages.flatMap((p) => p.achats) ?? [];
    const groups: Record<string, typeof all> = {};
    for (const achat of all) {
      const key = format(new Date(achat.date), 'MMMM yyyy', { locale: fr });
      if (!groups[key]) groups[key] = [];
      groups[key].push(achat);
    }
    return groups;
  }, [query.data]);

  const stats = query.data?.pages[0]?.stats ?? {
    totalDepense: 0,
    nbAchats: 0,
    totalPointsGagnes: 0,
  };

  return {
    achatsByMonth,
    stats,
    period,
    setPeriod,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
  };
}
