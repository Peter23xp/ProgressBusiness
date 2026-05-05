import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { portalApi } from '@/lib/portal.api';

export function usePortalHome() {
  const user = useAuthStore((s) => s.user);
  const clientId = user?.id ?? null;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['portal', 'home', clientId],
    queryFn: () => portalApi.getHomeData(),
    staleTime: 2 * 60_000,
    enabled: !!clientId,
  });

  return {
    client: data?.client ?? null,
    prochainNiveau: data?.prochainNiveau ?? null,
    niveauxConfig: data?.niveauxConfig ?? [],
    nbFilleulsActifs: data?.nbFilleulsActifs ?? 0,
    nbFilleulsTotal: data?.nbFilleulsTotal ?? 0,
    dernierAchats: data?.dernierAchats ?? [],
    isLoading,
    error,
    refetch,
  };
}
