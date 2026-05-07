import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { portalApi } from '@/lib/portal.api';
import { usePortalPurchases, type PurchasePeriod } from '@/hooks/usePortalPurchases';
import { formatUSD, cn } from '@/lib/utils';

// ── Period filter pills ───────────────────────────────────────────────────────

const PERIODS: { value: PurchasePeriod; label: string }[] = [
  { value: 'month',   label: 'Ce mois'          },
  { value: '3months', label: '3 derniers mois'  },
  { value: 'all',     label: 'Tout'             },
];

function PeriodPills({ value, onChange }: {
  value: PurchasePeriod;
  onChange: (v: PurchasePeriod) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            'rounded-full px-4 py-2 text-sm whitespace-nowrap flex-shrink-0 font-medium transition-colors',
            value === p.value
              ? 'bg-[#1E3A5F] text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ── Stats card ────────────────────────────────────────────────────────────────

function StatsCard({ totalDepense, nbAchats, totalPointsGagnes, period }: {
  totalDepense: number;
  nbAchats: number;
  totalPointsGagnes: number;
  period: PurchasePeriod;
}) {
  const label = period === 'month' ? 'ce mois' : period === '3months' ? 'ces 3 derniers mois' : 'au total';
  return (
    <div className="rounded-xl p-4 bg-blue-50 border border-blue-100">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
        Total dépensé {label}
      </p>
      <p className="text-2xl font-bold text-[#1E3A5F] mt-1">{formatUSD(totalDepense)}</p>
      <p className="text-sm text-neutral-500 mt-0.5">
        {nbAchats} achat{nbAchats !== 1 ? 's' : ''}
        {totalPointsGagnes > 0 && ` · +${totalPointsGagnes.toLocaleString('fr')} pts gagnés`}
      </p>
    </div>
  );
}

// ── Purchase card ─────────────────────────────────────────────────────────────

function PurchaseCard({ achat, onTap }: {
  achat: {
    id: string; date: string; siteNom: string;
    produitPrincipal: string; nbArticles: number;
    montantTotal: number; pointsAttribues: number; remiseAppliquee: number;
  };
  onTap: (id: string) => void;
}) {
  const extra = achat.nbArticles - 1;
  const nom = achat.produitPrincipal.length > 25
    ? achat.produitPrincipal.slice(0, 25) + '…'
    : achat.produitPrincipal;

  return (
    <button
      type="button"
      onClick={() => onTap(achat.id)}
      className={cn(
        'w-full text-left bg-white border rounded-xl p-4 mb-3 shadow-sm',
        'active:scale-[0.98] active:opacity-90 transition-transform',
        achat.remiseAppliquee > 0 ? 'border-neutral-100 border-l-4 border-l-green-500' : 'border-neutral-100',
      )}
    >
      <div className="flex justify-between items-start text-xs text-neutral-400 mb-1">
        <span>{format(new Date(achat.date), "d MMM · HH'h'mm", { locale: fr })}</span>
        <span>{achat.siteNom}</span>
      </div>
      <p className="text-sm font-medium text-neutral-800">
        {nom}
        {extra > 0 && <span className="text-neutral-400 ml-1">+ {extra} article{extra !== 1 ? 's' : ''}</span>}
      </p>
      {achat.remiseAppliquee > 0 && (
        <p className="text-xs text-green-600 mt-0.5">
          Remise appliquée : -{formatUSD(achat.remiseAppliquee)}
        </p>
      )}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-base font-bold text-[#1E3A5F]">{formatUSD(achat.montantTotal)}</span>
        <div className="flex items-center gap-1.5">
          {achat.pointsAttribues > 0 && (
            <span className="text-xs font-semibold text-green-600 bg-green-50 rounded-full px-2 py-0.5">
              +{achat.pointsAttribues} pts
            </span>
          )}
          <ChevronRight size={14} className="text-neutral-300" />
        </div>
      </div>
    </button>
  );
}

// ── Detail drawer (simple bottom panel) ──────────────────────────────────────

function PurchaseDetailPanel({ venteId, onClose }: { venteId: string; onClose: () => void }) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'purchase-detail', venteId],
    queryFn: () => portalApi.getPurchaseDetail(venteId),
    staleTime: 5 * 60_000,
  });

  const v = data?.vente;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Détail de l'achat"
    >
      <div
        className="w-full bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#1E3A5F]">Détail de l'achat</h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-sm">
            Fermer
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-8 rounded animate-pulse bg-neutral-200" />)}
          </div>
        ) : v ? (
          <>
            <p className="font-mono text-xs text-neutral-400 mb-1">{v.numeroVente ?? v.id.slice(0, 8)}</p>
            <p className="text-xs text-neutral-500 mb-4">
              {format(new Date(v.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })} · {v.siteNom}
            </p>

            <div className="space-y-2 mb-4">
              {v.lignes.map((l, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-neutral-700">{l.nom} ×{l.quantite}</span>
                  <span className="font-medium tabular-nums">{formatUSD(l.sousTotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Sous-total</span>
                <span>{formatUSD(v.montantBrut)}</span>
              </div>
              {v.remiseFidelite > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Remise fidélité</span>
                  <span>-{formatUSD(v.remiseFidelite)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#1E3A5F] pt-1 border-t border-neutral-100">
                <span>Total payé</span>
                <span>{formatUSD(v.montantNet)}</span>
              </div>
            </div>

            {v.pointsAttribues > 0 && (
              <p className="text-sm text-green-600 font-semibold mt-3">
                +{v.pointsAttribues} points attribués
                {v.soldePointsApres != null && ` · Solde : ${v.soldePointsApres.toLocaleString('fr')} pts`}
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate(`/sales/${v.id}/receipt`)}
              className="mt-4 w-full h-11 rounded-xl border border-[#1E3A5F] text-[#1E3A5F] font-semibold text-sm"
            >
              📄 Voir le reçu
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PortalAchatsPage() {
  const navigate = useNavigate();
  const { achatsByMonth, stats, period, setPeriod, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePortalPurchases();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const months = Object.keys(achatsByMonth);
  const hasAny = months.length > 0;

  return (
    <PortalLayout title="Mes achats" showBackButton onBack={() => navigate('/portal/home')}>
      <div className="px-4 py-4 space-y-4">

        <PeriodPills value={period} onChange={setPeriod} />

        {!isLoading && (
          <StatsCard
            totalDepense={stats.totalDepense}
            nbAchats={stats.nbAchats}
            totalPointsGagnes={stats.totalPointsGagnes}
            period={period}
          />
        )}

        {isLoading && (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 rounded-xl animate-pulse bg-neutral-200" />
            ))}
          </div>
        )}

        {!isLoading && !hasAny && (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-500">
              {period === 'all'
                ? 'Aucun achat enregistré pour l\'instant.'
                : `Aucun achat ${period === 'month' ? 'ce mois' : 'ces 3 derniers mois'}.`}
            </p>
            {period !== 'all' && (
              <button
                type="button"
                onClick={() => setPeriod('all')}
                className="mt-2 text-sm text-[#2E86C1] font-semibold hover:underline"
              >
                Voir tous mes achats
              </button>
            )}
          </div>
        )}

        {months.map((month) => (
          <div key={month}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-semibold text-neutral-400 capitalize">{month}</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
            {achatsByMonth[month].map((a) => (
              <PurchaseCard key={a.id} achat={a} onTap={setSelectedId} />
            ))}
          </div>
        ))}

        {hasNextPage && (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full h-11 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 flex items-center justify-center gap-2"
          >
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            Charger plus…
          </button>
        )}
        {!hasNextPage && hasAny && (
          <p className="text-center text-xs text-neutral-400 py-2">Vous avez vu tous vos achats.</p>
        )}

      </div>

      {selectedId && (
        <PurchaseDetailPanel venteId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </PortalLayout>
  );
}
