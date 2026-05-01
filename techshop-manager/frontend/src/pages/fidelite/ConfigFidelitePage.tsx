import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Settings, Save, Star, History, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fideliteApi, NIVEAU_COLORS, NIVEAU_LABELS, DEFAULT_NIVEAUX,
  type FideliteConfig, type NiveauConfig, type ConfigHistoryEntry,
} from '@/lib/fidelite.api';
import { formatDate, cn } from '@/lib/utils';
import type { NiveauFidelite } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  ratioPtsCDF: 'Ratio points/CDF',
  dureeValiditeMois: 'Durée validité (mois)',
  periodeInactiviteMois: 'Inactivité (mois)',
  cumulRemises: 'Cumul remises',
  'niveaux.ARGENT.seuilMin': 'Seuil Argent',
  'niveaux.OR.seuilMin': 'Seuil Or',
  'niveaux.PLATINE.seuilMin': 'Seuil Platine',
  'niveaux.BRONZE.remisePct': 'Remise Bronze',
  'niveaux.ARGENT.remisePct': 'Remise Argent',
  'niveaux.OR.remisePct': 'Remise Or',
  'niveaux.PLATINE.remisePct': 'Remise Platine',
};

// ── Niveau Preview ─────────────────────────────────────────────────────────────

function NiveauPreview({ niveaux, ratioPtsCDF }: { niveaux: NiveauConfig[]; ratioPtsCDF: number }) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">Aperçu progression</p>
      <div className="flex items-stretch gap-0 rounded-xl overflow-hidden border border-border">
        {niveaux.map((n, i) => {
          const color = NIVEAU_COLORS[n.niveau as NiveauFidelite] ?? '#9ca3af';
          const width = i === niveaux.length - 1 ? 'flex-1' : undefined;
          const pts = n.seuilMax !== null ? n.seuilMax : '∞';
          return (
            <div
              key={n.niveau}
              className={cn('px-3 py-2.5 text-center border-r border-white/30 last:border-0', width ?? 'w-1/4')}
              style={{ backgroundColor: `${color}20` }}
            >
              <p className="text-[11px] font-black uppercase" style={{ color }}>{NIVEAU_LABELS[n.niveau as NiveauFidelite]}</p>
              <p className="text-[9px] text-text-muted mt-0.5 font-mono">{n.seuilMin.toLocaleString()}–{typeof pts === 'number' ? pts.toLocaleString() : pts}</p>
              <p className="text-[10px] font-bold mt-1" style={{ color }}>{n.remisePct}%</p>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-text-muted">
        Taux de conversion : <span className="font-bold">1 pt = {ratioPtsCDF.toLocaleString()} CDF dépensé</span>
      </p>
    </div>
  );
}

// ── Simulateur ────────────────────────────────────────────────────────────────

function Simulateur({ niveaux, ratioPtsCDF }: { niveaux: NiveauConfig[]; ratioPtsCDF: number }) {
  const [achat, setAchat] = useState(50000);
  const ptsGagnes = Math.floor(achat / ratioPtsCDF);
  const ptsTotal = ptsGagnes;

  const niveau = [...niveaux]
    .reverse()
    .find(n => ptsTotal >= n.seuilMin) ?? niveaux[0];
  const color = NIVEAU_COLORS[niveau.niveau as NiveauFidelite] ?? '#9ca3af';
  const remise = niveau.remisePct;
  const economieCDF = Math.floor(achat * remise / 100);

  return (
    <div className="rounded-xl bg-slate-50 border border-border p-4 space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Simulateur</p>
      <div className="flex items-center gap-3">
        <label className="text-[12px] text-text-muted shrink-0">Montant achat</label>
        <input
          type="number"
          min={0}
          step={1000}
          value={achat}
          onChange={e => setAchat(Number(e.target.value))}
          className="w-36 text-sm"
        />
        <span className="text-[12px] text-text-muted">CDF</span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-lg px-2 py-2 border border-border">
          <p className="font-black text-[18px] text-amber-600">{ptsGagnes}</p>
          <p className="text-[9px] text-text-muted uppercase font-semibold tracking-wider">pts gagnés</p>
        </div>
        <div className="bg-white rounded-lg px-2 py-2 border border-border">
          <p className="font-black text-[18px]" style={{ color }}>{remise}%</p>
          <p className="text-[9px] text-text-muted uppercase font-semibold tracking-wider">remise</p>
        </div>
        <div className="bg-white rounded-lg px-2 py-2 border border-border">
          <p className="font-black text-[18px] text-success">{economieCDF.toLocaleString()}</p>
          <p className="text-[9px] text-text-muted uppercase font-semibold tracking-wider">CDF économisé</p>
        </div>
      </div>
    </div>
  );
}

// ── Historique Table ──────────────────────────────────────────────────────────

function HistoriqueTable({ entries }: { entries: ConfigHistoryEntry[] }) {
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const totalPages = Math.ceil(entries.length / PER_PAGE);
  const displayed = entries.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (entries.length === 0) {
    return <p className="text-[12px] text-text-muted text-center py-8">Aucune modification enregistrée.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Champ modifié</th>
              <th>Avant</th>
              <th>Après</th>
              <th>Par</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(e => (
              <tr key={e.id}>
                <td className="text-[12px] font-medium text-primary">{FIELD_LABELS[e.fieldName] ?? e.fieldName}</td>
                <td className="font-mono text-[11px] text-danger line-through text-text-muted">{e.oldValue}</td>
                <td className="font-mono text-[11px] text-success font-semibold">{e.newValue}</td>
                <td className="text-[12px] text-text-muted">{e.changedBy.prenom} {e.changedBy.nom}</td>
                <td className="text-[12px] text-text-muted whitespace-nowrap">{formatDate(e.changedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[12px] text-text-muted pt-1">
          <span>Page {page} / {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-border-strong disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={13} /> Préc.
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-border-strong disabled:opacity-40 transition-colors"
            >
              Suiv. <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  clientsRecomputes,
  isPending,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  clientsRecomputes?: number;
  isPending: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <button type="button" onClick={onCancel} className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors">
          <X size={18} />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-[16px] text-primary">Sauvegarder la configuration ?</h3>
            {typeof clientsRecomputes === 'number' && clientsRecomputes > 0 ? (
              <p className="text-[13px] text-text-muted mt-1">
                Cette modification recalculera les niveaux de{' '}
                <span className="font-bold text-primary">{clientsRecomputes.toLocaleString()} client{clientsRecomputes > 1 ? 's' : ''}</span>.
                L'opération est irréversible.
              </p>
            ) : (
              <p className="text-[13px] text-text-muted mt-1">
                Les modifications seront appliquées immédiatement.
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="btn-primary"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sauvegarde...
              </span>
            ) : (
              <span className="flex items-center gap-2"><Save size={14} /> Confirmer</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

interface FormValues {
  ratioPtsCDF: number;
  dureeValiditeMois: number;
  periodeInactiviteMois: number;
  cumulRemises: boolean;
  niveaux: NiveauConfig[];
}

export default function ConfigFidelitePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'historique'>('config');

  const { data, isLoading } = useQuery({
    queryKey: ['fidelite', 'config'],
    queryFn: () => fideliteApi.getConfig(),
    staleTime: 5 * 60_000,
  });

  const { register, handleSubmit, watch, reset, control, formState: { isDirty, errors } } = useForm<FormValues>({
    defaultValues: {
      ratioPtsCDF: 1000,
      dureeValiditeMois: 12,
      periodeInactiviteMois: 6,
      cumulRemises: false,
      niveaux: DEFAULT_NIVEAUX,
    },
  });

  useEffect(() => {
    if (data?.config) {
      reset({
        ratioPtsCDF: data.config.ratioPtsCDF,
        dureeValiditeMois: data.config.dureeValiditeMois,
        periodeInactiviteMois: data.config.periodeInactiviteMois,
        cumulRemises: data.config.cumulRemises,
        niveaux: data.config.niveaux,
      });
    }
  }, [data, reset]);

  const watchedNiveaux = useWatch({ control, name: 'niveaux' }) ?? DEFAULT_NIVEAUX;
  const watchedRatio = useWatch({ control, name: 'ratioPtsCDF' }) ?? 1000;

  const mutation = useMutation({
    mutationFn: (body: Partial<FideliteConfig>) => fideliteApi.updateConfig(body),
    onSuccess: res => {
      toast.success(`Configuration sauvegardée. ${res.clientsRecomputes} clients recalculés.`);
      qc.invalidateQueries({ queryKey: ['fidelite'] });
      setShowConfirm(false);
      setPendingValues(null);
    },
    onError: () => toast.error('Erreur lors de la sauvegarde.'),
  });

  function onSubmit(values: FormValues) {
    setPendingValues(values);
    setShowConfirm(true);
  }

  function handleConfirm() {
    if (!pendingValues) return;
    mutation.mutate(pendingValues);
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="skeleton h-9 w-9 rounded-lg" />
          <div className="skeleton h-6 w-64 rounded" />
        </div>
        <div className="card"><div className="skeleton h-64 rounded-xl" /></div>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        open={showConfirm}
        onConfirm={handleConfirm}
        onCancel={() => { setShowConfirm(false); setPendingValues(null); }}
        isPending={mutation.isPending}
      />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/fidelite')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted hover:border-border-strong hover:text-text transition-colors"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-[18px] font-extrabold text-primary">Configuration fidélité</h1>
              {isDirty && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  Modifications non sauvegardées
                </span>
              )}
            </div>
            <p className="text-[12px] text-text-muted">Paramètres du programme de récompense</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="period-toggle w-fit">
          <button
            type="button"
            className={cn('period-btn', activeTab === 'config' && 'active')}
            onClick={() => setActiveTab('config')}
          >
            <Settings size={13} /> Configuration
          </button>
          <button
            type="button"
            className={cn('period-btn', activeTab === 'historique' && 'active')}
            onClick={() => setActiveTab('historique')}
          >
            <History size={13} /> Historique
          </button>
        </div>

        {activeTab === 'config' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              {/* Niveaux + remises */}
              <div className="card space-y-4">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-500" />
                  <p className="text-[13px] font-bold text-primary">Niveaux et seuils</p>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Niveau</th>
                        <th>Seuil min (pts)</th>
                        <th>Seuil max (pts)</th>
                        <th>Remise (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchedNiveaux.map((n, i) => {
                        const color = NIVEAU_COLORS[n.niveau as NiveauFidelite] ?? '#9ca3af';
                        return (
                          <tr key={n.niveau}>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-[12px] font-bold" style={{ color }}>
                                  {NIVEAU_LABELS[n.niveau as NiveauFidelite]}
                                </span>
                              </div>
                            </td>
                            <td>
                              {i === 0 ? (
                                <span className="text-[11px] text-text-muted italic">0 (fixe)</span>
                              ) : (
                                <input
                                  type="number"
                                  min={1}
                                  className={cn('w-24 text-sm', errors.niveaux?.[i]?.seuilMin && 'border-danger')}
                                  {...register(`niveaux.${i}.seuilMin`, { valueAsNumber: true, min: 1 })}
                                />
                              )}
                            </td>
                            <td>
                              {i === watchedNiveaux.length - 1 ? (
                                <span className="text-[11px] text-text-muted italic font-mono">∞</span>
                              ) : (
                                <input
                                  type="number"
                                  min={1}
                                  className="w-24 text-sm"
                                  {...register(`niveaux.${i}.seuilMax`, { valueAsNumber: true, min: 1 })}
                                />
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={0.5}
                                  className="w-16 text-sm"
                                  {...register(`niveaux.${i}.remisePct`, { valueAsNumber: true, min: 0, max: 100 })}
                                />
                                <span className="text-[11px] text-text-muted">%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <NiveauPreview niveaux={watchedNiveaux} ratioPtsCDF={watchedRatio} />
              </div>

              {/* Paramètres généraux */}
              <div className="space-y-4">
                <div className="card space-y-4">
                  <p className="text-[13px] font-bold text-primary">Paramètres généraux</p>

                  <div className="form-group">
                    <label className="form-label">Ratio points / CDF dépensé</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-text-muted">1 pt =</span>
                      <input
                        type="number"
                        min={1}
                        className={cn('w-28 text-sm', errors.ratioPtsCDF && 'border-danger')}
                        {...register('ratioPtsCDF', { valueAsNumber: true, min: 1 })}
                      />
                      <span className="text-[12px] text-text-muted">CDF</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">Ex: 1 point par 1 000 CDF dépensé</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Validité points (mois)</label>
                      <input
                        type="number"
                        min={1}
                        className="text-sm"
                        {...register('dureeValiditeMois', { valueAsNumber: true, min: 1 })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Inactivité max (mois)</label>
                      <input
                        type="number"
                        min={1}
                        className="text-sm"
                        {...register('periodeInactiviteMois', { valueAsNumber: true, min: 1 })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-border px-4 py-3">
                    <div>
                      <p className="text-[12px] font-semibold text-primary">Cumul remises et promotions</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Applique la remise fidélité en plus des promos actives</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" {...register('cumulRemises')} />
                      <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                </div>

                {/* Simulateur */}
                <Simulateur niveaux={watchedNiveaux} ratioPtsCDF={watchedRatio} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => data?.config && reset({
                  ratioPtsCDF: data.config.ratioPtsCDF,
                  dureeValiditeMois: data.config.dureeValiditeMois,
                  periodeInactiviteMois: data.config.periodeInactiviteMois,
                  cumulRemises: data.config.cumulRemises,
                  niveaux: data.config.niveaux,
                })}
                disabled={!isDirty}
                className="btn-secondary disabled:opacity-40"
              >
                Annuler les modifications
              </button>
              <button
                type="submit"
                disabled={!isDirty || mutation.isPending}
                className="btn-primary disabled:opacity-40"
              >
                <Save size={14} /> Sauvegarder
              </button>
            </div>
          </form>
        ) : (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-text-muted" />
              <p className="text-[13px] font-bold text-primary">Historique des modifications</p>
            </div>
            <HistoriqueTable entries={data?.history ?? []} />
          </div>
        )}
      </div>
    </>
  );
}
