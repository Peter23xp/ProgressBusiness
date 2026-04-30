import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { OnboardingStepper } from '@/components/clients/OnboardingStepper';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { CodeParrainInput } from '@/components/clients/CodeParrainInput';

// ── Schema Zod ────────────────────────────────────────────────────────────────

const schema = z
  .object({
    prenom:           z.string().min(2, 'Minimum 2 caractères').max(50),
    nom:              z.string().min(2, 'Minimum 2 caractères').max(50),
    telephone:        z.string().regex(/^\+243[0-9]{9}$/, 'Format invalide (+243XXXXXXXXX)'),
    email:            z.string().email('Email invalide').or(z.literal('')).optional(),
    siteId:           z.string().min(1, 'Site requis'),
    codeParrain:      z.string().regex(/^TSG-[0-9]{4}$/).or(z.literal('')).optional(),
    matriculeExterne: z.string().max(50).optional(),
    montantRecit:     z.number({ invalid_type_error: 'Montant requis' }).positive('Montant requis'),
    modePaiement:     z.enum(['CASH', 'MPESA', 'AIRTEL_MONEY', 'VIREMENT']),
    numeroRecu:       z.string().optional(),
  })
  .refine(
    (d) => d.modePaiement === 'CASH' || !!d.numeroRecu,
    { message: 'Numéro de transaction requis pour ce mode', path: ['numeroRecu'] },
  );

type FormValues = z.infer<typeof schema>;

