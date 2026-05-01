import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  TrendingDown,
  FileText,
  ChevronRight,
  Download,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF, formatDateTime, cn } from '@/lib/utils';
import { useSites } from '@/hooks/useSites';
import { useAuthStore } from '@/store/auth.store';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RetourJournal {
  id: string;
  numeroAvoir: string | null;
  motif: string;
  modeRemboursement: string;
  montantRembourse: number;
  createdAt: string;
  vente: {
    id: string;
    numeroVente: string;
    site: { id: string; nom: string };
    client?: { id: string; prenom: string; nom: string; telephone: string } | null;
    agent: { id: string; nom: string };
  };
  lignes: Array<{
    produit: { id: string; nom: string; sku: string };
    quantite: number;
  }>;
}

interface JournalResponse {
  retours: RetourJournal[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  kpis: { totalRembourse: number; nbRetours: number };
}

const MOTIF_LABELS: Record<string, string> = {
  DEFECTUEUX: 'Défectueux',
  MAUVAISE_COMMANDE: 'Mauvaise commande',
  NON_CONFORME: 'Non conforme',
  CHANGE_AVIS: "Changement d'avis",
  AUTRE: 'Autre',
};

const MODE_LABELS: Record<string, string> = {
  CASH: 'Cash',
  MOBILE_MONEY: 'Mobile Money',
  AVOIR_POINTS: 'Points fidélité',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JournalRetoursPage() {
  const { user } = useAuthStore();
  const { sites } = useSites();
  const isAgent = user?.role === 'AGENT';

  const today = new Date().toISOString().slice(0, 10);
  const [siteId, setSiteId] = useState(user?.siteId ?? '');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(1);

  const params: Record<string, string | number> = { page, limit: 50 };
  if (siteId) params.siteId = siteId;
  if (dateDebut) params.dateDebut = dateDebut;
  if (dateFin) params.dateFin = dateFin;

  const { data, isLoading } = useQuery<JournalResponse>({
    queryKey: ['journal-retours', siteId, dateDebut, dateFin, page],
    queryFn: () => api.get('/ventes/journal-retours', { params }).then((r) => r.data),
    staleTime: 60_000,
  });

  const handleExportCsv = () => {
    if (!data?.retours.length) return;
    const rows = [
      ['Avoir', 'Date', 'Vente', 'Client', 'Agent', 'Site', 'Motif', 'Mode', 'Montant TTC'],
      ...data.retours.map((r) => [
        r.numeroAvoir ?? '',
        new Date(r.createdAt).toLocaleDateString('fr-FR'),
        r.vente.numeroVente,
        r.vente.client ? `${r.vente.client.prenom} ${r.vente.client.nom}` : 'Anonyme',
        r.vente.agent.nom,
        r.vente.site.nom,
        MOTIF_LABELS[r.motif] ?? r.motif,
        MODE_LABELS[r.modeRemboursement] ?? r.modeRemboursement,
        r.montantRembourse.toString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-retours-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-extrabold text-primary flex items-center gap-2">
            <RotateCcw size={20} className="text-danger" />
            Journal des retours
          </h1>
          <p className="text-[13px] text-text-muted mt-0.5">Avoirs commerciaux OHADA — traçabilité complète</p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!data?.retours.length}
          className="btn-secondary flex items-center gap-1.5 text-[13px] disabled:opacity-40"
        >
          <Download size={14} />
          Exporter CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-white px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-danger" />
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Total remboursé</p>
          </div>
          {isLoading
            ? <div className="skeleton h-7 w-28 rounded" />
            : <p className="text-[20px] font-black text-danger">{formatCDF(data?.kpis.totalRembourse ?? 0)}</p>}
        </div>
        <div className="rounded-xl border border-border bg-white px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted mb-1">Nb retours</p>
          {isLoading
            ? <div className="skeleton h-7 w-16 rounded" />
            : <p className="text-[20px] font-black text-text">{data?.kpis.nbRetours ?? 0}</p>}
        </div>
      </div>

      {/* Filtres */}
      <div className="rounded-xl border border-border bg-white px-4 py-3 flex flex-wrap gap-3 items-end">
        {!isAgent && (
          <div className="form-group mb-0 min-w-[140px]">
            <label className="form-label text-[11px]">Site</label>
            <select
              value={siteId}
              onChange={(e) => { setSiteId(e.target.value); setPage(1); }}
              className="text-[13px] px-3 py-2 rounded-lg border border-border bg-white w-full focus:outline-none focus:ring-2 focus:ring-primary-accent/30"
            >
              <option value="">Tous les sites</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
        )}
        <div className="form-group mb-0">
          <label className="form-label text-[11px]">Date début</label>
          <input
            type="date"
            value={dateDebut}
            max={today}
            onChange={(e) => { setDateDebut(e.target.value); setPage(1); }}
            className="text-[13px] px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-accent/30"
          />
        </div>
        <div className="form-group mb-0">
          <label className="form-label text-[11px]">Date fin</label>
          <input
            type="date"
            value={dateFin}
            max={today}
            onChange={(e) => { setDateFin(e.target.value); setPage(1); }}
            className="text-[13px] px-3 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-accent/30"
          />
        </div>
        {(dateDebut || dateFin || siteId) && (
          <button
            type="button"
            onClick={() => { setDateDebut(''); setDateFin(''); setSiteId(user?.siteId ?? ''); setPage(1); }}
            className="text-[12px] text-text-muted hover:text-danger transition-colors self-end pb-2"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : !data?.retours.length ? (
          <div className="py-16 text-center">
            <RotateCcw size={32} className="mx-auto text-text-muted opacity-30 mb-3" />
            <p className="text-[14px] font-semibold text-text">Aucun retour trouvé</p>
            <p className="text-[12px] text-text-muted mt-1">Ajustez les filtres ou la période.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wide text-text-muted">
                    <th className="px-4 py-2.5">Avoir</th>
                    <th className="px-4 py-2.5">Vente</th>
                    <th className="px-4 py-2.5 hidden sm:table-cell">Client</th>
                    <th className="px-4 py-2.5 hidden md:table-cell">Motif</th>
                    <th className="px-4 py-2.5 hidden md:table-cell">Mode</th>
                    <th className="px-4 py-2.5 text-right">Montant</th>
                    <th className="px-4 py-2.5 hidden lg:table-cell">Date</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.retours.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        {r.numeroAvoir
                          ? <span className="font-mono text-[12px] font-semibold text-primary-accent">{r.numeroAvoir}</span>
                          : <span className="text-[11px] text-text-muted italic">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/sales/${r.vente.id}`} className="font-mono text-[12px] text-text hover:text-primary-accent hover:underline">
                          {r.vente.numeroVente}
                        </Link>
                        <p className="text-[10px] text-text-muted">{r.vente.site.nom}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-[12px] text-text-muted">
                        {r.vente.client
                          ? <><p className="font-semibold text-text">{r.vente.client.prenom} {r.vente.client.nom}</p><p className="text-[10px]">{r.vente.client.telephone}</p></>
                          : <span className="italic">Anonyme</span>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[12px] text-text-muted">
                        {MOTIF_LABELS[r.motif] ?? r.motif}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[12px] text-text-muted">
                        {MODE_LABELS[r.modeRemboursement] ?? r.modeRemboursement}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[13px] font-bold text-danger">
                        {formatCDF(r.montantRembourse)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-[12px] text-text-muted">
                        {formatDateTime(r.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/sales/retours/${r.id}/avoir`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-[11px] font-semibold text-text hover:bg-primary-light hover:text-primary-accent transition-colors"
                            title="Voir l'avoir"
                          >
                            <FileText size={11} />Avoir
                          </Link>
                          <Link
                            to={`/sales/retours/${r.id}/ecritures`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-[11px] font-semibold text-text hover:bg-primary-light hover:text-primary-accent transition-colors"
                            title="Écritures OHADA"
                          >
                            OHADA<ChevronRight size={11} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-[12px] text-text-muted">{data.meta.total} retour{data.meta.total > 1 ? 's' : ''}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-[12px] px-3 py-1.5 disabled:opacity-40">← Précédent</button>
                  <span className="text-[12px] text-text-muted">{page} / {data.meta.totalPages}</span>
                  <button type="button" onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="btn-secondary text-[12px] px-3 py-1.5 disabled:opacity-40">Suivant →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
