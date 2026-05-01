import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Plus, CheckCircle2, AlertCircle,
  Package, FileText, Building2, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { stocksApi, getStockStatut } from '@/lib/stocks.api';
import { StockStatusBadge } from '@/components/stocks/StockStatusBadge';
import { ProductSearchCombobox } from '@/components/stocks/ProductSearchCombobox';
import { cn, formatCDF } from '@/lib/utils';
import type { ProduitSearchResult } from '@/lib/stocks.api';

// ── Constants ─────────────────────────────────────────────────────────────────

const SITES = [
  { id: 'goma', nom: 'Goma' },
  { id: 'bukavu', nom: 'Bukavu' },
  { id: 'kinshasa', nom: 'Kinshasa' },
];

const TVA_OPTIONS = [
  { value: 0, label: '0% — Exonéré' },
  { value: 16, label: '16% — Standard RDC' },
  { value: 20, label: '20%' },
];

type Step = 1 | 2 | 3;

const STEPS: { n: Step; label: string; icon: typeof Package }[] = [
  { n: 1, label: 'Produit', icon: Package },
  { n: 2, label: 'Fournisseur', icon: Building2 },
  { n: 3, label: 'Récapitulatif', icon: FileText },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface SuccessData {
  produitNom: string;
  sku: string;
  siteNom: string;
  quantite: number;
  stockApres: number;
  numeroBR: string;
  nomFournisseur: string;
  statut: 'OK' | 'ALERTE' | 'RUPTURE';
}

// ── StepIndicator ─────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-200',
                done && 'bg-success border-success text-white',
                active && 'bg-primary border-primary text-white shadow-sm',
                !done && !active && 'bg-white border-border text-text-muted',
              )}>
                {done ? <CheckCircle2 size={14} /> : s.n}
              </div>
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap',
                active ? 'text-primary' : done ? 'text-success' : 'text-text-muted',
              )}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'h-0.5 w-10 mx-2 mb-5 rounded-full transition-colors duration-200',
                s.n < current ? 'bg-success' : 'bg-border',
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function EntreeStockPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuthStore();
  const qc = useQueryClient();

  const canAccess = hasRole('GERANT');
  const canChooseSite = hasRole('DIRECTEUR_REGIONAL');
  const defaultSiteId = user?.siteId ?? '';
  const defaultSiteNom = user?.siteName ?? 'Mon site';

  const [siteId, setSiteId] = useState(canChooseSite ? '' : defaultSiteId);
  const siteNom = canChooseSite
    ? (SITES.find(s => s.id === siteId)?.nom ?? '')
    : defaultSiteNom;

  const [step, setStep] = useState<Step>(1);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Étape 1
  const [produitId, setProduitId] = useState<string | null>(null);
  const [selectedProduit, setSelectedProduit] = useState<ProduitSearchResult | null>(null);
  const [quantite, setQuantite] = useState<number | ''>('');

  // Étape 2
  const [nomFournisseur, setNomFournisseur] = useState('');
  const [villeFournisseur, setVilleFournisseur] = useState('');
  const [telephoneFournisseur, setTelephoneFournisseur] = useState('');
  const [numeroBR, setNumeroBR] = useState('');
  const [dateReception, setDateReception] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Étape 3 — valorisation optionnelle
  const [prixAchatHT, setPrixAchatHT] = useState<number | ''>('');
  const [tauxTVA, setTauxTVA] = useState<number>(0);

  const qty = typeof quantite === 'number' ? quantite : 0;
  const stockActuel = selectedProduit?.stockDisponible ?? 0;
  const stockApresPreview = stockActuel + qty;

  const prixTTC = typeof prixAchatHT === 'number' && prixAchatHT > 0
    ? prixAchatHT * (1 + tauxTVA / 100)
    : null;
  const valeurTotale = prixTTC !== null && qty > 0 ? prixTTC * qty : null;

  const canStep1Next = !!siteId && !!produitId && qty > 0;
  const canStep2Next = nomFournisseur.trim().length >= 2 && numeroBR.trim().length >= 1;

  const mutation = useMutation({
    mutationFn: () => {
      const notesParts = [
        `Fournisseur: ${nomFournisseur}`,
        villeFournisseur ? `Localité: ${villeFournisseur}` : '',
        telephoneFournisseur ? `Tél: ${telephoneFournisseur}` : '',
        notes ? `Obs: ${notes}` : '',
        typeof prixAchatHT === 'number' && prixAchatHT > 0
          ? `PU HT: ${prixAchatHT} CDF — TVA: ${tauxTVA}%`
          : '',
      ].filter(Boolean).join(' | ');

      return stocksApi.createEntry({
        siteId,
        produitId: produitId!,
        quantite: qty,
        referenceFournisseur: numeroBR,
        dateReception,
        notes: notesParts || undefined,
      });
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['stock-alerts'] });
      setSuccessData({
        produitNom: selectedProduit!.nom,
        sku: selectedProduit!.sku,
        siteNom,
        quantite: qty,
        stockApres: res.stockApres,
        numeroBR,
        nomFournisseur,
        statut: res.statut,
      });
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement de l'entrée.");
    },
  });

  function resetForm() {
    setStep(1);
    setProduitId(null);
    setSelectedProduit(null);
    setQuantite('');
    setNomFournisseur('');
    setVilleFournisseur('');
    setTelephoneFournisseur('');
    setNumeroBR('');
    setDateReception(new Date().toISOString().split('T')[0]);
    setNotes('');
    setPrixAchatHT('');
    setTauxTVA(0);
    setSuccessData(null);
  }

  // ── Accès refusé ─────────────────────────────────────────────────────────────

  if (!canAccess) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-3">
        <AlertCircle size={36} className="text-warning mx-auto opacity-60" />
        <h2 className="text-[16px] font-bold text-primary">Accès refusé</h2>
        <p className="text-[13px] text-text-muted">Cette page est réservée aux Gérants et Super-Admins.</p>
        <button type="button" onClick={() => navigate('/stocks')} className="btn-secondary text-[13px]">
          <ArrowLeft size={14} /> Retour aux stocks
        </button>
      </div>
    );
  }

  // ── Écran succès ──────────────────────────────────────────────────────────────

  if (successData) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="card text-center space-y-4 py-10">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-success" />
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-primary">Entrée enregistrée avec succès</h2>
            <p className="text-[13px] text-text-muted mt-1">{successData.produitNom} — {successData.siteNom}</p>
          </div>

          <div className="flex items-center justify-center gap-4 py-3 bg-slate-50 rounded-xl">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Ajouté</p>
              <p className="font-mono font-black text-[24px] text-success">+{successData.quantite}</p>
            </div>
            <div className="text-[20px] text-text-subtle">→</div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Nouveau stock</p>
              <p className="font-mono font-black text-[24px] text-primary">{successData.stockApres}</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <StockStatusBadge statut={successData.statut} />
          </div>

          <div className="rounded-lg bg-slate-50 border border-border px-4 py-3 text-[12px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-text-muted">N° Bon de Réception</span>
              <span className="font-mono font-semibold text-primary">{successData.numeroBR}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Fournisseur</span>
              <span className="font-medium">{successData.nomFournisseur}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={resetForm} className="btn-secondary flex-1 text-[13px]">
              <Plus size={14} /> Nouvelle entrée
            </button>
            <button type="button" onClick={() => navigate('/stocks')} className="btn-primary flex-1 text-[13px]">
              <Package size={14} /> Voir les stocks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulaire ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep((step - 1) as Step) : navigate('/stocks'))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:border-border-strong hover:text-text transition-colors"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h1 className="text-[18px] font-extrabold text-primary">Entrée de stock</h1>
          <p className="text-[12px] text-text-muted">Réception de marchandises — conforme OHADA</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex justify-center pt-1 pb-1">
        <StepIndicator current={step} />
      </div>

      {/* Carte de contenu */}
      <div className="card space-y-5">

        {/* ── Étape 1 : Produit & Quantité ─────────────────────────── */}
        {step === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">Site destinataire *</label>
              {canChooseSite ? (
                <select
                  value={siteId}
                  onChange={e => {
                    setSiteId(e.target.value);
                    setProduitId(null);
                    setSelectedProduit(null);
                    setQuantite('');
                  }}
                  className="text-sm"
                >
                  <option value="">Sélectionner un site</option>
                  {SITES.map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-slate-50">
                  <Package size={14} className="text-text-muted" />
                  <span className="text-[13px] font-medium">{defaultSiteNom}</span>
                  <span className="ml-auto text-[11px] text-text-subtle">(votre site)</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Produit *</label>
              <ProductSearchCombobox
                siteId={siteId}
                value={produitId}
                onChange={(id, prod) => { setProduitId(id); setSelectedProduit(prod); }}
              />
              {selectedProduit && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-[12px] text-text-muted">Stock actuel</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[15px]">{stockActuel}</span>
                    {stockActuel === 0 && <span className="badge-danger badge text-[10px]">Rupture</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Quantité reçue *</label>
              <input
                type="number"
                min={1}
                max={99999}
                placeholder="ex: 20"
                value={quantite}
                onChange={e => setQuantite(e.target.value ? parseInt(e.target.value) : '')}
                className="text-center text-[18px] font-bold"
              />
              {selectedProduit && qty > 0 && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-primary-light/20 border border-primary-light px-3 py-2">
                  <span className="text-[12px] text-primary-accent font-medium">Stock après réception</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-[18px] text-primary-accent">{stockApresPreview}</span>
                    <StockStatusBadge
                      statut={getStockStatut(stockApresPreview, selectedProduit?.stockDisponible ?? 5)}
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Étape 2 : Fournisseur & Document ─────────────────────── */}
        {step === 2 && (
          <>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-3">
                Identification du fournisseur
              </p>
              <div className="space-y-3">
                <div className="form-group">
                  <label className="form-label">Nom du fournisseur *</label>
                  <input
                    type="text"
                    placeholder="ex: ORCA Technologies Goma"
                    value={nomFournisseur}
                    onChange={e => setNomFournisseur(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">
                      Localité / Ville
                      <span className="ml-1 text-text-muted font-normal normal-case">(opt.)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Goma"
                      value={villeFournisseur}
                      onChange={e => setVilleFournisseur(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Téléphone
                      <span className="ml-1 text-text-muted font-normal normal-case">(opt.)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+243..."
                      value={telephoneFournisseur}
                      onChange={e => setTelephoneFournisseur(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-3">
                Document de réception
              </p>
              <div className="space-y-3">
                <div className="form-group">
                  <label className="form-label flex items-center gap-1.5">
                    N° Bon de Réception (BR) *
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
                      OHADA
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="ex: BR-2025-0047"
                    value={numeroBR}
                    onChange={e => setNumeroBR(e.target.value)}
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Référence du document physique remis par le fournisseur.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Date de réception *</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={dateReception}
                    onChange={e => setDateReception(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Notes
                    <span className="ml-1 text-text-muted font-normal normal-case">(optionnel)</span>
                  </label>
                  <textarea
                    rows={2}
                    maxLength={200}
                    placeholder="Observations sur la livraison..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Étape 3 : Récapitulatif & Valorisation ───────────────── */}
        {step === 3 && (
          <>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-3">
                Récapitulatif de l'entrée
              </p>
              <div className="rounded-xl bg-slate-50 border border-border divide-y divide-border/60 overflow-hidden">
                {([
                  { label: 'Produit', value: `${selectedProduit?.nom} (${selectedProduit?.sku})` },
                  { label: 'Site', value: siteNom },
                  { label: 'Quantité reçue', value: `+${qty} unités`, bold: true, color: 'text-success' as const },
                  { label: 'Stock après', value: `${stockApresPreview} unités` },
                  { label: 'Fournisseur', value: nomFournisseur },
                  villeFournisseur ? { label: 'Localité', value: villeFournisseur } : null,
                  telephoneFournisseur ? { label: 'Tél. fournisseur', value: telephoneFournisseur } : null,
                  { label: 'N° Bon de Réception', value: numeroBR, mono: true, highlight: true },
                  {
                    label: 'Date de réception',
                    value: new Date(dateReception + 'T00:00:00').toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    }),
                  },
                ] as ({ label: string; value: string; bold?: boolean; color?: string; mono?: boolean; highlight?: boolean } | null)[])
                  .filter((r): r is NonNullable<typeof r> => r !== null)
                  .map(row => (
                    <div key={row.label} className="flex justify-between items-baseline px-4 py-2.5 text-[13px]">
                      <span className="text-text-muted shrink-0">{row.label}</span>
                      <span className={cn(
                        'font-medium text-right ml-4 max-w-[55%] truncate',
                        row.bold && 'font-bold',
                        row.color,
                        row.mono && 'font-mono',
                        row.highlight && 'text-primary font-semibold',
                      )}>
                        {row.value}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Valorisation */}
            <div className="border-t border-border pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">Valorisation</p>
              <p className="text-[11px] text-text-muted mb-3">Optionnel — pour la comptabilité analytique OHADA</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Prix d'achat unitaire HT</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="ex: 25000"
                    value={prixAchatHT}
                    onChange={e => setPrixAchatHT(e.target.value ? parseFloat(e.target.value) : '')}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Taux TVA</label>
                  <select value={tauxTVA} onChange={e => setTauxTVA(Number(e.target.value))}>
                    {TVA_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {prixTTC !== null && valeurTotale !== null && (
                <div className="mt-2 rounded-lg bg-primary-light/20 border border-primary-light px-3 py-2.5 space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-text-muted">Prix unitaire TTC</span>
                    <span className="font-mono font-semibold text-primary-accent">{formatCDF(prixTTC)}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-text-muted">Valeur totale réception ({qty} u.)</span>
                    <span className="font-mono font-bold text-primary-accent">{formatCDF(valeurTotale)}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((step - 1) as Step) : navigate('/stocks'))}
            className="btn-secondary text-[13px]"
            disabled={mutation.isPending}
          >
            {step === 1 ? 'Annuler' : (
              <><ArrowLeft size={13} /> Précédent</>
            )}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as Step)}
              disabled={step === 1 ? !canStep1Next : !canStep2Next}
              className="btn-primary text-[13px]"
            >
              Suivant <ChevronRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="btn-primary text-[13px]"
            >
              {mutation.isPending ? 'Enregistrement…' : (
                <><Plus size={13} /> Enregistrer l'entrée</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
