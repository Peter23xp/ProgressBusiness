import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Gift, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF } from '@/lib/utils';

interface TopParrain { id: string; prenom: string; nom: string; filleuls: number; actifs: number; gains: number }
interface FunnelStep { etape: string; total: number; pourcentage: number }
interface RecompenseDue { clientId: string; clientNom: string; montant: number; type: string }
interface RapportParrainage {
  topParrains: TopParrain[];
  funnel: FunnelStep[];
  recompensesDues: RecompenseDue[];
  totalRecompensesDues: number;
}

export default function RapportParrainagePage() {
  const { data, isLoading } = useQuery<RapportParrainage>({
    queryKey: ['rapport-parrainage'],
    queryFn: () => api.get('/rapports/parrainage').then(r => r.data),
  });

  const maxFunnel = data?.funnel ? Math.max(...data.funnel.map(f => f.total), 1) : 1;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Users size={26} className="text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapport de parrainage</h1>
          <p className="text-sm text-gray-500">Analyse du programme de parrainage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-purple-500" />Funnel de conversion onboarding</h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.funnel || []).map((step, i) => (
                <div key={step.etape}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      {step.etape}
                    </span>
                    <span className="text-gray-500">{step.total} ({step.pourcentage}%)</span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full flex items-center justify-end pr-2 rounded-lg transition-all"
                      style={{
                        width: `${(step.total / maxFunnel) * 100}%`,
                        background: `linear-gradient(90deg, #7c3aed${Math.round(180 - i * 30).toString(16).padStart(2, '0')}, #7c3aed)`,
                        minWidth: step.total > 0 ? '40px' : '0',
                      }}
                    >
                      <span className="text-white text-xs font-bold">{step.pourcentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!data?.funnel || data.funnel.length === 0) && (
                <p className="text-center text-gray-400 text-sm py-6">Aucune donnée de funnel</p>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Gift size={18} className="text-green-500" />
            Récompenses dues
            {data?.totalRecompensesDues && (
              <span className="ml-auto font-black text-green-700">{formatCDF(data.totalRecompensesDues)}</span>
            )}
          </h2>
          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(data?.recompensesDues || []).map(r => (
                <div key={r.clientId} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                  <div>
                    <Link to={`/clients/${r.clientId}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600">{r.clientNom}</Link>
                    <p className="text-xs text-gray-500">{r.type}</p>
                  </div>
                  <span className="font-bold text-green-700">{formatCDF(r.montant)}</span>
                </div>
              ))}
              {(!data?.recompensesDues || data.recompensesDues.length === 0) && (
                <p className="text-center text-gray-400 text-sm py-6">Aucune récompense due</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users size={18} className="text-purple-500" />Top parrains</h2>
        {isLoading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase">
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Parrain</th>
                  <th className="pb-3 font-semibold text-center">Filleuls total</th>
                  <th className="pb-3 font-semibold text-center">Filleuls actifs</th>
                  <th className="pb-3 font-semibold text-right">Gains totaux</th>
                  <th className="pb-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.topParrains || []).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-blue-400'
                      }`}>{idx + 1}</span>
                    </td>
                    <td className="py-3">
                      <Link to={`/parrainage/arbre/${p.id}`} className="font-semibold text-blue-600 hover:underline">{p.prenom} {p.nom}</Link>
                    </td>
                    <td className="py-3 text-center font-semibold text-gray-800">{p.filleuls}</td>
                    <td className="py-3 text-center">
                      <span className="badge badge-success">{p.actifs}</span>
                    </td>
                    <td className="py-3 text-right font-bold text-green-700">{formatCDF(p.gains)}</td>
                    <td className="py-3">
                      <Link to={`/parrainage/arbre/${p.id}`} className="btn-secondary text-xs py-1 px-2">Arbre</Link>
                    </td>
                  </tr>
                ))}
                {(!data?.topParrains || data.topParrains.length === 0) && (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400">Aucun parrain trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
