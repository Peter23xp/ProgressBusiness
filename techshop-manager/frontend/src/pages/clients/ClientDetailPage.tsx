import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, MapPin, Calendar, CreditCard, Users, ShoppingBag, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF, formatDate, statutClientColor, niveauColor } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface ClientDetail {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  niveau: string;
  statut: string;
  pointsFidelite: number;
  site: { id: string; nom: string };
  codeParrain: string;
  matriculeExterne?: string;
  createdAt: string;
  parrain?: { id: string; prenom: string; nom: string; codeParrain: string };
  onboarding: {
    recitDate?: string;
    recitMontant?: number;
    formationDate?: string;
    formationNotes?: string;
    ficheDate?: string;
    ficheMontant?: number;
    activationDate?: string;
  };
  filleuls: Array<{ id: string; prenom: string; nom: string; statut: string; createdAt: string }>;
  achats: Array<{ id: string; numero: string; montant: number; date: string; pointsGagnes: number }>;
  mouvementsPoints: Array<{ id: string; type: string; points: number; description: string; date: string; soldeApres: number }>;
}

type Tab = 'infos' | 'onboarding' | 'parrainage' | 'achats' | 'points';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('infos');

  const { data: client, isLoading } = useQuery<ClientDetail>({
    queryKey: ['client', id],
    queryFn: () => api.get(`/clients/${id}`).then(r => r.data),
  });

  const canEdit = user && ['SUPER_ADMIN', 'GERANT'].includes(user.role);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'infos', label: 'Informations', icon: CreditCard },
    { key: 'onboarding', label: 'Onboarding', icon: Calendar },
    { key: 'parrainage', label: 'Parrainage', icon: Users },
    { key: 'achats', label: 'Achats', icon: ShoppingBag },
    { key: 'points', label: 'Points', icon: Star },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="card space-y-4">
          <div className="skeleton h-20 rounded" />
          <div className="skeleton h-12 rounded" />
          <div className="skeleton h-40 rounded" />
        </div>
      </div>
    );
  }

  if (!client) return <div className="p-6 text-center text-gray-400">Client introuvable.</div>;

  const onbSteps = [
    { label: 'Récit de vente', date: client.onboarding?.recitDate, done: !!client.onboarding?.recitDate, detail: client.onboarding?.recitMontant ? formatCDF(client.onboarding.recitMontant) : null },
    { label: 'Formation', date: client.onboarding?.formationDate, done: !!client.onboarding?.formationDate, detail: client.onboarding?.formationNotes || null },
    { label: 'Fiche client', date: client.onboarding?.ficheDate, done: !!client.onboarding?.ficheDate, detail: client.onboarding?.ficheMontant ? formatCDF(client.onboarding.ficheMontant) : null },
    { label: 'Activation', date: client.onboarding?.activationDate, done: !!client.onboarding?.activationDate, detail: client.statut === 'ACTIF' ? 'Compte actif' : 'En attente' },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/clients" className="btn-secondary p-2"><ArrowLeft size={18} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Fiche client</h1>
      </div>

      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-md">
              {client.prenom[0]}{client.nom[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.prenom} {client.nom}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`badge ${statutClientColor(client.statut)}`}>{client.statut}</span>
                <span className={`badge ${niveauColor(client.niveau)}`}>{client.niveau}</span>
                <span className="badge badge-gray font-mono">{client.codeParrain}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1"><Phone size={14} />{client.telephone}</span>
                <span className="flex items-center gap-1"><MapPin size={14} />{client.site?.nom}</span>
                <span className="flex items-center gap-1"><Calendar size={14} />Inscrit le {formatDate(client.createdAt)}</span>
                <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" />{client.pointsFidelite} points</span>
              </div>
            </div>
          </div>
          {canEdit && (
            <Link to={`/clients/${id}/edit`} className="btn-secondary flex items-center gap-2">
              <Edit size={16} /> Modifier
            </Link>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />{tab.label}
              </button>
            );
          })}
        </div>
        <div className="p-6">
          {activeTab === 'infos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Prénom', value: client.prenom },
                { label: 'Nom', value: client.nom },
                { label: 'Téléphone', value: client.telephone },
                { label: 'Email', value: client.email || '—' },
                { label: 'Site', value: client.site?.nom },
                { label: 'Code parrain', value: client.codeParrain },
                { label: 'Matricule externe', value: client.matriculeExterne || '—' },
                { label: 'Niveau fidélité', value: client.niveau },
                { label: 'Statut', value: client.statut },
                { label: 'Points', value: String(client.pointsFidelite) },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{f.label}</p>
                  <p className="text-gray-800 font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'onboarding' && (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {onbSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-5 pl-12 relative">
                    <div className={`absolute left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      step.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                    }`}>
                      {step.done && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className={`flex-1 p-4 rounded-lg border ${step.done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold ${step.done ? 'text-green-800' : 'text-gray-500'}`}>
                          Étape {idx + 1}: {step.label}
                        </p>
                        {step.date && <span className="text-xs text-gray-500">{formatDate(step.date)}</span>}
                      </div>
                      {step.detail && <p className="text-sm text-gray-600 mt-1">{step.detail}</p>}
                      {!step.done && <p className="text-xs text-gray-400 mt-1">Non complété</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'parrainage' && (
            <div className="space-y-5">
              {client.parrain && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-2">Parrain de ce client</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">
                      {client.parrain.prenom[0]}{client.parrain.nom[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{client.parrain.prenom} {client.parrain.nom}</p>
                      <p className="text-xs text-gray-500 font-mono">{client.parrain.codeParrain}</p>
                    </div>
                    <Link to={`/clients/${client.parrain.id}`} className="ml-auto btn-secondary text-xs px-3 py-1">
                      Voir fiche
                    </Link>
                  </div>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-700 mb-3">Filleuls ({client.filleuls?.length || 0})</p>
                {(client.filleuls || []).length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucun filleul pour l'instant.</p>
                ) : (
                  <div className="space-y-2">
                    {client.filleuls.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {f.prenom[0]}{f.nom[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{f.prenom} {f.nom}</p>
                            <p className="text-xs text-gray-400">{formatDate(f.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${statutClientColor(f.statut)}`}>{f.statut}</span>
                          <Link to={`/clients/${f.id}`} className="text-blue-600 text-xs hover:underline">Voir</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'achats' && (
            <div className="space-y-3">
              {(client.achats || []).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Aucun achat enregistré.</p>
              ) : (
                client.achats.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div>
                      <p className="font-mono text-sm font-semibold text-blue-700">{a.numero}</p>
                      <p className="text-xs text-gray-500">{formatDate(a.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCDF(a.montant)}</p>
                      <p className="text-xs text-purple-600">+{a.pointsGagnes} pts</p>
                    </div>
                    <Link to={`/sales/${a.id}`} className="btn-secondary text-xs px-3 py-1 ml-3">Détail</Link>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
                <p className="text-4xl font-black text-purple-700">{client.pointsFidelite}</p>
                <p className="text-purple-500 font-medium">Points de fidélité</p>
                <span className={`badge mt-2 inline-block ${niveauColor(client.niveau)}`}>{client.niveau}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-3">Historique des mouvements</p>
                {(client.mouvementsPoints || []).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Aucun mouvement de points.</p>
                ) : (
                  <div className="space-y-2">
                    {client.mouvementsPoints.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{m.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(m.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${m.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {m.points > 0 ? '+' : ''}{m.points} pts
                          </p>
                          <p className="text-xs text-gray-500">Solde: {m.soldeApres}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
