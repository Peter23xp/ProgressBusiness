import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Package, Tag, Plus, X, AlertCircle,
  ChevronDown, Barcode, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { stocksApi, type CreateProduitDto } from '@/lib/stocks.api';
import { formatUSD, cn } from '@/lib/utils';

// ── Types locaux ──────────────────────────────────────────────────────────────

interface FormValues {
  nom: string;
  categorie: string;
  description: string;
  prixVente: number | '';
  prixAchat: number | '';
  monnaie: 'CDF' | 'USD';
  seuilsParSite: { siteId: string; siteNom: string; seuilAlerte: number }[];
}

// ── Composant seuil par site ──────────────────────────────────────────────────

function SeuilRow({
  index,
  siteNom,
  value,
  onChange,
  readOnly,
}: {
  index: number;
  siteNom: string;
  value: number;
  onChange: (v: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full bg-primary-accent shrink-0" />
        <span className="text-[13px] font-medium text-primary truncate">{siteNom}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          min={0}
          value={value}
          onChange={e => onChange(Math.max(0, Number(e.target.value)))}
          readOnly={readOnly}
          className={cn('w-20 text-sm text-center', readOnly && 'bg-slate-50 text-text-muted cursor-default')}
        />
        <span className="text-[11px] text-text-muted">unités</span>
      </div>
    </div>
  );
}

// ── Panneau ajout catégorie inline ────────────────────────────────────────────

function AddCategorieInline({
  onAdd,
  onCancel,
}: {
  onAdd: (nom: string) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleConfirm() {
    const trimmed = val.trim();
    if (trimmed) onAdd(trimmed);
  }

  return (
    <div className="flex items-center gap-2 mt-1 p-2 bg-slate-50 rounded-lg border border-border">
      <input
        ref={inputRef}
        type="text"
        placeholder="Nom de la catégorie..."
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); } }}
        className="flex-1 text-sm bg-transparent border-0 outline-none p-0 placeholder:text-text-subtle"
      />
      <button
        type="button"
        disabled={!val.trim()}
        onClick={handleConfirm}
        className="flex items-center gap-1 text-[11px] font-semibold text-success hover:opacity-80 disabled:opacity-40 transition-opacity"
      >
        <Check size={12} /> Ajouter
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-text-subtle hover:text-text transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function NouveauProduitPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, hasRole } = useAuthStore();

  const isSuperAdmin = hasRole('SUPER_ADMIN');
  const isGerant = user?.role === 'GERANT';

  const [showAddCategorie, setShowAddCategorie] = useState(false);
  const [localCategories, setLocalCategories] = useState<string[]>([]);

  // ── Data : sites disponibles ──────────────────────────────────────────────

  const { data: sitesData } = useQuery({
    queryKey: ['sites', 'actifs'],
    queryFn: () =>
      import('@/lib/api').then(({ api }) =>
        api.get<{ data: { id: string; nom: string; ville: string; actif: boolean }[] }>('/sites').then(r => r.data),
      ),
    staleTime: 10 * 60_000,
  });

  const sitesActifs = (sitesData?.data ?? []).filter(s => s.actif !== false);

  // Pour GERANT : uniquement son site
  const sitesDisponibles = isSuperAdmin
    ? sitesActifs
    : sitesActifs.filter(s => s.id === user?.siteId);

  // ── Data : catégories ─────────────────────────────────────────────────────

  const { data: catData } = useQuery({
    queryKey: ['produits', 'categories'],
    queryFn: () => stocksApi.getCategories(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (catData?.categories) setLocalCategories(catData.categories);
  }, [catData]);

  // ── Form ──────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nom: '',
      categorie: '',
      description: '',
      prixVente: '',
      prixAchat: '',
      monnaie: 'CDF',
      seuilsParSite: [],
    },
  });

  const monnaie = useWatch({ control, name: 'monnaie' });
  const categorie = useWatch({ control, name: 'categorie' });
  const nomValue = useWatch({ control, name: 'nom' });
  const prixVente = useWatch({ control, name: 'prixVente' });
  const prixAchat = useWatch({ control, name: 'prixAchat' });

  // Initialiser les seuils par site dès que les sites sont connus
  useEffect(() => {
    if (sitesDisponibles.length > 0) {
      setValue(
        'seuilsParSite',
        sitesDisponibles.map(s => ({ siteId: s.id, siteNom: s.nom, seuilAlerte: 5 })),
      );
    }
  }, [sitesDisponibles.length]);

  // SKU preview en temps réel
  const { data: skuData } = useQuery({
    queryKey: ['sku-preview', categorie],
    queryFn: () => stocksApi.skuPreview(categorie),
    enabled: !!categorie,
    staleTime: 0,
  });
  const skuPreview = skuData?.sku ?? '—';

  // ── Ajout catégorie ───────────────────────────────────────────────────────

  const addCategorieMutation = useMutation({
    mutationFn: (nom: string) => stocksApi.addCategorie(nom),
    onSuccess: (res, nom) => {
      setLocalCategories(res.categories);
      setValue('categorie', nom);
      setShowAddCategorie(false);
      qc.invalidateQueries({ queryKey: ['produits', 'categories'] });
    },
    onError: () => toast.error('Cette catégorie existe déjà.'),
  });

  // ── Création produit ──────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (body: CreateProduitDto) => stocksApi.createProduit(body),
    onSuccess: (res) => {
      toast.success(`Produit créé — SKU ${res.produit.sku}`);
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['produits', 'categories'] });
      navigate(`/stocks/${res.produit.id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Erreur lors de la création.';
      toast.error(msg);
    },
  });

  function onSubmit(values: FormValues) {
    if (!values.categorie) return;
    const body: CreateProduitDto = {
      nom: values.nom.trim(),
      categorie: values.categorie,
      description: values.description?.trim() || undefined,
      prixVente: Number(values.prixVente),
      prixAchat: Number(values.prixAchat),
      monnaie: values.monnaie,
      seuilsParSite: values.seuilsParSite.map(s => ({
        siteId: s.siteId,
        seuilAlerte: s.seuilAlerte,
      })),
    };
    createMutation.mutate(body);
  }

  const seuilsParSite = watch('seuilsParSite');

  // Calcul marge pour le simulateur
  const marge =
    prixVente && prixAchat && Number(prixVente) > 0 && Number(prixAchat) >= 0
      ? Number(prixVente) - Number(prixAchat)
      : null;
  const margePct =
    marge !== null && Number(prixAchat) > 0
      ? ((marge / Number(prixAchat)) * 100).toFixed(1)
      : null;

  const prixLabel = monnaie === 'USD' ? 'USD' : 'CDF';

  return (
    <div className="space-y-0">
      {/* ── Header sticky ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-bg border-b border-border px-5 sm:px-7 py-3 -mx-5 sm:-mx-7 -mt-5 sm:-mt-7 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/stocks')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:border-border-strong hover:text-text transition-colors shrink-0"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <h1 className="text-[16px] font-extrabold text-primary leading-tight truncate">
              Nouveau produit
            </h1>
            <p className="text-[11px] text-text-muted">Catalogue · Stocks</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/stocks')}
            className="btn-secondary text-[12px]"
          >
            Annuler
          </button>
          <button
            type="button"
            form="form-nouveau-produit"
            disabled={createMutation.isPending}
            className="btn-primary text-[13px] disabled:opacity-50"
            onClick={handleSubmit(onSubmit)}
          >
            {createMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Création...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Package size={14} />
                Créer le produit
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Corps ───────────────────────────────────────────────────── */}
      <form id="form-nouveau-produit" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Colonne principale (2/3) ─────────────────────────── */}
          <div className="xl:col-span-2 space-y-5">

            {/* Informations produit */}
            <div className="card space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Informations produit</p>

              <div className="form-group">
                <label className="form-label" htmlFor="nom">
                  Nom du produit <span className="text-danger">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Ex: Samsung Galaxy A54 128GB"
                  className={cn(errors.nom && 'border-danger')}
                  {...register('nom', {
                    required: 'Le nom est requis.',
                    minLength: { value: 2, message: 'Minimum 2 caractères.' },
                  })}
                />
                {errors.nom && (
                  <p className="form-error">{errors.nom.message}</p>
                )}
              </div>

              {/* Catégorie */}
              <div className="form-group">
                <label className="form-label" htmlFor="categorie">
                  Catégorie <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    id="categorie"
                    className={cn('w-full appearance-none pr-8', errors.categorie && 'border-danger')}
                    {...register('categorie', { required: 'La catégorie est requise.' })}
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {localCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
                </div>
                {errors.categorie && <p className="form-error">{errors.categorie.message}</p>}
                {localCategories.length === 0 && !showAddCategorie && (
                  <p className="text-[11px] text-text-muted mt-1">
                    Aucune catégorie disponible.
                  </p>
                )}
                {!showAddCategorie ? (
                  <button
                    type="button"
                    onClick={() => setShowAddCategorie(true)}
                    className="mt-1.5 flex items-center gap-1 text-[11px] text-primary-accent hover:text-primary font-medium transition-colors"
                  >
                    <Plus size={11} /> Nouvelle catégorie
                  </button>
                ) : (
                  <AddCategorieInline
                    onAdd={(nom) => addCategorieMutation.mutate(nom)}
                    onCancel={() => setShowAddCategorie(false)}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Caractéristiques, modèle, couleur..."
                  className="resize-none"
                  {...register('description')}
                />
              </div>
            </div>

            {/* Prix */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Prix</p>
                {/* Toggle CDF / USD */}
                <div className="period-toggle">
                  <button
                    type="button"
                    className={cn('period-btn', monnaie === 'CDF' && 'active')}
                    onClick={() => setValue('monnaie', 'CDF')}
                  >
                    CDF
                  </button>
                  <button
                    type="button"
                    className={cn('period-btn', monnaie === 'USD' && 'active')}
                    onClick={() => setValue('monnaie', 'USD')}
                  >
                    USD
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="prixVente">
                    Prix de vente <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="prixVente"
                      type="number"
                      min={0}
                      step={monnaie === 'USD' ? '0.01' : '100'}
                      placeholder="0"
                      className={cn('pr-14', errors.prixVente && 'border-danger')}
                      {...register('prixVente', {
                        required: 'Prix de vente requis.',
                        min: { value: 1, message: 'Doit être supérieur à 0.' },
                        valueAsNumber: true,
                      })}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-text-muted">
                      {prixLabel}
                    </span>
                  </div>
                  {errors.prixVente && <p className="form-error">{errors.prixVente.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prixAchat">
                    Prix d'achat <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="prixAchat"
                      type="number"
                      min={0}
                      step={monnaie === 'USD' ? '0.01' : '100'}
                      placeholder="0"
                      className={cn('pr-14', errors.prixAchat && 'border-danger')}
                      {...register('prixAchat', {
                        required: "Prix d'achat requis.",
                        min: { value: 0, message: 'Doit être 0 ou plus.' },
                        valueAsNumber: true,
                      })}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-text-muted">
                      {prixLabel}
                    </span>
                  </div>
                  {errors.prixAchat && <p className="form-error">{errors.prixAchat.message}</p>}
                </div>
              </div>

              {/* Aperçu marge */}
              {marge !== null && (
                <div className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-[12px] border',
                  marge >= 0
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100',
                )}>
                  <span className="text-text-muted font-medium">Marge brute</span>
                  <div className="flex items-center gap-2">
                    {marge < 0 && <AlertCircle size={13} className="text-danger" />}
                    <span className={cn('font-bold font-mono', marge >= 0 ? 'text-success' : 'text-danger')}>
                      {monnaie === 'USD'
                        ? `${marge >= 0 ? '+' : ''}${marge.toFixed(2)} USD`
                        : formatUSD(marge)}
                    </span>
                    {margePct !== null && (
                      <span className="text-text-muted">({margePct}%)</span>
                    )}
                  </div>
                </div>
              )}

              {monnaie === 'USD' && (
                <p className="text-[10px] text-text-muted">
                  Les prix seront convertis en CDF au taux de 2 800 CDF/USD lors de l'enregistrement.
                </p>
              )}
            </div>
          </div>

          {/* ── Colonne droite (1/3) ─────────────────────────────── */}
          <div className="space-y-5">

            {/* SKU auto-généré */}
            <div className="card space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Référence produit</p>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-border px-4 py-3">
                <Barcode size={18} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-0.5">SKU (auto)</p>
                  <p className={cn(
                    'font-mono font-black text-[18px] leading-none tracking-wider',
                    skuPreview === '—' ? 'text-text-subtle' : 'text-primary',
                  )}>
                    {skuPreview}
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary-accent px-1.5 py-0.5 rounded">
                  Auto
                </span>
              </div>
              {!categorie && (
                <p className="text-[11px] text-text-muted">
                  Sélectionne une catégorie pour voir le SKU généré.
                </p>
              )}
            </div>

            {/* Seuils d'alerte par site */}
            <div className="card space-y-3">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-text-muted" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Seuil d'alerte par site
                </p>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Déclenche une alerte quand le stock descend en dessous de ce seuil.
              </p>

              {sitesDisponibles.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
                  <AlertCircle size={14} className="text-warning shrink-0" />
                  <p className="text-[11px] text-warning">Chargement des sites...</p>
                </div>
              ) : (
                <div>
                  {seuilsParSite.map((row, i) => (
                    <SeuilRow
                      key={row.siteId}
                      index={i}
                      siteNom={row.siteNom}
                      value={row.seuilAlerte}
                      readOnly={!isSuperAdmin && sitesDisponibles.length === 1}
                      onChange={(v) => {
                        const updated = [...seuilsParSite];
                        updated[i] = { ...updated[i], seuilAlerte: v };
                        setValue('seuilsParSite', updated);
                      }}
                    />
                  ))}
                </div>
              )}

              {!isSuperAdmin && isGerant && (
                <p className="text-[10px] text-text-muted">
                  Produit créé sur votre site uniquement.
                </p>
              )}
              {isSuperAdmin && (
                <p className="text-[10px] text-text-muted">
                  Produit créé sur tous les sites. Stock initial = 0 partout, à remplir via une entrée de stock.
                </p>
              )}
            </div>

            {/* Résumé avant soumission */}
            {nomValue && categorie && (
              <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary/60">Aperçu</p>
                <p className="text-[13px] font-bold text-primary truncate">{nomValue}</p>
                <p className="text-[11px] text-text-muted">{categorie} · {skuPreview}</p>
                {prixVente && (
                  <p className="text-[12px] font-semibold text-primary">
                    Vente : {monnaie === 'USD'
                      ? `${Number(prixVente).toFixed(2)} USD`
                      : formatUSD(Number(prixVente))}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
