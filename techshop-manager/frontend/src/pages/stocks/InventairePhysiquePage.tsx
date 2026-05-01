import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ClipboardList, CheckCircle2, AlertCircle, Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useSites } from '@/hooks/useSites';
import { stocksApi } from '@/lib/stocks.api';
import { StockStatusBadge } from '@/components/stocks/StockStatusBadge';
import { getStockStatut } from '@/lib/stocks.api';
import { cn } from '@/lib/utils';
import type { InventoryAdjustment, PhysicalInventoryProduct } from '@/lib/stocks.api';

type FilterMode = 'all' | 'ecart' | 'noncompte' | 'ok';

export default function InventairePhysiquePage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuthStore();
  const qc = useQueryClient();

  const canAccess = hasRole('GERANT');
  const { sites } = useSites();
  const defaultSiteId = user?.siteId ?? '';

  const [siteId, setSiteId] = useState(defaultSiteId);
  const [dateInventaire, setDateInventaire] = useState(new Date().toISOString().split('T')[0]);
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<{
    ajustements: InventoryAdjustment[];
    totalAjustements: number;
    totalSurplus: number;
    totalPertes: number;
    nonComptes: number;
  } | null>(null);

  const sessionKey = `inventory_${siteId}_${dateInventaire}`;

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['inventory-products', siteId],
    queryFn: () => stocksApi.getPhysicalInventoryProducts(siteId),
    enabled: !!siteId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const products: PhysicalInventoryProduct[] = productsData?.produits ?? [];

  // Restore from sessionStorage
  useEffect(() => {
    if (!siteId) return;
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) setCounts(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [siteId, sessionKey]);

  // Save to sessionStorage on change
  useEffect(() => {
    if (!siteId || Object.keys(counts).length === 0) return;
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(counts));
    } catch { /* ignore */ }
  }, [counts, siteId, sessionKey]);

  // Warn before unload
  useEffect(() => {
    const hasData = Object.values(counts).some(v => v !== null);
    if (!hasData) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "L'inventaire en cours sera perdu. Quitter quand même ?";
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [counts]);

  const mutation = useMutation({
    mutationFn: () => {
      const lignes = Object.entries(counts)
        .filter(([, v]) => v !== null)
        .map(([produitId, quantiteComptee]) => ({ produitId, quantiteComptee: quantiteComptee! }));
      return stocksApi.submitPhysicalInventory({ siteId, dateInventaire, lignes });
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['stock-alerts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      sessionStorage.removeItem(sessionKey);
      setConfirmOpen(false);
      setResult(res);
    },
    onError: (error: any) => {
      setConfirmOpen(false);
      const code = error?.response?.data?.code;
      if (code === 'ERR_INVENTORY_LOCK') {
        toast.error('Un inventaire a déjà été soumis pour ce site dans les dernières 24h.');
      } else {
        toast.error('Erreur lors de la validation de l\'inventaire.');
      }
    },
  });

  const setCount = useCallback((produitId: string, value: number | null) => {
    setCounts(prev => ({ ...prev, [produitId]: value }));
  }, []);

  if (!canAccess) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-3">
        <AlertCircle size={36} className="text-warning mx-auto opacity-60" />
        <h2 className="text-[16px] font-bold text-primary">Accès refusé</h2>
        <p className="text-[13px] text-text-muted">Cette page est réservée aux Gérants et Super-Admins.</p>
        <button type="button" onClick={() => navigate('/stocks')} className="btn-secondary text-[13px]">
          <ArrowLeft size={14} /> Retour
        </button>
      </div>
    );
  }

  const counted = products.filter(p => counts[p.produitId] !== null && counts[p.produitId] !== undefined);
  const total = products.length;
  const progress = total > 0 ? Math.round((counted.length / total) * 100) : 0;

  function getEcart(p: PhysicalInventoryProduct): number | null {
    const v = counts[p.produitId];
    if (v === null || v === undefined) return null;
    return v - p.stockSysteme;
  }

  const filteredProducts = products.filter(p => {
    const ecart = getEcart(p);
    if (filterMode === 'ecart') return ecart !== null && ecart !== 0;
    if (filterMode === 'noncompte') return counts[p.produitId] === null || counts[p.produitId] === undefined;
    if (filterMode === 'ok') return ecart === 0;
    return true;
  });

  // Résumé pour la dialog
  const countedCount = counted.length;
  const withEcart = products.filter(p => { const e = getEcart(p); return e !== null && e !== 0; }).length;
  const positifs = products.reduce((sum, p) => { const e = getEcart(p); return e && e > 0 ? sum + e : sum; }, 0);
  const negatifs = products.reduce((sum, p) => { const e = getEcart(p); return e && e < 0 ? sum + Math.abs(e) : sum; }, 0);

  function exportCSV() {
    if (!result) return;
    const rows = [
      ['SKU', 'Nom', 'Avant', 'Après', 'Écart', 'Type'],
      ...result.ajustements.map(a => [a.sku, a.produitNom, a.avant, a.apres, a.ecart, a.ecart > 0 ? 'Surplus' : a.ecart < 0 ? 'Perte' : 'Inchangé']),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventaire-${siteId}-${dateInventaire}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Phase 2 : résultat
  if (result) {
    const siteNom = sites.find(s => s.id === siteId)?.nom ?? siteId;
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/stocks')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text transition-colors">
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="text-[18px] font-extrabold text-primary">Inventaire physique — {siteNom}</h1>
            <p className="text-[12px] text-text-muted">{new Date(dateInventaire).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <CheckCircle2 size={18} className="text-success" />
          <p className="text-[14px] font-bold text-success">Inventaire validé avec succès !</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Comptés', value: countedCount, cls: 'text-primary' },
            { label: 'Surplus', value: `+${result.totalSurplus}`, cls: 'text-warning' },
            { label: 'Pertes', value: `-${result.totalPertes}`, cls: 'text-danger' },
            { label: 'Non comptés', value: result.nonComptes, cls: 'text-text-muted' },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">{s.label}</p>
              <p className={cn('font-black text-[24px] font-mono', s.cls)}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produit</th>
                <th className="text-center">Avant</th>
                <th className="text-center">Après</th>
                <th className="text-center">Écart</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {result.ajustements.map(a => (
                <tr key={a.produitId}>
                  <td className="font-mono text-[11px] text-text-muted">{a.sku}</td>
                  <td className="text-[13px]">{a.produitNom}</td>
                  <td className="text-center font-mono">{a.avant}</td>
                  <td className="text-center font-mono font-bold">{a.apres}</td>
                  <td className="text-center">
                    <span className={cn(
                      'font-mono font-bold text-[13px]',
                      a.ecart > 0 ? 'text-warning' : a.ecart < 0 ? 'text-danger' : 'text-success',
                    )}>
                      {a.ecart > 0 ? '+' : ''}{a.ecart}
                    </span>
                  </td>
                  <td>
                    {a.ecart === 0
                      ? <span className="text-[11px] text-success font-semibold">✅ Inchangé</span>
                      : <span className={cn('text-[11px] font-semibold', a.ecart > 0 ? 'text-warning' : 'text-danger')}>
                          {a.ecart > 0 ? '▲' : '▼'} Ajusté
                        </span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={exportCSV} className="btn-secondary">
            <Download size={14} /> Télécharger CSV
          </button>
          <button type="button" onClick={() => navigate('/stocks')} className="btn-primary">
            <ArrowLeft size={14} /> Retour aux stocks
          </button>
        </div>
      </div>
    );
  }

  // Phase 1 : saisie
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/stocks')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text transition-colors">
          <ArrowLeft size={17} />
        </button>
        <div>
          <h1 className="text-[18px] font-extrabold text-primary">Inventaire physique</h1>
          <p className="text-[12px] text-text-muted">Comptage et validation du stock réel</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Site</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-slate-50">
              <span className="text-[13px] font-medium">{sites.find(s => s.id === siteId)?.nom ?? siteId}</span>
              <span className="ml-auto text-[11px] text-text-subtle">(votre site)</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Date d'inventaire *</label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={dateInventaire}
              onChange={e => setDateInventaire(e.target.value)}
            />
          </div>
        </div>

        {siteId && total > 0 && (
          <div>
            <div className="flex justify-between text-[12px] mb-2">
              <span className="text-text-muted font-medium">{counted.length} / {total} produits comptés</span>
              <span className="font-bold text-primary-accent">{progress}%</span>
            </div>
            <div className="h-2.5 bg-bg-inset rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-accent rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {siteId && (
        <>
          {/* Filtres */}
          <div className="flex items-center gap-3">
            <div className="period-toggle">
              {([
                { v: 'all', l: 'Tous' },
                { v: 'ecart', l: 'Avec écart' },
                { v: 'noncompte', l: 'Non comptés' },
                { v: 'ok', l: 'OK' },
              ] as const).map(f => (
                <button
                  key={f.v}
                  type="button"
                  onClick={() => setFilterMode(f.v)}
                  className={cn('period-btn', filterMode === f.v && 'active')}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          {/* Tableau */}
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Produit</th>
                    <th className="text-center">Stock système</th>
                    <th className="text-center w-36">Compté</th>
                    <th className="text-center">Écart</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, idx) => {
                    const val = counts[p.produitId];
                    const isSet = val !== null && val !== undefined;
                    const ecart = isSet ? val - p.stockSysteme : null;
                    return (
                      <tr key={p.produitId}>
                        <td className="font-mono text-[11px] text-text-muted">{p.sku}</td>
                        <td className="text-[13px]">{p.nom}</td>
                        <td className="text-center font-mono font-bold">{p.stockSysteme}</td>
                        <td className="text-center">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={99999}
                            placeholder="—"
                            value={isSet ? val! : ''}
                            onChange={e => setCount(p.produitId, e.target.value !== '' ? parseInt(e.target.value) : null)}
                            tabIndex={idx + 1}
                            className="w-24 text-center font-bold text-[14px] py-1.5"
                          />
                        </td>
                        <td className="text-center">
                          {ecart !== null ? (
                            <span className={cn(
                              'font-mono font-bold text-[14px]',
                              ecart === 0 ? 'text-success' : ecart > 0 ? 'text-warning' : 'text-danger',
                            )}>
                              {ecart === 0 ? '0 ✅' : ecart > 0 ? `+${ecart} 🟡` : `${ecart} 🔴`}
                            </span>
                          ) : (
                            <span className="text-text-subtle text-[13px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[13px] text-text-muted">
                        <ClipboardList size={24} className="mx-auto mb-2 opacity-30" />
                        Aucun produit pour ce filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-text-muted">
                {counted.length > 0
                  ? `${counted.length} produits comptés, ${total - counted.length} non comptés (non ajustés)`
                  : 'Aucun produit compté pour l\'instant.'}
              </p>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={counted.length === 0}
                className="btn-primary text-[13px]"
              >
                <CheckCircle2 size={14} />
                Valider l'inventaire ({counted.length}/{total})
              </button>
            </div>
          )}
        </>
      )}

      {!siteId && (
        <div className="card text-center py-16 space-y-3">
          <ClipboardList size={40} className="mx-auto text-text-muted opacity-30" />
          <p className="text-[14px] font-semibold text-text-muted">Sélectionnez un site pour commencer l'inventaire.</p>
        </div>
      )}

      {/* Dialog confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !mutation.isPending && setConfirmOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-[15px] text-primary mb-2">Valider l'inventaire physique ?</h3>
            <p className="text-[12px] text-danger font-semibold mb-4">
              Cette action est IRRÉVERSIBLE. Les stocks du site {sites.find(s => s.id === siteId)?.nom} seront ajustés selon les quantités comptées.
            </p>
            <div className="space-y-1.5 text-[13px] bg-slate-50 rounded-xl p-4 mb-5">
              <div className="flex justify-between">
                <span className="text-text-muted">Produits comptés</span>
                <span className="font-semibold">{countedCount} sur {total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Produits avec écart</span>
                <span className="font-semibold">{withEcart}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Ajustements positifs</span>
                <span className="font-semibold text-warning">+{positifs} unités</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Ajustements négatifs</span>
                <span className="font-semibold text-danger">-{negatifs} unités</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Non comptés (ignorés)</span>
                <span className="font-semibold text-text-muted">{total - countedCount}</span>
              </div>
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Tapez VALIDER pour confirmer</label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="VALIDER"
                className="text-center font-bold tracking-widest uppercase"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmOpen(false)} disabled={mutation.isPending} className="btn-secondary flex-1">
                Annuler
              </button>
              <button
                type="button"
                onClick={() => mutation.mutate()}
                disabled={confirmText !== 'VALIDER' || mutation.isPending}
                className="btn-danger flex-1"
              >
                {mutation.isPending ? 'Validation…' : '✓ Valider l\'inventaire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
