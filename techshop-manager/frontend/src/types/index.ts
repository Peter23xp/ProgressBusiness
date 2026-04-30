// ============================================
// ENUMS
// ============================================

export type Role = 'SUPER_ADMIN' | 'DIRECTEUR_REGIONAL' | 'GERANT' | 'AGENT' | 'FORMATEUR' | 'CLIENT';

export type StatutClient = 'EN_COURS' | 'ACTIF' | 'SUSPENDU' | 'ARCHIVE';

export type NiveauFidelite = 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE';

export type EtapeOnboarding = 'RECIT' | 'FORMATION' | 'FICHE' | 'ACTIVATION';

export type StatutEtape = 'EN_ATTENTE' | 'EN_COURS' | 'COMPLETE';

export type ModePaiement = 'CASH' | 'MPESA' | 'AIRTEL_MONEY' | 'VIREMENT';

export type StatutVente = 'VALIDE' | 'RETOURNEE_PARTIELLE' | 'RETOURNEE' | 'ANNULEE';

export type TypeMouvement = 'ENTREE' | 'SORTIE_VENTE' | 'TRANSFERT_DEPART' | 'TRANSFERT_ARRIVEE' | 'AJUSTEMENT_INVENTAIRE';

export type StatutTransfert = 'EN_TRANSIT' | 'RECU' | 'ANNULE';

export type StatutParrainage = 'EN_ATTENTE' | 'VALIDE' | 'RECOMPENSE_VERSEE';

export type TypeRecompense = 'POINTS' | 'REMISE_PROCHAINE_VENTE' | 'COMMISSION_CDF';

export type StatutStock = 'OK' | 'ALERTE' | 'RUPTURE';

// ============================================
// AUTH
// ============================================

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
  nom?: string;
  prenom?: string;
  siteId?: string | null;
  siteName?: string | null;
  site?: { id: string; nom: string } | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ============================================
// SITE
// ============================================

export interface Site {
  id: string;
  nom: string;
  ville: string;
  adresse?: string;
  actif: boolean;
  createdAt: string;
}

// ============================================
// UTILISATEUR
// ============================================

export interface Utilisateur {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  role: Role;
  actif: boolean;
  langue: string;
  siteId?: string;
  site?: Pick<Site, 'id' | 'nom'>;
  derniereConnexion?: string;
}

// ============================================
// CLIENT
// ============================================

export interface Client {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  matriculeExterne?: string;
  codeParrain?: string;
  statut: StatutClient;
  pointsFidelite: number;
  pointsCumules: number;
  niveauFidelite: NiveauFidelite;
  notes?: string;
  dateInscription: string;
  dateActivation?: string;
  siteInscriptionId: string;
  siteInscription?: Pick<Site, 'id' | 'nom'>;
  parrainId?: string;
}

export interface OnboardingEtape {
  id: string;
  etape: EtapeOnboarding;
  statut: StatutEtape;
  completeeAt?: string;
  montant?: number;
  modePaiement?: ModePaiement;
  referenceTransaction?: string;
  notes?: string;
  agent?: Pick<Utilisateur, 'id' | 'nom'>;
  site?: Pick<Site, 'id' | 'nom'>;
}

// ============================================
// PRODUIT / STOCK
// ============================================

export interface Produit {
  id: string;
  sku: string;
  nom: string;
  description?: string;
  categorie: string;
  prixVente: number;
  prixAchat: number;
  actif: boolean;
}

export interface StockSite {
  siteId: string;
  siteNom: string;
  quantite: number;
  seuilAlerte: number;
  statut: StatutStock;
  updatedAt: string;
}

export interface StockItem {
  produit: Produit;
  siteId: string;
  quantite: number;
  seuilAlerte: number;
  statut: StatutStock;
}

export interface MouvementStock {
  id: string;
  type: TypeMouvement;
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  reference?: string;
  createdAt: string;
  produit?: Pick<Produit, 'id' | 'nom' | 'sku'>;
  site?: Pick<Site, 'id' | 'nom'>;
  agent?: Pick<Utilisateur, 'id' | 'nom'>;
}

export interface TransfertStock {
  id: string;
  quantiteEnvoyee: number;
  quantiteRecue?: number;
  motif?: string;
  statut: StatutTransfert;
  dateExpedition: string;
  dateReception?: string;
  produit?: Pick<Produit, 'id' | 'nom' | 'sku'>;
  siteSource?: Pick<Site, 'id' | 'nom'>;
  siteDestination?: Pick<Site, 'id' | 'nom'>;
}

// ============================================
// VENTE
// ============================================

export interface LigneVente {
  id: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  produit: Pick<Produit, 'id' | 'nom' | 'sku'>;
}

export interface Vente {
  id: string;
  numeroVente: string;
  statut: StatutVente;
  montantBrut: number;
  remiseFidelite: number;
  remiseParrainage: number;
  montantNet: number;
  modePaiement: ModePaiement;
  referenceTransaction?: string;
  montantRecu?: number;
  monnaieRendue?: number;
  pointsAttribues: number;
  createdAt: string;
  client?: Pick<Client, 'id' | 'nom' | 'prenom' | 'telephone' | 'niveauFidelite'>;
  site?: Pick<Site, 'id' | 'nom'>;
  agent?: Pick<Utilisateur, 'id' | 'nom'>;
  lignes?: LigneVente[];
}

// ============================================
// PARRAINAGE
// ============================================

export interface Parrainage {
  id: string;
  niveau: number;
  statut: StatutParrainage;
  recompenseType?: TypeRecompense;
  recompenseValeur?: number;
  recompenseVerseAt?: string;
  dateCreation: string;
  parrain?: Pick<Client, 'id' | 'nom' | 'prenom' | 'codeParrain'>;
  filleul?: Pick<Client, 'id' | 'nom' | 'prenom' | 'statut'>;
}

// ============================================
// FIDELITE
// ============================================

export interface MouvementPoints {
  id: string;
  type: string;
  delta: number;
  soldeApres: number;
  description?: string;
  createdAt: string;
}

// ============================================
// PAGINATION
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
}
