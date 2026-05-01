import { api } from './api';
import type { StatutParrainage, TypeRecompense } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ParrainageKpis {
  totalActifs: number;
  totalActifsDelta: number;
  recompensesVersees: number;
  meilleurParrain: {
    id: string;
    nom: string;
    prenom: string;
    nbFilleuls: number;
  } | null;
}

export interface ParrainageItem {
  id: string;
  parrain: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    codeParrain: string;
  };
  filleul: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    statut: string;
    dateActivation?: string;
  };
  niveau: 1 | 2;
  statut: StatutParrainage;
  recompenseType?: TypeRecompense;
  recompenseValeur?: number;
  recompenseVerseAt?: string;
  dateCreation: string;
  siteId: string;
}

export interface ParrainageListResponse {
  parrainages: ParrainageItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface TopParrain {
  rang: number;
  client: { id: string; nom: string; prenom: string; telephone: string };
  nbFilleulsActifs: number;
  nbFilleulsTotal: number;
  recompensesTotales: number;
  caGenere: number;
}

export interface ParrainageFilters {
  siteId?: string;
  period?: 'today' | 'week' | 'month' | 'all';
  statut?: StatutParrainage | '';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'dateCreation' | 'statut';
  sortOrder?: 'asc' | 'desc';
}

export interface TreeNode {
  clientId: string;
  nom: string;
  prenom: string;
  codeParrain: string;
  statut: 'EN_COURS' | 'ACTIF' | 'SUSPENDU';
  niveau: 0 | 1 | 2;
  filleuls: TreeNode[];
}

export interface FilleulFlat {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  niveau: 1 | 2;
  statut: string;
  dateActivation?: string;
  pointsGeneresPourParrain: number;
}

export interface ParrainageTreeResponse {
  arbre: TreeNode;
  stats: {
    nbFilleulsTotal: number;
    nbFilleulsActifs: number;
    gainsTotaux: number;
    typeRecompense: TypeRecompense;
  };
  parrainParent?: {
    id: string;
    nom: string;
    prenom: string;
    codeParrain: string;
    recompenseRecue: number;
  };
  filleuls: FilleulFlat[];
}

export interface ParrainageConfig {
  typeRecompense: TypeRecompense;
  valeurNiveau1: number;
  multiNiveaux: boolean;
  valeurNiveau2?: number;
  conditionDeclenchement: 'ACTIVATION' | 'PREMIER_ACHAT';
  plafondMensuel: number;
  actif: boolean;
}

export interface ConfigHistoryEntry {
  id: string;
  changedAt: string;
  changedBy: { id: string; nom: string; prenom: string };
  fieldName: string;
  oldValue: string;
  newValue: string;
}

// ── API client ────────────────────────────────────────────────────────────────

export const parrainageApi = {
  getStats: (filters: Pick<ParrainageFilters, 'siteId' | 'period'>) =>
    api.get<{ kpis: ParrainageKpis }>('/parrainage/stats', { params: filters }).then(r => r.data),

  list: (filters: ParrainageFilters) =>
    api.get<ParrainageListResponse>('/parrainage', { params: filters }).then(r => r.data),

  getTop: (filters: Pick<ParrainageFilters, 'siteId' | 'period'> & { limit?: number }) =>
    api.get<{ topParrains: TopParrain[] }>('/parrainage/top', { params: filters }).then(r => r.data),

  getTree: (clientId: string) =>
    api.get<ParrainageTreeResponse>(`/parrainage/tree/${clientId}`, { params: { niveaux: 2 } }).then(r => r.data),

  getConfig: () =>
    api.get<{ config: ParrainageConfig; history: ConfigHistoryEntry[] }>('/parrainage/config').then(r => r.data),

  updateConfig: (body: Omit<ParrainageConfig, 'actif'>) =>
    api.put<{ config: ParrainageConfig; modifiedFields: string[]; affectedParrainages: number }>('/parrainage/config', body).then(r => r.data),
};
