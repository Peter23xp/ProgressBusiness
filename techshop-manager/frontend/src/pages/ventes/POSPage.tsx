import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  User,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore, NIVEAUX_REMISE } from '@/store/cart.store';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { ventesApi } from '@/lib/ventes.api';
import { clientsApi } from '@/lib/clients.api';
import { savePendingVente } from '@/lib/offline';
import { cn, formatCDF } from '@/lib/utils';
import type { CartClient } from '@/store/cart.store';
import type { ProduitPOS } from '@/lib/ventes.api';
import type { ClientSearchResult } from '@/lib/clients.api';
import type { ModePaiement, NiveauFidelite } from '@/types';

// ── Badge stock ───────────────────────────────────────────────────

function StockBadge({ statut, stock }: { statut: ProduitPOS['statut']; stock: number }) {
  if (statut === 'RUPTURE') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-danger">
        Rupture
      </span>
    );
  }
  if (statut === 'ALERTE') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-warning">
        ⚠ {stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-success">
      Stock : {stock}
    </span>
  );
}

// ── Badge niveau fidélité ─────────────────────────────────────────

const NIVEAU_COLORS: Record<NiveauFidelite, string> = {
  BRONZE: 'bg-amber-100 text-amber-700',
  ARGENT: 'bg-slate-100 text-slate-600',
  OR: 'bg-yellow-100 text-yellow-700',
  PLATINE: 'bg-purple-100 text-platine',
};

function NiveauBadge({ niveau }: { niveau: NiveauFidelite }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold',
        NIVEAU_COLORS[niveau],
      )}
    >
      {niveau}
    </span>
  );
}

// ── Skeleton produit ──────────────────────────────────────────────

function ProduitSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-white p-3 flex flex-col gap-2">
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="skeleton h-2.5 w-1/2 rounded" />
      <div className="skeleton h-4 w-1/3 rounded mt-1" />
      <div className="skeleton h-8 w-full rounded mt-1" />
    </div>
  );
}

// ── Carte produit ─────────────────────────────────────────────────

function ProduitCard({
  produit,
  onAdd,
}: {
  produit: ProduitPOS;
  onAdd: (p: ProduitPOS) => void;
}) {
  const isRupture = produit.statut === 'RUPTURE';
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-3 flex flex-col gap-1.5 transition-shadow hover:shadow-md',
        isRupture ? 'border-red-200 opacity-70' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-[13px] font-semibold text-text leading-snug line-clamp-2">{produit.nom}</p>
        <StockBadge statut={produit.statut} stock={produit.stockDisponible} />
      </div>
      <p className="text-[11px] text-text-muted font-mono">{produit.sku}</p>
      <p className="text-[13px] font-bold text-primary-accent">{formatCDF(produit.prixVente)}</p>
      <button
        type="button"
        onClick={() => onAdd(produit)}
        disabled={isRupture}
        className={cn(
          'mt-auto flex items-center justify-center gap-1.5 w-full rounded-lg py-1.5 text-[12px] font-semibold transition-colors',
          isRupture
            ? 'bg-slate-100 text-text-subtle cursor-not-allowed'
            : 'bg-primary-accent text-white hover:bg-blue-700',
        )}
        aria-label={`Ajouter ${produit.nom}`}
      >
        <Plus size={13} />
        Ajouter
      </button>
    </div>
  );
}

// ── Sélecteur client ──────────────────────────────────────────────

function ClientSelector({ onSelect }: { onSelect: (client: CartClient) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setIsLoading(true);
    clientsApi
      .search(debouncedQuery)
      .then((data) => {
        setResults(data.clients);
        setShowDropdown(true);
      })
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (c: ClientSearchResult) => {
    const cartClient: CartClient = {
      id: c.id,
      nom: c.nom,
      prenom: c.prenom,
      telephone: c.telephone,
      niveauFidelite: c.niveauFidelite,
      pointsFidelite: 0,
      remisePct: NIVEAUX_REMISE[c.niveauFidelite],
    };
    onSelect(cartClient);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 pr-8 text-sm"
        />
        {isLoading && (
          <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle animate-spin" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl border border-border bg-white shadow-lg max-h-56 overflow-y-auto">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-blue-50/60 transition-colors text-left"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-text truncate">
                  {c.prenom} {c.nom}
                </p>
                <p className="text-[11px] text-text-muted font-mono">{c.telephone}</p>
              </div>
              <NiveauBadge niveau={c.niveauFidelite} />
            </button>
          ))}
        </div>
      )}

      {showDropdown && !isLoading && results.length === 0 && debouncedQuery.trim() && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl border border-border bg-white shadow-lg px-3 py-3 text-[12px] text-text-muted text-center">
          Aucun client trouvé
        </div>
      )}
    </div>
  );
}

