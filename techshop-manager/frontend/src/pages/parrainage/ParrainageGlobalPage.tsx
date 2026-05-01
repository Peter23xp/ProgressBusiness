import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import {
  Users, Award, Gift, RefreshCw, AlertCircle, ChevronLeft,
  ChevronRight, Search, Users2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { parrainageApi } from '@/lib/parrainage.api';
import { formatCDF, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useSites } from '@/hooks/useSites';
import type { ParrainageFilters, TopParrain, ParrainageItem } from '@/lib/parrainage.api';
import type { StatutParrainage } from '@/types';

const PERIODS = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'all', label: 'Tout' },
] as const;

const STATUT_CONFIG: Record<StatutParrainage, { label: string; cls: string }> = {
  EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  VALIDE: { label: 'Validé', cls: 'bg-blue-100 text-blue-700' },
  RECOMPENSE_VERSEE: { label: 'Récompense versée', cls: 'bg-green-100 text-green-700' },
};

const RANK_COLORS = [
  'bg-yellow-400 text-yellow-900',
  'bg-gray-300 text-gray-700',
  'bg-amber-600 text-white',
  'bg-neutral-200 text-neutral-600',
  'bg-neutral-200 text-neutral-600',
];

function ParrainageStatusBadge({ statut, size = 'md' }: { statut: StatutParrainage; size?: 'sm' | 'md' }) {
  const cfg = STATUT_CONFIG[statut];
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
      cfg.cls,
    )}>
      {cfg.label}
    </span>
  );
}

