import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatUSD } from '@/lib/utils';
import type { TopProduct } from '@/hooks/useRegionalDashboard';

interface TopProductsListProps {
  data: TopProduct[] | undefined;
  isLoading: boolean;
}

const rankStyle = (rang: number): string => {
  if (rang === 1) return 'bg-amber-100 text-amber-700';
  if (rang === 2) return 'bg-slate-200 text-slate-600';
  if (rang === 3) return 'bg-orange-200 text-orange-800';
  return 'bg-slate-100 text-text-muted';
};

export function TopProductsList({ data, isLoading }: TopProductsListProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl shadow-card border border-border bg-white p-5 h-full">
      <div className="mb-4">
        <h2 className="text-section-title text-primary">Top 5 Produits</h2>
        <p className="text-xs text-text-muted mt-0.5">Sur la période sélectionnée</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-7 h-7 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-32 rounded-full" />
                <div className="skeleton h-3 w-20 rounded-full" />
              </div>
              <div className="skeleton h-3.5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-center text-text-muted text-sm py-8" role="status" aria-live="polite">
          Aucune vente sur cette période
        </p>
      ) : (
        <ol className="space-y-0.5">
          {data.map((product) => (
            <li key={product.produitId}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 p-2 rounded-lg text-left transition-colors duration-100',
                  'hover:bg-blue-50/60',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent',
                )}
                onClick={() => navigate(`/stocks/${product.produitId}`)}
              >
                <span className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0',
                  rankStyle(product.rang),
                )}>
                  {product.rang}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-text truncate">{product.produitNom}</p>
                  <p className="text-[11px] text-text-muted font-mono">{product.sku}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className="text-[12px] font-bold text-text font-mono">{product.quantiteVendue} u.</span>
                  <span className="text-[11px] text-success font-mono">{formatUSD(product.caGenere)}</span>
                </div>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
