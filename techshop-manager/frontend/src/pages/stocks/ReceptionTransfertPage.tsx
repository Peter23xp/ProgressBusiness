import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface ReceptionFormData {
  quantiteRecue: number;
  observations?: string;
}

interface Transfert {
  id: string; statut: string; quantite: number; createdAt: string; motif: string;
  produit: { nom: string; sku: string };
  siteSource: { nom: string };
  siteDestination: { nom: string };
  expediteur: { prenom: string; nom: string };
}

export default function ReceptionTransfertPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: transfert, isLoading } = useQuery<Transfert>({
    queryKey: ['transfert', id],
    queryFn: () => api.get(`/stocks/transfert/${id}`).then(r => r.data),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ReceptionFormData>();
  const quantiteRecue = watch('quantiteRecue');

  const ecart = transfert && quantiteRecue ? Number(quantiteRecue) - transfert.quantite : null;

  const mutation = useMutation({
    mutationFn: (data: ReceptionFormData) => api.patch(`/stocks/transfert/${id}/recevoir`, data),
    onSuccess: () => {
      toast.success('Transfert réceptionné avec succès.');
      qc.invalidateQueries({ queryKey: ['stocks'] });
      navigate('/stocks');
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors de la réception.'),
  });

  const signalMutation = useMutation({
    mutationFn: (observations: string) => api.patch(`/stocks/transfert/${id}/signaler-probleme`, { observations }),
    onSuccess: () => {
      toast.success('Problème signalé.');
      navigate('/stocks');
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur.'),
  });

  if (isLoading) {
    return <div className="p-6 space-y-4">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="card"><div className="skeleton h-40 rounded" /></div>
    </div>;
  }

  if (!transfert) return <div className="p-6 text-center text-gray-400">Transfert introuvable.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Réception de transfert</h1>
          <span className={`badge ${transfert.statut === 'EN_TRANSIT' ? 'badge-warning' : transfert.statut === 'RECEPTIONNE' ? 'badge-success' : 'badge-danger'}`}>{transfert.statut}</span>
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-blue-500 font-semibold uppercase mb-1">Produit</p>
            <p className="font-bold text-gray-900 flex items-center gap-2"><Package size={16} />{transfert.produit.nom}</p>
            <p className="text-sm text-gray-500 font-mono">{transfert.produit.sku}</p>
          </div>
          <div>
            <p className="text-xs text-blue-500 font-semibold uppercase mb-1">Quantité envoyée</p>
            <p className="font-black text-3xl text-blue-700">{transfert.quantite}</p>
          </div>
          <div>
            <p className="text-xs text-blue-500 font-semibold uppercase mb-1">De</p>
            <p className="font-semibold text-gray-800">{transfert.siteSource.nom}</p>
            <p className="text-xs text-gray-500">par {transfert.expediteur.prenom} {transfert.expediteur.nom}</p>
          </div>
          <div>
            <p className="text-xs text-blue-500 font-semibold uppercase mb-1">Date d'envoi</p>
            <p className="font-semibold text-gray-800">{formatDate(transfert.createdAt)}</p>
            <p className="text-xs text-gray-500">Motif: {transfert.motif}</p>
          </div>
        </div>
      </div>

      {transfert.statut === 'RECEPTIONNE' ? (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-500" />
            <p className="font-semibold text-green-800">Ce transfert a déjà été réceptionné.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-5">Confirmer la réception</h2>
          <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-5">
            <div className="form-group">
              <label className="form-label">Quantité reçue *</label>
              <input
                type="number"
                min={0}
                placeholder={String(transfert.quantite)}
                className={`w-full px-4 py-3 border rounded-lg text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantiteRecue ? 'border-red-400' : 'border-gray-300'}`}
                {...register('quantiteRecue', { required: 'Quantité requise', valueAsNumber: true, min: { value: 0, message: 'Minimum 0' } })}
              />
              {errors.quantiteRecue && <p className="form-error">{errors.quantiteRecue.message}</p>}
              {ecart !== null && (
                <div className={`mt-2 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
                  ecart === 0 ? 'bg-green-50 text-green-700 border border-green-200' :
                  ecart < 0 ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {ecart === 0 ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  Écart: {ecart > 0 ? '+' : ''}{ecart} unités {ecart < 0 ? '(manquantes)' : ecart > 0 ? '(en surplus)' : '(aucun écart)'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Observations {ecart !== null && ecart !== 0 ? '(obligatoire si écart)' : '(optionnel)'}</label>
              <textarea
                rows={3}
                placeholder="État des colis, observations sur la livraison..."
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  ecart !== null && ecart !== 0 ? 'border-orange-300' : 'border-gray-300'
                }`}
                {...register('observations', {
                  validate: (val) => {
                    if (ecart !== null && ecart !== 0 && !val?.trim()) return 'Observations requises en cas d\'écart.';
                    return true;
                  }
                })}
              />
              {errors.observations && <p className="form-error">{errors.observations.message}</p>}
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  const obs = (document.querySelector('textarea') as HTMLTextAreaElement)?.value;
                  signalMutation.mutate(obs || 'Problème signalé');
                }}
                className="btn-danger flex items-center gap-2"
              >
                <AlertTriangle size={16} /> Signaler problème
              </button>
              <button type="submit" disabled={mutation.isLoading} className="btn-primary flex items-center gap-2">
                {mutation.isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <CheckCircle size={16} /> Confirmer réception
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
