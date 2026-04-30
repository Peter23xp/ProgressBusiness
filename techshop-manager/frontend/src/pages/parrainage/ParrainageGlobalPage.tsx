import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Gift, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF, formatDate, statutClientColor } from '@/lib/utils';

interface ParrainageStats {
  parrainagesActifs: number;
  recompensesVersees: number;
  meilleurParrain: { id: string; prenom: string; nom: string; filleuls: number; gains: number } | null;
}

interface ParrainageRecent {
  id: string;
  parrain: { id: string; prenom: string; nom: string; codeParrain: string };
  filleul: { id: string; prenom: string; nom: string };
  statut: string;
  recompense?: number;
  createdAt: string;
}

export default function ParrainageGlobalPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<ParrainageStats>({
    queryKey: ['parrainage-stats'],
    queryFn: () => api.get('/parrainage/stats').then(r => r.data),
  });

  const { data: parrainages, isLoading: listLoading } = useQuery<ParrainageRecent[]>({
    queryKey: ['parrainage-list'],
    queryFn: () => api.get('/parrainage?limit=20').then(r => r.data),
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Users size={26} className="text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parrainage</h1>
          <p className="text-sm text-gray-500">Suivi du programme de parrainage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statsLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="stat-card"><div className="skeleton h-16 rounded" /></div>)
        ) : (
          <>
            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-xl"><Users size={22} className="text-purple-600" /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.parrainagesActifs ?? 0}</p>
                  <p className="text-sm text-gray-500">Parrainages actifs</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl"><Gift size={22} className="text-green-600" /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatCDF(stats?.recompensesVersees || 0)}</p>
                  <p className="text-sm text-gray-500">Récompenses versées</p>
                </div>
              </div>
            </div>
            {stats?.meilleurParrain ? (
              <div className="stat-card">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-xl"><Award size={22} className="text-yellow-600" /></div>
                  <div>
                    <p className="font-bold text-gray-900">{stats.meilleurParrain.prenom} {stats.meilleurParrain.nom}</p>
                    <p className="text-sm text-gray-500">{stats.meilleurParrain.filleuls} filleuls</p>
                    <p className="text-xs text-yellow-600 font-semibold">{formatCDF(stats.meilleurParrain.gains)} gagnés</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="stat-card">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-xl"><Award size={22} className="text-yellow-600" /></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">—</p>
                    <p className="text-sm text-gray-500">Meilleur parrain</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Parrainages récents</h2>
        {listLoading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Parrain</th>
                  <th className="pb-3 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Filleul</th>
                  <th className="pb-3 font-semibold">Statut</th>
                  <th className="pb-3 font-semibold">Récompense</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(parrainages || []).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Link to={`/parrainage/arbre/${p.parrain.id}`} className="font-semibold text-blue-600 hover:underline">
                        {p.parrain.prenom} {p.parrain.nom}
                      </Link>
                    </td>
                    <td className="py-3 font-mono text-gray-500 text-xs">{p.parrain.codeParrain}</td>
                    <td className="py-3 text-gray-700">
                      <Link to={`/clients/${p.filleul.id}`} className="hover:underline text-gray-700">
                        {p.filleul.prenom} {p.filleul.nom}
                      </Link>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${statutClientColor(p.statut)}`}>{p.statut}</span>
                    </td>
                    <td className="py-3 font-semibold text-green-700">
                      {p.recompense ? formatCDF(p.recompense) : '—'}
                    </td>
                    <td className="py-3 text-gray-500">{formatDate(p.createdAt)}</td>
                    <td className="py-3">
                      <Link to={`/parrainage/arbre/${p.parrain.id}`} className="btn-secondary text-xs py-1 px-2">
                        Arbre
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!parrainages || parrainages.length === 0) && (
                  <tr><td colSpan={7} className="py-12 text-center">
                    <Users size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400">Aucun parrainage enregistré</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
