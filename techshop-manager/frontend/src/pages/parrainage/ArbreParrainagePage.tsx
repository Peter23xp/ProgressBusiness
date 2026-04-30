import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Gift, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { formatCDF, formatDate, statutClientColor } from '@/lib/utils';

interface FilleulNode {
  id: string;
  prenom: string;
  nom: string;
  statut: string;
  niveau: string;
  createdAt: string;
  gainGenere?: number;
}

interface ParrainageTree {
  client: {
    id: string; prenom: string; nom: string; telephone: string;
    codeParrain: string; niveau: string;
  };
  parrain?: { id: string; prenom: string; nom: string; codeParrain: string };
  filleuls: FilleulNode[];
  totalFilleuls: number;
  gainsCumules: number;
}

const STATUT_COLORS: Record<string, string> = {
  ACTIF: '#22c55e', EN_COURS: '#f59e0b', INACTIF: '#9ca3af', SUSPENDU: '#ef4444',
};

export default function ArbreParrainagePage() {
  const { clientId } = useParams<{ clientId: string }>();

  const { data, isLoading } = useQuery<ParrainageTree>({
    queryKey: ['parrainage-tree', clientId],
    queryFn: () => api.get(`/parrainage/tree/${clientId}`).then(r => r.data),
  });

  const copyCode = () => {
    if (data?.client.codeParrain) {
      navigator.clipboard.writeText(data.client.codeParrain);
      toast.success('Code parrain copié !');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="card"><div className="skeleton h-64 rounded" /></div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center text-gray-400">Données introuvables.</div>;

  const { client, parrain, filleuls } = data;
  const svgW = 600;
  const svgH = Math.max(200, 80 + filleuls.length * 60);
  const centerX = svgW / 2;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/clients/${clientId}`} className="btn-secondary p-2"><ArrowLeft size={18} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Arbre de parrainage</h1>
      </div>

      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-black text-lg shadow">
              {client.prenom[0]}{client.nom[0]}
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900">{client.prenom} {client.nom}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded text-sm">{client.codeParrain}</span>
                <button onClick={copyCode} className="text-gray-400 hover:text-purple-600"><Copy size={14} /></button>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-purple-700">{data.totalFilleuls}</p>
              <p className="text-xs text-gray-500">Filleuls totaux</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-green-700">{formatCDF(data.gainsCumules)}</p>
              <p className="text-xs text-gray-500">Gains cumulés</p>
            </div>
          </div>
        </div>
      </div>

      {parrain && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-500 font-semibold uppercase mb-2">Parrain de {client.prenom}</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">
              {parrain.prenom[0]}{parrain.nom[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{parrain.prenom} {parrain.nom}</p>
              <p className="text-xs text-gray-500 font-mono">{parrain.codeParrain}</p>
            </div>
            <Link to={`/parrainage/arbre/${parrain.id}`} className="ml-auto btn-secondary text-xs px-3 py-1">Voir son arbre</Link>
          </div>
        </div>
      )}

      {filleuls.length > 0 && (
        <div className="card overflow-hidden">
          <h2 className="font-semibold text-gray-800 mb-4">Visualisation de l'arbre</h2>
          <div className="overflow-x-auto">
            <svg width={svgW} height={svgH} className="mx-auto">
              <circle cx={centerX} cy={50} r={30} fill="#7c3aed" />
              <text x={centerX} y={55} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">
                {client.prenom[0]}{client.nom[0]}
              </text>
              {filleuls.map((f, i) => {
                const y = 140 + i * 60;
                const x = Math.max(50, Math.min(svgW - 50, centerX + (i - (filleuls.length - 1) / 2) * (svgW / Math.max(filleuls.length, 3))));
                const color = STATUT_COLORS[f.statut] || '#9ca3af';
                return (
                  <g key={f.id}>
                    <line x1={centerX} y1={80} x2={x} y2={y - 20} stroke="#e5e7eb" strokeWidth={2} />
                    <circle cx={x} cy={y} r={22} fill={color} opacity={0.9} />
                    <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold">
                      {f.prenom[0]}{f.nom[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex gap-3 mt-2 justify-center flex-wrap">
            {Object.entries(STATUT_COLORS).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-gray-600">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={18} className="text-purple-500" />
          Filleuls ({filleuls.length})
        </h2>
        {filleuls.length === 0 ? (
          <div className="py-10 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400">Aucun filleul pour l'instant.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase">
                  <th className="pb-3 font-semibold">Filleul</th>
                  <th className="pb-3 font-semibold">Niveau</th>
                  <th className="pb-3 font-semibold">Statut</th>
                  <th className="pb-3 font-semibold">Gain généré</th>
                  <th className="pb-3 font-semibold">Date parrainage</th>
                  <th className="pb-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filleuls.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                          {f.prenom[0]}{f.nom[0]}
                        </div>
                        <span className="font-medium text-gray-800">{f.prenom} {f.nom}</span>
                      </div>
                    </td>
                    <td className="py-3"><span className="badge badge-gray">{f.niveau}</span></td>
                    <td className="py-3"><span className={`badge ${statutClientColor(f.statut)}`}>{f.statut}</span></td>
                    <td className="py-3 font-semibold text-green-700">
                      <div className="flex items-center gap-1">
                        <Gift size={14} />
                        {f.gainGenere ? formatCDF(f.gainGenere) : '—'}
                      </div>
                    </td>
                    <td className="py-3 text-gray-500">{formatDate(f.createdAt)}</td>
                    <td className="py-3">
                      <Link to={`/clients/${f.id}`} className="btn-secondary text-xs py-1 px-2">Fiche</Link>
                    </td>
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
