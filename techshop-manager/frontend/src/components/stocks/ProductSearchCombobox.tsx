import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { stocksApi, getStockStatut } from '@/lib/stocks.api';
import { StockStatusBadge } from './StockStatusBadge';
import { formatUSD } from '@/lib/utils';
import type { ProduitSearchResult } from '@/lib/stocks.api';

export type { ProduitSearchResult };

interface ProductSearchComboboxProps {
  siteId: string;
  value: string | null;
  onChange: (id: string | null, produit: ProduitSearchResult | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ProductSearchCombobox({
  siteId, value, onChange, disabled, placeholder = 'Rechercher par SKU ou nom...',
}: ProductSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProduitSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || value) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (!siteId) return;
      try {
        const res = await stocksApi.searchProducts(query, siteId);
        setResults(res.produits ?? []);
        setOpen(true);
      } catch { setResults([]); }
    }, 300);
  }, [query, siteId, value]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function select(p: ProduitSearchResult) {
    onChange(p.id, p);
    setSelectedLabel(`${p.sku} — ${p.nom}`);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  function clear() {
    onChange(null, null);
    setSelectedLabel('');
    setQuery('');
    setResults([]);
  }

  if (!siteId) {
    return (
      <input disabled placeholder="Sélectionnez un site d'abord." className="opacity-50 cursor-not-allowed" />
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-primary-accent bg-primary-light/20">
          <span className="flex-1 text-[13px] font-medium text-text">{selectedLabel}</span>
          <button type="button" onClick={clear} disabled={disabled} className="text-text-subtle hover:text-danger transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={e => { setQuery(e.target.value); if (e.target.value) setOpen(true); }}
              onFocus={() => query && setOpen(true)}
              disabled={disabled}
              className="pl-8 text-sm"
            />
          </div>
          {open && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl border border-border bg-white shadow-card-hover overflow-hidden">
              {results.map(p => {
                const st = getStockStatut(p.stockDisponible, 1);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => select(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary-light/30 border-b border-border/50 last:border-0 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-text-muted">{p.sku}</span>
                        <span className="text-[13px] font-medium text-text truncate">{p.nom}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-text-muted">{formatUSD(p.prixVente)}</span>
                        <span className="text-[11px] text-text-subtle">· Stock : {p.stockDisponible}</span>
                      </div>
                    </div>
                    <StockStatusBadge statut={st} size="sm" />
                  </button>
                );
              })}
            </div>
          )}
          {open && results.length === 0 && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl border border-border bg-white shadow-card px-4 py-3 text-[13px] text-text-muted">
              Aucun produit trouvé pour cette recherche.
            </div>
          )}
        </>
      )}
    </div>
  );
}
