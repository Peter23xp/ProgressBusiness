import { api } from './api';
import type { StatutStock, TypeMouvement } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StockInventoryItem {
  produitId: string;
  sku: string;
  produitNom: string;
  categorie: string;
  prixVente: number;
  siteId: string;
  siteNom: string;
  quantite: number;
  seuilAlerte: number;
  statut: StatutStock;
  updatedAt: string;
}

export interface StockInventoryResponse {
  stocks: StockInventoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalAlertes: number;
    totalRuptures: number;
  };
}

export interface StockSiteRow {
  siteId: string;
  siteNom: string;
  quantite: number;
  seuilAlerte: number;
  statut: StatutStock;
  updatedAt: string;
}

export interface StockProductDetailResponse {
  produit: {
    id: string;
    sku: string;
    nom: string;
    description?: string;
    categorie: string;
    prixVente: number;
    prixAchat: number;
  };
  stocksBySite: StockSiteRow[];
  totalStock: number;
}

export interface MouvementStockDetail {
  id: string;
  type: TypeMouvement;
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  reference?: string;
  agentNom: string;
  siteNom: string;
  siteId: string;
  createdAt: string;
}

export interface MovementListResponse {
  mouvements: MouvementStockDetail[];
  meta: { total: number; page: number; totalPages: number };
}

export interface StockEntryDto {
  siteId: string;
  produitId: string;
  quantite: number;
  referenceFournisseur?: string;
  dateReception: string;
  notes?: string;
}

export interface StockEntryResponse {
  mouvement: MouvementStockDetail;
  stockApres: number;
  statut: StatutStock;
}

export interface StockTransferDto {
  siteSourceId: string;
  siteDestinationId: string;
  produitId: string;
  quantite: number;
  motif?: string;
}

export interface TransfertDetail {
  id: string;
  produitId: string;
  produitNom: string;
  sku: string;
  siteSourceId: string;
  siteSourceNom: string;
  siteDestinationId: string;
  siteDestinationNom: string;
  quantiteEnvoyee: number;
  quantiteRecue?: number;
  motif?: string;
  statut: 'EN_TRANSIT' | 'RECU' | 'ANNULE';
  initiePar: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransferResponse {
  transfert: TransfertDetail;
  stockSourceApres: number;
  statut: 'EN_TRANSIT';
}

export interface ReceiveTransferDto {
  quantiteRecue: number;
  observations?: string;
}

export interface ReceiveTransferResponse {
  transfert: TransfertDetail;
  stockDestinationApres: number;
  statut: StatutStock;
  ecart: number | null;
}

export interface StockAlertItem {
  produitId: string;
  produitNom: string;
  sku: string;
  siteId: string;
  siteNom: string;
  stockActuel: number;
  seuilAlerte: number;
  type: 'ALERTE' | 'RUPTURE';
  depuis: string;
  isOrdering: boolean;
}

export interface AlertListResponse {
  alertes: StockAlertItem[];
  summary: { totalRuptures: number; totalAlertes: number };
}

export interface PhysicalInventoryProduct {
  produitId: string;
  sku: string;
  nom: string;
  categorie: string;
  stockSysteme: number;
}

export interface PhysicalInventoryLine {
  produitId: string;
  quantiteComptee: number;
}

export interface PhysicalInventoryDto {
  siteId: string;
  dateInventaire: string;
  lignes: PhysicalInventoryLine[];
}

export interface InventoryAdjustment {
  produitId: string;
  produitNom: string;
  sku: string;
  avant: number;
  apres: number;
  ecart: number;
}

export interface PhysicalInventoryResponse {
  ajustements: InventoryAdjustment[];
  totalAjustements: number;
  totalSurplus: number;
  totalPertes: number;
  nonComptes: number;
}

export interface ProduitSearchResult {
  id: string;
  sku: string;
  nom: string;
  categorie: string;
  prixVente: number;
  stockDisponible: number;
  statut: StatutStock;
}

// ── Helper ────────────────────────────────────────────────────────────────────

export function getStockStatut(quantite: number, seuilAlerte: number): StatutStock {
  if (quantite === 0) return 'RUPTURE';
  if (quantite <= seuilAlerte) return 'ALERTE';
  return 'OK';
}

// ── API client ────────────────────────────────────────────────────────────────

export const stocksApi = {
  getInventory: (params: {
    siteId?: string;
    search?: string;
    categorie?: string;
    statut?: StatutStock | '';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get<StockInventoryResponse>('/stocks', { params }).then(r => r.data),

  getProductDetail: (produitId: string) =>
    api.get<StockProductDetailResponse>(`/produits/${produitId}/stocks`).then(r => r.data),

  updateSeuil: (siteId: string, produitId: string, seuilAlerte: number) =>
    api.patch<{ stockSite: StockSiteRow }>(`/stocks/${siteId}/${produitId}/seuil`, { seuilAlerte }).then(r => r.data),

  getMovements: (produitId: string, params: {
    type?: TypeMouvement | '';
    siteId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => api.get<MovementListResponse>(`/stocks/${produitId}/movements`, { params }).then(r => r.data),

  createEntry: (body: StockEntryDto) =>
    api.post<StockEntryResponse>('/stocks/entree', body).then(r => r.data),

  createTransfer: (body: StockTransferDto) =>
    api.post<StockTransferResponse>('/stocks/transfert', body).then(r => r.data),

  getTransferById: (transfertId: string) =>
    api.get<TransfertDetail>(`/stocks/transfert/${transfertId}`).then(r => r.data),

  receiveTransfer: (transfertId: string, body: ReceiveTransferDto) =>
    api.patch<ReceiveTransferResponse>(`/stocks/transfert/${transfertId}/recevoir`, body).then(r => r.data),

  reportTransfer: (transfertId: string, body: { raison: string; details?: string }) =>
    api.post<{ success: true }>(`/stocks/transfert/${transfertId}/report`, body).then(r => r.data),

  getAlerts: (params: { siteId?: string; type?: 'ALERTE' | 'RUPTURE' | '' }) =>
    api.get<AlertListResponse>('/stocks/alertes', { params }).then(r => r.data),

  markOrdering: (siteId: string, produitId: string) =>
    api.patch<{ success: boolean; expiresAt: string }>(`/stocks/alertes/${siteId}/${produitId}/ordering`).then(r => r.data),

  getPhysicalInventoryProducts: (siteId: string) =>
    api.get<{ produits: PhysicalInventoryProduct[]; total: number }>('/stocks/inventaire/produits', { params: { siteId } }).then(r => r.data),

  submitPhysicalInventory: (body: PhysicalInventoryDto) =>
    api.post<PhysicalInventoryResponse>('/stocks/inventaire', body).then(r => r.data),

  searchProducts: (q: string, siteId: string) =>
    api.get<{ produits: ProduitSearchResult[] }>('/produits/search', { params: { q, siteId, limit: 8 } }).then(r => r.data),
};
