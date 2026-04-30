import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, statutClientColor, niveauColor } from '@/lib/utils';

interface Client {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  niveau: string;
  statut: string;
  site: { nom: string };
  codeParrain: string;
  createdAt: string;
  pointsFidelite: number;
}

interface PaginatedClients {
  data: Client[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ClientsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [site, setSite] = useState('');
  const [statut, setStatut] = useState('');
  const [niveau, setNiveau] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedClients>({
    queryKey: ['clients', { search, site, statut, niveau, page }],
    queryFn: () => api.get('/clients', {
      params: { search, site, statut, niveau, page, limit: 20 }
    }).then(r => r.data),
    keepPreviousData: true,
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={26} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500">{data?.total ?? '...'} clients au total</p>
          </div>
        </div>
        <Link to="/clients/new/recit" className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Nouveau Client
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, code..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={site}
            onChange={e => { setSite(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les sites</option>
            <option value="GOMA_CENTRE">Goma Centre</option>
            <option value="GOMA_NORD">Goma Nord</option>
            <option value="GISENYI">Gisenyi</option>
          </select>
          <select
            value={statut}
            onChange={e => { setStatut(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="EN_COURS">En cours</option>
            <option value="INACTIF">Inactif</option>
            <option value="SUSPENDU">Suspendu</option>
          </select>
          <select
            value={niveau}
            onChange={e => { setNiveau(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les niveaux</option>
            <option value="BRONZE">Bronze</option>
            <option value="ARGENT">Argent</option>
            <option value="OR">Or</option>
            <option value="PLATINE">Platine</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-14 rounded" />)}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Téléphone</th>
                    <th className="pb-3 font-semibold">Site</th>
                    <th className="pb-3 font-semibold">Niveau</th>
                    <th className="pb-3 font-semibold">Statut</th>
                    <th className="pb-3 font-semibold">Points</th>
                    <th className="pb-3 font-semibold">Inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data?.data || []).map(client => (
                    <tr
                      key={client.id}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                            {client.prenom[0]}{client.nom[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{client.prenom} {client.nom}</p>
                            <p className="text-xs text-gray-400 font-mono">{client.codeParrain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 font-mono">{client.telephone}</td>
                      <td className="py-3 text-gray-600">{client.site?.nom}</td>
                      <td className="py-3">
                        <span className={`badge ${niveauColor(client.niveau)}`}>{client.niveau}</span>
                      </td>
                      <td className="py-3">
                        <span className={`badge ${statutClientColor(client.statut)}`}>{client.statut}</span>
                      </td>
                      <td className="py-3 font-semibold text-purple-700">{client.pointsFidelite}</td>
                      <td className="py-3 text-gray-500">{formatDate(client.createdAt)}</td>
                    </tr>
                  ))}
                  {(!data?.data || data.data.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Users size={40} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-400">Aucun client trouvé</p>
                        <Link to="/clients/new/recit" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                          Créer le premier client
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Page {data.page} sur {data.totalPages} ({data.total} résultats)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={data.page === 1}
                    className="btn-secondary p-2 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={data.page === data.totalPages}
                    className="btn-secondary p-2 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
