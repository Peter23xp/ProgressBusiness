import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { formatCDF, formatDateTime } from '@/lib/utils';

interface RetourFormData {
  lignesRetour: Record<string, boolean>;
  motif: string;
  motifDetail?: string;
  modeRemboursement: string;
}

interface VenteLigne { id: string; produitNom: string; quantite: number; prixUnitaire: number; sousTotal: number }
interface Vente { id: string; numero: string; createdAt: string; montantTotal: number; client?: { prenom: string; nom: string }; lignes: VenteLigne[] }

export default function RetoursPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vente, isLoading } = useQuery<Vente>({
    queryKey: ['vente-retour', id],
    queryFn: () => api.get(`/ventes/${id}`).then(r => r.data),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RetourFormData>({
    defaultValues: { modeRemboursement: 'CASH' },
  });

  const lignesRetour = watch('lignesRetour') || {};
  const montantRetour = vente?.lignes
    .filter(l => lignesRetour[l.id])
    .reduce((sum, l) => sum + l.sousTotal, 0) || 0;

  const mutation = useMutation({
    mutationFn: (data: RetourFormData) => {
      const lignes = vente?.lignes.filter(l => data.lignesRetour?.[l.id]).map(l => l.id) || [];
      return api.post(`/ventes/${id}/retour`, {
        lignesIds: lignes,
        motif: data.motif,
        motifDetail: data.motifDetail,
        modeRemboursement: data.modeRemboursement,
      });
    },
    onSuccess: () => {
      toast.success('Retour enregistré avec succès.');
      navigate(`/sales/${id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors du retour.'),
  });

  if (isLoading) {
    return <div className="p-6 space-y-4">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="card"><div className="skeleton h-40 rounded" /></div>
    </div>;
  }

  if (!vente) return <div className="p-6 text-center text-gray-400">Vente introuvable.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><RotateCcw size={20} className="text-orange-500" /> Initier un retour</h1>
          <p className="text-sm text-gray-500">Vente {vente.numero} · {formatDateTime(vente.createdAt)}</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{vente.numero}</p>
            {vente.client && <p className="text-sm text-gray-500">Client: {vente.client.prenom} {vente.client.nom}</p>}
          </div>
          <p className="font-black text-orange-700 text-xl">{formatCDF(vente.montantTotal)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-5">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Articles à retourner</h2>
          <div className="space-y-3">
            {vente.lignes.map(ligne => (
              <label key={ligne.id} className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                lignesRetour[ligne.id] ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-400"
                  {...register(`lignesRetour.${ligne.id}`)}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{ligne.produitNom}</p>
                  <p className="text-xs text-gray-500">{ligne.quantite} x {formatCDF(ligne.prixUnitaire)}</p>
                </div>
                <p className="font-bold text-gray-900">{formatCDF(ligne.sousTotal)}</p>
              </label>
            ))}
          </div>
          {montantRetour > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex justify-between font-bold">
              <span className="text-gray-700">Montant à rembourser:</span>
              <span className="text-orange-700 text-lg">{formatCDF(montantRetour)}</span>
            </div>
          )}
        </div>

        <div className="card space-y-5">
          <div className="form-group">
            <label className="form-label">Motif du retour *</label>
            <select
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.motif ? 'border-red-400' : 'border-gray-300'}`}
              {...register('motif', { required: 'Motif requis' })}
            >
              <option value="">Sélectionner un motif</option>
              <option value="DEFECTUEUX">Produit défectueux</option>
              <option value="MAUVAISE_TAILLE">Mauvaise taille / modèle</option>
              <option value="ERREUR_COMMANDE">Erreur de commande</option>
              <option value="INSATISFACTION">Insatisfaction client</option>
              <option value="AUTRE">Autre</option>
            </select>
            {errors.motif && <p className="form-error">{errors.motif.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Détails supplémentaires (optionnel)</label>
            <textarea
              rows={3}
              placeholder="Décrivez le problème en détail..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register('motifDetail')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mode de remboursement *</label>
            <div className="grid grid-cols-3 gap-3">
              {['CASH', 'MPESA', 'AVOIR'].map(mode => (
                <label key={mode} className="relative flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                  <input type="radio" value={mode} className="sr-only" {...register('modeRemboursement', { required: true })} />
                  <span className="font-medium text-sm">{mode === 'CASH' ? 'Cash' : mode === 'MPESA' ? 'M-Pesa' : 'Avoir'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Annuler</button>
          <button
            type="submit"
            disabled={mutation.isLoading || Object.values(lignesRetour).filter(Boolean).length === 0}
            className="btn-danger flex items-center gap-2 disabled:opacity-50"
          >
            {mutation.isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RotateCcw size={16} />}
            Confirmer le retour ({formatCDF(montantRetour)})
          </button>
        </div>
      </form>
    </div>
  );
}
