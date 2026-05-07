import { useState, type ReactNode } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import {
  ArrowLeft, Star, TrendingUp, TrendingDown, Gift, RefreshCw,
  ShoppingCart, AlertCircle, ChevronLeft, ChevronRight, Search,
} from 'lucide-react';
import { fideliteApi, NIVEAU_COLORS, NIVEAU_LABELS, type TypeMouvementPoints, type PointsFilters } from '@/lib/fidelite.api';
import { formatUSD, formatDate, cn } from '@/lib/utils';
import type { NiveauFidelite } from '@/types';

const NIVEAU_ORDER: NiveauFidelite[] = ['BRONZE', 'ARGENT', 'OR', 'PLATINE'];
const NIVEAU_SEUILS: Record<NiveauFidelite, number> = {
  BRONZE: 0,
  ARGENT: 500,
  OR: 2000,
  PLATINE: 5000,
};

const TYPE_ICONS: Record<TypeMouvementPoints, { icon: ReactNode; positive: boolean }> = {
  ACHAT: { icon: <ShoppingCart size={13} />, positive: true },
  PARRAINAGE: { icon: <Gift size={13} />, positive: true },
  AVOIR_RETOUR: { icon: <TrendingUp size={13} />, positive: true },
  RETOUR: { icon: <TrendingDown size={13} />, positive: false },
  EXPIRATION: { icon: <AlertCircle size={13} />, positive: false },
  AJUSTEMENT_ADMIN: { icon: <Star size={13} />, positive: true },
};

const TYPE_LABELS: Record<TypeMouvementPoints, string> = {
  ACHAT: 'Achat',
  PARRAINAGE: 'Parrainage',
  AVOIR_RETOUR: 'Avoir/Retour',
  RETOUR: 'Retour',
  EXPIRATION: 'Expiration',
  AJUSTEMENT_ADMIN: 'Ajustement',
};

function NiveauBadge({ niveau }: { niveau: NiveauFidelite }) {
  const color = NIVEAU_COLORS[niveau];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}22`, color }}
    >
      <Star size={10} fill={color} />
      {NIVEAU_LABELS[niveau]}
    </span>
  );
}

function NiveauProgressBar({ niveau, points }: { niveau: NiveauFidelite; points: number }) {
  const idx = NIVEAU_ORDER.indexOf(niveau);
  const next = NIVEAU_ORDER[idx + 1] as NiveauFidelite | undefined;
  const seuilCurrent = NIVEAU_SEUILS[niveau];
  const seuilNext = next ? NIVEAU_SEUILS[next] : null;
  const color = NIVEAU_COLORS[niveau];
  const nextColor = next ? NIVEAU_COLORS[next] : color;

  const pct = seuilNext
    ? Math.min(100, ((points - seuilCurrent) / (seuilNext - seuilCurrent)) * 100)
    : 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <NiveauBadge niveau={niveau} />
        {next ? (
          <span className="text-text-muted font-medium">
            {(seuilNext! - points).toLocaleString()} pts vers {NIVEAU_LABELS[next]}
          </span>
        ) : (
          <span className="text-[11px] font-semibold" style={{ color }}>Niveau maximum — PLATINE</span>
        )}
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${nextColor})`,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-text-muted">
        <span>{seuilCurrent.toLocaleString()} pts</span>
        <span className="font-mono font-semibold text-primary">{points.toLocaleString()} pts</span>
        {seuilNext && <span>{seuilNext.toLocaleString()} pts</span>}
      </div>
    </div>
  );
}

