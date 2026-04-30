import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF, formatDate, niveauColor } from '@/lib/utils';

interface FideliteStats {
  pointsDistribues: number;
  remisesAccordees: number;
  clientsActifsProgramme: number;
}

interface TopClient {
  id: string;
  prenom: string;
  nom: string;
  niveau: string;
  pointsFidelite: number;
  totalAchats: number;
}

interface AttributionRecente {
  id: string;
  clientNom: string;
  points: number;
  type: string;
  date: string;
}

interface NiveauConfig {
  niveau: string;
  couleur: string;
  seuilMin: number;
  seuilMax?: number;
  remise: number;
}

const NIVEAUX_DISPLAY: NiveauConfig[] = [
  { niveau: 'BRONZE', couleur: '#cd7f32', seuilMin: 0, seuilMax: 999, remise: 0 },
  { niveau: 'ARGENT', couleur: '#9ca3af', seuilMin: 1000, seuilMax: 4999, remise: 3 },
  { niveau: 'OR', couleur: '#f59e0b', seuilMin: 5000, seuilMax: 9999, remise: 5 },
  { niveau: 'PLATINE', couleur: '#8b5cf6', seuilMin: 10000, remise: 10 },
];

export default function FideliteProgrammePage() {
  const { data: stats, isLoading: statsLoading } = useQuery<FideliteStats>({
    queryKey: ['fidelite-stats'],
    queryFn: () => api.get('/fidelite/stats').then(r => r.data),
  });

  const { data: topClients, isLoading: topLoading } = useQuery<TopClient[]>({
    queryKey: ['fidelite-top-clients'],
    queryFn: () => api.get('/fidelite/top-clients').then(r => r.data),
  });

  const { data: attributions, isLoading: attribLoading } = useQuery<AttributionRecente[]>({
    queryKey: ['fidelite-attributions'],
    queryFn: () => api.get('/fidelite/attributions?limit=10').then(r => r.data),
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Star size={26} className="text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programme de fidélité</h1>
          <p className="text-sm text-gray-500">Gestion des niveaux et récompenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="stat-card"><div className="skeleton h-14 rounded" /></div>)
        ) : (
          <>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-3 rounded-xl"><Star size={20} className="text-yellow-500" /></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stats?.pointsDistribues?.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Points distribués</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl"><TrendingUp size={20} className="text-green-600" /></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{formatCDF(stats?.remisesAccordees || 0)}</p>
                  <p className="text-sm text-gray-500">Remises accordées</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl"><Award size={20} className="text-blue-600" /></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stats?.clientsActifsProgramme}</p>
                  <p className="text-sm text-gray-500">Clients au programme</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Niveaux de fidélité</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NIVEAUX_DISPLAY.map(n => (
            <div key={n.niveau} className="text-center p-5 rounded-2xl border-2" style={{ borderColor: n.couleur, backgroundColor: `${n.couleur}15` }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: n.couleur }}>
                <Star size={22} fill="white" className="text-white" />
              </div>
              <p className="font-black text-lg" style={{ color: n.couleur }}>{n.niveau}</p>
              <p className="text-xs text-gray-500 mt-1">
                {n.seuilMin.toLocaleString()} — {n.seuilMax ? n.seuilMax.toLocaleString() : '∞'} pts
              </p>
              <div className="mt-2 bg-white rounded-lg px-3 py-1 inline-block">
                <p className="font-bold text-sm text-gray-800">Remise: {n.remise}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            Top 10 clients fidèles
          </h2>
          {topLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
          ) : (
            <div className="space-y-2">
              {(topClients || []).map((c, idx) => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-blue-400'
                  }`}>{idx + 1}</span>
                  <div className="flex-1">
                    <Link to={`/fidelite/client/${c.id}`} className="font-semibold text-gray-800 hover:text-blue-600 text-sm">{c.prenom} {c.nom}</Link>
                    <div className="flex items-center gap-1">
                      <span className={`badge text-xs ${niveauColor(c.niveau)}`}>{c.niveau}</span>
                    </div>
                  </div>
                  <span className="font-black text-purple-700">{c.pointsFidelite.toLocaleString()} pts</span>
                </div>
              ))}
              {(!topClients || topClients.length === 0) && (
                <p className="text-center text-gray-400 text-sm py-6">Aucun client</p>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            Dernières attributions de points
          </h2>
          {attribLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
          ) : (
            <div className="space-y-2">
              {(attributions || []).map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.clientNom}</p>
                    <p className="text-xs text-gray-400">{a.type} · {formatDate(a.date)}</p>
                  </div>
                  <span className={`font-bold ${a.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {a.points > 0 ? '+' : ''}{a.points} pts
                  </span>
                </div>
              ))}
              {(!attributions || attributions.length === 0) && (
                <p className="text-center text-gray-400 text-sm py-6">Aucune attribution récente</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
