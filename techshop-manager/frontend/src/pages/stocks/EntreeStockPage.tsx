import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';

interface EntreeFormData {
  siteId: string;
  produitId: string;
  quantite: number;
  referenceFournisseur?: string;
  dateReception: string;
  notes?: string;
}

interface Produit { id: string; nom: string; sku: string; categorie: string }

export default function EntreeStockPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [prodSearch, setProdSearch] = useState('');
  const [prodResults, setProdResults] = useState<Produit[]>([]);
  const [selectedProd, setSelectedProd] = useState<Produit | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EntreeFormData>({
    defaultValues: { dateReception: today },
  });

  useEffect(() => {
    if (!prodSearch.trim() || selectedProd) { setProdResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/produits/search?q=${encodeURIComponent(prodSearch)}`);
        setProdResults(res.data);
      } catch { setProdResults([]); }
    }, 300);
  }, [prodSearch, selectedProd]);

  const selectProd = (p: Produit) => {
    setSelectedProd(p);
    setValue('produitId', p.id);
    setProdSearch(p.nom);
    setProdResults([]);
  };

  const mutation = useMutation({
    mutationFn: (data: EntreeFormData) => api.post('/stocks/entree', data),
    onSuccess: () => {
      toast.success('Entrée de stock enregistrée avec succès.');
      qc.invalidateQueries({ queryKey: ['stocks'] });
      navigate('/stocks');
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors de l\'enregistrement.'),
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Package size={26} className="text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrée de stock</h1>
          <p className="text-sm text-gray-500">Réception de marchandises</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Site destinataire *</label>
            <select
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.siteId ? 'border-red-400' : 'border-gray-300'}`}
              {...register('siteId', { required: 'Site requis' })}
            >
              <option value="">Sélectionner un site</option>
              <option value="GOMA_CENTRE">Goma Centre</option>
              <option value="GOMA_NORD">Goma Nord</option>
              <option value="GISENYI">Gisenyi</option>
            </select>
            {errors.siteId && <p className="form-error">{errors.siteId.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Produit *</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={prodSearch}
                onChange={e => { setProdSearch(e.target.value); setSelectedProd(null); setValue('produitId', ''); }}
                placeholder="Rechercher un produit..."
                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.produitId ? 'border-red-400' : 'border-gray-300'}`}
              />
              <input type="hidden" {...register('produitId', { required: 'Produit requis' })} />
              {prodResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg z-10 mt-1 overflow-hidden">
                  {prodResults.map(p => (
                    <button key={p.id} type="button" onClick={() => selectProd(p)}
                      className="w-full p-3 text-left hover:bg-blue-50 border-b last:border-0">
                      <p className="font-medium text-gray-800">{p.nom}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.sku} · {p.categorie}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedProd && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2 flex justify-between items-center">
                <p className="text-sm font-medium text-green-800">{selectedProd.nom}</p>
                <p className="text-xs text-green-600 font-mono">{selectedProd.sku}</p>
              </div>
            )}
            {errors.produitId && <p className="form-error">{errors.produitId.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Quantité reçue *</label>
            <input
              type="number"
              min={1}
              placeholder="ex: 50"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantite ? 'border-red-400' : 'border-gray-300'}`}
              {...register('quantite', { required: 'Quantité requise', valueAsNumber: true, min: { value: 1, message: 'Minimum 1' } })}
            />
            {errors.quantite && <p className="form-error">{errors.quantite.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label className="form-label">Référence fournisseur (optionnel)</label>
              <input
                placeholder="ex: BON-2026-001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('referenceFournisseur')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date de réception *</label>
              <input
                type="date"
                max={today}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateReception ? 'border-red-400' : 'border-gray-300'}`}
                {...register('dateReception', { required: 'Date requise' })}
              />
              {errors.dateReception && <p className="form-error">{errors.dateReception.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optionnel)</label>
            <textarea
              rows={3}
              placeholder="Observations sur la livraison..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              {...register('notes')}
            />
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/stocks')} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isLoading} className="btn-primary flex items-center gap-2">
              {mutation.isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Enregistrer l'entrée
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
