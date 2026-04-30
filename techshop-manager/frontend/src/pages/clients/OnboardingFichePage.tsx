import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { formatCDF } from '@/lib/utils';

interface FicheFormData {
  montantFiche: number;
  modePaiement: string;
  numeroTransaction?: string;
}

interface ClientOnboardingState {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  site: { nom: string };
  onboarding: {
    recitDate?: string;
    recitMontant?: number;
    formationDate?: string;
    formationNotes?: string;
  };
}

export default function OnboardingFichePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: client } = useQuery<ClientOnboardingState>({
    queryKey: ['client-basic', id],
    queryFn: () => api.get(`/clients/${id}`).then(r => r.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FicheFormData>({
    defaultValues: { modePaiement: 'CASH' },
  });

  const mutation = useMutation({
    mutationFn: (data: FicheFormData) => api.post(`/clients/${id}/onboarding/fiche`, data),
    onSuccess: () => {
      toast.success('Fiche client enregistrée !');
      navigate(`/clients/${id}/activate`);
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors de l\'enregistrement.'),
  });

  const stepperSteps = ['Récit de vente', 'Formation', 'Fiche client', 'Activation'];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/clients/${id}/formation`)} className="btn-secondary p-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding — Fiche Client</h1>
          <p className="text-gray-500 text-sm">Étape 3 sur 4</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {stepperSteps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < 2 ? 'bg-green-500 text-white' : i === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{i < 2 ? '✓' : i + 1}</div>
              <span className={`text-xs mt-1 font-medium ${i === 2 ? 'text-blue-600' : i < 2 ? 'text-green-600' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < stepperSteps.length - 1 && <div className={`h-0.5 flex-1 mb-4 ${i < 2 ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {client && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-xs text-blue-500 font-semibold uppercase mb-3">Résumé de l'onboarding</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                {client.onboarding?.recitDate && <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="text-xs text-gray-500 font-medium">Récit de vente</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {client.onboarding?.recitMontant ? formatCDF(client.onboarding.recitMontant) : '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {client.onboarding?.formationDate && <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="text-xs text-gray-500 font-medium">Formation</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {client.onboarding?.formationDate ? 'Complétée' : '—'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{client.prenom} {client.nom}</p>
              <p className="text-sm text-gray-500">{client.telephone}</p>
              <p className="text-sm text-gray-500">{client.site?.nom}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Paiement de la fiche client</h2>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Montant fiche (CDF) *</label>
            <input
              type="number"
              min={0}
              placeholder="ex: 25000"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.montantFiche ? 'border-red-400' : 'border-gray-300'}`}
              {...register('montantFiche', { required: 'Montant requis', valueAsNumber: true, min: { value: 0, message: 'Montant positif requis' } })}
            />
            {errors.montantFiche && <p className="form-error">{errors.montantFiche.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Mode de paiement *</label>
            <div className="grid grid-cols-3 gap-3">
              {['CASH', 'MPESA', 'AIRTEL_MONEY'].map(mode => (
                <label key={mode} className="relative flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input type="radio" value={mode} className="sr-only" {...register('modePaiement', { required: true })} />
                  <span className="font-medium text-sm text-gray-700">{mode === 'CASH' ? 'Cash' : mode === 'MPESA' ? 'M-Pesa' : 'Airtel Money'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">N° Transaction / Reçu (optionnel)</label>
            <input
              placeholder="ex: TXN-789012"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('numeroTransaction')}
            />
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/clients')} className="btn-secondary">
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {mutation.isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Suivant : Activation →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
