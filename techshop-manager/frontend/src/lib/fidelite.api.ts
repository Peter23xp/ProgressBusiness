import { api } from './api';
import type { NiveauFidelite } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TypeMouvementPoints =
  | 'ACHAT' | 'PARRAINAGE' | 'AVOIR_RETOUR' | 'RETOUR' | 'EXPIRATION' | 'AJUSTEMENT_ADMIN';

export interface MouvementPoints {
  id: string;
  clientId: string;
  clientNom: string;
  clientPrenom: string;
  type: TypeMouvementPoints;
  description: string;
  deltaPoints: number;
  soldeBefore: number;
  soldeAfter: number;
  createdAt: string;
  siteId: string;
  venteId?: string;
  parrainageId?: string;
}

export interface NiveauConfig {
  niveau: NiveauFidelite;
  seuilMin: number;
  seuilMax: number | null;
  remisePct: number;
  couleurHex: string;
  avantages: string[];
}

export interface FideliteConfig {
  id: string;
  ratioPtsCDF: number;
  niveaux: NiveauConfig[];
  dureeValiditeMois: number;
  periodeInactiviteMois: number;
  cumulRemises: boolean;
  updatedAt: string;
  updatedBy?: { id: string; nom: string; prenom: string };
}

export interface FideliteStats {
  pointsDistribues: number;
  pointsDistribuesDelta: number;
  remisesAccordees: number;
  remisesAccordeesDelta: number;
  clientsActifsTotal: number;
  clientsActifsDelta: number;
  repartitionNiveaux: { niveau: NiveauFidelite; count: number; pct: number }[];
}

export interface TopClientFidele {
  rang: number;
  client: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    niveauFidelite: NiveauFidelite;
  };
  pointsActuels: number;
  pointsGagnesCettePeriode: number;
  nbAchats: number;
  montantTotalAchats: number;
}

export interface ClientFideliteData {
  client: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    siteNom: string;
    niveauFidelite: NiveauFidelite;
    pointsFidelite: number;
    remisePct: number;
    totalPointsGagnes: number;
    totalPointsDeduits: number;
  };
}

export interface MouvementsResponse {
  mouvements: MouvementPoints[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  summary: { totalGagne: number; totalDeduit: number };
}

export interface ConfigHistoryEntry {
  id: string;
  changedAt: string;
  changedBy: { id: string; nom: string; prenom: string };
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export interface FideliteFilters {
  siteId?: string;
  period?: 'today' | 'week' | 'month' | 'all';
}

export interface PointsFilters {
  type?: TypeMouvementPoints | '';
  dateDebut?: string;
  dateFin?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const NIVEAU_COLORS: Record<NiveauFidelite, string> = {
  BRONZE: '#92400E',
  ARGENT: '#6B7280',
  OR: '#B45309',
  PLATINE: '#6D28D9',
};

export const NIVEAU_LABELS: Record<NiveauFidelite, string> = {
  BRONZE: 'Bronze',
  ARGENT: 'Argent',
  OR: 'Or',
  PLATINE: 'Platine',
};

export const DEFAULT_NIVEAUX: NiveauConfig[] = [
  { niveau: 'BRONZE', seuilMin: 0, seuilMax: 499, remisePct: 0, couleurHex: '#92400E', avantages: [] },
  { niveau: 'ARGENT', seuilMin: 500, seuilMax: 1999, remisePct: 3, couleurHex: '#6B7280', avantages: [] },
  { niveau: 'OR', seuilMin: 2000, seuilMax: 4999, remisePct: 5, couleurHex: '#B45309', avantages: [] },
  { niveau: 'PLATINE', seuilMin: 5000, seuilMax: null, remisePct: 8, couleurHex: '#6D28D9', avantages: [] },
];

// ── API client ────────────────────────────────────────────────────────────────

export const fideliteApi = {
  getStats: (filters: FideliteFilters) =>
    api.get<{ stats: FideliteStats }>('/fidelite/stats', { params: filters }).then(r => r.data),

  getTopClients: (params: FideliteFilters & { limit?: number }) =>
    api.get<{ clients: TopClientFidele[] }>('/fidelite/top-clients', { params }).then(r => r.data),

  getRecentMouvements: (params: FideliteFilters & { limit?: number }) =>
    api.get<{ mouvements: MouvementPoints[] }>('/fidelite/mouvements', { params }).then(r => r.data),

  getClientData: (clientId: string) =>
    api.get<ClientFideliteData>(`/fidelite/client/${clientId}`).then(r => r.data),

  getClientMouvements: (clientId: string, filters: PointsFilters) =>
    api.get<MouvementsResponse>(`/fidelite/client/${clientId}/mouvements`, { params: filters }).then(r => r.data),

  getConfig: () =>
    api.get<{ config: FideliteConfig; history: ConfigHistoryEntry[] }>('/fidelite/config').then(r => r.data),

  getConfigHistory: () =>
    api.get<{ history: ConfigHistoryEntry[] }>('/fidelite/config/history').then(r => r.data),

  updateConfig: (body: Partial<FideliteConfig>) =>
    api.put<{ config: FideliteConfig; clientsRecomputes: number; modifiedFields: string[] }>('/fidelite/config', body).then(r => r.data),
};
