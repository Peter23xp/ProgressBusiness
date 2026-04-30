import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle, User, Phone, MapPin, Gift, CreditCard, Zap } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { formatCDF, formatDate } from '@/lib/utils';

interface ClientActivationData {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  site: { nom: string };
  codeParrain: string;
  statut: string;
  parrain?: { prenom: string; nom: string; codeParrain: string };
  onboarding: {
    recitDate?: string;
    recitMontant?: number;
    recitModePaiement?: string;
    formationDate?: string;
    ficheDate?: string;
    ficheMontant?: number;
    ficheModePaiement?: string;
  };
}

export default function OnboardingActivationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: client, isLoading } = useQuery<ClientActivationData>({
    queryKey: ['client-activation', id],
    queryFn: () => api.get(`/clients/${id}`).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: () => api.post(`/clients/${id}/onboarding/activate`),
    onSuccess: () => {
      toast.success('Compte activé avec succès ! Le client est maintenant actif.');
      navigate(`/clients/${id}`);
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors de l\'activation.'),
  });

  const stepperSteps = ['Récit de vente', 'Formation', 'Fiche client', 'Activation'];

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="card space-y-4">
          <div className="skeleton h-40 rounded" />
        </div>
      </div>
    );
  }

  if (!client) return <div className="p-6 text-center text-gray-400">Client introuvable.</div>;

  const totalPaye = (client.onboarding?.recitMontant || 0) + (client.onboarding?.ficheMontant || 0);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Onboarding — Activation</h1>
        <p className="text-gray-500 text-sm">Étape 4 sur 4 — Dernière étape</p>
      </div>

      <div className="flex items-center gap-2">
        {stepperSteps.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < 3 ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
              }`}>{i < 3 ? '✓' : i + 1}</div>
              <span className={`text-xs mt-1 font-medium ${i === 3 ? 'text-blue-600' : 'text-green-600'}`}>{s}</span>
            </div>
            {i < stepperSteps.length - 1 && <div className="h-0.5 flex-1 bg-green-400 mb-4" />}
          </div>
        ))}
      </div>

      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <CheckCircle className="text-green-500" size={22} />
          Récapitulatif complet de l'onboarding
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Client</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                  {client.prenom[0]}{client.nom[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{client.prenom} {client.nom}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={12} />{client.telephone}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={12} />{client.site?.nom}</p>
                </div>
              </div>
            </div>

            {client.parrain && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Parrain</p>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-purple-500" />
                  <p className="font-medium text-gray-800">{client.parrain.prenom} {client.parrain.nom}</p>
                  <span className="badge badge-info font-mono text-xs ml-auto">{client.parrain.codeParrain}</span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Code parrain généré</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="font-black text-blue-700 text-xl tracking-widest font-mono">{client.codeParrain}</p>
                <p className="text-xs text-blue-500 mt-1">Code unique de parrainage</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-3">Paiements effectués</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <CreditCard size={14} /> Récit de vente
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCDF(client.onboarding?.recitMontant || 0)}</p>
                    <p className="text-xs text-gray-400">{client.onboarding?.recitDate ? formatDate(client.onboarding.recitDate) : '—'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <CreditCard size={14} /> Fiche client
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCDF(client.onboarding?.ficheMontant || 0)}</p>
                    <p className="text-xs text-gray-400">{client.onboarding?.ficheDate ? formatDate(client.onboarding.ficheDate) : '—'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-900">TOTAL</span>
                  <span className="font-black text-green-700 text-lg">{formatCDF(totalPaye)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Récit', done: !!client.onboarding?.recitDate },
                { label: 'Formation', done: !!client.onboarding?.formationDate },
                { label: 'Fiche', done: !!client.onboarding?.ficheDate },
              ].map(step => (
                <div key={step.label} className={`flex items-center gap-3 p-3 rounded-lg ${step.done ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <CheckCircle size={16} className={step.done ? 'text-green-500' : 'text-red-400'} />
                  <p className={`text-sm font-medium ${step.done ? 'text-green-700' : 'text-red-600'}`}>
                    {step.label}: {step.done ? 'Complété' : 'Non complété'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Zap size={30} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tout est prêt !</h3>
            <p className="text-gray-500 mt-1 text-sm max-w-md">
              Vérifiez les informations ci-dessus puis cliquez sur ACTIVER pour finaliser l'onboarding et activer le compte client.
            </p>
          </div>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isLoading}
            className="btn-primary px-8 py-3 text-lg font-bold flex items-center gap-3"
          >
            {mutation.isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Gift size={22} />
            )}
            ACTIVER LE COMPTE
          </button>
          <p className="text-xs text-gray-400">Cette action ne peut pas être annulée.</p>
        </div>
      </div>
    </div>
  );
}
