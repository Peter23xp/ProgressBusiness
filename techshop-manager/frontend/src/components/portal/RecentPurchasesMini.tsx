import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCDF } from '@/lib/utils';

interface RecentPurchasesMiniProps {
  achats: Array<{
    id: string;
    date: string;
    produitPrincipal: string;
    montantTotal: number;
    nbArticles: number;
  }>;
  onViewAll: () => void;
}

export function RecentPurchasesMini({ achats, onViewAll }: RecentPurchasesMiniProps) {
  return (
    <div>
      {achats.length === 0 ? (
        <p className="text-sm text-neutral-500 py-2">
          Aucun achat enregistré pour l'instant.
        </p>
      ) : (
        <div className="space-y-3">
          {achats.map((a) => {
            const extra = a.nbArticles - 1;
            const nom = a.produitPrincipal.length > 25
              ? a.produitPrincipal.slice(0, 25) + '…'
              : a.produitPrincipal;
            return (
              <div key={a.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-neutral-400">
                    {format(new Date(a.date), 'd MMM', { locale: fr })}
                  </span>
                  <span className="text-xs text-neutral-400 mx-1">·</span>
                  <span className="text-sm font-medium text-neutral-800">{nom}</span>
                  {extra > 0 && (
                    <span className="text-xs text-neutral-400 ml-1">+{extra} article{extra !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-[#1E3A5F] ml-2 tabular-nums whitespace-nowrap">
                  {formatCDF(a.montantTotal)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onViewAll}
        className="mt-3 text-sm font-semibold text-[#2E86C1] hover:underline"
        aria-label="Voir tous mes achats"
      >
        Voir tous mes achats →
      </button>
    </div>
  );
}
