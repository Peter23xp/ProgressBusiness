import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Download, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { formatCDF, formatDateTime } from '@/lib/utils';

interface Vente {
  id: string;
  numero: string;
  clientNom: string;
  agentNom: string;
  siteNom: string;
  montantTotal: number;
  modePaiement: string;
  statut: string;
  createdAt: string;
}

interface PaginatedVentes {
  data: Vente[];
  total: number;
  totalMontant: number;
  page: number;
  totalPages: number;
}

export default function VentesHistoriquePage() {
  const [search, setSearch] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [site, setSite] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedVentes>({
    queryKey: ['ventes', { search, dateDebut, dateFin, site, page }],
    queryFn: () => api.get('/ventes', { params: { search, dateDebut, dateFin, site, page, limit: 20 } }).then(r => r.data),
    keepPreviousData: true,
  });

  const handleExport = async () => {
    try {
      const res = await api.get('/ventes/export', { params: { search, dateDebut, dateFin, site }, responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = 'ventes.csv'; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export CSV téléchargé.');
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Erreur d\'export.');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag size={26} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historique des ventes</h1>
            <p className="text-sm text-gray-500">{data?.total ?? '...'} ventes</p>
          </div>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Exporter CSV
        </button>
      </div>

      {data && (
        <div className="stat-card bg-green-50 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <ShoppingBag size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{formatCDF(data.totalMontant)}</p>
              <p className="text-sm text-green-600">Total de la période</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Rechercher n° vente, client..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input type="date" value={dateDebut} onChange={e => { setDateDebut(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="date" value={dateFin} onChange={e => { setDateFin(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={site} onChange={e => { setSite(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les sites</option>
            <option value="GOMA_CENTRE">Goma Centre</option>
            <option value="GOMA_NORD">Goma Nord</option>
            <option value="GISENYI">Gisenyi</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <>
            <div className="table-container">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wider">
                    <th className="pb-3 font-semibold">N° Vente</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Agent</th>
                    <th className="pb-3 font-semibold">Site</th>
                    <th className="pb-3 font-semibold">Montant</th>
                    <th className="pb-3 font-semibold">Paiement</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data?.data || []).map(v => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <Link to={`/sales/${v.id}`} className="text-blue-600 hover:underline font-mono font-semibold">{v.numero}</Link>
                      </td>
                      <td className="py-3 text-gray-700">{v.clientNom}</td>
                      <td className="py-3 text-gray-500">{v.agentNom}</td>
                      <td className="py-3 text-gray-500">{v.siteNom}</td>
                      <td className="py-3 font-bold text-gray-900">{formatCDF(v.montantTotal)}</td>
                      <td className="py-3"><span className="badge badge-info">{v.modePaiement}</span></td>
                      <td className="py-3 text-gray-500">{formatDateTime(v.createdAt)}</td>
                      <td className="py-3">
                        <span className={`badge ${v.statut === 'COMPLETE' ? 'badge-success' : v.statut === 'ANNULE' ? 'badge-danger' : 'badge-warning'}`}>{v.statut}</span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.data || data.data.length === 0) && (
                    <tr><td colSpan={8} className="py-12 text-center">
                      <ShoppingBag size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400">Aucune vente trouvée</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Page {data.page} / {data.totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={data.page === 1} className="btn-secondary p-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={data.page === data.totalPages} className="btn-secondary p-2 disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
