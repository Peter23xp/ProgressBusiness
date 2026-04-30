import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, Plus, ArrowRightLeft, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { statutStockColor } from '@/lib/utils';

interface StockItem {
  id: string;
  produit: { id: string; nom: string; sku: string; categorie: string };
  site: { id: string; nom: string };
  quantite: number;
  seuil: number;
  statut: 'OK' | 'ALERTE' | 'RUPTURE';
}

interface PaginatedStocks {
  data: StockItem[];
  total: number;
}

export default function InventairePage() {
  const [search, setSearch] = useState('');
  const [site, setSite] = useState('');
  const [categorie, setCategorie] = useState('');
  const [statut, setStatut] = useState('');

  const { data, isLoading } = useQuery<PaginatedStocks>({
    queryKey: ['stocks', { search, site, categorie, statut }],
    queryFn: () => api.get('/stocks', { params: { search, site, categorie, statut } }).then(r => r.data),
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package size={26} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventaire des stocks</h1>
            <p className="text-sm text-gray-500">{data?.total ?? '...'} articles</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/stocks/entree" className="btn-secondary flex items-center gap-2"><Plus size={16} /> Entrée stock</Link>
          <Link to="/stocks/transfert" className="btn-primary flex items-center gap-2"><ArrowRightLeft size={16} /> Transfert</Link>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher produit, SKU..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={site} onChange={e => setSite(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les sites</option>
            <option value="GOMA_CENTRE">Goma Centre</option>
            <option value="GOMA_NORD">Goma Nord</option>
            <option value="GISENYI">Gisenyi</option>
          </select>
          <select value={categorie} onChange={e => setCategorie(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Toutes catégories</option>
            <option value="TELEPHONIE">Téléphonie</option>
            <option value="ACCESSOIRES">Accessoires</option>
            <option value="INFORMATIQUE">Informatique</option>
          </select>
          <select value={statut} onChange={e => setStatut(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les statuts</option>
            <option value="OK">OK</option>
            <option value="ALERTE">Alerte</option>
            <option value="RUPTURE">Rupture</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[...Array(10)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">SKU</th>
                  <th className="pb-3 font-semibold">Produit</th>
                  <th className="pb-3 font-semibold">Catégorie</th>
                  <th className="pb-3 font-semibold">Site</th>
                  <th className="pb-3 font-semibold text-center">Quantité</th>
                  <th className="pb-3 font-semibold text-center">Seuil</th>
                  <th className="pb-3 font-semibold">Statut</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(data?.data || []).map(s => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${
                    s.statut === 'RUPTURE' ? 'bg-red-50' : s.statut === 'ALERTE' ? 'bg-orange-50' : ''
                  }`}>
                    <td className="py-3 font-mono text-xs text-gray-500">{s.produit.sku}</td>
                    <td className="py-3">
                      <Link to={`/stocks/produit/${s.produit.id}`} className="font-semibold text-blue-600 hover:underline">{s.produit.nom}</Link>
                    </td>
                    <td className="py-3 text-gray-500">{s.produit.categorie}</td>
                    <td className="py-3 text-gray-600">{s.site.nom}</td>
                    <td className="py-3 text-center">
                      <span className={`font-black text-lg ${s.statut === 'RUPTURE' ? 'text-red-600' : s.statut === 'ALERTE' ? 'text-orange-600' : 'text-green-700'}`}>
                        {s.quantite}
                      </span>
                    </td>
                    <td className="py-3 text-center text-gray-500">{s.seuil}</td>
                    <td className="py-3">
                      <span className={`badge ${statutStockColor(s.statut)}`}>{s.statut}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link to="/stocks/entree" className="text-xs btn-secondary py-1 px-2">Entrée</Link>
                        <Link to="/stocks/transfert" className="text-xs btn-secondary py-1 px-2">Transfert</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <tr><td colSpan={8} className="py-12 text-center">
                    <Package size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400">Aucun article en stock</p>
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
