import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF, statutStockColor } from '@/lib/utils';

interface StockConsolide {
  produitId: string;
  sku: string;
  nom: string;
  categorie: string;
  prix: number;
  stockParSite: Record<string, number>;
  stockTotal: number;
  valeurTotale: number;
  statut: string;
}

interface RapportStocks {
  produits: StockConsolide[];
  sites: string[];
  valeurTotaleInventaire: number;
  produitsEnRupture: Array<{ nom: string; sku: string; site: string }>;
}

export default function RapportStocksPage() {
  const { data, isLoading } = useQuery<RapportStocks>({
    queryKey: ['rapport-stocks'],
    queryFn: () => api.get('/rapports/stocks').then(r => r.data),
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Package size={26} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapport des stocks</h1>
          <p className="text-sm text-gray-500">Vue consolidée de l'inventaire</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card col-span-1 sm:col-span-2">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl"><Package size={22} className="text-blue-600" /></div>
            <div>
              {isLoading ? <div className="skeleton h-8 w-40 rounded" /> : (
                <>
                  <p className="text-2xl font-bold text-gray-900">{formatCDF(data?.valeurTotaleInventaire || 0)}</p>
                  <p className="text-sm text-gray-500">Valeur totale de l'inventaire</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="stat-card bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl"><AlertTriangle size={22} className="text-red-600" /></div>
            <div>
              {isLoading ? <div className="skeleton h-8 w-20 rounded" /> : (
                <>
                  <p className="text-2xl font-bold text-red-700">{data?.produitsEnRupture?.length || 0}</p>
                  <p className="text-sm text-red-600">Produits en rupture</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {data?.produitsEnRupture && data.produitsEnRupture.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <h2 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Produits en rupture de stock
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.produitsEnRupture.map((p, i) => (
              <div key={i} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-sm">
                <p className="font-semibold text-red-700">{p.nom}</p>
                <p className="text-xs text-gray-500">{p.sku} · {p.site}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">Inventaire consolidé</h2>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase bg-gray-50">
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Catégorie</th>
                  <th className="px-4 py-3 font-semibold">Prix unit.</th>
                  {(data?.sites || []).map(s => (
                    <th key={s} className="px-4 py-3 font-semibold text-center">{s}</th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-center">Total</th>
                  <th className="px-4 py-3 font-semibold text-right">Valeur</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.produits || []).map(p => (
                  <tr key={p.produitId} className={`hover:bg-gray-50 ${p.statut === 'RUPTURE' ? 'bg-red-50' : p.statut === 'ALERTE' ? 'bg-orange-50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nom}</td>
                    <td className="px-4 py-3 text-gray-500">{p.categorie}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCDF(p.prix)}</td>
                    {(data?.sites || []).map(s => (
                      <td key={s} className="px-4 py-3 text-center font-semibold text-gray-700">
                        {p.stockParSite?.[s] ?? 0}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-black text-gray-900">{p.stockTotal}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCDF(p.valeurTotale)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${statutStockColor(p.statut)}`}>{p.statut}</span>
                    </td>
                  </tr>
                ))}
                {(!data?.produits || data.produits.length === 0) && (
                  <tr><td colSpan={8} className="py-10 text-center text-gray-400">Aucun produit en stock.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
