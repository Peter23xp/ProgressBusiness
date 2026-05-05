import { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { portalApi } from '@/lib/portal.api';
import type { PortalHomeData } from '@/lib/portal.api';

export type PointsFilter = 'all' | 'gains' | 'deductions';

export function usePortalPoints() {
  const user = useAuthStore((s) => s.user);
  const clientId = user?.id ?? null;
  const [typeFilter, setTypeFilter] = useState<PointsFilter>('all');
  const qc = useQueryClient();

  const homeData = qc.getQueryData<PortalHomeData>(['portal', 'home', clientId]);

  const query = useInfiniteQuery({
    queryKey: ['portal', 'points', clientId, typeFilter],
    queryFn: ({ pageParam = 1 }) =>
      portalApi.getPointsMouvements({ typeFilter, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    staleTime: 2 * 60_000,
    enabled: !!clientId,
  });

  const allMouvements = query.data?.pages.flatMap((p) => p.mouvements) ?? [];

  return {
    niveauFidelite: homeData?.client.niveauFidelite,
    pointsActuels: homeData?.client.pointsFidelite,
    remisePct: homeData?.client.remisePct,
    niveauxConfig: homeData?.niveauxConfig ?? [],
    prochainNiveau: homeData?.prochainNiveau ?? null,
    mouvements: allMouvements,
    typeFilter,
    setTypeFilter,
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
