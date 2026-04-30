import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { formatCDF, formatDate } from '@/lib/utils';

interface VenteDetail {
  id: string;
  numero: string;
  date: string;
  clientNom: string;
  agentNom: string;
  siteNom: string;
  produits: string;
  montantTotal: number;
  modePaiement: string;
  statut: string;
}

interface TotauxAgent {
  agentNom: string;
  totalVentes: number;
  totalCA: number;
}

interface RapportVentesDetail {
  ventes: VenteDetail[];
  total: number;
  totalCA: number;
  totauxParAgent: TotauxAgent[];
}

export default function RapportVentesPage() {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [sites, setSites] = useState<string[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [modesPaiement, setModesPaiement] = useState<string[]>([]);

  const { data, isLoading } = useQuery<RapportVentesDetail>({
    queryKey: ['rapport-ventes-detail', { dateDebut, dateFin, sites, agents, modesPaiement }],
    queryFn: () => api.get('/rapports/ventes/detail', {
      params: { dateDebut, dateFin, sites: sites.join(','), agents: agents.join(','), modesPaiement: modesPaiement.join(',') }
    }).then(r => r.data),
  });

  const toggleMultiSelect = (val: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(val)) setter(current.filter(v => v !== val));
    else setter([...current, val]);
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/rapports/ventes/detail/export', {
        params: { dateDebut, dateFin, sites: sites.join(','), agents: agents.join(',') },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `rapport-ventes-${Date.now()}.csv`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Rapport exporté.');
    } catch (error) { toast.error(getErrorMessage(error) || 'Erreur d\'export.'); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapport des ventes détaillé</h1>
          <p className="text-sm text-gray-500">{data?.total ?? '...'} ventes · {formatCDF(data?.totalCA || 0)}</p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2"><Download size={16} /> Exporter CSV</button>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold"><Filter size={16} /> Filtres avancés</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="form-label">Date début</label>
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="form-group">
            <label className="form-label">Date fin</label>
            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="form-group">
            <label className="form-label">Sites</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['GOMA_CENTRE', 'GOMA_NORD', 'GISENYI'].map(s => (
                <button key={s} type="button" onClick={() => toggleMultiSelect(s, sites, setSites)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${sites.includes(s) ? 'bg-blue-100 border-blue-400 text-blue-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Paiement</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['CASH', 'MPESA', 'AIRTEL_MONEY'].map(m => (
                <button key={m} type="button" onClick={() => toggleMultiSelect(m, modesPaiement, setModesPaiement)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${modesPaiement.includes(m) ? 'bg-green-100 border-green-400 text-green-700' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data?.totauxParAgent && data.totauxParAgent.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Totaux par agent</h2>
          <div className="flex flex-wrap gap-3">
            {data.totauxParAgent.map(a => (
              <div key={a.agentNom} className="bg-gray-50 rounded-xl p-4 border flex-1 min-w-40">
                <p className="font-semibold text-gray-800 text-sm">{a.agentNom}</p>
                <p className="text-xl font-black text-blue-700">{a.totalVentes} ventes</p>
                <p className="text-sm text-green-700 font-semibold">{formatCDF(a.totalCA)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Détail des ventes</h2>
        {isLoading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase">
                  <th className="pb-3 font-semibold">N° Vente</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Agent</th>
                  <th className="pb-3 font-semibold">Site</th>
                  <th className="pb-3 font-semibold">Montant</th>
                  <th className="pb-3 font-semibold">Paiement</th>
                  <th className="pb-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.ventes || []).map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-blue-600 text-xs">{v.numero}</td>
                    <td className="py-3 text-gray-500">{formatDate(v.date)}</td>
                    <td className="py-3 text-gray-700">{v.clientNom}</td>
                    <td className="py-3 text-gray-500">{v.agentNom}</td>
                    <td className="py-3 text-gray-500">{v.siteNom}</td>
                    <td className="py-3 font-bold text-gray-900">{formatCDF(v.montantTotal)}</td>
                    <td className="py-3"><span className="badge badge-info text-xs">{v.modePaiement}</span></td>
                    <td className="py-3">
                      <span className={`badge text-xs ${v.statut === 'COMPLETE' ? 'badge-success' : v.statut === 'ANNULE' ? 'badge-danger' : 'badge-warning'}`}>{v.statut}</span>
                    </td>
                  </tr>
                ))}
                {(!data?.ventes || data.ventes.length === 0) && (
                  <tr><td colSpan={8} className="py-10 text-center text-gray-400">Aucune vente pour les filtres sélectionnés.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
