import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF } from '@/lib/utils';

interface RapportVentes {
  totalCA: number;
  totalVentes: number;
  caParPeriode: Array<{ date: string; montant: number }>;
  caParSite: Array<{ siteNom: string; montant: number; couleur: string }>;
  topProduits: Array<{ nom: string; quantite: number; ca: number }>;
  resumeSites: Array<{ siteId: string; siteNom: string; ca: number; ventes: number; clients: number }>;
}

type Periode = 'week' | 'month' | 'quarter' | 'year';

const COULEURS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function RapportsDashboardPage() {
  const [periode, setPeriode] = useState<Periode>('month');

  const { data, isLoading } = useQuery<RapportVentes>({
    queryKey: ['rapports-ventes', periode],
    queryFn: () => api.get(`/rapports/ventes?periode=${periode}`).then(r => r.data),
  });

  const maxCA = data ? Math.max(...(data.caParPeriode || []).map(d => d.montant), 1) : 1;
  const maxProduit = data ? Math.max(...(data.topProduits || []).map(p => p.ca), 1) : 1;
  const totalSites = data?.caParSite?.reduce((s, x) => s + x.montant, 0) || 1;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 size={26} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rapports — Vue d'ensemble</h1>
            <p className="text-sm text-gray-500">Analyse des ventes et performances</p>
          </div>
        </div>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {(['week', 'month', 'quarter', 'year'] as Periode[]).map(p => (
            <button key={p} onClick={() => setPeriode(p)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${periode === p ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl"><TrendingUp size={22} className="text-blue-600" /></div>
            <div>
              {isLoading ? <div className="skeleton h-8 w-32 rounded" /> : (
                <>
                  <p className="text-2xl font-bold text-gray-900">{formatCDF(data?.totalCA || 0)}</p>
                  <p className="text-sm text-gray-500">Chiffre d'affaires total</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl"><BarChart2 size={22} className="text-green-600" /></div>
            <div>
              {isLoading ? <div className="skeleton h-8 w-24 rounded" /> : (
                <>
                  <p className="text-2xl font-bold text-gray-900">{data?.totalVentes || 0}</p>
                  <p className="text-sm text-gray-500">Ventes totales</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-500" />Évolution du CA</h2>
        {isLoading ? (
          <div className="flex items-end gap-2 h-40">{[...Array(7)].map((_, i) => <div key={i} className="skeleton flex-1 rounded-t h-20" />)}</div>
        ) : (
          <div className="flex items-end gap-2 h-48">
            {(data?.caParPeriode || []).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md cursor-default transition-colors"
                  style={{ height: `${(d.montant / maxCA) * 160}px`, minHeight: '4px' }} title={formatCDF(d.montant)} />
                <span className="text-xs text-gray-500 mt-1 text-center truncate w-full">{d.date}</span>
              </div>
            ))}
            {(!data?.caParPeriode || data.caParPeriode.length === 0) && (
              <div className="w-full text-center text-gray-400 py-10">Aucune donnée</div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Répartition CA par site</h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.caParSite || []).map((s, i) => (
                <div key={s.siteNom}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{s.siteNom}</span>
                    <span className="text-gray-500">{formatCDF(s.montant)} ({Math.round((s.montant / totalSites) * 100)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(s.montant / totalSites) * 100}%`, backgroundColor: COULEURS[i % COULEURS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Top 5 produits</h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.topProduits || []).map((p, i) => (
                <div key={p.nom} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{p.nom}</span>
                      <span className="text-xs text-gray-500">{p.quantite} vdus</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(p.ca / maxProduit) * 100}%`, backgroundColor: COULEURS[i % COULEURS.length] }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-24 text-right">{formatCDF(p.ca)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Résumé par site</h2>
        {isLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase">
                  <th className="pb-3 font-semibold">Site</th>
                  <th className="pb-3 font-semibold">CA</th>
                  <th className="pb-3 font-semibold">Ventes</th>
                  <th className="pb-3 font-semibold">Clients actifs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.resumeSites || []).map(s => (
                  <tr key={s.siteId} className="hover:bg-gray-50">
                    <td className="py-3 font-semibold text-gray-800">{s.siteNom}</td>
                    <td className="py-3 font-bold text-green-700">{formatCDF(s.ca)}</td>
                    <td className="py-3 text-gray-700">{s.ventes}</td>
                    <td className="py-3 text-gray-700">{s.clients}</td>
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
