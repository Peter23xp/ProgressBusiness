import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, RotateCcw, User, MapPin, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCDF, formatDateTime } from '@/lib/utils';

interface VenteLigne { id: string; produitNom: string; sku: string; quantite: number; prixUnitaire: number; remise: number; sousTotal: number }
interface VenteDetail {
  id: string; numero: string; statut: string; createdAt: string;
  agent: { prenom: string; nom: string };
  site: { nom: string; ville: string };
  client?: { id: string; prenom: string; nom: string; telephone: string; niveau: string };
  lignes: VenteLigne[];
  sousTotal: number; remiseFidelite: number; remiseMontant: number; montantTotal: number;
  modePaiement: string; montantRecu?: number; monnaieRendue?: number;
  pointsGagnes?: number;
}

export default function VenteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vente, isLoading } = useQuery<VenteDetail>({
    queryKey: ['vente', id],
    queryFn: () => api.get(`/ventes/${id}`).then(r => r.data),
  });

  const isReturnable = vente ? (new Date().getTime() - new Date(vente.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="card space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded" />)}</div>
      </div>
    );
  }

  if (!vente) return <div className="p-6 text-center text-gray-400">Vente introuvable.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary p-2"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{vente.numero}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${vente.statut === 'COMPLETE' ? 'badge-success' : vente.statut === 'ANNULE' ? 'badge-danger' : 'badge-warning'}`}>{vente.statut}</span>
              <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={13} />{formatDateTime(vente.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/sales/${id}/receipt`} className="btn-secondary flex items-center gap-2"><Printer size={16} /> Imprimer</Link>
          {isReturnable && vente.statut === 'COMPLETE' && (
            <Link to={`/sales/${id}/retour`} className="btn-danger flex items-center gap-2"><RotateCcw size={16} /> Retour</Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Agent</p>
          <p className="font-semibold text-gray-900">{vente.agent?.prenom} {vente.agent?.nom}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 font-semibold uppercase mb-2 flex items-center gap-1"><MapPin size={12} />Site</p>
          <p className="font-semibold text-gray-900">{vente.site?.nom}</p>
          <p className="text-sm text-gray-500">{vente.site?.ville}</p>
        </div>
        {vente.client && (
          <div className="card">
            <p className="text-xs text-gray-400 font-semibold uppercase mb-2 flex items-center gap-1"><User size={12} />Client</p>
            <Link to={`/clients/${vente.client.id}`} className="font-semibold text-blue-600 hover:underline">
              {vente.client.prenom} {vente.client.nom}
            </Link>
            <p className="text-sm text-gray-500">{vente.client.telephone}</p>
            <span className="badge badge-gray text-xs">{vente.client.niveau}</span>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Articles vendus</h2>
        <div className="table-container">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b text-xs uppercase">
                <th className="pb-3 font-semibold">Produit</th>
                <th className="pb-3 font-semibold">SKU</th>
                <th className="pb-3 font-semibold text-right">Prix unit.</th>
                <th className="pb-3 font-semibold text-center">Qté</th>
                <th className="pb-3 font-semibold text-right">Remise</th>
                <th className="pb-3 font-semibold text-right">Sous-total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vente.lignes.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{l.produitNom}</td>
                  <td className="py-3 font-mono text-gray-500 text-xs">{l.sku}</td>
                  <td className="py-3 text-right text-gray-700">{formatCDF(l.prixUnitaire)}</td>
                  <td className="py-3 text-center font-semibold">{l.quantite}</td>
                  <td className="py-3 text-right text-green-600">{l.remise > 0 ? `-${l.remise}%` : '—'}</td>
                  <td className="py-3 text-right font-bold text-gray-900">{formatCDF(l.sousTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Récapitulatif</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Sous-total</span><span>{formatCDF(vente.sousTotal)}</span></div>
            {vente.remiseMontant > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Remise fidélité ({vente.remiseFidelite}%)</span>
                <span>-{formatCDF(vente.remiseMontant)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-lg text-gray-900 border-t pt-2 mt-2">
              <span>TOTAL</span><span>{formatCDF(vente.montantTotal)}</span>
            </div>
            {vente.pointsGagnes && vente.pointsGagnes > 0 && (
              <div className="flex justify-between text-purple-600 text-xs">
                <span>Points fidélité gagnés</span><span>+{vente.pointsGagnes} pts</span>
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Paiement</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Mode</span><span className="badge badge-info">{vente.modePaiement}</span></div>
            {vente.montantRecu && (
              <div className="flex justify-between"><span className="text-gray-600">Reçu</span><span className="font-semibold">{formatCDF(vente.montantRecu)}</span></div>
            )}
            {vente.monnaieRendue !== undefined && vente.monnaieRendue > 0 && (
              <div className="flex justify-between"><span className="text-gray-600">Monnaie rendue</span><span className="font-semibold text-blue-600">{formatCDF(vente.monnaieRendue)}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
