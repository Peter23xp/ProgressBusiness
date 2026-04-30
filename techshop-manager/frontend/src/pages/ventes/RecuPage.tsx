import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, MessageSquare, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '@/lib/api';
import { formatCDF, formatDateTime } from '@/lib/utils';

interface VenteLigne { produitNom: string; quantite: number; prixUnitaire: number; sousTotal: number }
interface VenteRecu {
  id: string; numero: string; createdAt: string;
  site: { nom: string; adresse: string; telephone?: string };
  client?: { prenom: string; nom: string; telephone: string; codeParrain: string };
  agent: { prenom: string; nom: string };
  lignes: VenteLigne[];
  sousTotal: number; remiseMontant: number; remiseFidelite: number; montantTotal: number;
  modePaiement: string; montantRecu?: number; monnaieRendue?: number; pointsGagnes?: number;
}

export default function RecuPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vente, isLoading } = useQuery<VenteRecu>({
    queryKey: ['vente-recu', id],
    queryFn: () => api.get(`/ventes/${id}`).then(r => r.data),
  });

  const smsMutation = useMutation({
    mutationFn: () => api.post(`/ventes/${id}/sms-recu`),
    onSuccess: () => toast.success('Reçu envoyé par SMS.'),
    onError: (error) => toast.error(getErrorMessage(error) || 'Erreur d\'envoi SMS.'),
  });

  if (isLoading) {
    return <div className="p-6 text-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  if (!vente) return <div className="p-6 text-center text-gray-400">Reçu introuvable.</div>;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-container { max-width: 80mm; margin: 0 auto; padding: 0; font-size: 11px; }
          .print-container * { color: black !important; background: white !important; }
        }
      `}</style>

      <div className="p-4 no-print flex items-center gap-3 border-b bg-white">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2"><ArrowLeft size={18} /></button>
        <h1 className="font-bold text-gray-900 flex-1">Reçu de vente</h1>
        <button onClick={() => smsMutation.mutate()} disabled={!vente.client || smsMutation.isLoading}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50">
          {smsMutation.isLoading ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <MessageSquare size={16} />}
          Envoyer SMS
        </button>
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
          <Printer size={16} /> Imprimer
        </button>
      </div>

      <div className="flex justify-center p-6 bg-gray-100 min-h-screen">
        <div className="print-container bg-white shadow-lg rounded-lg p-5 w-80 font-mono text-xs">
          <div className="text-center mb-4 border-b pb-3">
            <h2 className="text-base font-black text-gray-900 tracking-tight">TECHSHOP MANAGER</h2>
            <p className="text-gray-600">{vente.site?.nom}</p>
            <p className="text-gray-500">{vente.site?.adresse}</p>
            {vente.site?.telephone && <p className="text-gray-500">{vente.site.telephone}</p>}
          </div>

          <div className="mb-3 border-b pb-3">
            <div className="flex justify-between">
              <span className="text-gray-500">N° Reçu:</span>
              <span className="font-bold">{vente.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span>{formatDateTime(vente.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Agent:</span>
              <span>{vente.agent?.prenom} {vente.agent?.nom}</span>
            </div>
          </div>

          {vente.client && (
            <div className="mb-3 border-b pb-3">
              <p className="font-bold text-gray-700 mb-1">CLIENT</p>
              <div className="flex justify-between"><span className="text-gray-500">Nom:</span><span>{vente.client.prenom} {vente.client.nom}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tél:</span><span>{vente.client.telephone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Code:</span><span>{vente.client.codeParrain}</span></div>
            </div>
          )}

          <div className="mb-3 border-b pb-3">
            <p className="font-bold text-gray-700 mb-1">ARTICLES</p>
            <div className="space-y-1.5">
              {vente.lignes.map((l, i) => (
                <div key={i}>
                  <div className="flex justify-between">
                    <span className="flex-1 pr-2 leading-tight">{l.produitNom}</span>
                    <span className="font-bold">{formatCDF(l.sousTotal)}</span>
                  </div>
                  <div className="text-gray-400 text-right">{l.quantite} x {formatCDF(l.prixUnitaire)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3 border-b pb-3 space-y-1">
            <div className="flex justify-between text-gray-600"><span>Sous-total:</span><span>{formatCDF(vente.sousTotal)}</span></div>
            {vente.remiseMontant > 0 && (
              <div className="flex justify-between text-gray-600"><span>Remise ({vente.remiseFidelite}%):</span><span>-{formatCDF(vente.remiseMontant)}</span></div>
            )}
            <div className="flex justify-between font-black text-sm border-t pt-1">
              <span>TOTAL:</span><span>{formatCDF(vente.montantTotal)}</span>
            </div>
          </div>

          <div className="mb-3 border-b pb-3 space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Mode:</span><span className="font-semibold">{vente.modePaiement}</span></div>
            {vente.montantRecu && <div className="flex justify-between"><span className="text-gray-500">Reçu:</span><span>{formatCDF(vente.montantRecu)}</span></div>}
            {vente.monnaieRendue !== undefined && vente.monnaieRendue > 0 && (
              <div className="flex justify-between"><span className="text-gray-500">Monnaie:</span><span>{formatCDF(vente.monnaieRendue)}</span></div>
            )}
          </div>

          {vente.pointsGagnes && vente.pointsGagnes > 0 && (
            <div className="mb-3 border-b pb-3">
              <div className="flex justify-between text-purple-700 font-semibold">
                <span>Points gagnés:</span><span>+{vente.pointsGagnes} pts</span>
              </div>
            </div>
          )}

          <div className="text-center text-gray-500 space-y-1 mt-3">
            <p className="font-semibold">Merci pour votre achat !</p>
            <p>TechShop Manager — Goma, RDC</p>
          </div>
        </div>
      </div>
    </>
  );
}
