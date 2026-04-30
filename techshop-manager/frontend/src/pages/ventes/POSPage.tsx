import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { formatCDF } from '@/lib/utils';

interface Produit { id: string; nom: string; sku: string; prix: number; stock: number; categorie: string }
interface Client { id: string; prenom: string; nom: string; telephone: string; niveau: string; pointsFidelite: number; remiseFidelite: number }
interface CartItem { produit: Produit; quantite: number }

export default function POSPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [prodSearch, setProdSearch] = useState('');
  const [prodResults, setProdResults] = useState<Produit[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modePaiement, setModePaiement] = useState<'CASH' | 'MPESA' | 'AIRTEL_MONEY'>('CASH');
  const [montantRecu, setMontantRecu] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastVenteId, setLastVenteId] = useState('');
  const prodTimer = useRef<ReturnType<typeof setTimeout>>();
  const clientTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!prodSearch.trim()) { setProdResults([]); return; }
    clearTimeout(prodTimer.current);
    setProdLoading(true);
    prodTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/produits/search?q=${encodeURIComponent(prodSearch)}`);
        setProdResults(res.data);
      } catch { setProdResults([]); }
      finally { setProdLoading(false); }
    }, 300);
  }, [prodSearch]);

  useEffect(() => {
    if (!clientSearch.trim()) { setClientResults([]); return; }
    clearTimeout(clientTimer.current);
    setClientLoading(true);
    clientTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/clients/search?q=${encodeURIComponent(clientSearch)}`);
        setClientResults(res.data);
      } catch { setClientResults([]); }
      finally { setClientLoading(false); }
    }, 300);
  }, [clientSearch]);

  const addToCart = (p: Produit) => {
    setCart(prev => {
      const ex = prev.find(i => i.produit.id === p.id);
      if (ex) return prev.map(i => i.produit.id === p.id ? { ...i, quantite: i.quantite + 1 } : i);
      return [...prev, { produit: p, quantite: 1 }];
    });
    setProdSearch('');
    setProdResults([]);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.produit.id === id ? { ...i, quantite: Math.max(1, i.quantite + delta) } : i));
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.produit.id !== id));

  const sousTotal = cart.reduce((s, i) => s + i.produit.prix * i.quantite, 0);
  const remise = selectedClient ? (sousTotal * (selectedClient.remiseFidelite / 100)) : 0;
  const total = sousTotal - remise;
  const monnaie = modePaiement === 'CASH' && montantRecu ? Math.max(0, parseFloat(montantRecu) - total) : 0;

  const mutation = useMutation({
    mutationFn: () => api.post('/ventes', {
      clientId: selectedClient?.id,
      lignes: cart.map(i => ({ produitId: i.produit.id, quantite: i.quantite, prixUnitaire: i.produit.prix })),
      modePaiement,
      montantRecu: modePaiement === 'CASH' ? parseFloat(montantRecu) || total : total,
    }),
    onSuccess: (res) => {
      setLastVenteId(res.data.id);
      setShowSuccessModal(true);
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur lors de la vente.'),
  });

  const handleNewSale = () => {
    setCart([]); setSelectedClient(null); setClientSearch('');
    setMontantRecu(''); setShowSuccessModal(false);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Left: products */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden border-r">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><ShoppingCart size={18} className="text-blue-500" /> Point de vente</h2>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={prodSearch}
            onChange={e => setProdSearch(e.target.value)}
            placeholder="Rechercher un produit (nom, SKU)..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {prodLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />}
        </div>

        {prodResults.length > 0 && (
          <div className="mb-4 border rounded-xl overflow-hidden shadow-sm">
            {prodResults.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="w-full flex items-center justify-between p-3 hover:bg-blue-50 border-b last:border-0 transition-colors text-left"
              >
                <div>
                  <p className="font-semibold text-gray-800">{p.nom}</p>
                  <p className="text-xs text-gray-400 font-mono">{p.sku} · Stock: {p.stock}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-700">{formatCDF(p.prix)}</p>
                  <Plus size={14} className="text-gray-400 ml-auto" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <ShoppingCart size={48} />
              <p className="mt-3 text-sm">Panier vide — Recherchez un produit</p>
            </div>
          ) : cart.map(item => (
            <div key={item.produit.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.produit.nom}</p>
                <p className="text-xs text-gray-400">{formatCDF(item.produit.prix)} / unité</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.produit.id, -1)} className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"><Minus size={12} /></button>
                <span className="w-8 text-center font-bold text-sm">{item.quantite}</span>
                <button onClick={() => updateQty(item.produit.id, 1)} className="w-7 h-7 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600"><Plus size={12} /></button>
              </div>
              <p className="w-24 text-right font-bold text-gray-900 text-sm">{formatCDF(item.produit.prix * item.quantite)}</p>
              <button onClick={() => removeItem(item.produit.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: summary */}
      <div className="w-96 flex flex-col p-4 bg-gray-50 overflow-y-auto">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><User size={16} />Client</h3>
          {selectedClient ? (
            <div className="bg-white border rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{selectedClient.prenom} {selectedClient.nom}</p>
                <p className="text-xs text-gray-500">{selectedClient.telephone} · {selectedClient.niveau}</p>
                <p className="text-xs text-purple-600">Remise: {selectedClient.remiseFidelite}%</p>
              </div>
              <button onClick={() => { setSelectedClient(null); setClientSearch(''); }} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
            </div>
          ) : (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                placeholder="Rechercher client..."
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {clientLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />}
              {clientResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg z-10 overflow-hidden mt-1">
                  {clientResults.map(c => (
                    <button key={c.id} onClick={() => { setSelectedClient(c); setClientSearch(''); setClientResults([]); }}
                      className="w-full p-2 text-left hover:bg-blue-50 border-b last:border-0">
                      <p className="font-medium text-sm text-gray-800">{c.prenom} {c.nom}</p>
                      <p className="text-xs text-gray-400">{c.telephone}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Sous-total</span><span>{formatCDF(sousTotal)}</span>
          </div>
          {remise > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Remise fidélité ({selectedClient?.remiseFidelite}%)</span>
              <span>-{formatCDF(remise)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-lg text-gray-900 border-t pt-2">
            <span>TOTAL</span><span>{formatCDF(total)}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-semibold text-gray-700 mb-2 text-sm">Mode de paiement</p>
          <div className="grid grid-cols-3 gap-2">
            {(['CASH', 'MPESA', 'AIRTEL_MONEY'] as const).map(m => (
              <button key={m} onClick={() => setModePaiement(m)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                  modePaiement === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {m === 'CASH' ? 'Cash' : m === 'MPESA' ? 'M-Pesa' : 'Airtel'}
              </button>
            ))}
          </div>
        </div>

        {modePaiement === 'CASH' && (
          <div className="mb-4">
            <label className="form-label text-xs">Montant reçu (CDF)</label>
            <input type="number" value={montantRecu} onChange={e => setMontantRecu(e.target.value)}
              placeholder={String(total)} min={total}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {montantRecu && parseFloat(montantRecu) >= total && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2 flex justify-between text-sm">
                <span className="text-green-700 font-medium">Monnaie à rendre:</span>
                <span className="font-black text-green-700">{formatCDF(monnaie)}</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => mutation.mutate()}
          disabled={cart.length === 0 || mutation.isLoading || (modePaiement === 'CASH' && montantRecu !== '' && parseFloat(montantRecu) < total)}
          className="btn-primary w-full py-3 font-bold text-base flex items-center justify-center gap-2 mt-auto"
        >
          {mutation.isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={20} />}
          VALIDER LA VENTE — {formatCDF(total)}
        </button>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-green-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Vente enregistrée !</h3>
            <p className="text-gray-500 text-sm mb-6">La transaction a été enregistrée avec succès.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate(`/sales/${lastVenteId}/receipt`)} className="btn-primary flex-1">Imprimer reçu</button>
              <button onClick={handleNewSale} className="btn-secondary flex-1">Nouvelle vente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
