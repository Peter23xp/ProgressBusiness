import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Package, CheckCircle2, AlertCircle, AlertTriangle, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { stocksApi } from '@/lib/stocks.api';
import { StockStatusBadge } from '@/components/stocks/StockStatusBadge';
import { cn, formatDateTime } from '@/lib/utils';

export default function ReceptionTransfertPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuthStore();
  const qc = useQueryClient();

  const [quantiteRecue, setQuantiteRecue] = useState<number | ''>('');
  const [observations, setObservations] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportRaison, setReportRaison] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reported, setReported] = useState(false);
  const [success, setSuccess] = useState<{ stockApres: number; statut: 'OK' | 'ALERTE' | 'RUPTURE'; ecart: number | null } | null>(null);

  const { data: transfert, isLoading } = useQuery({
    queryKey: ['transfert', id],
    queryFn: () => stocksApi.getTransferById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: () => stocksApi.receiveTransfer(id!, {
      quantiteRecue: quantiteRecue as number,
      observations: observations || undefined,
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['stocks'] });
      qc.invalidateQueries({ queryKey: ['stock-alerts'] });
      qc.invalidateQueries({ queryKey: ['transfert', id] });
      setConfirmOpen(false);
      setSuccess({ stockApres: res.stockDestinationApres, statut: res.statut, ecart: res.ecart });
    },
    onError: (error: any) => {
      setConfirmOpen(false);
      const code = error?.response?.data?.code;
      if (code === 'ERR_ALREADY_RECEIVED') {
        toast.error('Ce transfert a déjà été réceptionné.');
      } else {
        toast.error('Erreur lors de la réception.');
      }
    },
  });

  const reportMutation = useMutation({
    mutationFn: () => stocksApi.reportTransfer(id!, { raison: reportRaison, details: reportDetails || undefined }),
    onSuccess: () => {
      toast.success('Problème signalé. Le Gérant expéditeur a été notifié.');
      setReportOpen(false);
      setReported(true);
    },
    onError: () => toast.error('Erreur lors du signalement.'),
  });

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="card"><div className="skeleton h-40 rounded" /></div>
      </div>
    );
  }

  if (!transfert) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-3">
        <Package size={36} className="text-text-muted mx-auto opacity-30" />
        <p className="text-[14px] font-semibold text-text-muted">Transfert introuvable.</p>
        <button type="button" onClick={() => navigate('/stocks')} className="btn-secondary text-[13px]">
          <ArrowLeft size={14} /> Retour
        </button>
      </div>
    );
  }

  // Garde accès strict
  const isSuperAdmin = hasRole('SUPER_ADMIN');
  const isDestGerant = user?.siteId === transfert.siteDestinationId;
  if (!isSuperAdmin && !isDestGerant) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-3">
        <AlertCircle size={36} className="text-danger mx-auto opacity-60" />
        <h2 className="text-[16px] font-bold text-primary">Accès refusé</h2>
        <p className="text-[13px] text-text-muted">
          Ce transfert est destiné au site {transfert.siteDestinationNom}. Vous n'êtes pas autorisé à valider cette réception.
        </p>
        <button type="button" onClick={() => navigate('/stocks')} className="btn-secondary text-[13px]">
          <ArrowLeft size={14} /> Retour
        </button>
      </div>
    );
  }

  // Succès
  if (success) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="card text-center space-y-4 py-10">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-success" />
          </div>
          <h2 className="text-[17px] font-bold text-primary">Réception confirmée !</h2>
          <p className="text-[13px] text-text-muted">
            {transfert.produitNom} — {transfert.siteDestinationNom}
          </p>
          {success.ecart !== null && success.ecart !== 0 && (
            <div className={cn(
              'rounded-lg px-4 py-2 text-[12px] font-medium',
              success.ecart < 0 ? 'bg-amber-50 text-warning' : 'bg-blue-50 text-primary-accent',
            )}>
              Écart constaté : {success.ecart > 0 ? '+' : ''}{success.ecart} unités
            </div>
          )}
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase text-text-muted">Stock {transfert.siteDestinationNom}</p>
              <p className="font-mono font-black text-[24px]">{success.stockApres}</p>
            </div>
            <StockStatusBadge statut={success.statut} />
          </div>
          <button type="button" onClick={() => navigate('/stocks')} className="btn-primary mx-auto">
            <ArrowLeft size={14} /> Retour aux stocks
          </button>
        </div>
      </div>
    );
  }

  const hoursSince = differenceInHours(new Date(), new Date(transfert.createdAt));
  const is72h = hoursSince > 72;
  const alreadyDone = transfert.statut !== 'EN_TRANSIT';

  const qty = typeof quantiteRecue === 'number' ? quantiteRecue : null;
  const ecart = qty !== null ? qty - transfert.quantiteEnvoyee : null;
  const obsRequired = ecart !== null && ecart !== 0;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Banner 72h */}
      {is72h && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-danger font-medium">
            Ce transfert est en attente depuis plus de 72 heures. Veuillez le traiter immédiatement.
          </p>
        </div>
      )}

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
          <h1 className="text-[18px] font-extrabold text-primary">Réception de transfert</h1>
          <p className="text-[12px] text-text-muted">Valider la réception des marchandises</p>
        </div>
      </div>

      {/* Détail transfert */}
      <div className="card space-y-3 bg-blue-50/50 border-blue-100">
        <div className="grid grid-cols-2 gap-y-3 text-[13px]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Produit</p>
            <p className="font-semibold">{transfert.produitNom}</p>
            <p className="font-mono text-[11px] text-text-muted">{transfert.sku}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Quantité envoyée</p>
            <p className="font-mono font-black text-[24px] text-primary-accent">{transfert.quantiteEnvoyee}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Expéditeur</p>
            <p className="font-medium">{transfert.siteSourceNom}</p>
            <p className="text-[11px] text-text-muted">par {transfert.initiePar}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">Date d'envoi</p>
            <p className="font-medium">{formatDateTime(transfert.createdAt)}</p>
            <p className="text-[11px] text-text-muted">
              <Clock size={10} className="inline mr-0.5" />
              {formatDistanceToNow(new Date(transfert.createdAt), { locale: fr, addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Déjà traité */}
      {alreadyDone ? (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <CheckCircle2 size={16} className="text-primary-accent" />
          <p className="text-[13px] text-primary-accent font-medium">
            Ce transfert a déjà été traité (statut : {transfert.statut}).
          </p>
          <button type="button" onClick={() => navigate('/stocks')} className="ml-auto text-[12px] text-primary-accent underline hover:no-underline">
            ← Retour aux stocks
          </button>
        </div>
      ) : (
        <div className="card space-y-5">
          {reported && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
              <CheckCircle2 size={13} className="text-success" />
              <p className="text-[12px] text-success font-medium">Problème signalé à l'expéditeur.</p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Quantité réellement reçue *</label>
            <input
              type="number"
              min={0}
              max={99999}
              placeholder={String(transfert.quantiteEnvoyee)}
              value={quantiteRecue}
              onChange={e => setQuantiteRecue(e.target.value ? parseInt(e.target.value) : '')}
              className="text-center text-[22px] font-black"
            />
          </div>

          {/* EcartAlert */}
          {ecart !== null && ecart !== 0 && (
            <div className={cn(
              'flex items-start gap-2.5 rounded-lg px-3 py-3 border',
              ecart < 0 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200',
            )}>
              <AlertTriangle size={14} className={cn('flex-shrink-0 mt-0.5', ecart < 0 ? 'text-warning' : 'text-danger')} />
              <div>
                <p className={cn('text-[12px] font-semibold', ecart < 0 ? 'text-warning' : 'text-danger')}>
                  {ecart < 0 ? 'Réception partielle' : 'Surplus détecté'} — Écart : {ecart > 0 ? '+' : ''}{ecart} unités
                </p>
                <p className={cn('text-[11px] mt-0.5', ecart < 0 ? 'text-warning/80' : 'text-danger/80')}>
                  Vous avez reçu {qty} sur {transfert.quantiteEnvoyee} envoyées.
                  Une observation est obligatoire. L'expéditeur sera notifié de cet écart.
                </p>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Observations {obsRequired ? '*' : <span className="text-text-muted font-normal normal-case">(optionnel)</span>}
            </label>
            <textarea
              rows={3}
              placeholder="État des colis, observations..."
              value={observations}
              onChange={e => setObservations(e.target.value)}
              className={cn('resize-none', obsRequired && !observations.trim() && 'border-warning')}
            />
            {obsRequired && !observations.trim() && (
              <p className="form-error">Observation obligatoire si écart détecté.</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="btn-secondary text-[13px] text-danger border-danger/30 hover:bg-red-50"
            >
              <AlertTriangle size={14} />
              Signaler un problème
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={!qty && qty !== 0 || (obsRequired && !observations.trim())}
              className="btn-primary text-[13px]"
            >
              <CheckCircle2 size={14} />
              Confirmer la réception
            </button>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !mutation.isPending && setConfirmOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-[15px] text-primary mb-4">Confirmer la réception ?</h3>
            <div className="space-y-2 text-[13px] bg-slate-50 rounded-xl p-4 mb-5">
              <div className="flex justify-between">
                <span className="text-text-muted">Produit</span>
                <span className="font-medium">{transfert.produitNom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Quantité reçue</span>
                <span className="font-bold">{quantiteRecue} unités</span>
              </div>
              {ecart !== null && ecart !== 0 && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Écart</span>
                  <span className={cn('font-bold', ecart < 0 ? 'text-warning' : 'text-danger')}>
                    {ecart > 0 ? '+' : ''}{ecart} unités
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmOpen(false)} disabled={mutation.isPending} className="btn-secondary flex-1">Annuler</button>
              <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary flex-1">
                {mutation.isPending ? 'Confirmation…' : '✓ Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report dialog */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !reportMutation.isPending && setReportOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-[15px] text-primary mb-4">Signaler un problème</h3>
            <div className="space-y-2 mb-4">
              {[
                'Produit endommagé à la réception',
                'Produit différent de celui attendu',
                'Emballage défectueux',
                'Autre',
              ].map(r => (
                <label key={r} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                  <input
                    type="radio"
                    name="raison"
                    value={r}
                    checked={reportRaison === r}
                    onChange={() => setReportRaison(r)}
                    className="w-4 h-4"
                  />
                  <span className="text-[13px]">{r}</span>
                </label>
              ))}
            </div>
            {reportRaison === 'Autre' && (
              <textarea
                rows={2}
                placeholder="Décrivez le problème..."
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                className="resize-none mb-4"
              />
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setReportOpen(false)} disabled={reportMutation.isPending} className="btn-secondary flex-1">Annuler</button>
              <button
                type="button"
                onClick={() => reportMutation.mutate()}
                disabled={!reportRaison || reportMutation.isPending}
                className="btn-danger flex-1"
              >
                {reportMutation.isPending ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
