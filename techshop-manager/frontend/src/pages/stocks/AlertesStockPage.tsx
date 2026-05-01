import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ShoppingCart, Settings, CheckCircle2, RefreshCw, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { stocksApi } from '@/lib/stocks.api';
import { StockStatusBadge } from '@/components/stocks/StockStatusBadge';
import { EditSeuilModal } from './ProduitStockPage';
import { cn } from '@/lib/utils';
import type { StockAlertItem } from '@/lib/stocks.api';

const SITES = [
  { id: 'goma', nom: 'Goma' },
  { id: 'bukavu', nom: 'Bukavu' },
  { id: 'kinshasa', nom: 'Kinshasa' },
];

export default function AlertesStockPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuthStore();
  const qc = useQueryClient();

  const canAccess = hasRole('GERANT');
  const canSeeSites = hasRole('DIRECTEUR_REGIONAL');

  const [siteFilter, setSiteFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALERTE' | 'RUPTURE' | ''>('');
  const [editSeuil, setEditSeuil] = useState<StockAlertItem | null>(null);
  const [ordering, setOrdering] = useState<Record<string, boolean>>({});

  const forcedSiteId = canSeeSites ? (siteFilter || undefined) : (user?.siteId ?? undefined);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['stock-alerts', { siteId: forcedSiteId, type: typeFilter }],
    queryFn: () => stocksApi.getAlerts({
      siteId: forcedSiteId,
      type: typeFilter || undefined,
    }),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const orderingMutation = useMutation({
    mutationFn: ({ siteId, produitId }: { siteId: string; produitId: string }) =>
      stocksApi.markOrdering(siteId, produitId),
    onSuccess: (_, vars) => {
      setOrdering(prev => ({ ...prev, [`${vars.siteId}:${vars.produitId}`]: true }));
      toast.success('Marqué comme en cours de commande (24h).');
    },
    onError: () => toast.error('Erreur lors du marquage.'),
  });

  if (!canAccess) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-3">
        <AlertCircle size={36} className="text-warning mx-auto opacity-60" />
        <h2 className="text-[16px] font-bold text-primary">Accès refusé</h2>
        <p className="text-[13px] text-text-muted">Cette page est réservée aux Gérants et Super-Admins.</p>
        <button type="button" onClick={() => navigate('/stocks')} className="btn-secondary text-[13px]">
          Retour aux stocks
        </button>
      </div>
    );
  }

  const alertes = data?.alertes ?? [];
  const summary = data?.summary;

  const sorted = [...alertes].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'RUPTURE' ? -1 : 1;
    return new Date(a.depuis).getTime() - new Date(b.depuis).getTime();
  });

  function isOrderingActive(item: StockAlertItem) {
    return item.isOrdering || ordering[`${item.siteId}:${item.produitId}`];
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-page-title text-primary">Alertes stock</h1>
          <p className="mt-1 text-[13px] text-text-muted">
            Produits en rupture ou sous le seuil d'alerte
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn-secondary">
            <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Résumé */}
      {!isLoading && summary && (
        <div className="grid grid-cols-2 gap-4">
          <div className={cn(
            'card flex items-center gap-4',
            (summary.totalRuptures > 0) ? 'bg-red-50 border-red-100' : 'bg-white',
          )}>
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-danger" />
            </div>
            <div>
              <p className="font-black text-[28px] text-danger leading-none">{summary.totalRuptures}</p>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Ruptures · stock = 0</p>
            </div>
          </div>
          <div className={cn(
            'card flex items-center gap-4',
            (summary.totalAlertes > 0) ? 'bg-amber-50 border-amber-100' : 'bg-white',
          )}>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-warning" />
            </div>
            <div>
              <p className="font-black text-[28px] text-warning leading-none">{summary.totalAlertes}</p>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Alertes · stock ≤ seuil</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        {canSeeSites && (
          <div className="relative">
            <select
              value={siteFilter}
              onChange={e => setSiteFilter(e.target.value)}
              className={cn('text-sm pr-8', siteFilter && 'border-primary-accent bg-primary-light/20')}
            >
              <option value="">Tous les sites</option>
              {SITES.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
        )}
        <div className="period-toggle">
          {(['', 'RUPTURE', 'ALERTE'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn('period-btn', typeFilter === t && 'active')}
            >
              {t === '' ? 'Tous' : t === 'RUPTURE' ? 'Ruptures' : 'Alertes'}
            </button>
          ))}
        </div>
      </div>

      {/* Erreur */}
      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-danger">
          <AlertCircle size={16} />
          Impossible de charger les alertes.
          <button type="button" onClick={() => refetch()} className="ml-auto underline hover:no-underline">Réessayer</button>
        </div>
      )}

      {/* Tableau */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Site</th>
              <th className="text-center">Stock</th>
              <th className="text-center">Seuil</th>
              <th>Statut</th>
              <th>Depuis</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j}><div className="skeleton h-3 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              : sorted.map(a => {
                  const isOrd = isOrderingActive(a);
                  const key = `${a.siteId}-${a.produitId}`;
                  return (
                    <tr
                      key={key}
                      className={cn(
                        a.type === 'RUPTURE' ? 'bg-red-50/70' : 'bg-amber-50/60',
                      )}
                    >
                      <td>
                        <button
                          type="button"
                          onClick={() => navigate(`/stocks/${a.produitId}`)}
                          className="text-left hover:text-primary-accent transition-colors"
                        >
                          <p className="font-medium text-[13px]">{a.produitNom}</p>
                          <p className="font-mono text-[11px] text-text-muted">{a.sku}</p>
                        </button>
                      </td>
                      <td className="text-[13px] text-text-muted">{a.siteNom}</td>
                      <td className="text-center">
                        <span className={cn(
                          'font-black text-[18px] font-mono',
                          a.type === 'RUPTURE' ? 'text-danger' : 'text-warning',
                        )}>
                          {a.stockActuel}
                        </span>
                      </td>
                      <td className="text-center font-mono text-[12px] text-text-muted">{a.seuilAlerte}</td>
                      <td><StockStatusBadge statut={a.type} size="sm" /></td>
                      <td className="text-[12px] text-text-muted whitespace-nowrap">
                        {formatDistanceToNow(new Date(a.depuis), { locale: fr, addSuffix: true })}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => !isOrd && orderingMutation.mutate({ siteId: a.siteId, produitId: a.produitId })}
                            disabled={isOrd || orderingMutation.isPending}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors',
                              isOrd
                                ? 'bg-green-50 border-green-200 text-success cursor-default'
                                : 'border-border text-text-muted hover:border-primary-accent hover:text-primary-accent',
                            )}
                          >
                            {isOrd ? (
                              <><CheckCircle2 size={11} /> En commande ✓</>
                            ) : (
                              <><ShoppingCart size={11} /> Commander</>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditSeuil(a)}
                            className="p-1.5 rounded-lg text-text-subtle hover:text-primary hover:bg-primary-light/30 transition-colors"
                            title="Modifier le seuil"
                          >
                            <Settings size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>

        {!isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={26} className="text-success" />
            </div>
            <p className="text-[14px] font-semibold text-success">Tous les stocks sont suffisants.</p>
            <p className="text-[12px] text-text-muted">Aucun produit en rupture ni en alerte en ce moment.</p>
          </div>
        )}
      </div>

      {/* EditSeuil modal */}
      {editSeuil && (
        <EditSeuilModal
          open
          onClose={() => setEditSeuil(null)}
          produitId={editSeuil.produitId}
          produitNom={editSeuil.produitNom}
          siteId={editSeuil.siteId}
          siteNom={editSeuil.siteNom}
          currentSeuil={editSeuil.seuilAlerte}
          currentStock={editSeuil.stockActuel}
          onSuccess={() => {
            setEditSeuil(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
