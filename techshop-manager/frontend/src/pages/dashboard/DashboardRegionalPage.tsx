import { useQuery } from '@tanstack/react-query';
import { Building2, TrendingUp, Users, ShoppingCart, AlertTriangle, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF } from '@/lib/utils';

interface SiteStats {
  id: string;
  nom: string;
  ville: string;
  ca: number;
  ventes: number;
  clients: number;
  alertes: number;
}

interface MonthlyCA {
  mois: string;
  total: number;
  sites: Record<string, number>;
}

interface TopProduit {
  id: string;
  nom: string;
  quantite: number;
  ca: number;
}

interface TopParrain {
  id: string;
  nom: string;
  filleuls: number;
  gains: number;
}

interface RegionalData {
  sites: SiteStats[];
  casMensuel: MonthlyCA[];
  topProduits: TopProduit[];
  topParrains: TopParrain[];
}

export default function DashboardRegionalPage() {
  const { data, isLoading } = useQuery<RegionalData>({
    queryKey: ['dashboard-regional'],
    queryFn: () => api.get('/dashboard/regional').then(r => r.data),
    refetchInterval: 300000,
  });

  const maxCA = data ? Math.max(...(data.casMensuel || []).map(d => d.total), 1) : 1;
  const maxProduit = data ? Math.max(...(data.topProduits || []).map(p => p.ca), 1) : 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Building2 size={28} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Régional</h1>
          <p className="text-gray-500 text-sm">Comparatif de performance par site</p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Performance par site</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Site</th>
                  <th className="pb-3 font-medium">Ville</th>
                  <th className="pb-3 font-medium">
                    <span className="flex items-center gap-1"><TrendingUp size={14} /> CA Total</span>
                  </th>
                  <th className="pb-3 font-medium">
                    <span className="flex items-center gap-1"><ShoppingCart size={14} /> Ventes</span>
                  </th>
                  <th className="pb-3 font-medium">
                    <span className="flex items-center gap-1"><Users size={14} /> Clients</span>
                  </th>
                  <th className="pb-3 font-medium">
                    <span className="flex items-center gap-1"><AlertTriangle size={14} /> Alertes</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.sites || []).map(site => (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-semibold text-gray-900">{site.nom}</td>
                    <td className="py-3 text-gray-600">{site.ville}</td>
                    <td className="py-3 font-bold text-green-700">{formatCDF(site.ca)}</td>
                    <td className="py-3 text-gray-700">{site.ventes}</td>
                    <td className="py-3 text-gray-700">{site.clients}</td>
                    <td className="py-3">
                      <span className={`badge ${site.alertes > 0 ? 'badge-warning' : 'badge-success'}`}>
                        {site.alertes}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!data?.sites || data.sites.length === 0) && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">Aucun site disponible</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" />
          Évolution CA mensuel
        </h2>
        {isLoading ? (
          <div className="flex items-end gap-3 h-48">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton flex-1 rounded-t h-32" />)}
          </div>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {(data?.casMensuel || []).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{formatCDF(d.total)}</span>
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md"
                  style={{ height: `${(d.total / maxCA) * 160}px`, minHeight: '4px' }}
                  title={formatCDF(d.total)}
                />
                <span className="text-xs text-gray-500 mt-1">{d.mois}</span>
              </div>
            ))}
            {(!data?.casMensuel || data.casMensuel.length === 0) && (
              <div className="w-full text-center text-gray-400 py-10">Aucune donnée mensuelle</div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            Top 5 Produits
          </h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.topProduits || []).map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{p.nom}</span>
                      <span className="text-xs text-gray-500">{formatCDF(p.ca)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.ca / maxProduit) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{p.quantite} vdus</span>
                </div>
              ))}
              {(!data?.topProduits || data.topProduits.length === 0) && (
                <p className="text-center text-gray-400 text-sm py-6">Aucune donnée</p>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-purple-500" />
            Top 5 Parrains
          </h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.topParrains || []).map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-blue-400'
                  }`}>{idx + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{p.nom}</p>
                    <p className="text-xs text-gray-500">{p.filleuls} filleuls</p>
                  </div>
                  <span className="text-sm font-bold text-green-700">{formatCDF(p.gains)}</span>
                </div>
              ))}
              {(!data?.topParrains || data.topParrains.length === 0) && (
                <p className="text-center text-gray-400 text-sm py-6">Aucune donnée</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
