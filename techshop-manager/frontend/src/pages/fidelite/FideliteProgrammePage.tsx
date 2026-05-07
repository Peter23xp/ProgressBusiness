import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, TrendingUp, Users, RefreshCw, Settings, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { fideliteApi, NIVEAU_COLORS, NIVEAU_LABELS, type FideliteFilters } from '@/lib/fidelite.api';
import { formatUSD, formatDate, cn } from '@/lib/utils';
import { useSites } from '@/hooks/useSites';
import type { NiveauFidelite } from '@/types';

const PERIODS = [
  { value: 'today', label: "Auj." },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'all', label: 'Tout' },
] as const;

const MOUVEMENT_CFG: Record<string, { label: string; positive: boolean }> = {
  ACHAT: { label: 'Achat', positive: true },
  PARRAINAGE: { label: 'Parrainage', positive: true },
  AVOIR_RETOUR: { label: 'Avoir retour', positive: true },
  RETOUR: { label: 'Retour', positive: false },
  EXPIRATION: { label: 'Expiration', positive: false },
  AJUSTEMENT_ADMIN: { label: 'Ajustement', positive: true },
};

const RANK_COLORS = [
  'bg-yellow-400 text-yellow-900',
  'bg-gray-300 text-gray-700',
  'bg-amber-600 text-white',
  'bg-slate-200 text-slate-600',
  'bg-slate-200 text-slate-600',
];

function NiveauBadge({ niveau }: { niveau: NiveauFidelite }) {
  const color = NIVEAU_COLORS[niveau];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {NIVEAU_LABELS[niveau]}
    </span>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-[11px] text-text-muted font-semibold">= Stable</span>;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-semibold', delta > 0 ? 'text-success' : 'text-danger')}>
      {delta > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()}
    </span>
  );
}

