import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRightLeft, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useSites } from '@/hooks/useSites';
import { stocksApi, getStockStatut } from '@/lib/stocks.api';
import { StockStatusBadge } from '@/components/stocks/StockStatusBadge';
import { ProductSearchCombobox } from '@/components/stocks/ProductSearchCombobox';
import { cn } from '@/lib/utils';
import type { ProduitSearchResult } from '@/lib/stocks.api';

export default function TransfertPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuthStore();
  const qc = useQueryClient();

  const canAccess = hasRole('GERANT');
  const canChooseSite = hasRole('DIRECTEUR_REGIONAL');
  const { sites } = useSites();

  const defaultSiteId = user?.siteId ?? '';
  const [siteSourceId, setSiteSourceId] = useState(canChooseSite ? '' : defaultSiteId);
  const [siteDestId, setSiteDestId] = useState('');
  const [produitId, setProduitId] = useState<string | null>(null);
  const [selectedProduit, setSelectedProduit] = useState<ProduitSearchResult | null>(null);
  const [quantite, setQuantite] = useState<number | ''>('');
  const [motif, setMotif] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Charger stock source et destination pour la prévisualisation
  const { data: stockSource } = useQuery({
    queryKey: ['stock-site', siteSourceId, produitId],
    queryFn: () => stocksApi.getInventory({ siteId: siteSourceId, search: selectedProduit?.sku }),
    enabled: !!siteSourceId && !!produitId,
    staleTime: 30_000,
    select: d => d.stocks.find(s => s.produitId === produitId),
  });

  const { data: stockDest } = useQuery({
    queryKey: ['stock-site', siteDestId, produitId],
    queryFn: () => stocksApi.getInventory({ siteId: siteDestId, search: selectedProduit?.sku }),
    enabled: !!siteDestId && !!produitId,
    staleTime: 30_000,
    select: d => d.stocks.find(s => s.produitId === produitId),
  });

  const mutation = useMutation({
    mutationFn: () => stocksApi.createTransfer({
      siteSourceId,
      siteDestinationId: siteDestId,
      produitId: produitId!,
      quantite: quantite as number,
      motif: motif || undefined,
    }),
    onSuccess: () => {
      toast.success(`Transfert initié. Une notification a été envoyée au Gérant de ${sites.find(s => s.id === siteDestId)?.nom}.`);
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['stock-alerts'] });
      setConfirmOpen(false);
      setTimeout(() => navigate('/stocks'), 1500);
    },
    onError: (error: any) => {
      setConfirmOpen(false);
      const code = error?.response?.data?.code;
      if (code === 'ERR_STOCK_INSUFFISANT') {
        toast.error('Stock insuffisant pour ce transfert.');
      } else {
        toast.error('Erreur lors du transfert.');
      }
    },
  });

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

  const samesSite = siteSourceId && siteDestId && siteSourceId === siteDestId;
  const stockSourceActuel = stockSource?.quantite ?? (selectedProduit?.stockDisponible ?? 0);
  const stockDestActuel = stockDest?.quantite ?? 0;
  const seuilSource = stockSource?.seuilAlerte ?? 5;
  const seuilDest = stockDest?.seuilAlerte ?? 5;

  const qty = typeof quantite === 'number' ? quantite : 0;
  const stockSourceApres = stockSourceActuel - qty;
  const stockDestApres = stockDestActuel + qty;

  const isInsuffisant = qty > 0 && stockSourceApres < 0;
  const isAlertSource = qty > 0 && stockSourceApres >= 0 && stockSourceApres <= seuilSource && stockSourceActuel > seuilSource;
  const canSubmit = !!produitId && !!siteSourceId && !!siteDestId && !samesSite && qty > 0 && !isInsuffisant;

  const sourceNom = sites.find(s => s.id === siteSourceId)?.nom ?? siteSourceId;
  const destNom = sites.find(s => s.id === siteDestId)?.nom ?? siteDestId;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/stocks')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:border-border-strong hover:text-text transition-colors"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h1 className="text-[18px] font-extrabold text-primary">Transfert inter-sites</h1>
          <p className="text-[12px] text-text-muted">Déplacer du stock entre deux sites</p>
        </div>
      </div>

      <div className="card space-y-5">
        {/* Sites */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Site source *</label>
            {canChooseSite ? (
              <div className="relative">
                <select
                  value={siteSourceId}
                  onChange={e => { setSiteSourceId(e.target.value); setProduitId(null); setSelectedProduit(null); }}
                  className="text-sm"
                >
                  <option value="">Sélectionner</option>
                  {sites.filter(s => s.id !== siteDestId).map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-slate-50">
                <span className="text-[13px] font-medium">{user?.siteName ?? sourceNom}</span>
                <span className="ml-auto text-[11px] text-text-subtle">(votre site)</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Site destination *</label>
            <div className="relative">
              <select
                value={siteDestId}
                onChange={e => setSiteDestId(e.target.value)}
                className={cn('text-sm', samesSite && 'border-danger')}
              >
                <option value="">Sélectionner</option>
                {sites.filter(s => s.id !== siteSourceId).map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>
            {samesSite && (
              <p className="form-error">Le site de destination doit être différent du site source.</p>
            )}
          </div>
        </div>

        {/* Produit */}
        <div className="form-group">
          <label className="form-label">Produit *</label>
          <ProductSearchCombobox
            siteId={siteSourceId || defaultSiteId}
            value={produitId}
            onChange={(id, prod) => { setProduitId(id); setSelectedProduit(prod); }}
            disabled={!siteSourceId}
          />
        </div>

        {/* Quantité */}
        <div className="form-group">
          <label className="form-label">Quantité à transférer *</label>
          <input
            type="number"
            min={1}
            max={stockSourceActuel}
            placeholder="ex: 5"
            value={quantite}
            onChange={e => setQuantite(e.target.value ? parseInt(e.target.value) : '')}
            className="text-center text-[18px] font-bold"
          />
        </div>

        {/* Motif */}
        <div className="form-group">
          <label className="form-label">Motif <span className="text-text-muted font-normal normal-case">(optionnel)</span></label>
          <input
            type="text"
            placeholder="ex: Réapprovisionnement Bukavu"
            value={motif}
            onChange={e => setMotif(e.target.value)}
          />
        </div>

        {/* Prévisualisation */}
        {selectedProduit && siteSourceId && siteDestId && !samesSite && qty > 0 && (
          <div className="rounded-xl border border-border bg-slate-50 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Récapitulatif — {selectedProduit.nom}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white border border-border p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">{sourceNom} (source)</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-[18px]">{stockSourceActuel}</span>
                  <span className="text-text-subtle">→</span>
                  <span className={cn(
                    'font-mono font-black text-[18px]',
                    stockSourceApres < 0 ? 'text-danger' : 'text-text',
                  )}>
                    {stockSourceApres}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <StockStatusBadge statut={getStockStatut(stockSourceActuel, seuilSource)} size="sm" />
                  <span className="text-text-subtle text-[10px]">→</span>
                  <StockStatusBadge statut={getStockStatut(Math.max(0, stockSourceApres), seuilSource)} size="sm" />
                </div>
              </div>

              <div className="rounded-lg bg-white border border-border p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">{destNom} (destination)</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-[18px]">{stockDestActuel}</span>
                  <span className="text-text-subtle">→</span>
                  <span className="font-mono font-black text-[18px] text-success">{stockDestApres}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <StockStatusBadge statut={getStockStatut(stockDestActuel, seuilDest)} size="sm" />
                  <span className="text-text-subtle text-[10px]">→</span>
                  <StockStatusBadge statut={getStockStatut(stockDestApres, seuilDest)} size="sm" />
                </div>
              </div>
            </div>

            {/* Alertes */}
            {isInsuffisant && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                <AlertCircle size={14} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-danger font-medium">
                  Stock insuffisant — {sourceNom} n'a que {stockSourceActuel} unités disponibles.
                </p>
              </div>
            )}
            {isAlertSource && !isInsuffisant && (
              <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                <AlertCircle size={14} className="text-warning flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-warning font-medium">
                  Ce transfert passera {sourceNom} en alerte (seuil : {seuilSource} unités).
                </p>
              </div>
            )}
            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
              <Info size={14} className="text-primary-accent flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-primary-accent">
                Le stock {destNom} sera mis à jour après confirmation de réception par le Gérant de {destNom}.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button type="button" onClick={() => navigate('/stocks')} className="btn-secondary text-[13px]">
            Annuler
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!canSubmit}
            className="btn-primary text-[13px]"
          >
            <ArrowRightLeft size={14} />
            Initier le transfert
          </button>
        </div>
      </div>

      {/* Confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !mutation.isPending && setConfirmOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-[15px] text-primary mb-4">Confirmer le transfert ?</h3>
            <div className="space-y-2 text-[13px] bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between">
                <span className="text-text-muted">Produit</span>
                <span className="font-medium">{selectedProduit?.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">De → Vers</span>
                <span className="font-medium">{sourceNom} → {destNom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Quantité</span>
                <span className="font-bold">{quantite} unités</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 mb-5">
              <AlertCircle size={13} className="text-warning flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-warning">
                Le stock {sourceNom} sera immédiatement décrémenté de {quantite} unités. Le stock {destNom} sera mis à jour après confirmation de réception.
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmOpen(false)} disabled={mutation.isPending} className="btn-secondary flex-1">
                Annuler
              </button>
              <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary flex-1">
                {mutation.isPending ? 'Transfert…' : '⇄ Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
