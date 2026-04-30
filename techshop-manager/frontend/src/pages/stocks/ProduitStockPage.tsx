import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Edit, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { formatDateTime, statutStockColor } from '@/lib/utils';

interface StockSite { siteId: string; siteNom: string; quantite: number; seuil: number; statut: string }
interface Mouvement { id: string; type: string; quantite: number; reference?: string; notes?: string; createdAt: string; agentNom: string }
interface ProduitStock {
  produit: { id: string; nom: string; sku: string; prix: number; categorie: string; description?: string };
  stocksParSite: StockSite[];
  mouvements: Mouvement[];
}

export default function ProduitStockPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editSeuil, setEditSeuil] = useState<{ siteId: string; siteNom: string; seuil: number } | null>(null);
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery<ProduitStock>({
    queryKey: ['produit-stocks', id],
    queryFn: () => api.get(`/produits/${id}/stocks`).then(r => r.data),
  });

  const seuilForm = useForm<{ seuil: number }>();

  const seuilMutation = useMutation({
    mutationFn: ({ siteId, seuil }: { siteId: string; seuil: number }) =>
      api.patch(`/stocks/${siteId}/${id}/seuil`, { seuil }),
    onSuccess: () => {
      toast.success('Seuil mis à jour.');
      qc.invalidateQueries({ queryKey: ['produit-stocks', id] });
      setEditSeuil(null);
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur de mise à jour.'),
  });

  const filteredMouvements = (data?.mouvements || []).filter(m => !typeFilter || m.type === typeFilter);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="card"><div className="skeleton h-40 rounded" /></div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center text-gray-400">Produit introuvable.</div>;

  const { produit, stocksParSite } = data;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{produit.nom}</h1>
          <p className="text-sm text-gray-500 font-mono">{produit.sku} · {produit.categorie}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card"><p className="text-xs text-gray-400 font-semibold uppercase">SKU</p><p className="font-mono font-bold text-gray-900">{produit.sku}</p></div>
        <div className="card"><p className="text-xs text-gray-400 font-semibold uppercase">Prix</p><p className="font-bold text-blue-700 text-lg">{produit.prix?.toLocaleString()} CDF</p></div>
        <div className="card"><p className="text-xs text-gray-400 font-semibold uppercase">Catégorie</p><p className="font-semibold text-gray-900">{produit.categorie}</p></div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package size={18} className="text-blue-500" />Stock par site</h2>
        <div className="table-container">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b text-xs uppercase">
                <th className="pb-3 font-semibold">Site</th>
                <th className="pb-3 font-semibold text-center">Quantité</th>
                <th className="pb-3 font-semibold text-center">Seuil</th>
                <th className="pb-3 font-semibold">Statut</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stocksParSite.map(s => (
                <tr key={s.siteId} className={s.statut === 'RUPTURE' ? 'bg-red-50' : s.statut === 'ALERTE' ? 'bg-orange-50' : ''}>
                  <td className="py-3 font-medium text-gray-800">{s.siteNom}</td>
                  <td className="py-3 text-center">
                    <span className={`font-black text-lg ${s.statut === 'RUPTURE' ? 'text-red-600' : s.statut === 'ALERTE' ? 'text-orange-600' : 'text-green-700'}`}>{s.quantite}</span>
                  </td>
                  <td className="py-3 text-center text-gray-600">{s.seuil}</td>
                  <td className="py-3"><span className={`badge ${statutStockColor(s.statut)}`}>{s.statut}</span></td>
                  <td className="py-3">
                    <button onClick={() => { setEditSeuil({ siteId: s.siteId, siteNom: s.siteNom, seuil: s.seuil }); seuilForm.setValue('seuil', s.seuil); }}
                      className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                      <Edit size={12} /> Seuil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Historique des mouvements</h2>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les types</option>
            <option value="ENTREE">Entrée</option>
            <option value="SORTIE">Sortie (Vente)</option>
            <option value="TRANSFERT_ENVOI">Transfert envoi</option>
            <option value="TRANSFERT_RECEPTION">Transfert réception</option>
            <option value="INVENTAIRE">Inventaire</option>
            <option value="RETOUR">Retour</option>
          </select>
        </div>
        <div className="space-y-2">
          {filteredMouvements.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Aucun mouvement enregistré.</p>
          ) : filteredMouvements.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  m.type.includes('ENTREE') || m.type === 'TRANSFERT_RECEPTION' || m.type === 'RETOUR' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {m.type.includes('ENTREE') || m.type === 'TRANSFERT_RECEPTION' || m.type === 'RETOUR' ? '+' : '-'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.type}</p>
                  <p className="text-xs text-gray-400">{m.agentNom} · {formatDateTime(m.createdAt)}</p>
                  {m.reference && <p className="text-xs text-gray-400 font-mono">{m.reference}</p>}
                </div>
              </div>
              <span className={`font-bold text-lg ${
                m.type.includes('ENTREE') || m.type === 'TRANSFERT_RECEPTION' || m.type === 'RETOUR' ? 'text-green-600' : 'text-red-600'
              }`}>
                {m.type.includes('ENTREE') || m.type === 'TRANSFERT_RECEPTION' || m.type === 'RETOUR' ? '+' : '-'}{m.quantite}
              </span>
            </div>
          ))}
        </div>
      </div>

      {editSeuil && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Modifier le seuil — {editSeuil.siteNom}</h3>
            <p className="text-sm text-gray-500 mb-4">Le seuil déclenche une alerte quand le stock descend en-dessous.</p>
            <form onSubmit={seuilForm.handleSubmit(d => seuilMutation.mutate({ siteId: editSeuil.siteId, seuil: d.seuil }))}>
              <input type="number" min={0} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
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
