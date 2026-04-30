import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, niveauColor } from '@/lib/utils';

interface MouvementPoints {
  id: string;
  type: string;
  points: number;
  description: string;
  date: string;
  soldeApres: number;
  reference?: string;
}

interface ClientPointsData {
  client: {
    id: string;
    prenom: string;
    nom: string;
    niveau: string;
    pointsFidelite: number;
    prochaineRecompense?: { niveau: string; pointsNecessaires: number; remise: number };
  };
  mouvements: MouvementPoints[];
  prochaineRecompense?: { niveau: string; pointsNecessaires: number; remise: number };
}

const NIVEAUX_SEUILS = [
  { niveau: 'BRONZE', seuil: 0, couleur: '#cd7f32' },
  { niveau: 'ARGENT', seuil: 1000, couleur: '#9ca3af' },
  { niveau: 'OR', seuil: 5000, couleur: '#f59e0b' },
  { niveau: 'PLATINE', seuil: 10000, couleur: '#8b5cf6' },
];

export default function ClientPointsPage() {
  const { clientId } = useParams<{ clientId: string }>();

  const { data, isLoading } = useQuery<ClientPointsData>({
    queryKey: ['fidelite-client', clientId],
    queryFn: () => api.get(`/fidelite/client/${clientId}`).then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="card"><div className="skeleton h-48 rounded" /></div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center text-gray-400">Données introuvables.</div>;

  const { client, mouvements } = data;
  const niveauActuel = NIVEAUX_SEUILS.find(n => n.niveau === client.niveau);
  const prochainNiveau = NIVEAUX_SEUILS.find(n => n.seuil > (niveauActuel?.seuil || 0));
  const progres = prochainNiveau
    ? Math.min(100, ((client.pointsFidelite - (niveauActuel?.seuil || 0)) / (prochainNiveau.seuil - (niveauActuel?.seuil || 0))) * 100)
    : 100;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/clients/${clientId}`} className="btn-secondary p-2"><ArrowLeft size={18} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Points de fidélité</h1>
      </div>

      <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-center gap-5 mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
            {client.prenom[0]}{client.nom[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{client.prenom} {client.nom}</h2>
            <span className={`badge ${niveauColor(client.niveau)} mt-1 inline-block`}>{client.niveau}</span>
          </div>
          <div className="ml-auto text-right">
            <p className="text-4xl font-black text-purple-700">{client.pointsFidelite.toLocaleString()}</p>
            <p className="text-purple-500 font-medium text-sm">points</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-600 flex items-center gap-1">
              <Star size={14} style={{ color: niveauActuel?.couleur }} />
              {client.niveau}
            </span>
            {prochainNiveau && (
              <span className="text-gray-600 flex items-center gap-1">
                <Star size={14} style={{ color: prochainNiveau.couleur }} />
                {prochainNiveau.niveau} ({prochainNiveau.seuil.toLocaleString()} pts)
              </span>
            )}
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progres}%`,
                background: `linear-gradient(90deg, ${niveauActuel?.couleur || '#8b5cf6'}, ${prochainNiveau?.couleur || '#8b5cf6'})`,
              }}
            />
          </div>
          {prochainNiveau && (
            <p className="text-xs text-gray-500 text-center">
              Encore {(prochainNiveau.seuil - client.pointsFidelite).toLocaleString()} points pour atteindre {prochainNiveau.niveau}
            </p>
          )}
          {!prochainNiveau && (
            <p className="text-xs text-center font-semibold text-purple-600">Niveau maximum atteint — PLATINE</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-purple-500" />
          Historique des mouvements
        </h2>
        {mouvements.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Aucun mouvement de points.</p>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold text-right">Points</th>
                  <th className="pb-3 font-semibold text-right">Solde après</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mouvements.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="py-3 text-gray-500">{formatDate(m.date)}</td>
                    <td className="py-3">
                      <span className={`badge text-xs ${m.points > 0 ? 'badge-success' : 'badge-danger'}`}>{m.type}</span>
                    </td>
                    <td className="py-3 text-gray-700">{m.description}</td>
                    <td className="py-3 text-right">
                      <span className={`font-bold ${m.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {m.points > 0 ? '+' : ''}{m.points}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-700">{m.soldeApres.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
