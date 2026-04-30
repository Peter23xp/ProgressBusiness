import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';

interface InventaireItem {
  produitId: string;
  sku: string;
  nom: string;
  stockSysteme: number;
  stockCompte?: number;
}

export default function InventairePhysiquePage() {
  const qc = useQueryClient();
  const [site, setSite] = useState('');
  const [inventaire, setInventaire] = useState<Record<string, number>>({});

  const { data: items, isLoading } = useQuery<InventaireItem[]>({
    queryKey: ['inventaire-physique', site],
    queryFn: () => api.get(`/stocks?site=${site}&limit=200`).then(r => r.data.data?.map((s: any) => ({
      produitId: s.produit.id,
      sku: s.produit.sku,
      nom: s.produit.nom,
      stockSysteme: s.quantite,
    })) || []),
    enabled: !!site,
  });

  useEffect(() => {
    if (items) {
      const initial: Record<string, number> = {};
      items.forEach(i => { initial[i.produitId] = i.stockSysteme; });
      setInventaire(initial);
    }
  }, [items]);

  const mutation = useMutation({
    mutationFn: () => api.post('/stocks/inventaire', {
      siteId: site,
      lignes: Object.entries(inventaire).map(([produitId, stockCompte]) => ({ produitId, stockCompte })),
    }),
    onSuccess: () => {
      toast.success('Inventaire physique validé avec succès !');
      qc.invalidateQueries({ queryKey: ['stocks'] });
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors de la validation.'),
  });

  const comptes = Object.values(inventaire).filter(v => v !== undefined).length;
  const total = items?.length || 0;
  const progress = total > 0 ? Math.round((comptes / total) * 100) : 0;

  const SITES = [
    { id: 'GOMA_CENTRE', nom: 'Goma Centre' },
    { id: 'GOMA_NORD', nom: 'Goma Nord' },
    { id: 'GISENYI', nom: 'Gisenyi' },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <ClipboardList size={26} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaire physique</h1>
          <p className="text-sm text-gray-500">Comptage et validation du stock réel</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1">
            <label className="form-label">Sélectionner le site</label>
            <select value={site} onChange={e => { setSite(e.target.value); setInventaire({}); }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Choisir un site pour commencer</option>
              {SITES.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
        </div>

        {site && total > 0 && (
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Progression: {comptes} / {total} articles</span>
              <span className="font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {site && (
        <div className="card p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
          ) : (
            <>
              <div className="table-container">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wider bg-gray-50">
                      <th className="px-4 py-3 font-semibold">SKU</th>
                      <th className="px-4 py-3 font-semibold">Produit</th>
                      <th className="px-4 py-3 font-semibold text-center">Stock système</th>
                      <th className="px-4 py-3 font-semibold text-center w-40">Stock compté</th>
                      <th className="px-4 py-3 font-semibold text-center">Écart</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(items || []).map(item => {
                      const compteVal = inventaire[item.produitId];
                      const ecart = compteVal !== undefined ? compteVal - item.stockSysteme : null;
                      return (
                        <tr key={item.produitId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{item.nom}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-gray-700">{item.stockSysteme}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min={0}
                              value={compteVal ?? ''}
                              onChange={e => setInventaire(prev => ({ ...prev, [item.produitId]: parseInt(e.target.value) || 0 }))}
                              className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {ecart !== null ? (
                              <span className={`font-bold text-base ${
                                ecart === 0 ? 'text-green-600' : ecart > 0 ? 'text-blue-600' : 'text-red-600'
                              }`}>
                                {ecart > 0 ? '+' : ''}{ecart}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {(!items || items.length === 0) && (
                      <tr><td colSpan={5} className="py-12 text-center text-gray-400">Aucun article dans ce site.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {items && items.length > 0 && (
                <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Écarts: <span className="text-red-600 font-bold">{Object.entries(inventaire).filter(([id, v]) => {
                      const item = items.find(i => i.produitId === id);
                      return item && v !== undefined && v !== item.stockSysteme;
                    }).length}</span> articles avec écart
                  </div>
                  <button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isLoading || progress < 100}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {mutation.isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : <CheckCircle size={16} />}
                    Valider l'inventaire ({progress}%)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!site && (
        <div className="card text-center py-12">
          <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Sélectionnez un site pour commencer l'inventaire</p>
          <p className="text-gray-400 text-sm mt-1">L'inventaire physique permet de corriger les écarts entre le stock système et le stock réel.</p>
        </div>
      )}
    </div>
  );
}
