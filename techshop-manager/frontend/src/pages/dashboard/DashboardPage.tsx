import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingCart, AlertTriangle, UserPlus, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF, formatDate, formatDateTime } from '@/lib/utils';
import { Link } from 'react-router-dom';

type Periode = 'today' | 'week' | 'month';

interface DashStats {
  clientsActifs: number;
  ventesJour: number;
  alertesStock: number;
  nouveauxFilleuls: number;
  variationClients?: number;
  variationVentes?: number;
}

interface SalesChartData {
  date: string;
  montant: number;
}

interface RecentTransaction {
  id: string;
  numero: string;
  clientNom: string;
  montant: number;
  modePaiement: string;
  createdAt: string;
  statut: string;
}

interface StockAlert {
  id: string;
  produitNom: string;
  siteNom: string;
  stockActuel: number;
  seuil: number;
  type: 'ALERTE' | 'RUPTURE';
}

export default function DashboardPage() {
  const [periode, setPeriode] = useState<Periode>('today');

  const { data: stats, isLoading: statsLoading } = useQuery<DashStats>({
    queryKey: ['dashboard-stats', periode],
    queryFn: () => api.get(`/dashboard/stats?periode=${periode}`).then(r => r.data),
    refetchInterval: 300000,
  });

  const { data: salesChart, isLoading: chartLoading } = useQuery<SalesChartData[]>({
    queryKey: ['dashboard-sales-chart', periode],
    queryFn: () => api.get(`/dashboard/sales-chart?periode=${periode}`).then(r => r.data),
    refetchInterval: 300000,
  });

  const { data: recentTx, isLoading: txLoading } = useQuery<RecentTransaction[]>({
    queryKey: ['dashboard-recent-transactions'],
    queryFn: () => api.get('/dashboard/recent-transactions').then(r => r.data),
    refetchInterval: 300000,
  });

  const { data: stockAlerts, isLoading: alertsLoading } = useQuery<StockAlert[]>({
    queryKey: ['dashboard-stock-alerts'],
    queryFn: () => api.get('/dashboard/stock-alerts').then(r => r.data),
    refetchInterval: 300000,
  });

  const maxVal = salesChart ? Math.max(...salesChart.map(d => d.montant), 1) : 1;

  const statCards = [
    { label: 'Clients actifs', value: stats?.clientsActifs, icon: <Users size={22} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Ventes du jour', value: stats?.ventesJour !== undefined ? formatCDF(stats.ventesJour) : undefined, icon: <ShoppingCart size={22} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Alertes stock', value: stats?.alertesStock, icon: <AlertTriangle size={22} />, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Nouveaux filleuls', value: stats?.nouveauxFilleuls, icon: <UserPlus size={22} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de l'activité commerciale</p>
        </div>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {(['today', 'week', 'month'] as Periode[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriode(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                periode === p ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p === 'today' ? "Aujourd'hui" : p === 'week' ? 'Cette semaine' : 'Ce mois'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            {statsLoading ? (
              <div className="space-y-3">
                <div className="skeleton h-8 w-24 rounded" />
                <div className="skeleton h-4 w-32 rounded" />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className={`${card.bg} ${card.color} p-3 rounded-xl`}>{card.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value ?? '—'}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Ventes des 7 derniers jours
            </h2>
          </div>
          {chartLoading ? (
            <div className="flex items-end gap-2 h-40">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="skeleton flex-1 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {(salesChart || []).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400 font-medium">{formatCDF(d.montant)}</span>
                  <div
                    className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t-md cursor-default"
                    style={{ height: `${(d.montant / maxVal) * 160}px`, minHeight: '4px' }}
                    title={formatCDF(d.montant)}
                  />
                  <span className="text-xs text-gray-500 mt-1">{formatDate(d.date)}</span>
                </div>
              ))}
              {(!salesChart || salesChart.length === 0) && (
                <div className="w-full text-center text-gray-400 py-10">Aucune donnée disponible</div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            Alertes stock
          </h2>
          {alertsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(stockAlerts || []).slice(0, 5).map(a => (
                <div key={a.id} className={`p-3 rounded-lg border-l-4 ${a.type === 'RUPTURE' ? 'bg-red-50 border-red-400' : 'bg-orange-50 border-orange-400'}`}>
                  <p className="font-medium text-sm text-gray-800">{a.produitNom}</p>
                  <p className="text-xs text-gray-500">{a.siteNom} · Stock: {a.stockActuel} / Seuil: {a.seuil}</p>
                  <span className={`badge text-xs mt-1 inline-block ${a.type === 'RUPTURE' ? 'badge-danger' : 'badge-warning'}`}>
                    {a.type}
                  </span>
                </div>
              ))}
              {(!stockAlerts || stockAlerts.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-6">Aucune alerte</p>
              )}
              {(stockAlerts || []).length > 0 && (
                <Link to="/stocks/alertes" className="block text-center text-sm text-blue-600 hover:underline mt-2">
                  Voir toutes les alertes →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Transactions récentes</h2>
          <Link to="/sales/history" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
        </div>
        {txLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">N° Vente</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Montant</th>
                  <th className="pb-3 font-medium">Paiement</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(recentTx || []).map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <Link to={`/sales/${tx.id}`} className="text-blue-600 hover:underline font-mono">{tx.numero}</Link>
                    </td>
                    <td className="py-3 text-gray-700">{tx.clientNom}</td>
                    <td className="py-3 font-semibold text-gray-900">{formatCDF(tx.montant)}</td>
                    <td className="py-3">
                      <span className="badge badge-info">{tx.modePaiement}</span>
                    </td>
                    <td className="py-3 text-gray-500">{formatDateTime(tx.createdAt)}</td>
                    <td className="py-3">
                      <span className={`badge ${tx.statut === 'COMPLETE' ? 'badge-success' : tx.statut === 'ANNULE' ? 'badge-danger' : 'badge-warning'}`}>
                        {tx.statut}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!recentTx || recentTx.length === 0) && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">Aucune transaction récente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
