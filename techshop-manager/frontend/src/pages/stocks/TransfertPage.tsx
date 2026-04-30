import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';

interface TransfertFormData {
  siteSourceId: string;
  siteDestinationId: string;
  produitId: string;
  quantite: number;
  motif: string;
}

interface Produit { id: string; nom: string; sku: string }
interface StockPreview { siteNom: string; quantiteActuelle: number; quantiteApres: number }

const SITES = [
  { id: 'GOMA_CENTRE', nom: 'Goma Centre' },
  { id: 'GOMA_NORD', nom: 'Goma Nord' },
  { id: 'GISENYI', nom: 'Gisenyi' },
];

export default function TransfertPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [prodSearch, setProdSearch] = useState('');
  const [prodResults, setProdResults] = useState<Produit[]>([]);
  const [selectedProd, setSelectedProd] = useState<Produit | null>(null);
  const [preview, setPreview] = useState<{ source: StockPreview; dest: StockPreview } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TransfertFormData>();
  const watchSource = watch('siteSourceId');
  const watchDest = watch('siteDestinationId');
  const watchQty = watch('quantite');
  const watchProd = watch('produitId');

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

  const { data: stockSource } = useQuery({
    queryKey: ['stock-preview', watchSource, watchProd],
    queryFn: () => api.get(`/stocks/${watchSource}/${watchProd}`).then(r => r.data),
    enabled: !!watchSource && !!watchProd,
  });

  const { data: stockDest } = useQuery({
    queryKey: ['stock-preview-dest', watchDest, watchProd],
    queryFn: () => api.get(`/stocks/${watchDest}/${watchProd}`).then(r => r.data),
    enabled: !!watchDest && !!watchProd,
  });

  useEffect(() => {
    if (stockSource && stockDest && watchQty) {
      const qty = Number(watchQty);
      setPreview({
        source: { siteNom: SITES.find(s => s.id === watchSource)?.nom || watchSource, quantiteActuelle: stockSource.quantite, quantiteApres: stockSource.quantite - qty },
        dest: { siteNom: SITES.find(s => s.id === watchDest)?.nom || watchDest, quantiteActuelle: stockDest.quantite, quantiteApres: stockDest.quantite + qty },
      });
    } else {
      setPreview(null);
    }
  }, [stockSource, stockDest, watchQty, watchSource, watchDest]);

  const mutation = useMutation({
    mutationFn: (data: TransfertFormData) => api.post('/stocks/transfert', data),
    onSuccess: () => {
      toast.success('Transfert initié avec succès.');
      qc.invalidateQueries({ queryKey: ['stocks'] });
      navigate('/stocks');
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors du transfert.'),
  });

  const onSubmit = (data: TransfertFormData) => {
    if (data.siteSourceId === data.siteDestinationId) {
      toast.error('Les sites source et destination doivent être différents.');
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ArrowRightLeft size={26} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfert de stock</h1>
          <p className="text-sm text-gray-500">Déplacer des articles entre sites</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label className="form-label">Site source *</label>
              <select
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.siteSourceId ? 'border-red-400' : 'border-gray-300'}`}
                {...register('siteSourceId', { required: 'Site source requis' })}
              >
                <option value="">Sélectionner</option>
                {SITES.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
              {errors.siteSourceId && <p className="form-error">{errors.siteSourceId.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Site destination *</label>
              <select
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.siteDestinationId ? 'border-red-400' : 'border-gray-300'}`}
                {...register('siteDestinationId', { required: 'Site destination requis' })}
              >
                <option value="">Sélectionner</option>
                {SITES.filter(s => s.id !== watchSource).map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
              {errors.siteDestinationId && <p className="form-error">{errors.siteDestinationId.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Produit *</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={prodSearch}
                onChange={e => { setProdSearch(e.target.value); setSelectedProd(null); setValue('produitId', ''); }}
                placeholder="Rechercher un produit..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input type="hidden" {...register('produitId', { required: 'Produit requis' })} />
              {prodResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg z-10 mt-1 overflow-hidden">
                  {prodResults.map(p => (
                    <button key={p.id} type="button" onClick={() => { setSelectedProd(p); setValue('produitId', p.id); setProdSearch(p.nom); setProdResults([]); }}
                      className="w-full p-3 text-left hover:bg-blue-50 border-b last:border-0">
                      <p className="font-medium text-gray-800">{p.nom}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.produitId && <p className="form-error">{errors.produitId.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Quantité à transférer *</label>
            <input
              type="number" min={1}
              placeholder="ex: 10"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantite ? 'border-red-400' : 'border-gray-300'}`}
              {...register('quantite', { required: 'Quantité requise', valueAsNumber: true, min: { value: 1, message: 'Minimum 1' } })}
            />
            {errors.quantite && <p className="form-error">{errors.quantite.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Motif du transfert *</label>
            <select
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.motif ? 'border-red-400' : 'border-gray-300'}`}
              {...register('motif', { required: 'Motif requis' })}
            >
              <option value="">Sélectionner un motif</option>
              <option value="REEQUILIBRAGE">Rééquilibrage des stocks</option>
              <option value="RUPTURE_SITE">Rupture dans le site destination</option>
              <option value="PROMOTION">Promotion commerciale</option>
              <option value="RETOUR_FOURNISSEUR">Retour fournisseur</option>
              <option value="AUTRE">Autre</option>
            </select>
            {errors.motif && <p className="form-error">{errors.motif.message}</p>}
          </div>

          {preview && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-700 mb-3">Aperçu après transfert</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white rounded-lg p-3 border">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Source: {preview.source.siteNom}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-gray-700">{preview.source.quantiteActuelle}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                    <span className={`text-lg font-bold ${preview.source.quantiteApres < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {preview.source.quantiteApres}
                    </span>
                  </div>
                  {preview.source.quantiteApres < 0 && <p className="text-xs text-red-500 mt-1">Stock insuffisant !</p>}
                </div>
                <ArrowRight size={24} className="text-blue-500 flex-shrink-0" />
                <div className="flex-1 bg-white rounded-lg p-3 border">
                  <p className="text-xs text-gray-400 font-semibold uppercase">Dest: {preview.dest.siteNom}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-gray-700">{preview.dest.quantiteActuelle}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                    <span className="text-lg font-bold text-green-600">{preview.dest.quantiteApres}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/stocks')} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isLoading} className="btn-primary flex items-center gap-2">
              {mutation.isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <ArrowRightLeft size={16} /> Initier le transfert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
