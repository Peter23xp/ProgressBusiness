import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface RecitFormData {
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  site: string;
  codeParrain?: string;
  matriculeExterne?: string;
  montantRecit: number;
  modePaiement: string;
  numeroRecu?: string;
}

export default function OnboardingRecitPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'ok' | 'exists'>('idle');
  const [parrainStatus, setParrainStatus] = useState<'idle' | 'checking' | 'ok' | 'notfound'>('idle');
  const [parrainNom, setParrainNom] = useState('');

  const { register, handleSubmit, watch, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<RecitFormData>({
    defaultValues: { site: user?.site?.id || '', modePaiement: 'CASH' },
  });

  const telephone = watch('telephone');
  const codeParrain = watch('codeParrain');

  useEffect(() => {
    if (!telephone || telephone.length < 9) { setPhoneStatus('idle'); return; }
    setPhoneStatus('checking');
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/clients/check-phone/${encodeURIComponent(telephone)}`);
        if (res.data.exists) {
          setPhoneStatus('exists');
          setError('telephone', { message: 'Ce numéro est déjà utilisé.' });
        } else {
          setPhoneStatus('ok');
          clearErrors('telephone');
        }
      } catch { setPhoneStatus('idle'); }
    }, 600);
    return () => clearTimeout(t);
  }, [telephone, setError, clearErrors]);

  useEffect(() => {
    if (!codeParrain || codeParrain.length < 4) { setParrainStatus('idle'); setParrainNom(''); return; }
    setParrainStatus('checking');
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/parrainage/check-code/${encodeURIComponent(codeParrain)}`);
        if (res.data.valid) {
          setParrainStatus('ok');
          setParrainNom(`${res.data.parrain?.prenom || ''} ${res.data.parrain?.nom || ''}`.trim());
        } else {
          setParrainStatus('notfound');
          setParrainNom('');
        }
      } catch { setParrainStatus('notfound'); setParrainNom(''); }
    }, 600);
    return () => clearTimeout(t);
  }, [codeParrain]);

  const mutation = useMutation({
    mutationFn: (data: RecitFormData) => api.post('/clients/onboarding/recit', data),
    onSuccess: (res) => {
      toast.success('Récit de vente enregistré !');
      navigate(`/clients/${res.data.clientId}/formation`);
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors de l\'enregistrement.'),
  });

  const onSubmit = async (data: RecitFormData) => {
    if (phoneStatus === 'exists') { toast.error('Numéro déjà utilisé.'); return; }
    mutation.mutate(data);
  };

  const stepperSteps = ['Récit de vente', 'Formation', 'Fiche client', 'Activation'];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Onboarding Nouveau Client</h1>
        <p className="text-gray-500 text-sm">Étape 1 sur 4</p>
      </div>

      <div className="flex items-center gap-2">
        {stepperSteps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex flex-col items-center ${i < stepperSteps.length - 1 ? 'w-full' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{i + 1}</div>
              <span className={`text-xs mt-1 font-medium ${i === 0 ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < stepperSteps.length - 1 && <div className="h-0.5 flex-1 bg-gray-200 mb-4" />}
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Récit de vente</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label className="form-label">Prénom *</label>
              <input
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.prenom ? 'border-red-400' : 'border-gray-300'}`}
                {...register('prenom', { required: 'Prénom requis' })}
              />
              {errors.prenom && <p className="form-error">{errors.prenom.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nom ? 'border-red-400' : 'border-gray-300'}`}
                {...register('nom', { required: 'Nom requis' })}
              />
              {errors.nom && <p className="form-error">{errors.nom.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Téléphone (+243) *</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+243 XXX XXX XXX"
                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.telephone ? 'border-red-400' : 'border-gray-300'}`}
                {...register('telephone', { required: 'Téléphone requis', pattern: { value: /^\+?243[0-9]{9}$/, message: 'Format: +243XXXXXXXXX' } })}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {phoneStatus === 'checking' && <Loader size={16} className="text-gray-400 animate-spin" />}
                {phoneStatus === 'ok' && <CheckCircle size={16} className="text-green-500" />}
                {phoneStatus === 'exists' && <XCircle size={16} className="text-red-500" />}
              </div>
            </div>
            {errors.telephone && <p className="form-error">{errors.telephone.message}</p>}
            {phoneStatus === 'exists' && <p className="text-red-500 text-xs mt-1">Ce numéro est déjà enregistré dans le système.</p>}
            {phoneStatus === 'ok' && <p className="text-green-600 text-xs mt-1">Numéro disponible.</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email (optionnel)</label>
            <input
              type="email"
              placeholder="client@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' } })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label className="form-label">Site *</label>
              <select
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.site ? 'border-red-400' : 'border-gray-300'}`}
                {...register('site', { required: 'Site requis' })}
              >
                <option value="">Sélectionner un site</option>
                <option value="GOMA_CENTRE">Goma Centre</option>
                <option value="GOMA_NORD">Goma Nord</option>
                <option value="GISENYI">Gisenyi</option>
              </select>
              {errors.site && <p className="form-error">{errors.site.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Matricule externe (optionnel)</label>
              <input
                placeholder="ex: MAT-001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('matriculeExterne')}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Code parrain (optionnel)</label>
            <div className="relative">
              <input
                placeholder="ex: TSM-ABC123"
                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  parrainStatus === 'notfound' ? 'border-orange-400' : parrainStatus === 'ok' ? 'border-green-400' : 'border-gray-300'
                }`}
                {...register('codeParrain')}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {parrainStatus === 'checking' && <Loader size={16} className="text-gray-400 animate-spin" />}
                {parrainStatus === 'ok' && <CheckCircle size={16} className="text-green-500" />}
                {parrainStatus === 'notfound' && <XCircle size={16} className="text-orange-400" />}
              </div>
            </div>
            {parrainStatus === 'ok' && parrainNom && <p className="text-green-600 text-xs mt-1">Parrain trouvé: {parrainNom}</p>}
            {parrainStatus === 'notfound' && <p className="text-orange-500 text-xs mt-1">Code parrain introuvable.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label className="form-label">Montant récit (CDF) *</label>
              <input
                type="number"
                min={0}
                placeholder="ex: 50000"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.montantRecit ? 'border-red-400' : 'border-gray-300'}`}
                {...register('montantRecit', { required: 'Montant requis', valueAsNumber: true, min: { value: 0, message: 'Montant positif requis' } })}
              />
              {errors.montantRecit && <p className="form-error">{errors.montantRecit.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Mode de paiement *</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('modePaiement', { required: true })}
              >
                <option value="CASH">Cash</option>
                <option value="MPESA">M-Pesa</option>
                <option value="AIRTEL_MONEY">Airtel Money</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">N° Reçu / Transaction (optionnel)</label>
            <input
              placeholder="ex: TXN-123456"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('numeroRecu')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/clients')} className="btn-secondary">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isLoading || phoneStatus === 'exists'}
              className="btn-primary flex items-center gap-2"
            >
              {(isSubmitting || mutation.isLoading) && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Suivant : Formation →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