export default function FideliteProgrammePage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuthStore();
  const canSeeSites = hasRole('DIRECTEUR_REGIONAL');
  const { sites } = useSites();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [siteId, setSiteId] = useState('');

  const filters: FideliteFilters = {
    period,
    siteId: canSeeSites ? (siteId || undefined) : (user?.siteId ?? undefined),
  };

  const { data: statsData, isLoading: statsLoading, refetch, isFetching } = useQuery({
    queryKey: ['fidelite', 'stats', filters],
    queryFn: () => fideliteApi.getStats(filters),
    staleTime: 2 * 60_000,
  });

  const { data: topData, isLoading: topLoading } = useQuery({
    queryKey: ['fidelite', 'top', filters],
    queryFn: () => fideliteApi.getTopClients({ ...filters, limit: 10 }),
    staleTime: 3 * 60_000,
  });

  const { data: mouvData, isLoading: mouvLoading } = useQuery({
    queryKey: ['fidelite', 'recent', filters],
    queryFn: () => fideliteApi.getRecentMouvements({ ...filters, limit: 8 }),
    staleTime: 60_000,
  });

  const stats = statsData?.stats;
  const topClients = topData?.clients ?? [];
  const mouvements = mouvData?.mouvements ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-page-title text-primary">Fidélité</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Programme de récompense multi-niveaux</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canSeeSites && (
            <select value={siteId} onChange={e => setSiteId(e.target.value)} className="text-sm">
              <option value="">Tous les sites</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          )}
          <div className="period-toggle">
            {PERIODS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={cn('period-btn', period === p.value && 'active')}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => refetch()} className="btn-secondary">
            <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
          </button>
          {hasRole('SUPER_ADMIN') && (
            <button type="button" onClick={() => navigate('/fidelite/config')} className="btn-secondary">
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card"><div className="skeleton h-16 rounded-lg" /></div>
          ))
        ) : (
          <>
            <div className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Star size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="font-black text-[28px] leading-none text-primary">
                  {(stats?.pointsDistribues ?? 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">Points distribués</p>
                <DeltaBadge delta={stats?.pointsDistribuesDelta ?? 0} />
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-success" />
              </div>
              <div>
                <p className="font-black text-[28px] leading-none text-primary">
                  {formatUSD(stats?.remisesAccordees ?? 0)}
                </p>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">Remises accordées</p>
                <DeltaBadge delta={stats?.remisesAccordeesDelta ?? 0} />
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Users size={18} className="text-primary-accent" />
              </div>
              <div>
                <p className="font-black text-[28px] leading-none text-primary">
                  {stats?.clientsActifsTotal ?? 0}
                </p>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">Clients actifs</p>
                <DeltaBadge delta={stats?.clientsActifsDelta ?? 0} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Corps principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Colonne gauche : répartition + mouvements */}
        <div className="space-y-5">

          {/* Répartition par niveau */}
          <div className="card space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Répartition par niveau</p>
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-8 rounded" />)
            ) : (
              (stats?.repartitionNiveaux ?? []).map(r => {
                const color = NIVEAU_COLORS[r.niveau];
                return (
                  <div key={r.niveau} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <NiveauBadge niveau={r.niveau} />
                      <span className="text-[11px] text-text-muted font-mono">
                        {r.count} · {r.pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${r.pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Feed mouvements récents */}
          <div className="card space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">Mouvements récents</p>
            {mouvLoading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded" />)
            ) : mouvements.length === 0 ? (
              <p className="text-[12px] text-text-muted text-center py-6">Aucun mouvement récent.</p>
            ) : (
              mouvements.map(m => {
                const cfg = MOUVEMENT_CFG[m.type] ?? { label: m.type, positive: m.deltaPoints > 0 };
                const isPositive = m.deltaPoints > 0;
                return (
                  <div key={m.id} className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-primary truncate">
                        {m.clientPrenom} {m.clientNom}
                      </p>
                      <p className="text-[10px] text-text-muted">{cfg.label} · {formatDate(m.createdAt)}</p>
                    </div>
                    <span className={cn('text-[12px] font-bold shrink-0 font-mono', isPositive ? 'text-success' : 'text-danger')}>
                      {isPositive ? '+' : ''}{m.deltaPoints} pts
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Colonne droite : top clients */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Top 10 clients fidèles</p>
            <span className="text-[10px] text-text-subtle">
              {PERIODS.find(p => p.value === period)?.label}
            </span>
          </div>

          {topLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}
            </div>
          ) : topClients.length === 0 ? (
            <div className="py-12 text-center">
              <Star size={28} className="mx-auto text-text-subtle opacity-30 mb-2" />
              <p className="text-[12px] text-text-muted">Aucun client fidèle pour cette période.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Niveau</th>
                    <th>Points actuels</th>
                    <th>Gagnés</th>
                    <th>Achats</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map(tc => (
                    <tr key={tc.client.id}>
                      <td>
                        <span className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black',
                          RANK_COLORS[(tc.rang - 1) % RANK_COLORS.length],
                        )}>
                          {tc.rang}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                            {tc.client.prenom[0]}{tc.client.nom[0]}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-primary leading-tight">
                              {tc.client.prenom} {tc.client.nom}
                            </p>
                            <p className="text-[10px] text-text-muted">{tc.client.telephone}</p>
                          </div>
                        </div>
                      </td>
                      <td><NiveauBadge niveau={tc.client.niveauFidelite} /></td>
                      <td className="font-mono text-[12px] font-bold text-primary">
                        {tc.pointsActuels.toLocaleString()}
                      </td>
                      <td className="font-mono text-[12px] text-success font-semibold">
                        +{tc.pointsGagnesCettePeriode.toLocaleString()}
                      </td>
                      <td className="text-[12px] text-text-muted">{tc.nbAchats}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => navigate(`/fidelite/client/${tc.client.id}`)}
                          className="text-[11px] text-primary-accent hover:text-primary font-medium transition-colors"
                        >
                          Détail →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