export default function ParrainageGlobalPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuthStore();
  const canSeeSites = hasRole('DIRECTEUR_REGIONAL');
  const { sites } = useSites();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [siteId, setSiteId] = useState('');
  const [statut, setStatut] = useState<StatutParrainage | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const filters: ParrainageFilters = {
    period,
    siteId: canSeeSites ? (siteId || undefined) : (user?.siteId ?? undefined),
    statut: statut || undefined,
    search: search || undefined,
    page,
    limit: 20,
    sortBy: 'dateCreation',
    sortOrder: 'desc',
  };

  const { data: kpisData, isLoading: kpisLoading, isError: kpisError } = useQuery({
    queryKey: ['parrainage', 'stats', filters.siteId, period],
    queryFn: () => parrainageApi.getStats({ siteId: filters.siteId, period }),
    staleTime: 2 * 60_000,
  });

  const { data: listData, isLoading: listLoading, isFetching, isError: listError, refetch } = useQuery({
    queryKey: ['parrainage', 'list', filters],
    queryFn: () => parrainageApi.list(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const { data: topData, isLoading: topLoading } = useQuery({
    queryKey: ['parrainage', 'top', filters.siteId, period],
    queryFn: () => parrainageApi.getTop({ siteId: filters.siteId, period, limit: 5 }),
    staleTime: 5 * 60_000,
  });

  const kpis = kpisData?.kpis;
  const parrainages = listData?.parrainages ?? [];
  const meta = listData?.meta;
  const topParrains: TopParrain[] = topData?.topParrains ?? [];

  function handleSearch(val: string) {
    setSearchInput(val);
    const timeout = setTimeout(() => { setSearch(val); setPage(1); }, 400);
    return () => clearTimeout(timeout);
  }

  const isError = kpisError || listError;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-page-title text-primary">Parrainage</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Programme de parrainage multi-niveaux</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canSeeSites && (
            <select
              value={siteId}
              onChange={e => { setSiteId(e.target.value); setPage(1); }}
              className="text-sm"
            >
              <option value="">Tous les sites</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          )}
          <div className="period-toggle">
            {PERIODS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => { setPeriod(p.value); setPage(1); }}
                className={cn('period-btn', period === p.value && 'active')}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => refetch()} className="btn-secondary">
            <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpisLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card"><div className="skeleton h-16 rounded-lg" /></div>
          ))
        ) : (
          <>
            {/* Actifs */}
            <div className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-primary-accent" />
              </div>
              <div>
                <p className="font-black text-[28px] leading-none text-primary">{kpis?.totalActifs ?? 0}</p>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">Parrainages actifs</p>
                {typeof kpis?.totalActifsDelta === 'number' && (
                  <span className={cn(
                    'text-[11px] font-semibold mt-0.5 inline-block',
                    kpis.totalActifsDelta > 0 ? 'text-success' : kpis.totalActifsDelta < 0 ? 'text-danger' : 'text-text-muted',
                  )}>
                    {kpis.totalActifsDelta > 0 ? `↑ +${kpis.totalActifsDelta}` : kpis.totalActifsDelta < 0 ? `↓ ${kpis.totalActifsDelta}` : '= Stable'} ce mois
                  </span>
                )}
              </div>
            </div>

            {/* Récompenses */}
            <div className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Gift size={18} className="text-success" />
              </div>
              <div>
                <p className="font-black text-[28px] leading-none text-primary">{kpis?.recompensesVersees ?? 0}</p>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">Récompenses versées</p>
                <p className="text-[11px] text-text-subtle mt-0.5">Sur la période sélectionnée</p>
              </div>
            </div>

            {/* Meilleur parrain */}
            {kpis?.meilleurParrain ? (
              <div className="card bg-primary border-0 text-white flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold text-[14px]">
                  {kpis.meilleurParrain.prenom[0]}{kpis.meilleurParrain.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Award size={12} className="text-yellow-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Meilleur parrain</span>
                  </div>
                  <p className="font-bold text-[14px] truncate">{kpis.meilleurParrain.prenom} {kpis.meilleurParrain.nom}</p>
                  <p className="text-[12px] text-white/80">{kpis.meilleurParrain.nbFilleuls} filleuls</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/parrainage/tree/${kpis.meilleurParrain!.id}`)}
                  className="text-white/70 hover:text-white text-[11px] font-medium shrink-0 transition-colors"
                >
                  Voir →
                </button>
              </div>
            ) : (
              <div className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Award size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-black text-[28px] leading-none text-primary">—</p>
                  <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">Meilleur parrain</p>
                  <p className="text-[11px] text-text-subtle mt-0.5">Aucune activation ce mois</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-danger">
          <AlertCircle size={16} />
          Erreur de chargement des données de parrainage.
          <button type="button" onClick={() => refetch()} className="ml-auto underline hover:no-underline">Réessayer</button>
        </div>
      )}

      {/* Corps principal — tableau + top */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Tableau parrainages */}
        <div className="xl:col-span-2 space-y-3">
          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                type="text"
                placeholder="Nom parrain ou filleul..."
                value={searchInput}
                onChange={e => handleSearch(e.target.value)}
                className="pl-8 text-sm w-full"
              />
            </div>
            <select
              value={statut}
              onChange={e => { setStatut(e.target.value as StatutParrainage | ''); setPage(1); }}
              className="text-sm"
            >
              <option value="">Tous statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDE">Validé</option>
              <option value="RECOMPENSE_VERSEE">Récompense versée</option>
            </select>
          </div>

          <div className={cn('table-container transition-opacity', isFetching && 'opacity-70')}>
            <table>
              <thead>
                <tr>
                  <th>Parrain</th>
                  <th>Filleul</th>
                  <th>Statut</th>
                  <th>Récompense</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j}><div className="skeleton h-3 rounded w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : parrainages.map((p: ParrainageItem) => (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/parrainage/tree/${p.parrain.id}`)}
                        className={cn(
                          'cursor-pointer',
                          p.statut === 'EN_ATTENTE' && 'bg-yellow-50/60',
                          p.statut === 'RECOMPENSE_VERSEE' && 'bg-green-50/30',
                        )}
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                              {p.parrain.prenom[0]}{p.parrain.nom[0]}
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-primary leading-tight">
                                {p.parrain.prenom} {p.parrain.nom}
                              </p>
                              <p className="font-mono text-[10px] text-text-muted">{p.parrain.codeParrain}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0">
                              {p.filleul.prenom[0]}{p.filleul.nom[0]}
                            </div>
                            <div>
                              <p className="text-[13px] font-medium leading-tight">{p.filleul.prenom} {p.filleul.nom}</p>
                              <p className="text-[10px] text-text-muted">{p.filleul.telephone}</p>
                            </div>
                          </div>
                        </td>
                        <td><ParrainageStatusBadge statut={p.statut} size="sm" /></td>
                        <td className="font-mono text-[12px] text-success font-semibold">
                          {p.recompenseValeur
                            ? p.recompenseType === 'POINTS'
                              ? `${p.recompenseValeur} pts`
                              : formatCDF(p.recompenseValeur)
                            : '—'}
                        </td>
                        <td className="text-[12px] text-text-muted whitespace-nowrap">
                          {formatDate(p.dateCreation)}
                        </td>
                        <td>
                          <ChevronRight size={14} className="text-text-subtle" />
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>

            {!listLoading && parrainages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users2 size={36} className="text-text-subtle opacity-40" />
                <p className="text-[14px] font-semibold text-text-muted">
                  Aucun parrainage trouvé pour cette période.
                </p>
                {(search || statut) && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setSearchInput(''); setStatut(''); setPage(1); }}
                    className="btn-secondary text-[12px]"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-[12px] text-text-muted pt-1">
              <span>Page {meta.page} / {meta.totalPages} — {meta.total} résultat{meta.total > 1 ? 's' : ''}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-border-strong disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={13} /> Préc.
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-border-strong disabled:opacity-40 transition-colors"
                >
                  Suiv. <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Top 5 parrains */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Top 5 parrains</p>
            <span className="text-[10px] text-text-subtle">{PERIODS.find(p => p.value === period)?.label}</span>
          </div>

          {topLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-6 w-6 rounded-full" />
                  <div className="skeleton h-8 flex-1 rounded" />
                </div>
              ))
            : topParrains.length === 0
              ? (
                <div className="py-8 text-center">
                  <Users2 size={28} className="mx-auto text-text-subtle opacity-30 mb-2" />
                  <p className="text-[12px] text-text-muted">Aucune donnée disponible.</p>
                </div>
              )
              : topParrains.map((tp: TopParrain) => (
                  <div
                    key={tp.client.id}
                    onClick={() => navigate(`/parrainage/tree/${tp.client.id}`)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
                      RANK_COLORS[(tp.rang - 1) % RANK_COLORS.length],
                    )}>
                      {tp.rang}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                      {tp.client.prenom[0]}{tp.client.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{tp.client.prenom} {tp.client.nom}</p>
                      <p className="text-[11px] text-text-muted">{tp.nbFilleulsActifs} filleuls actifs</p>
                    </div>
                    <ChevronRight size={13} className="text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                ))
          }

          {topParrains.length > 0 && (
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => navigate('/parrainage/classement')}
                className="w-full text-[12px] text-primary-accent hover:text-primary font-medium text-center py-1.5 transition-colors"
              >
                Voir le classement complet →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
