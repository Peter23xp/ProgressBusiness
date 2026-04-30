import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { ventesApi } from '@/lib/ventes.api';

export function useProductSearch(siteId: string) {
  const [query, setQuery] = useState('');
  const [categorie, setCategorie] = useState('');
  const [stockOnly, setStockOnly] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['produits', 'search', siteId, debouncedQuery, categorie, stockOnly],
    queryFn: () =>
      ventesApi.searchProduits({
        q: debouncedQuery || undefined,
        siteId,
        categorie: categorie || undefined,
        stockOnly: stockOnly || undefined,
      }),
    enabled: !!siteId,
    staleTime: 30_000,
    gcTime: 60_000,
  });

  return {
    produits: data?.produits ?? [],
    isLoading,
    isError,
    query,
    setQuery,
    categorie,
    setCategorie,
    stockOnly,
    setStockOnly,
  };
}
