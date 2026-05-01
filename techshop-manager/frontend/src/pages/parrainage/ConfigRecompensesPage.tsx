import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, RotateCcw, AlertCircle, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { parrainageApi } from '@/lib/parrainage.api';
import { formatCDF, cn } from '@/lib/utils';
import type { ParrainageConfig, ConfigHistoryEntry } from '@/lib/parrainage.api';

// ── Types form ─────────────────────────────────────────────────────────────────

type FormValues = Omit<ParrainageConfig, 'actif'>;

const TYPE_LABELS = {
  POINTS: { unit: 'pts', label: 'Points de fidélité' },
  REMISE_PROCHAINE_VENTE: { unit: '%', label: 'Remise prochaine vente' },
  COMMISSION_CDF: { unit: 'CDF', label: 'Commission CDF' },
} as const;

// ── Simulateur ─────────────────────────────────────────────────────────────────

function Simulateur({ config }: { config: FormValues }) {
  const [nbFilleuls, setNbFilleuls] = useState(3);
  const [montantAchat, setMontantAchat] = useState(150000);

  const { typeRecompense, valeurNiveau1, valeurNiveau2, multiNiveaux } = config;
  const v1 = valeurNiveau1 || 0;
  const v2 = valeurNiveau2 || 0;
  const unitInfo = TYPE_LABELS[typeRecompense] ?? TYPE_LABELS.POINTS;

  function formatVal(v: number) {
    if (typeRecompense === 'POINTS') return `${v} pts`;
    if (typeRecompense === 'COMMISSION_CDF') return formatCDF(v);
    return `${v}%`;
  }

  const gainN1 = typeRecompense === 'REMISE_PROCHAINE_VENTE'
    ? v1
    : typeRecompense === 'COMMISSION_CDF'
    ? Math.round((montantAchat * v1) / 100) * nbFilleuls
    : v1 * nbFilleuls;

  const gainN2 = multiNiveaux && v2 > 0
    ? typeRecompense === 'REMISE_PROCHAINE_VENTE'
      ? v2
      : typeRecompense === 'COMMISSION_CDF'
      ? Math.round((montantAchat * v2) / 100) * nbFilleuls
      : v2 * nbFilleuls
    : null;

  return (
    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Simulateur de récompense</p>

      <div className="flex flex-wrap gap-3">
        <div className="form-group flex-1 min-w-32">
          <label className="form-label text-blue-700">Nb filleuls</label>
          <input
            type="number"
            min={1}
            max={50}
            value={nbFilleuls}
            onChange={e => setNbFilleuls(Math.max(1, parseInt(e.target.value) || 1))}
            className="text-center font-bold"
          />
        </div>
        {typeRecompense === 'COMMISSION_CDF' && (
          <div className="form-group flex-1 min-w-32">
            <label className="form-label text-blue-700">Montant achat (CDF)</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={montantAchat}
              onChange={e => setMontantAchat(parseInt(e.target.value) || 0)}
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-blue-700">Parrain (N1) reçoit</span>
          <span className="font-bold text-blue-900">
            {typeRecompense === 'REMISE_PROCHAINE_VENTE'
              ? `${nbFilleuls} bon${nbFilleuls > 1 ? 's' : ''} de ${v1}%`
              : `${nbFilleuls} × ${formatVal(typeRecompense === 'COMMISSION_CDF' ? Math.round((montantAchat * v1) / 100) : v1)} = ${formatVal(gainN1)}`}
          </span>
        </div>
        {gainN2 !== null && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-blue-600 opacity-80">Parrain du parrain (N2)</span>
            <span className="font-semibold text-blue-800">
              {typeRecompense === 'REMISE_PROCHAINE_VENTE'
                ? `${nbFilleuls} bon${nbFilleuls > 1 ? 's' : ''} de ${v2}%`
                : `${nbFilleuls} × ${formatVal(typeRecompense === 'COMMISSION_CDF' ? Math.round((montantAchat * v2) / 100) : v2)} = ${formatVal(gainN2)}`}
            </span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-blue-500">Calcul basé sur la configuration en cours d'édition, non encore sauvegardée.</p>
    </div>
  );
}

// ── Historique ─────────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  typeRecompense: 'Type de récompense',
  valeurNiveau1: 'Valeur N1',
  valeurNiveau2: 'Valeur N2',
  multiNiveaux: 'Multi-niveaux',
  conditionDeclenchement: 'Condition déclenchement',
  plafondMensuel: 'Plafond mensuel',
};

function HistoriqueTable({ history }: { history: ConfigHistoryEntry[] }) {
  const [page, setPage] = useState(0);
  const perPage = 10;
  const total = history.length;
  const slice = history.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="space-y-3">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Admin</th>
              <th>Champ modifié</th>
              <th>Avant</th>
              <th>Après</th>
            </tr>
          </thead>
          <tbody>
            {slice.map(h => (
              <tr key={h.id} className={cn(slice.indexOf(h) % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                <td className="text-[12px] text-text-muted whitespace-nowrap">
                  {format(new Date(h.changedAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                </td>
                <td className="text-[13px]">{h.changedBy.prenom} {h.changedBy.nom}</td>
                <td className="text-[12px] text-text-muted">{FIELD_LABELS[h.fieldName] ?? h.fieldName}</td>
                <td className="font-mono text-[11px] text-danger">{h.oldValue}</td>
                <td className="font-mono text-[11px] text-success">{h.newValue}</td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted text-[13px]">
                  Aucune modification enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {total > perPage && (
        <div className="flex items-center justify-between text-[12px] text-text-muted">
          <span>Page {page + 1} / {Math.ceil(total / perPage)}</span>
          <div className="flex gap-1">
            <button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary text-[11px]">Préc.</button>
            <button type="button" disabled={(page + 1) * perPage >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary text-[11px]">Suiv.</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal confirmation ─────────────────────────────────────────────────────────

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  affectedParrainages,
  typeChanged,
  oldType,
  newType,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  affectedParrainages: number;
  typeChanged: boolean;
  oldType: string;
  newType: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !isPending && onClose()}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-[15px] text-primary mb-3">Confirmer la modification</h3>
        <p className="text-[13px] text-text-muted mb-3">
          Cette configuration s'applique à <strong>tous les sites</strong> (Goma, Bukavu, Kinshasa) et impactera{' '}
          <strong className="text-primary">{affectedParrainages} parrainage{affectedParrainages > 1 ? 's' : ''}</strong> actif{affectedParrainages > 1 ? 's' : ''} immédiatement.
        </p>
        {typeChanged && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 mb-3">
            <AlertCircle size={13} className="text-danger flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-danger">
              Vous changez le type de récompense de <strong>{oldType}</strong> vers <strong>{newType}</strong>. Les récompenses EN_ATTENTE seront recalculées avec les nouveaux paramètres.
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="btn-secondary flex-1">Annuler</button>
          <button type="button" onClick={onConfirm} disabled={isPending} className="btn-primary flex-1 bg-danger border-danger hover:bg-danger/90">
            {isPending ? 'Enregistrement…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function ConfigRecompensesPage() {
  const qc = useQueryClient();
  const { hasRole } = useAuthStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['parrainage', 'config'],
    queryFn: () => parrainageApi.getConfig(),
    staleTime: 10 * 60_000,
  });

  const { register, handleSubmit, watch, reset, formState: { isDirty, errors } } = useForm<FormValues>({
    defaultValues: data?.config ?? {
      typeRecompense: 'POINTS',
      valeurNiveau1: 500,
      multiNiveaux: false,
      valeurNiveau2: undefined,
      conditionDeclenchement: 'ACTIVATION',
      plafondMensuel: 0,
    },
  });

  const watched = watch();
  const multiNiveaux = watched.multiNiveaux;
  const typeRecompense = watched.typeRecompense;

  useEffect(() => {
    if (data?.config) reset(data.config);
  }, [data?.config, reset]);

  const mutation = useMutation({
    mutationFn: (body: FormValues) => parrainageApi.updateConfig(body),
    onSuccess: () => {
      toast.success('Configuration du parrainage mise à jour avec succès.');
      qc.invalidateQueries({ queryKey: ['parrainage', 'config'] });
      qc.invalidateQueries({ queryKey: ['parrainage'] });
      setConfirmOpen(false);
      setPendingValues(null);
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde. Vérifiez les valeurs saisies.');
      setConfirmOpen(false);
    },
  });

  function onSubmit(values: FormValues) {
    setPendingValues(values);
    setConfirmOpen(true);
  }

  const unitInfo = TYPE_LABELS[typeRecompense] ?? TYPE_LABELS.POINTS;
  const origType = data?.config?.typeRecompense;
  const typeChanged = !!origType && origType !== typeRecompense;
  const affectedParrainages = 0;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="card"><div className="skeleton h-72 rounded-xl" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Settings size={22} className="text-primary" />
          <div>
            <h1 className="text-[18px] font-extrabold text-primary">Configuration du parrainage</h1>
            <p className="text-[12px] text-text-muted">Paramètres globaux — tous les sites</p>
          </div>
        </div>
        {isDirty && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[11px] font-semibold">
            <AlertCircle size={11} /> Modifications non sauvegardées
          </span>
        )}
      </div>

      {/* Avertissement */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
        <p className="text-[12px] text-warning">
          Configuration globale — s'applique à <strong>tous les sites</strong> (Goma, Bukavu, Kinshasa). Toute modification impacte immédiatement l'ensemble des parrainages actifs.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="card space-y-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Règles de récompense</p>

          {/* Type */}
          <div className="form-group">
            <label className="form-label">Type de récompense *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(TYPE_LABELS) as (keyof typeof TYPE_LABELS)[]).map(t => (
                <label
                  key={t}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors text-[13px]',
                    typeRecompense === t ? 'border-primary-accent bg-primary-light/20' : 'border-border hover:border-border-strong',
                  )}
                >
                  <input type="radio" value={t} {...register('typeRecompense')} className="sr-only" />
                  <div className={cn('w-3.5 h-3.5 rounded-full border-2 shrink-0', typeRecompense === t ? 'border-primary-accent bg-primary-accent' : 'border-border')} />
                  <span className={typeRecompense === t ? 'font-semibold text-primary' : 'text-text-muted'}>
                    {TYPE_LABELS[t].label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Valeurs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Valeur N1 (parrain direct) *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={typeRecompense === 'REMISE_PROCHAINE_VENTE' ? 50 : 100000}
                  placeholder={typeRecompense === 'REMISE_PROCHAINE_VENTE' ? 'ex: 5' : 'ex: 500'}
                  {...register('valeurNiveau1', {
                    required: 'Requis',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Min 1' },
                    max: typeRecompense === 'REMISE_PROCHAINE_VENTE' ? { value: 50, message: 'Max 50%' } : undefined,
                  })}
                />
                <span className="text-[12px] font-bold text-text-muted shrink-0">{unitInfo.unit}</span>
              </div>
              {errors.valeurNiveau1 && <p className="form-error">{errors.valeurNiveau1.message}</p>}
            </div>

            {multiNiveaux && (
              <div className="form-group">
                <label className="form-label">Valeur N2 (parrain du parrain) *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    placeholder={typeRecompense === 'REMISE_PROCHAINE_VENTE' ? 'ex: 2' : 'ex: 200'}
                    {...register('valeurNiveau2', {
                      valueAsNumber: true,
                      min: { value: 1, message: 'Min 1' },
                    })}
                  />
                  <span className="text-[12px] font-bold text-text-muted shrink-0">{unitInfo.unit}</span>
                </div>
                {errors.valeurNiveau2 && <p className="form-error">{errors.valeurNiveau2.message}</p>}
              </div>
            )}
          </div>

          {/* Multi-niveaux */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-primary">Parrainage multi-niveaux</p>
              <p className="text-[11px] text-text-muted mt-0.5">Attribuer des récompenses au parrain du parrain (N2)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('multiNiveaux')} />
              <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Condition */}
            <div className="form-group">
              <label className="form-label">Condition de déclenchement *</label>
              <div className="space-y-2">
                {[
                  { value: 'ACTIVATION', label: "À l'activation du filleul" },
                  { value: 'PREMIER_ACHAT', label: 'Au premier achat du filleul' },
                ].map(opt => (
                  <label key={opt.value} className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer text-[13px] transition-colors',
                    watched.conditionDeclenchement === opt.value ? 'border-primary-accent bg-primary-light/20' : 'border-border',
                  )}>
                    <input type="radio" value={opt.value} {...register('conditionDeclenchement')} className="sr-only" />
                    <div className={cn('w-3.5 h-3.5 rounded-full border-2 shrink-0', watched.conditionDeclenchement === opt.value ? 'border-primary-accent bg-primary-accent' : 'border-border')} />
                    <span className={watched.conditionDeclenchement === opt.value ? 'font-medium text-primary' : 'text-text-muted'}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Plafond */}
            <div className="form-group">
              <label className="form-label">Plafond mensuel</label>
              <input
                type="number"
                min={0}
                placeholder="0 = illimité"
                {...register('plafondMensuel', { valueAsNumber: true, min: { value: 0, message: 'Min 0' } })}
              />
              <p className="text-[11px] text-text-muted mt-1">Récompenses max par mois par parrain. 0 = illimité.</p>
              {errors.plafondMensuel && <p className="form-error">{errors.plafondMensuel.message}</p>}
            </div>
          </div>
        </div>

        {/* Simulateur */}
        <Simulateur config={watched} />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => reset(data?.config)}
            disabled={!isDirty}
            className="btn-secondary text-[13px]"
          >
            <RotateCcw size={13} /> Annuler les modifications
          </button>
          <button
            type="submit"
            disabled={!isDirty || mutation.isPending}
            className="btn-primary text-[13px]"
          >
            <Save size={13} /> Enregistrer la configuration
          </button>
        </div>
      </form>

      {/* Historique */}
      {data?.history && data.history.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-text-muted" />
            <p className="text-[13px] font-semibold text-primary">Historique des modifications</p>
          </div>
          <HistoriqueTable history={data.history} />
        </div>
      )}

      {/* Modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => pendingValues && mutation.mutate(pendingValues)}
        isPending={mutation.isPending}
        affectedParrainages={affectedParrainages}
        typeChanged={typeChanged}
        oldType={origType ?? ''}
        newType={typeRecompense}
      />
    </div>
  );
}