// ── Modal succès ──────────────────────────────────────────────────

interface SuccessModalProps {
  result: {
    id: string;
    numeroVente: string;
    montantNet: number;
    pointsAttribues?: number;
  };
  onPrint: () => void;
  onNewSale: () => void;
}

function SuccessModal({ result, onPrint, onNewSale }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={28} className="text-success" />
        </div>
        <div className="text-center">
          <h2 className="text-[17px] font-bold text-primary">Vente enregistrée !</h2>
          <p className="mt-1 text-[13px] text-text-muted font-mono">{result.numeroVente}</p>
        </div>
        <div className="w-full rounded-xl bg-bg border border-border px-4 py-3 text-center">
          <p className="text-[12px] text-text-muted uppercase tracking-wide font-semibold">Montant total</p>
          <p className="text-[22px] font-bold text-primary mt-0.5">{formatCDF(result.montantNet)}</p>
          {result.pointsAttribues && result.pointsAttribues > 0 && (
            <p className="mt-1 text-[12px] font-semibold text-primary-accent">
              +{result.pointsAttribues} points fidélité
            </p>
          )}
        </div>
        <div className="w-full flex flex-col gap-2">
          <button type="button" onClick={onPrint} className="btn-secondary w-full">
            Imprimer le reçu
          </button>
          <button type="button" onClick={onNewSale} className="btn-primary w-full">
            Nouvelle vente
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal erreur stock ────────────────────────────────────────────

interface StockErrorModalProps {
  produits: Array<{ nom: string; stockActuel: number; quantiteDemandee: number }>;
  onClose: () => void;
}

function StockErrorModal({ produits, onClose }: StockErrorModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 flex-shrink-0">
            <AlertTriangle size={20} className="text-danger" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-primary">Stock insuffisant</h2>
            <p className="text-[12px] text-text-muted">Ajustez les quantités et réessayez</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {produits.map((p, i) => (
            <div key={i} className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
              <p className="text-[13px] font-semibold text-text">{p.nom}</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                Stock actuel : {p.stockActuel} — Demandé : {p.quantiteDemandee}
              </p>
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} className="btn-secondary w-full">
          Fermer
        </button>
      </div>
    </div>
  );
}

// ── Page principale POS ───────────────────────────────────────────

export default function POSPage() {
  const navigate = useNavigate();
  const { user, isOfflineMode } = useAuthStore();

  const siteId = user?.siteId ?? '';
  const siteName = user?.siteName ?? user?.site?.nom ?? 'Caisse';
  const agentName = user?.name ?? '';

  const {
    items,
    client,
    modePaiement,
    montantRecu,
    appliquerRemise,
    isSubmitting,
    montantBrut,
    remiseMontant,
    montantNet,
    monnaieARendre,
    addItem,
    removeItem,
    updateQuantite,
    setClient,
    setModePaiement,
    setMontantRecu,
    toggleRemise,
    setIsSubmitting,
    resetAfterSale,
    clearCart,
  } = useCartStore();

  const {
    produits,
    isLoading: produitsLoading,
    query,
    setQuery,
    categorie,
    setCategorie,
    stockOnly,
    setStockOnly,
  } = useProductSearch(siteId);

  const searchRef = useRef<HTMLInputElement>(null);

  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    venteResult: { id: string; numeroVente: string; montantNet: number; pointsAttribues?: number } | null;
  }>({ open: false, venteResult: null });

  const [stockErrorModal, setStockErrorModal] = useState<{
    open: boolean;
    produits: Array<{ nom: string; stockActuel: number; quantiteDemandee: number }>;
  }>({ open: false, produits: [] });

  // Autofocus sur la recherche produit
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Escape pour vider la recherche
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setQuery('');
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setQuery]);

  const brutVal = montantBrut();
  const remiseVal = remiseMontant();
  const netVal = montantNet();
  const monnaieVal = monnaieARendre();

  const canSubmit =
    items.length > 0 &&
    modePaiement !== null &&
    !(modePaiement === 'CASH' && montantRecu < netVal);

  const MODES: { value: ModePaiement; label: string }[] = [
    { value: 'CASH', label: 'Espèces' },
    { value: 'MPESA', label: 'M-Pesa' },
    { value: 'AIRTEL_MONEY', label: 'Airtel Money' },
    { value: 'VIREMENT', label: 'Virement' },
  ];

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      clientId: client?.id,
      siteId,
      lignes: items.map((i) => ({
        produitId: i.produitId,
        quantite: i.quantite,
        prixUnitaire: i.prixUnitaire,
      })),
      modePaiement: modePaiement!,
      montantRecu: modePaiement === 'CASH' ? montantRecu : undefined,
      appliquerRemiseFidelite: appliquerRemise,
    };

    try {
      const data = await ventesApi.create(payload);
      const result = {
        id: data.vente.id,
        numeroVente: data.vente.numeroVente,
        montantNet: data.vente.montantNet,
        pointsAttribues: data.vente.pointsAttribues,
      };
      resetAfterSale(result);
      setSuccessModal({ open: true, venteResult: result });
    } catch (err: unknown) {
      const isNetwork =
        (err as { code?: string }).code === 'NETWORK_OFFLINE' ||
        (err as { code?: string }).code === 'ERR_NETWORK' ||
        !(err as { response?: unknown }).response;

      if (isNetwork) {
        try {
          await savePendingVente(payload);
          toast.success('Vente sauvegardée hors-ligne — sera synchronisée dès reconnexion');
          resetAfterSale(null);
        } catch {
          toast.error('Impossible de sauvegarder la vente hors-ligne');
        }
      } else {
        const axiosErr = err as { response?: { status?: number; data?: { details?: unknown } } };
        if (axiosErr.response?.status === 409) {
          const details = axiosErr.response.data?.details;
          const produitsList = Array.isArray(details)
            ? (details as Array<{ nom: string; stockActuel: number; quantiteDemandee: number }>)
            : [];
          setStockErrorModal({ open: true, produits: produitsList });
        } else {
          toast.error('Erreur lors de l\'enregistrement de la vente');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">
      {/* ── Header fixe ─────────────────────────────────────────── */}
      <header className="h-12 flex-shrink-0 flex items-center justify-between gap-4 bg-primary px-4 z-10">
        <div className="flex items-center gap-2">
          <ShoppingCart size={15} className="text-blue-400" aria-hidden />
          <span className="text-[13px] font-bold text-white tracking-wide">
            CAISSE — {siteName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-blue-300">{agentName}</span>
          {isOfflineMode && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <WifiOff size={10} />
              Hors-ligne
            </span>
          )}
        </div>
      </header>

      {/* ── Corps principal ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panneau gauche (60%) : Produits ───────────────────── */}
        <div className="w-[60%] flex flex-col border-r border-border overflow-hidden">
          {/* Filtres */}
          <div className="flex-shrink-0 flex flex-col gap-2 p-3 bg-white border-b border-border">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle"
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher un produit (Echap pour effacer)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 pr-8 text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}
                  className="text-sm pr-8"
                >
                  <option value="">Toutes catégories</option>
                  <option value="TELEPHONE">Téléphones</option>
                  <option value="ACCESSOIRE">Accessoires</option>
                  <option value="TABLETTE">Tablettes</option>
                  <option value="ORDINATEUR">Ordinateurs</option>
                  <option value="AUTRE">Autre</option>
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle"
                />
              </div>

              <label className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-muted cursor-pointer select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={stockOnly}
                  onChange={(e) => setStockOnly(e.target.checked)}
                  className="w-auto min-h-0 h-3.5 w-3.5 rounded accent-primary-accent"
                />
                En stock
              </label>
            </div>
          </div>

          {/* Grille produits */}
          <div className="flex-1 overflow-y-auto p-3">
            {produitsLoading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProduitSkeleton key={i} />
                ))}
              </div>
            ) : produits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted py-12">
                <Search size={32} className="opacity-30" />
                <p className="text-[13px] font-medium">Aucun produit trouvé</p>
                {query && (
                  <p className="text-[12px]">
                    Essayez un autre terme ou supprimez les filtres
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {produits.map((p) => (
                  <ProduitCard key={p.id} produit={p} onAdd={addItem} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Panneau droit (40%) : Panier + Client + Paiement ──── */}
        <div className="w-[40%] flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">

            {/* Section Panier */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-text-muted">
                  Panier ({items.length})
                </h2>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] text-danger hover:underline"
                  >
                    Vider
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center py-8 gap-2">
                  <ShoppingCart size={24} className="text-text-subtle opacity-50" />
                  <p className="text-[12px] text-text-muted">Panier vide</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {items.map((item) => (
                    <div
                      key={item.produitId}
                      className="flex items-center gap-2 rounded-lg border border-border bg-bg p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-text truncate">{item.nom}</p>
                        <p className="text-[11px] text-text-muted">{formatCDF(item.prixUnitaire)}</p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantite(item.produitId, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-border text-text-muted hover:border-primary-accent hover:text-primary-accent transition-colors"
                          aria-label="Diminuer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-6 text-center text-[12px] font-bold text-text">
                          {item.quantite}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantite(item.produitId, +1)}
                          disabled={item.quantite >= item.stockDisponible}
                          className="flex h-6 w-6 items-center justify-center rounded border border-border text-text-muted hover:border-primary-accent hover:text-primary-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Augmenter"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <p className="w-20 text-right text-[12px] font-bold text-text flex-shrink-0">
                        {formatCDF(item.prixUnitaire * item.quantite)}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(item.produitId)}
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-text-subtle hover:text-danger transition-colors"
                        aria-label={`Supprimer ${item.nom}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section Client */}
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Client
              </h2>

              {client ? (
                <div className="rounded-xl border border-border bg-bg p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[13px] font-semibold text-text">
                        {client.prenom} {client.nom}
                      </p>
                      <NiveauBadge niveau={client.niveauFidelite} />
                    </div>
                    <p className="text-[11px] text-text-muted font-mono mt-0.5">{client.telephone}</p>
                    {client.remisePct > 0 && (
                      <p className="text-[11px] text-success font-semibold mt-1">
                        Remise fidélité : {client.remisePct}%
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setClient(null)}
                    className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded text-text-subtle hover:text-danger transition-colors"
                    aria-label="Retirer le client"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <ClientSelector onSelect={setClient} />
              )}

              {client && client.remisePct > 0 && items.length > 0 && (
                <label className="mt-2 inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={appliquerRemise}
                    onChange={toggleRemise}
                    className="w-auto min-h-0 h-3.5 w-3.5 rounded accent-primary-accent"
                  />
                  <span className="text-[12px] text-text-muted">
                    Appliquer la remise fidélité ({client.remisePct}%)
                  </span>
                </label>
              )}
            </section>

            {/* Section Paiement */}
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Paiement
              </h2>

              {/* Totaux */}
              {items.length > 0 && (
                <div className="rounded-xl border border-border bg-bg p-3 flex flex-col gap-1.5 mb-3">
                  <div className="flex justify-between text-[12px] text-text-muted">
                    <span>Sous-total</span>
                    <span className="font-mono">{formatCDF(brutVal)}</span>
                  </div>
                  {remiseVal > 0 && (
                    <div className="flex justify-between text-[12px] text-success">
                      <span>Remise fidélité</span>
                      <span className="font-mono">−{formatCDF(remiseVal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[14px] font-bold text-primary border-t border-border pt-1.5">
                    <span>Total</span>
                    <span className="font-mono">{formatCDF(netVal)}</span>
                  </div>
                </div>
              )}

              {/* Mode de paiement */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModePaiement(m.value)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-[12px] font-semibold transition-all',
                      modePaiement === m.value
                        ? 'bg-primary-accent border-primary-accent text-white shadow-sm'
                        : 'border-border text-text-muted hover:border-primary-accent hover:text-primary-accent bg-white',
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Montant reçu si CASH */}
              {modePaiement === 'CASH' && (
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="form-label">Montant reçu (CDF)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    placeholder={String(netVal)}
                    value={montantRecu || ''}
                    onChange={(e) => setMontantRecu(Number(e.target.value))}
                    className="text-sm font-mono"
                  />
                  {monnaieVal > 0 && (
                    <p className="text-[12px] font-semibold text-success">
                      Monnaie à rendre : {formatCDF(monnaieVal)}
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Bouton valider (fixe en bas) */}
          <div className="flex-shrink-0 p-3 border-t border-border bg-white">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="btn-primary w-full text-[14px] py-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Valider la vente — {formatCDF(netVal)}
                </>
              )}
            </button>
            {items.length === 0 && (
              <p className="mt-1.5 text-center text-[11px] text-text-subtle">
                Ajoutez des produits au panier
              </p>
            )}
            {items.length > 0 && !modePaiement && (
              <p className="mt-1.5 text-center text-[11px] text-warning">
                Choisissez un mode de paiement
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {successModal.open && successModal.venteResult && (
        <SuccessModal
          result={successModal.venteResult}
          onPrint={() => {
            navigate(`/sales/${successModal.venteResult!.id}/receipt`);
            setSuccessModal({ open: false, venteResult: null });
          }}
          onNewSale={() => {
            clearCart();
            setSuccessModal({ open: false, venteResult: null });
          }}
        />
      )}

      {stockErrorModal.open && (
        <StockErrorModal
          produits={stockErrorModal.produits}
          onClose={() => setStockErrorModal({ open: false, produits: [] })}
        />
      )}
    </div>
  );
}
