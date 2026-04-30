import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShoppingCart, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface StockAlerte {
  id: string;
  produit: { id: string; nom: string; sku: string };
  site: { id: string; nom: string };
  quantiteActuelle: number;
  seuil: number;
  type: 'ALERTE' | 'RUPTURE';
  depuis: string;
}

export default function AlertesStockPage() {
  const qc = useQueryClient();
  const [editSeuil, setEditSeuil] = useState<StockAlerte | null>(null);
  const seuilForm = useForm<{ seuil: number }>();

  const { data: alertes, isLoading } = useQuery<StockAlerte[]>({
    queryKey: ['stocks-alertes'],
    queryFn: () => api.get('/stocks/alertes').then(r => r.data),
    refetchInterval: 60000,
  });

  const seuilMutation = useMutation({
    mutationFn: ({ siteId, produitId, seuil }: { siteId: string; produitId: string; seuil: number }) =>
      api.patch(`/stocks/${siteId}/${produitId}/seuil`, { seuil }),
    onSuccess: () => {
      toast.success('Seuil mis à jour.');
      qc.invalidateQueries({ queryKey: ['stocks-alertes'] });
      setEditSeuil(null);
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur.'),
  });

  const ruptures = alertes?.filter(a => a.type === 'RUPTURE') || [];
  const enAlerte = alertes?.filter(a => a.type === 'ALERTE') || [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <AlertTriangle size={26} className="text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertes stock</h1>
          <p className="text-sm text-gray-500">{alertes?.length ?? '...'} alertes actives</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl"><AlertTriangle size={22} className="text-red-600" /></div>
            <div>
              <p className="text-2xl font-black text-red-700">{ruptures.length}</p>
              <p className="text-sm text-red-600">Ruptures de stock</p>
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-orange-500 bg-orange-50">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-xl"><AlertTriangle size={22} className="text-orange-600" /></div>
            <div>
              <p className="text-2xl font-black text-orange-700">{enAlerte.length}</p>
              <p className="text-sm text-orange-600">En alerte (seuil bas)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Toutes les alertes actives</h2>
        {isLoading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 rounded" />)}</div>
        ) : (
          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Produit</th>
                  <th className="pb-3 font-semibold">Site</th>
                  <th className="pb-3 font-semibold text-center">Stock actuel</th>
                  <th className="pb-3 font-semibold text-center">Seuil</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Depuis</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(alertes || []).map(a => (
                  <tr key={a.id} className={`hover:bg-gray-50 ${a.type === 'RUPTURE' ? 'bg-red-50' : 'bg-orange-50'}`}>
                    <td className="py-3">
                      <Link to={`/stocks/produit/${a.produit.id}`} className="font-semibold text-blue-600 hover:underline">{a.produit.nom}</Link>
                      <p className="text-xs text-gray-400 font-mono">{a.produit.sku}</p>
                    </td>
                    <td className="py-3 text-gray-700">{a.site.nom}</td>
                    <td className="py-3 text-center">
                      <span className={`font-black text-xl ${a.type === 'RUPTURE' ? 'text-red-600' : 'text-orange-600'}`}>{a.quantiteActuelle}</span>
                    </td>
                    <td className="py-3 text-center text-gray-500">{a.seuil}</td>
                    <td className="py-3">
                      <span className={`badge ${a.type === 'RUPTURE' ? 'badge-danger' : 'badge-warning'}`}>{a.type}</span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{formatDate(a.depuis)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link to="/stocks/entree" className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                          <ShoppingCart size={12} /> Commander
                        </Link>
                        <button
                          onClick={() => { setEditSeuil(a); seuilForm.setValue('seuil', a.seuil); }}
                          className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
                        >
                          <Edit size={12} /> Seuil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!alertes || alertes.length === 0) && (
                  <tr><td colSpan={7} className="py-12 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle size={24} className="text-green-500" />
                    </div>
                    <p className="text-gray-500 font-medium">Aucune alerte de stock active</p>
                    <p className="text-gray-400 text-sm">Tous les stocks sont à des niveaux satisfaisants.</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editSeuil && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-1">Modifier le seuil</h3>
            <p className="text-sm text-gray-500 mb-1">{editSeuil.produit.nom}</p>
            <p className="text-xs text-gray-400 mb-4">{editSeuil.site.nom}</p>
            <form onSubmit={seuilForm.handleSubmit(d => seuilMutation.mutate({ siteId: editSeuil.site.id, produitId: editSeuil.produit.id, seuil: d.seuil }))}>
              <input type="number" min={0}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                {...seuilForm.register('seuil', { required: true, valueAsNumber: true, min: 0 })} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditSeuil(null)} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={seuilMutation.isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {seuilMutation.isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
