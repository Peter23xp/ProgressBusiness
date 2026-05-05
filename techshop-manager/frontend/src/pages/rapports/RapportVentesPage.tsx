import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, ShoppingCart, Percent, Receipt, Download, AlertCircle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSalesDetailReport } from '@/hooks/useSalesDetailReport';
import { PeriodSelector } from '@/components/reports/PeriodSelector';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { getDateRangeFromPreset, type PeriodPreset, type DateRange, toISODate } from '@/lib/dateRange.utils';
import { formatCDF, formatDateTime, cn } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import type { VentesDetailParams, AgentPerformance } from '@/lib/reports.api';

// ── Types locaux ──────────────────────────────────────────────────────────────

interface SalesFilters {
  preset: PeriodPreset;
  dateRange: DateRange;
  siteId: string;
  agentId: string;
  modePaiement: string;
}

const DEFAULT_FILTERS: SalesFilters = {
  preset: 'this_month',
  dateRange: getDateRangeFromPreset('this_month'),
  siteId: '',
  agentId: '',
  modePaiement: '',
};

// ── Stat card avec trend ──────────────────────────────────────────────────────

function StatCard({
  label, value, trend, icon, isLoading,
}: {
  label: string;
  value: string;
  trend?: number;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <>
              <div className="skeleton h-6 w-28 rounded mb-1" />
              <div className="skeleton h-3 w-20 rounded" />
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-primary leading-tight">{value}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8 text-primary">
            {icon}
          </div>
          {trend !== undefined && !isLoading && trend !== 0 && (
            <span className={cn('flex items-center gap-0.5 text-xs font-semibold', trend > 0 ? 'text-success' : 'text-danger')}>
              {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Filtres ───────────────────────────────────────────────────────────────────

function FiltersPanel({
  draft, setDraft, onApply, onReset,
}: {
  draft: SalesFilters;
  setDraft: (f: SalesFilters) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const activeCount = [draft.siteId, draft.agentId, draft.modePaiement].filter(Boolean).length
    + (draft.preset !== 'this_month' ? 1 : 0);

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <PeriodSelector
          value={draft.preset}
          onChange={(p, r) => setDraft({ ...draft, preset: p, dateRange: r })}
        />
        {draft.preset === 'custom' && (
          <DateRangePicker
            value={draft.dateRange}
            onChange={(r) => setDraft({ ...draft, dateRange: r, preset: 'custom' })}
            maxDate={new Date()}
          />
        )}
        <select
          value={draft.siteId}
          onChange={(e) => setDraft({ ...draft, siteId: e.target.value })}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm"
          aria-label="Filtrer par site"
        >
          <option value="">Tous les sites</option>
          <option value="goma">Goma</option>
          <option value="bukavu">Bukavu</option>
          <option value="kinshasa">Kinshasa</option>
        </select>
        <select
          value={draft.modePaiement}
          onChange={(e) => setDraft({ ...draft, modePaiement: e.target.value })}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm"
          aria-label="Mode de paiement"
        >
          <option value="">Tous paiements</option>
          <option value="CASH">Cash</option>
          <option value="MPESA">M-Pesa</option>
          <option value="AIRTEL_MONEY">Airtel Money</option>
          <option value="VIREMENT">Virement</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onApply} className="btn-primary !min-h-0 h-8 text-xs px-4">
          Appliquer {activeCount > 0 && <span className="ml-1 rounded-full bg-white/20 px-1.5">{activeCount}</span>}
        </button>
        <button type="button" onClick={onReset} className="btn-secondary !min-h-0 h-8 text-xs px-3">
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

// ── Tableau ventes ────────────────────────────────────────────────────────────

function SalesDetailTable({
  ventes, meta, onPageChange, isLoading, isFetching,
}: {
  ventes: any[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  onPageChange: (p: number) => void;
  isLoading: boolean;
  isFetching: boolean;
}) {
  const navigate = useNavigate();
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  if (isLoading) {
    return (
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b">
          <div className="skeleton h-5 w-40 rounded" />
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-3 space-y-2">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const STATUT_STYLE: Record<string, string> = {
    VALIDE: 'badge-success',
    RETOURNEE: 'bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-2 py-0.5 rounded-full',
    RETOURNEE_PARTIELLE: 'badge-warning',
    ANNULEE: 'bg-gray-100 text-gray-500 border border-gray-200 text-xs font-semibold px-2 py-0.5 rounded-full',
  };

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-sm font-bold text-primary">
          Détail des ventes
          {isFetching && <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary-accent"><RefreshCw size={10} className="animate-spin" />Chargement…</span>}
        </h2>
        <span className="text-xs text-text-muted">{meta.total} résultat{meta.total !== 1 ? 's' : ''}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#1E3A5F' }}>
              {['N° Vente', 'Date', 'Client', 'Produit(s)', 'Agent', 'Site', 'Montant', 'Paiement', 'Remise', 'Points', 'Statut'].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-white whitespace-nowrap"
                  onClick={h === 'Date' ? () => setSortDir((d) => d === 'desc' ? 'asc' : 'desc') : undefined}
                  style={h === 'Date' ? { cursor: 'pointer' } : undefined}
                >
                  <span className="flex items-center gap-1">
                    {h}
                    {h === 'Date' && (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventes.length === 0 && (
              <tr>
                <td colSpan={11} className="py-10 text-center text-text-muted">
                  Aucune vente pour les filtres sélectionnés.
                </td>
              </tr>
            )}
            {ventes.map((v) => {
              const isProblematic = v.statut === 'RETOURNEE' || v.statut === 'ANNULEE';
              const remise = Number(v.remiseFidelite ?? 0) + Number(v.remiseParrainage ?? 0);
              const firstProduit = v.lignes?.[0]?.produit?.nom ?? '—';
              const extraCount = (v.lignes?.length ?? 1) - 1;
              return (
                <tr
                  key={v.id}
                  className={cn(
                    'border-b border-border/60 hover:bg-blue-50/40 transition-colors',
                    isProblematic && 'bg-gray-50',
                  )}
                >
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/sales/${v.id}`)}
                      className="font-mono text-xs font-semibold text-primary-accent hover:underline"
                    >
                      {v.numeroVente ?? v.id.slice(0, 8)}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-text-muted whitespace-nowrap">
                    {formatDateTime(v.createdAt)}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {v.client ? `${v.client.prenom} ${v.client.nom}`.slice(0, 18) : 'Anonyme'}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {firstProduit.slice(0, 18)}
                    {extraCount > 0 && <span className="ml-1 text-text-muted">+{extraCount}</span>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-text-muted">{v.agent?.nom ?? '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-text-muted">{v.site?.nom ?? '—'}</td>
                  <td className="px-3 py-2.5 font-mono text-xs font-bold text-primary">
                    {formatCDF(Number(v.montantNet ?? 0))}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    <span className="badge badge-info">{v.modePaiement}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {remise > 0
                      ? <span className="font-semibold text-danger">-{formatCDF(remise)}</span>
                      : <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {(v.pointsAttribues ?? 0) > 0
                      ? <span className="font-semibold text-success">+{v.pointsAttribues} pts</span>
                      : <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUT_STYLE[v.statut] ?? 'badge-gray')}>
                      {v.statut}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {meta.totalPages > 1 && (
        <div className="px-4 py-3 border-t">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

// ── Tableau performance agents ────────────────────────────────────────────────

function AgentPerformanceTable({ data, isLoading, onAgentClick }: {
  data: AgentPerformance[];
  isLoading: boolean;
  onAgentClick: (agentId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b"><div className="skeleton h-5 w-48 rounded" /></div>
        <div className="divide-y">
          {[...Array(4)].map((_, i) => <div key={i} className="px-4 py-3"><div className="skeleton h-4 w-full rounded" /></div>)}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const totals = {
    nbVentes: data.reduce((s, a) => s + a.nbVentes, 0),
    caTotal: data.reduce((s, a) => s + a.caTotal, 0),
    caMoyen: 0,
    remisesAccordees: data.reduce((s, a) => s + a.remisesAccordees, 0),
  };

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-bold text-primary">Performance par agent</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#1E3A5F' }}>
              {['Agent', 'Site', 'Nb ventes', 'CA total', 'CA moyen', 'Remises'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-white">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr
                key={a.agentId}
                onClick={() => onAgentClick(a.agentId)}
                className="border-b border-border/60 cursor-pointer hover:bg-blue-50/40"
              >
                <td className="px-4 py-2.5 font-semibold text-primary">{a.agentNom}</td>
                <td className="px-4 py-2.5 text-text-muted text-xs">{a.siteNom}</td>
                <td className="px-4 py-2.5 tabular-nums">{a.nbVentes}</td>
                <td className="px-4 py-2.5 font-bold text-success tabular-nums">{formatCDF(a.caTotal)}</td>
                <td className="px-4 py-2.5 text-text-muted tabular-nums">{formatCDF(a.caMoyen)}</td>
                <td className="px-4 py-2.5 tabular-nums text-danger">{a.remisesAccordees > 0 ? formatCDF(a.remisesAccordees) : '—'}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-primary/30 bg-slate-50">
              <td className="px-4 py-2.5 font-bold text-primary" colSpan={2}>TOTAL</td>
              <td className="px-4 py-2.5 font-bold tabular-nums">{totals.nbVentes}</td>
              <td className="px-4 py-2.5 font-bold text-success tabular-nums">{formatCDF(totals.caTotal)}</td>
              <td className="px-4 py-2.5 text-text-muted">—</td>
              <td className="px-4 py-2.5 font-bold text-danger tabular-nums">{totals.remisesAccordees > 0 ? formatCDF(totals.remisesAccordees) : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RapportVentesPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isDR = hasRole('DIRECTEUR_REGIONAL');

  const [draft, setDraft] = useState<SalesFilters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<SalesFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [agentFilter, setAgentFilter] = useState('');

  const params: VentesDetailParams = {
    siteId: applied.siteId || undefined,
    agentId: agentFilter || applied.agentId || undefined,
    modePaiement: applied.modePaiement || undefined,
    dateDebut: toISODate(applied.dateRange.from),
    dateFin: toISODate(applied.dateRange.to),
    page,
    limit: 50,
  };

  const { data, isLoading, isFetching, error, refetch } = useSalesDetailReport(params);

  const ventes = useMemo(() => (data as any)?.ventes ?? [], [data]);
  const meta = useMemo(() => (data as any)?.meta ?? { total: 0, page: 1, limit: 50, totalPages: 0 }, [data]);
  const resume = useMemo(() => (data as any)?.resume ?? { totalCA: 0, nbVentes: 0, remisesAccordees: 0, ticketMoyen: 0, trends: { ca: 0, ventes: 0 } }, [data]);
  const totauxParAgent = useMemo(() => (data as any)?.totauxParAgent ?? [], [data]);

  const handleApply = () => { setApplied(draft); setPage(1); setAgentFilter(''); };
  const handleReset = () => { setDraft(DEFAULT_FILTERS); setApplied(DEFAULT_FILTERS); setPage(1); setAgentFilter(''); };
  const handleAgentClick = (agentId: string) => { setAgentFilter(agentId); setPage(1); };

  const exportUrl = `/reports/export?type=VENTES_DETAIL&dateDebut=${toISODate(applied.dateRange.from)}&dateFin=${toISODate(applied.dateRange.to)}${applied.siteId ? `&siteId=${applied.siteId}` : ''}`;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <AlertCircle size={36} className="text-danger" />
        <p className="text-sm font-semibold text-primary">Impossible de charger le rapport.</p>
        <button type="button" onClick={() => refetch()} className="btn-primary flex items-center gap-2">
          <RefreshCw size={14} /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/reports')} className="btn-ghost !min-h-0 !p-1.5 rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-page-title text-primary">Rapport Ventes Détaillé</h1>
            <p className="text-xs text-text-muted">Analyse ligne par ligne des transactions</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(exportUrl)}
          className="btn-secondary !min-h-0 h-9 text-xs flex items-center gap-1.5"
        >
          <Download size={13} />
          Export PDF/XLSX
        </button>
      </div>

      {/* Filtres */}
      <FiltersPanel draft={draft} setDraft={setDraft} onApply={handleApply} onReset={handleReset} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="CA Total" value={formatCDF(resume.totalCA)} trend={resume.trends?.ca} icon={<TrendingUp size={16} />} isLoading={isLoading} />
        <StatCard label="Nb ventes" value={String(resume.nbVentes)} trend={resume.trends?.ventes} icon={<ShoppingCart size={16} />} isLoading={isLoading} />
        <StatCard label="Remises accordées" value={formatCDF(resume.remisesAccordees)} icon={<Percent size={16} />} isLoading={isLoading} />
        <StatCard label="Ticket moyen" value={formatCDF(resume.ticketMoyen)} icon={<Receipt size={16} />} isLoading={isLoading} />
      </div>

      {/* Tableau ventes */}
      <SalesDetailTable
        ventes={ventes}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading}
        isFetching={isFetching}
      />

      {/* Performance agents */}
      <AgentPerformanceTable
        data={totauxParAgent}
        isLoading={isLoading}
        onAgentClick={handleAgentClick}
      />
    </div>
  );
}