const MODES = [
  { value: 'CASH',         label: 'Cash' },
  { value: 'MPESA',        label: 'M-Pesa' },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money' },
  { value: 'VIREMENT',     label: 'Virement' },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingRecitPage() {
  const navigate   = useNavigate();
  const { user, hasRole } = useAuthStore();

  const isAgent = user?.role === 'AGENT';

  // Charger les sites (GERANT/SUPER_ADMIN) et la config (montant récit)
  const { data: sitesRaw } = useQuery<{ data: Array<{ id: string; nom: string }> }>({
    queryKey: ['sites'],
    queryFn: () => api.get('/sites').then(r => r.data),
    enabled: !isAgent,
  });
  const sites = sitesRaw?.data ?? [];

  const { data: config } = useQuery<{ montantRecit: number }>({
    queryKey: ['config'],
    queryFn: () => api.get('/config').then(r => r.data),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      siteId:       user?.siteId ?? '',
      modePaiement: 'CASH',
      montantRecit: config?.montantRecit ?? undefined,
    },
  });

  // Pré-remplir le montant dès que la config est disponible
  useEffect(() => {
    if (config?.montantRecit) {
      setValue('montantRecit', config.montantRecit, { shouldValidate: false });
    }
  }, [config, setValue]);

  const modePaiement = watch('modePaiement');
  const telephone    = watch('telephone') ?? '';
  const needsRef     = modePaiement !== 'CASH';

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      api.post<{ id: string }>('/clients/onboarding/recit', {
        ...data,
        email: data.email || undefined,
        codeParrain: data.codeParrain || undefined,
        matriculeExterne: data.matriculeExterne || undefined,
        numeroRecu: data.numeroRecu || undefined,
      }),
    onSuccess: (res) => {
      toast.success('Client créé avec succès ! Passage à la formation...');
      setTimeout(() => navigate(`/clients/${res.data.id}/formation`), 1000);
    },
    onError: (error: any) => {
      const code = error?.response?.data?.code;
      const msg  = getErrorMessage(error) || 'Une erreur est survenue.';

      if (code === 'ERR_CONFLICT' && error?.response?.data?.message?.includes('téléphone')) {
        setError('telephone', { message: 'Ce numéro est déjà enregistré.' });
        return;
      }
      if (code === 'ERR_SELF_PARRAINAGE') {
        toast.error('Un client ne peut pas se parrainer lui-même.');
        return;
      }
      toast.error(`${msg} Vos données sont conservées, réessayez.`);
    },
  });

  const fieldCls = (hasErr: boolean) => cn(
    'w-full px-3 py-2.5 rounded-lg border border-border text-[13px] text-text bg-white',
    'focus:outline-none focus:ring-2 focus:ring-primary-accent/30 focus:border-primary-accent transition-colors',
    hasErr && 'border-danger focus:ring-danger/30 focus:border-danger',
  );

  const disabled = isSubmitting || mutation.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/clients')}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-text-muted hover:border-border-strong hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent"
          aria-label="Retour à la liste des clients"
        >
          <ArrowLeft size={17} aria-hidden />
        </button>
        <div>
          <h1 className="text-[18px] font-extrabold text-primary leading-tight">Nouveau client</h1>
          <p className="text-[12px] text-text-muted">Étape 1 sur 4 — Récit de vente</p>
        </div>
      </div>

      {/* Stepper */}
      <OnboardingStepper currentStep={1} />

      {/* Formulaire */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <h2 className="text-[15px] font-bold text-primary mb-5">
          Informations personnelles &amp; Achat du récit
        </h2>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-5">

          {/* Prénom + Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="prenom" className="form-label">Prénom *</label>
              <input
                id="prenom"
                autoComplete="given-name"
                disabled={disabled}
                className={fieldCls(!!errors.prenom)}
                {...register('prenom')}
              />
              {errors.prenom && <p className="form-error">{errors.prenom.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="nom" className="form-label">Nom *</label>
              <input
                id="nom"
                autoComplete="family-name"
                disabled={disabled}
                className={fieldCls(!!errors.nom)}
                {...register('nom')}
              />
              {errors.nom && <p className="form-error">{errors.nom.message}</p>}
            </div>
          </div>

          {/* Téléphone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <Controller
                name="telephone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disabled={disabled}
                    error={errors.telephone?.message}
                  />
                )}
              />
              {errors.telephone && (
                <p className="form-error">{errors.telephone.message}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                placeholder="optionnel"
                autoComplete="email"
                disabled={disabled}
                className={fieldCls(!!errors.email)}
                {...register('email')}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
          </div>

          {/* Site */}
          <div className="form-group">
            <label htmlFor="siteId" className="form-label">Site *</label>
            {isAgent ? (
              <input
                id="siteId"
                value={user?.site?.nom ?? user?.siteName ?? user?.siteId ?? ''}
                disabled
                className={cn(fieldCls(false), 'opacity-60 cursor-not-allowed bg-slate-50')}
                readOnly
              />
            ) : (
              <select
                id="siteId"
                disabled={disabled}
                className={fieldCls(!!errors.siteId)}
                {...register('siteId')}
              >
                <option value="">Sélectionner un site</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            )}
            {isAgent && (
              <input type="hidden" {...register('siteId')} value={user?.siteId ?? ''} />
            )}
            {errors.siteId && <p className="form-error">{errors.siteId.message}</p>}
          </div>

          {/* Code parrain + Matricule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                Code parrain <span className="text-text-muted font-normal">(optionnel)</span>
              </label>
              <Controller
                name="codeParrain"
                control={control}
                render={({ field }) => (
                  <CodeParrainInput
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    currentClientPhone={telephone}
                    disabled={disabled}
                    error={errors.codeParrain?.message}
                  />
                )}
              />
            </div>
            <div className="form-group">
              <label htmlFor="matriculeExterne" className="form-label">
                Matricule externe <span className="text-text-muted font-normal">(optionnel)</span>
              </label>
              <input
                id="matriculeExterne"
                placeholder="ex: NK-GOM-001-0001"
                disabled={disabled}
                className={fieldCls(false)}
                {...register('matriculeExterne')}
              />
            </div>
          </div>

          {/* Séparateur Achat */}
          <div className="rounded-xl border border-border bg-slate-50 p-5 space-y-4">
            <h3 className="text-[13px] font-bold text-primary">Achat du Récit</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Montant */}
              <div className="form-group">
                <label htmlFor="montantRecit" className="form-label">Montant payé * (CDF)</label>
                <input
                  id="montantRecit"
                  type="number"
                  min={1}
                  placeholder="ex: 5 000"
                  disabled={disabled}
                  className={fieldCls(!!errors.montantRecit)}
                  {...register('montantRecit', { valueAsNumber: true })}
                />
                {errors.montantRecit && <p className="form-error">{errors.montantRecit.message}</p>}
              </div>

              {/* Mode paiement */}
              <div className="form-group">
                <p className="form-label">Mode de paiement *</p>
                <div className="grid grid-cols-2 gap-2">
                  {MODES.map((m) => (
                    <label
                      key={m.value}
                      className={cn(
                        'flex items-center justify-center px-3 py-2 border-2 rounded-lg cursor-pointer text-[12px] font-semibold transition-colors',
                        'has-[:checked]:border-primary-accent has-[:checked]:bg-primary-light/40 has-[:checked]:text-primary-accent',
                        'border-border text-text-muted hover:border-border-strong',
                      )}
                    >
                      <input
                        type="radio"
                        value={m.value}
                        className="sr-only"
                        disabled={disabled}
                        {...register('modePaiement')}
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Numéro reçu — conditionnel */}
            {needsRef && (
              <div className="form-group">
                <label htmlFor="numeroRecu" className="form-label">Numéro de transaction *</label>
                <input
                  id="numeroRecu"
                  placeholder="ex: TXN-123456"
                  disabled={disabled}
                  className={fieldCls(!!errors.numeroRecu)}
                  {...register('numeroRecu')}
                />
                {errors.numeroRecu && <p className="form-error">{errors.numeroRecu.message}</p>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
            <Link
              to="/clients"
              className="btn-secondary text-[13px]"
              tabIndex={disabled ? -1 : undefined}
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={disabled}
              className="btn-primary text-[13px] flex items-center gap-2"
            >
              {disabled && <Loader2 size={14} className="animate-spin" aria-hidden />}
              {disabled ? 'Enregistrement…' : 'Enregistrer & Passer à la Formation →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
