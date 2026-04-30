import { useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { ClientLevelBadge } from '@/components/clients/ClientLevelBadge';
import type { ClientDetail } from '@/lib/clients.api';
import type { NiveauFidelite } from '@/types';

interface ClientPointsTabProps {
  client: ClientDetail;
}

type TypeFilter = '' | 'ACHAT' | 'PARRAINAGE' | 'REMISE' | 'EXPIRATION';

const TYPE_CONFIG: Record<string, { label: string; classes: string; sign: string }> = {
  ACHAT:      { label: 'Achat',       classes: 'bg-green-100 text-success',        sign: '+' },
  PARRAINAGE: { label: 'Parrainage',  classes: 'bg-blue-100 text-primary-accent',  sign: '+' },
  REMISE:     { label: 'Remise',      classes: 'bg-amber-100 text-warning',         sign: '-' },
  EXPIRATION: { label: 'Expiration',  classes: 'bg-red-100 text-danger',           sign: '-' },
};

interface NiveauInfo {
  niveau: NiveauFidelite;
  label: string;
  seuil: number;
  plafond: number | null;
  remise: string;
  avantage: string;
  barColor: string;
}

const NIVEAUX: NiveauInfo[] = [
  { niveau: 'BRONZE',  label: 'Bronze',  seuil: 0,     plafond: 999,   remise: '0%',  avantage: 'Accès aux promotions standard',      barColor: 'bg-amber-600' },
  { niveau: 'ARGENT',  label: 'Argent',  seuil: 1000,  plafond: 4999,  remise: '3%',  avantage: 'Livraison prioritaire',               barColor: 'bg-slate-400' },
  { niveau: 'OR',      label: 'Or',      seuil: 5000,  plafond: 14999, remise: '5%',  avantage: 'Accès aux ventes privées',            barColor: 'bg-yellow-500' },
  { niveau: 'PLATINE', label: 'Platine', seuil: 15000, plafond: null,  remise: '8%',  avantage: 'Service dédié + cadeaux exclusifs',   barColor: 'bg-violet-600' },
];

const NIVEAU_BAR_COLOR: Record<NiveauFidelite, string> = {
  BRONZE:  'bg-amber-600',
  ARGENT:  'bg-slate-400',
  OR:      'bg-yellow-500',
  PLATINE: 'bg-violet-600',
};

const PAGE_SIZE = 10;

function progressToNextLevel(points: number, niveau: NiveauFidelite): { pct: number; manquants: number | null; prochainNiveau: NiveauFidelite | null } {
  const idx = NIVEAUX.findIndex((n) => n.niveau === niveau);
  if (idx === -1 || idx === NIVEAUX.length - 1) {
    return { pct: 100, manquants: null, prochainNiveau: null };
  }
  const current = NIVEAUX[idx];
  const next = NIVEAUX[idx + 1];
  const range = next.seuil - current.seuil;
  const progress = points - current.seuil;
  const pct = Math.min(100, Math.round((progress / range) * 100));
  const manquants = next.seuil - points;
  return { pct, manquants, prochainNiveau: next.niveau };
}

export function ClientPointsTab({ client }: ClientPointsTabProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('');
  const [page, setPage] = useState(1);

  const mouvements = client.mouvementsPoints ?? [];
  const filtered = typeFilter ? mouvements.filter((m) => m.type === typeFilter) : mouvements;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const { pct, manquants, prochainNiveau } = progressToNextLevel(
    client.pointsFidelite,
    client.niveauFidelite,
  );

  const barColor = NIVEAU_BAR_COLOR[client.niveauFidelite];

  const handleTypeFilter = (t: TypeFilter) => {
    setTypeFilter(t);
    setPage(1);
  };

  return (
    <div className="space-y-6">

      {/* Section A — Solde + progression */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Solde et niveau</p>

        {/* Solde card */}
        <div className="rounded-xl bg-bg border border-border px-5 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-1">Solde actuel</p>
              <p className="text-[32px] font-extrabold font-mono text-text leading-none">
                {client.pointsFidelite.toLocaleString('fr')}
                <span className="text-[16px] font-bold text-text-muted ml-2">pts</span>
              </p>
              {client.pointsCumules > 0 && (
                <p className="text-[11px] text-text-muted mt-1.5 flex items-center gap-1">
                  <TrendingUp size={11} aria-hidden />
                  {client.pointsCumules.toLocaleString('fr')} pts cumulés depuis l'activation
                </p>
              )}
            </div>
            <ClientLevelBadge niveau={client.niveauFidelite} size="md" />
          </div>

          {/* Barre de progression */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-text-muted">
              <span>{client.niveauFidelite}</span>
              {prochainNiveau ? (
                <span>{prochainNiveau} dans {manquants?.toLocaleString('fr')} pts</span>
              ) : (
                <span className="text-violet-600 font-semibold">Niveau maximum atteint</span>
              )}
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={cn('h-full rounded-full transition-all duration-500', barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tableau des niveaux */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm" aria-label="Niveaux de fidélité">
            <thead>
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted">Niveau</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted">Seuil</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted hidden sm:table-cell">Remise</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-text-muted hidden md:table-cell">Avantage</th>
              </tr>
            </thead>
            <tbody>
              {NIVEAUX.map((n, i) => {
                const isActive = n.niveau === client.niveauFidelite;
                return (
                  <tr
                    key={n.niveau}
                    className={cn(
                      'border-b border-border/60 last:border-b-0',
                      isActive ? 'bg-primary-light/40' : i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]',
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {isActive && <Star size={11} className="text-primary-accent fill-primary-accent flex-shrink-0" aria-hidden />}
                        <ClientLevelBadge niveau={n.niveau} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-mono text-text-muted">
                      {n.seuil.toLocaleString('fr')} {n.plafond ? `– ${n.plafond.toLocaleString('fr')}` : '+'} pts
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-bold text-text hidden sm:table-cell">{n.remise}</td>
                    <td className="px-4 py-2.5 text-[12px] text-text-muted hidden md:table-cell">{n.avantage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section B — Historique mouvements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
            Historique des mouvements
          </p>
          {/* Filtre type */}
          <div className="period-toggle" role="group" aria-label="Type de mouvement">
            {(['', 'ACHAT', 'PARRAINAGE', 'REMISE', 'EXPIRATION'] as TypeFilter[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeFilter(t)}
                className={cn('period-btn', typeFilter === t && 'active')}
              >
                {t === '' ? 'Tous' : TYPE_CONFIG[t].label}
              </button>
            ))}
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted" role="status">
            <Star size={28} className="mb-2 opacity-20" aria-hidden />
            <p className="text-[13px] font-medium text-text">Aucun mouvement sur ce filtre.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm" aria-label="Historique des mouvements de points">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Description</th>
                    <th className="px-4 py-3 text-right">Δ Points</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Solde après</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((m, i) => {
                    const cfg = TYPE_CONFIG[m.type] ?? TYPE_CONFIG.ACHAT;
                    const isPositive = m.delta > 0;
                    return (
                      <tr
                        key={m.id}
                        className={cn(
                          'border-b border-border/60 last:border-b-0 transition-colors',
                          i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]',
                        )}
                      >
                        <td className="px-4 py-3 text-[12px] text-text-muted whitespace-nowrap">
                          {formatDate(m.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                            cfg.classes,
                          )}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-text hidden md:table-cell max-w-[200px] truncate">
                          {m.description}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            'text-[13px] font-bold font-mono',
                            isPositive ? 'text-success' : 'text-danger',
                          )}>
                            {isPositive ? '+' : ''}{m.delta.toLocaleString('fr')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right hidden sm:table-cell">
                          <span className="text-[12px] font-mono text-text-muted">
                            {m.soldeApres.toLocaleString('fr')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination locale */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 px-1">
                <p className="text-[11px] text-text-muted">
                  {filtered.length} mouvement{filtered.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-2.5 py-1.5 rounded-lg border border-border text-[12px] font-medium text-text-muted hover:text-text hover:border-border-strong transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <span className="px-3 py-1.5 text-[12px] text-text-muted">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-2.5 py-1.5 rounded-lg border border-border text-[12px] font-medium text-text-muted hover:text-text hover:border-border-strong transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