export default function ClientPointsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState<TypeMouvementPoints | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const mouvFilters: PointsFilters = {
    type: typeFilter || undefined,
    search: search || undefined,
    page,
    limit: 15,
    sortOrder,
  };

  const { data: clientData, isLoading: clientLoading } = useQuery({
    queryKey: ['fidelite', 'client', id],
    queryFn: () => fideliteApi.getClientData(id!),
    staleTime: 3 * 60_000,
    enabled: !!id,
  });

  const { data: mouvData, isLoading: mouvLoading, isFetching } = useQuery({
    queryKey: ['fidelite', 'client', id, 'mouvements', mouvFilters],
    queryFn: () => fideliteApi.getClientMouvements(id!, mouvFilters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    enabled: !!id,
  });

  function handleSearch(val: string) {
    setSearchInput(val);
    const t = setTimeout(() => { setSearch(val); setPage(1); }, 400);
    return () => clearTimeout(t);
  }

  if (clientLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="skeleton h-9 w-9 rounded-lg" />
          <div className="skeleton h-6 w-48 rounded" />
        </div>
        <div className="card"><div className="skeleton h-48 rounded-xl" /></div>
        <div className="card"><div className="skeleton h-64 rounded-xl" /></div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-3">
        <AlertCircle size={36} className="text-danger mx-auto opacity-60" />
        <h2 className="text-[16px] font-bold text-primary">Client introuvable</h2>
        <button type="button" onClick={() => navigate('/fidelite')} className="btn-secondary text-[13px]">
          <ArrowLeft size={14} /> Retour fidélité
        </button>
      </div>
    );
  }

  const { client } = clientData;
  const mouvements = mouvData?.mouvements ?? [];
  const meta = mouvData?.meta;
  const summary = mouvData?.summary;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/clients/${id}`)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:border-border-strong hover:text-text transition-colors"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h1 className="text-[18px] font-extrabold text-primary">Points de fidélité</h1>
          <p className="text-[12px] text-text-muted">{client.prenom} {client.nom}</p>
        </div>
      </div>

      {/* Profil fidélité */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-[18px] shadow shrink-0"
              style={{ backgroundColor: NIVEAU_COLORS[client.niveauFidelite] }}
            >
              {client.prenom[0]}{client.nom[0]}
            </div>
            <div>
              <h2 className="font-bold text-[18px] text-primary">{client.prenom} {client.nom}</h2>
              <p className="text-[12px] text-text-muted mt-0.5">{client.siteNom}</p>
              <div className="mt-1.5">
                <NiveauBadge niveau={client.niveauFidelite} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black text-[36px] leading-none" style={{ color: NIVEAU_COLORS[client.niveauFidelite] }}>
              {client.pointsFidelite.toLocaleString()}
            </p>
            <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">points actuels</p>
            <p className="text-[12px] text-success font-semibold mt-1">Remise {client.remisePct}%</p>
          </div>
        </div>

        <NiveauProgressBar niveau={client.niveauFidelite} points={client.pointsFidelite} />
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <p className="font-black text-[22px] text-success leading-none">{(client.totalPointsGagnes ?? 0).toLocaleString()}</p>
          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mt-1">Total gagné</p>
        </div>
        <div className="card text-center py-3">
          <p className="font-black text-[22px] text-danger leading-none">{(client.totalPointsDeduits ?? 0).toLocaleString()}</p>
          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mt-1">Total déduit</p>
        </div>
        <div className="card text-center py-3">
          <p className="font-black text-[22px] text-primary leading-none" style={{ color: NIVEAU_COLORS[client.niveauFidelite] }}>
            {client.pointsFidelite.toLocaleString()}
          </p>
          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mt-1">Solde actuel</p>
        </div>
      </div>

      {/* Historique mouvements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[13px] font-bold text-primary">Historique des mouvements</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchInput}
                onChange={e => handleSearch(e.target.value)}
                className="pl-8 text-sm w-40"
              />
            </div>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as TypeMouvementPoints | ''); setPage(1); }}
              className="text-sm"
            >
              <option value="">Tous les types</option>
              {(Object.keys(TYPE_LABELS) as TypeMouvementPoints[]).map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}
              className="btn-secondary text-[11px] gap-1"
            >
              <RefreshCw size={11} />
              {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
            </button>
          </div>
        </div>

        {summary && (
          <div className="flex items-center gap-4 text-[11px] text-text-muted px-1">
            <span>Total période : <span className="text-success font-bold">+{summary.totalGagne.toLocaleString()} pts</span></span>
            <span><span className="text-danger font-bold">-{summary.totalDeduit.toLocaleString()} pts</span></span>
          </div>
        )}

        <div className={cn('table-container transition-opacity', isFetching && 'opacity-70')}>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Delta</th>
                <th>Solde avant</th>
                <th>Solde après</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {mouvLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j}><div className="skeleton h-3 rounded w-full" /></td>
                      ))}
                    </tr>
                  ))
                : mouvements.map(m => {
                    const typeCfg = TYPE_ICONS[m.type as TypeMouvementPoints];
                    const isPositive = m.deltaPoints > 0;
                    return (
                      <tr key={m.id}>
                        <td>
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            isPositive ? 'bg-green-100 text-success' : 'bg-red-100 text-danger',
                          )}>
                            {typeCfg?.icon}
                            {TYPE_LABELS[m.type as TypeMouvementPoints] ?? m.type}
                          </span>
                        </td>
                        <td className="text-[12px] text-text-muted max-w-[220px] truncate">
                          {m.venteId ? (
                            <Link
                              to={`/ventes/${m.venteId}`}
                              className="text-primary-accent hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              {m.description}
                            </Link>
                          ) : m.description}
                        </td>
                        <td className={cn('font-mono text-[12px] font-bold', isPositive ? 'text-success' : 'text-danger')}>
                          {isPositive ? '+' : ''}{m.deltaPoints}
                        </td>
                        <td className="font-mono text-[12px] text-text-muted">{m.soldeBefore.toLocaleString()}</td>
                        <td className="font-mono text-[12px] font-semibold text-primary">{m.soldeAfter.toLocaleString()}</td>
                        <td className="text-[12px] text-text-muted whitespace-nowrap">{formatDate(m.createdAt)}</td>
                      </tr>
                    );
                  })
              }
              {!mouvLoading && mouvements.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted text-[13px]">
                    Aucun mouvement{typeFilter ? ` de type ${TYPE_LABELS[typeFilter]}` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-[12px] text-text-muted pt-1">
            <span>Page {meta.page} / {meta.totalPages} — {meta.total} mouvement{meta.total > 1 ? 's' : ''}</span>
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
    </div>
  );
}
