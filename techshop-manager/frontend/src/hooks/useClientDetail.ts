import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/lib/clients.api';
import type { UpdateClientDto } from '@/lib/clients.api';

export function useClientDetail(clientId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsApi.getDetailById(clientId),
    staleTime: 5 * 60 * 1000,
    enabled: !!clientId,
  });

  const updateMutation = useMutation({
    mutationFn: (body: UpdateClientDto) => clientsApi.update(clientId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    client: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateClient: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    resetUpdateError: updateMutation.reset,
  };
}
