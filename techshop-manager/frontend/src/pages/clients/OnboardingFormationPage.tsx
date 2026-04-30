import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface FormationFormData {
  nomFormateur: string;
  dateFormation: string;
  notes?: string;
  certificationRequise: boolean;
}

interface ClientBasic {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  site: { nom: string };
  statut: string;
}

export default function OnboardingFormationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: client } = useQuery<ClientBasic>({
    queryKey: ['client-basic', id],
    queryFn: () => api.get(`/clients/${id}`).then(r => r.data),
  });

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormationFormData>({
    defaultValues: {
      nomFormateur: user ? `${user.prenom} ${user.nom}` : '',
      dateFormation: today,
      certificationRequise: true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormationFormData) => api.post(`/clients/${id}/onboarding/formation`, data),
    onSuccess: () => {
      toast.success('Formation enregistrée !');
      navigate(`/clients/${id}/fiche`);
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors de l\'enregistrement.'),
  });

  const stepperSteps = ['Récit de vente', 'Formation', 'Fiche client', 'Activation'];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/clients/${id}/recit`)} className="btn-secondary p-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding — Formation</h1>
          <p className="text-gray-500 text-sm">Étape 2 sur 4</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {stepperSteps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < 1 ? 'bg-green-500 text-white' : i === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{i < 1 ? '✓' : i + 1}</div>
              <span className={`text-xs mt-1 font-medium ${i === 1 ? 'text-blue-600' : i < 1 ? 'text-green-600' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < stepperSteps.length - 1 && <div className={`h-0.5 flex-1 mb-4 ${i < 1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {client && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-500 font-semibold uppercase mb-2">Client en cours d'onboarding</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-lg">
              {client.prenom[0]}{client.nom[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{client.prenom} {client.nom}</p>
              <p className="text-sm text-gray-500">{client.telephone} · {client.site?.nom}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Informations de formation</h2>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Nom du formateur *</label>
            <input
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nomFormateur ? 'border-red-400' : 'border-gray-300'}`}
              {...register('nomFormateur', { required: 'Nom du formateur requis' })}
            />
            {errors.nomFormateur && <p className="form-error">{errors.nomFormateur.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Date de formation *</label>
            <input
              type="date"
              max={today}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateFormation ? 'border-red-400' : 'border-gray-300'}`}
              {...register('dateFormation', { required: 'Date requise' })}
            />
            {errors.dateFormation && <p className="form-error">{errors.dateFormation.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Notes de formation (optionnel)</label>
            <textarea
              rows={4}
              placeholder="Observations, compétences évaluées, points à améliorer..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register('notes')}
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input
              type="checkbox"
              id="certificationRequise"
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
              {...register('certificationRequise')}
            />
            <div>
              <label htmlFor="certificationRequise" className="font-medium text-gray-800 cursor-pointer">
                Certification requise
              </label>
              <p className="text-xs text-gray-500 mt-0.5">Le client doit obtenir la certification pour être pleinement activé.</p>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/clients')} className="btn-secondary">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {(isSubmitting || mutation.isLoading) && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Suivant : Fiche client →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
