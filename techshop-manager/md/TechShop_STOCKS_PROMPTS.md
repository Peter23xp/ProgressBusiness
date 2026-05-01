# 🛒 TECHSHOP MANAGER — PROMPTS DE DÉVELOPPEMENT
## Module STOCKS | Écrans SCR-017 · SCR-018 · SCR-019 · SCR-020 · SCR-021 · SCR-022 · SCR-023

> **MODE D'EMPLOI :**
> Ce fichier contient **7 prompts indépendants**, un par écran du module Stocks.
> Exécute-les **dans l'ordre numéroté**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Les modules AUTH, DASHBOARD et CLIENTS doivent être **entièrement terminés** avant de commencer —
> AppLayout, useAuth, api.ts, ProtectedRoute, formatCDF et Pagination sont des prérequis directs.

---

## CONTEXTE GLOBAL (rappel rapide pour chaque prompt)

```
Projet      : TechShop Manager — Système de Gestion Commercial Multi-Sites
Stack       : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State       : Zustand (auth + UI) + TanStack Query v5 (serveur)
Offline     : Dexie.js (IndexedDB) + Service Worker (Workbox)
Backend     : Node.js + NestJS + Prisma ORM + PostgreSQL 15 + Redis 7
Tests       : Vitest + Testing Library (front) | Jest + Supertest (back)
Palette     : Bleu foncé #1E3A5F (primary) | Bleu accent #2E86C1 | Blanc #FFFFFF
              Vert #1A6B3A (succès/actif) | Orange #E65100 (alerte) | Rouge #B71C1C (danger)
Monorepo    : apps/client + apps/server + packages/shared
Devise      : Franc Congolais (CDF) — format : 1 200 000 CDF
Sites       : Goma (siège), Bukavu, Kinshasa
```

---

## RÉCAPITULATIF DES 7 PROMPTS — MODULE STOCKS

| N° | Écran   | Route                          | Fichier principal                                    | Rôle min | Priorité | Durée est. |
|----|---------|--------------------------------|------------------------------------------------------|----------|----------|------------|
| 1  | SCR-017 | /stocks                        | pages/stocks/StocksInventoryPage.tsx                 | Agent    | **P0**   | ~2-3h      |
| 2  | SCR-018 | /stocks/:produitId             | pages/stocks/StockProductDetailPage.tsx              | Gérant   | **P0**   | ~2h        |
| 3  | SCR-019 | /stocks/entry                  | pages/stocks/StockEntryPage.tsx                      | Gérant   | **P0**   | ~1-2h      |
| 4  | SCR-020 | /stocks/transfer               | pages/stocks/StockTransferPage.tsx                   | Gérant   | **P0**   | ~2h        |
| 5  | SCR-021 | /stocks/transfer/:id/receive   | pages/stocks/StockTransferReceivePage.tsx            | Gérant   | **P0**   | ~1-2h      |
| 6  | SCR-022 | /stocks/alerts                 | pages/stocks/StockAlertsPage.tsx                     | Gérant   | **P0**   | ~1-2h      |
| 7  | SCR-023 | /stocks/inventory              | pages/stocks/StockPhysicalInventoryPage.tsx          | Gérant   | **P1**   | ~2-3h      |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Modules AUTH + DASHBOARD + CLIENTS — TERMINÉS
  ↓ Fournit : AppLayout, useAuth, api.ts, ProtectedRoute, formatCDF, Pagination
  ↓
Prompt 1 (SCR-017 — Inventaire par site)
  ↓ Crée : stocks.api.ts, useStocks hook, StockStatusBadge, StockStatusRowColor,
            ProductSearchCombobox (réutilisé en SCR-019 et SCR-020)
  ↓
Prompt 2 (SCR-018 — Détail produit stock)
  ↓ Utilise : stocks.api.ts, StockStatusBadge, formatCDF
  ↓ Crée : useStockProductDetail hook, StockBySiteTable, StockMovementHistory,
            EditSeuilModal (réutilisé en SCR-022)
  ↓
Prompt 3 (SCR-019 — Entrée de stock)
  ↓ Utilise : stocks.api.ts, ProductSearchCombobox, formatCDF
  ↓ Crée : useStockEntry hook
  ↓
Prompt 4 (SCR-020 — Transfert inter-sites)
  ↓ Utilise : stocks.api.ts, ProductSearchCombobox, formatCDF
  ↓ Crée : useStockTransfer hook, TransferPreviewCard
  ↓
Prompt 5 (SCR-021 — Réception transfert)
  ↓ Utilise : stocks.api.ts, StockStatusBadge, formatCDF
  ↓ Crée : useTransferReceive hook, EcartAlert
  ↓
Prompt 6 (SCR-022 — Alertes et seuils)
  ↓ Utilise : stocks.api.ts, StockStatusBadge, EditSeuilModal (SCR-018)
  ↓ Crée : useStockAlerts hook
  ↓
Prompt 7 (SCR-023 — Inventaire physique)
  ↓ Utilise : stocks.api.ts, StockStatusBadge, formatCDF, Pagination
  ↓ Crée : usePhysicalInventory hook, InventoryResultTable
  ↓
  → MODULE STOCKS COMPLET
  → Prêt pour :
        Module VENTES  (utilise stocks.api — vérification stock caisse SCR-012)
        Module RAPPORTS (utilise /stocks pour rapports multi-sites SCR-032)
        Module DASHBOARD (StockAlerts déjà utilisé en SCR-003)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 7 — SCR-017 : INVENTAIRE PAR SITE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : TechShop Manager
Fichier cible principal : apps/client/src/pages/stocks/StocksInventoryPage.tsx
Route       : /stocks
Accès       : Protégé — rôle minimum : AGENT (lecture seule) | GERANT (actions)
Dépendances : AppLayout, useAuth, api.ts, ProtectedRoute, formatCDF, Pagination


OBJECTIF
--------
Créer la page d'inventaire des stocks par site (SCR-017), point d'entrée du module.
Elle affiche le stock de tous les produits avec filtres, recherche et indicateurs
de criticité visuels. Elle crée le client API partagé (stocks.api.ts) et les
composants badges de statut stock réutilisés dans tout le module.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/stocks/StocksInventoryPage.tsx           ← CRÉER
2.  apps/client/src/pages/stocks/StocksInventoryPage.test.tsx      ← CRÉER
3.  apps/client/src/api/stocks.api.ts                              ← CRÉER (client API module)
4.  apps/client/src/hooks/useStocks.ts                             ← CRÉER (TanStack Query)
5.  apps/client/src/components/stocks/StockStatusBadge.tsx         ← CRÉER (réutilisable)
6.  apps/client/src/components/stocks/ProductSearchCombobox.tsx    ← CRÉER (réutilisable)
7.  apps/client/src/router/index.tsx                               ← MODIFIER (ajouter routes /stocks/*)

BACK-END :
8.  apps/server/src/modules/stocks/stocks.module.ts                ← CRÉER
9.  apps/server/src/modules/stocks/stocks.controller.ts            ← CRÉER
10. apps/server/src/modules/stocks/stocks.service.ts               ← CRÉER
11. apps/server/src/modules/stocks/dto/query-stocks.dto.ts         ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
Page dans AppLayout. Zone contenu :

  ┌──────────────────────────────────────────────────────────────────┐
  │  Stocks  [Goma ▼]                  [ + Entrée ]  [ ⇄ Transfert ]│
  │                                                                  │
  │  [ 🔍 Rechercher par nom ou SKU... ] [Catégorie ▼] [Statut ▼]   │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐  │
  │  │ SKU      │ Nom produit        │ Cat.  │ Prix vente │ Stock │  │
  │  │ Seuil    │ Statut                                          │  │
  │  ├────────────────────────────────────────────────────────────┤  │
  │  │ SAM-A54  │ Samsung Galaxy A54 │ Phone │ 450 000 CDF│  12  │  │
  │  │ Seuil: 5 │ ● OK                                           │  │
  │  ├──────────────────────── fond orange-50 ───────────────────┤  │
  │  │ APL-14   │ iPhone 14          │ Phone │ 1 200 000  │   2  │  │
  │  │ Seuil: 3 │ ⚠ ALERTE                                       │  │
  │  ├──────────────────────── fond red-50 ─────────────────────┤  │
  │  │ CHG-65W  │ Chargeur rapide 65W│ Acces │  28 000 CDF│   0  │  │
  │  │ Seuil: 2 │ 🔴 RUPTURE                                     │  │
  │  └────────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  Légende : ● OK  ⚠ ALERTE (< seuil)  🔴 RUPTURE (stock = 0)    │
  │  < Précédent   Page 1 / 8   Suivant >   50 produits/page        │
  └──────────────────────────────────────────────────────────────────┘

Ligne ALERTE  → fond orange-50 (bg-orange-50)
Ligne RUPTURE → fond red-50   (bg-red-50)
Ligne OK      → fond normal alternée (#FFFFFF / #F5F5F5)


COMPOSANT StockStatusBadge — StockStatusBadge.tsx
--------------------------------------------------
Badge réutilisable dans tout le module Stocks et le Dashboard.

  interface StockStatusBadgeProps {
    statut: 'OK' | 'ALERTE' | 'RUPTURE';
    size?: 'sm' | 'md';
    showIcon?: boolean;    // défaut: true
  }

  Correspondances visuelles :
    OK      → badge vert  (#1A6B3A) — icône CheckCircle2  — texte "OK"
    ALERTE  → badge orange (#E65100) — icône AlertTriangle — texte "Alerte"
    RUPTURE → badge rouge  (#B71C1C) — icône XCircle       — texte "Rupture"

Calcul du statut (helper exporté) :
  export function getStockStatut(quantite: number, seuilAlerte: number): StockStatut {
    if (quantite === 0) return 'RUPTURE';
    if (quantite <= seuilAlerte) return 'ALERTE';
    return 'OK';
  }


COMPOSANT ProductSearchCombobox — ProductSearchCombobox.tsx
------------------------------------------------------------
Combobox de recherche de produit réutilisé dans SCR-019 (entrée) et SCR-020 (transfert).

  interface ProductSearchComboboxProps {
    siteId: string;                        // pour afficher le stock disponible
    value: string | null;                  // produitId sélectionné
    onChange: (produitId: string | null, produit: ProduitSearchResult | null) => void;
    disabled?: boolean;
    placeholder?: string;
  }

  interface ProduitSearchResult {
    id: string;
    sku: string;
    nom: string;
    categorie: string;
    prixVente: number;
    stockDisponible: number;               // stock sur le siteId fourni
  }

Comportement :
  - Input texte avec debounce 300ms → GET /api/v1/produits/search?q=...&siteId=...
  - Affiche les résultats dans un Popover (max 8 résultats)
  - Chaque option : [SKU en Roboto Mono] [Nom] — [Stock: X unités] [Badge statut]
  - Sélection : affiche "[SKU] — [Nom]" dans l'input + ferme le Popover
  - Bouton ✕ pour réinitialiser la sélection
  - Si aucun résultat : "Aucun produit trouvé pour cette recherche."
  - Si siteId absent : désactivé avec tooltip "Sélectionnez un site d'abord."


CLIENT API — stocks.api.ts
----------------------------
  // apps/client/src/api/stocks.api.ts
  import { api } from '../lib/api';

  export const stocksApi = {
    // SCR-017
    getInventory: (params: StockQueryParams) =>
      api.get<StockInventoryResponse>('/api/v1/stocks', { params }),

    // SCR-018
    getProductDetail: (produitId: string) =>
      api.get<StockProductDetailResponse>(`/api/v1/produits/${produitId}/stocks`),

    updateSeuil: (siteId: string, produitId: string, seuilAlerte: number) =>
      api.patch(`/api/v1/stocks/${siteId}/${produitId}/seuil`, { seuilAlerte }),

    getMovements: (produitId: string, params: MovementQueryParams) =>
      api.get<MovementListResponse>(`/api/v1/stocks/${produitId}/movements`, { params }),

    // SCR-019
    createEntry: (body: StockEntryDto) =>
      api.post<StockEntryResponse>('/api/v1/stocks/entree', body),

    // SCR-020
    createTransfer: (body: StockTransferDto) =>
      api.post<StockTransferResponse>('/api/v1/stocks/transfert', body),

    // SCR-021
    getPendingTransfers: (siteId: string) =>
      api.get<PendingTransferResponse>('/api/v1/stocks/transfert/pending', { params: { siteId } }),

    getTransferById: (transfertId: string) =>
      api.get<TransferDetailResponse>(`/api/v1/stocks/transfert/${transfertId}`),

    receiveTransfer: (transfertId: string, body: ReceiveTransferDto) =>
      api.patch<ReceiveTransferResponse>(`/api/v1/stocks/transfert/${transfertId}/recevoir`, body),

    // SCR-022
    getAlerts: (params: AlertQueryParams) =>
      api.get<AlertListResponse>('/api/v1/stocks/alertes', { params }),

    markOrdering: (produitId: string, siteId: string) =>
      api.patch(`/api/v1/stocks/alertes/${siteId}/${produitId}/ordering`),

    // SCR-023
    getPhysicalInventoryProducts: (siteId: string) =>
      api.get<PhysicalInventoryProductsResponse>('/api/v1/stocks/inventaire/produits', { params: { siteId } }),

    submitPhysicalInventory: (body: PhysicalInventoryDto) =>
      api.post<PhysicalInventoryResponse>('/api/v1/stocks/inventaire', body),

    // Produits — recherche (réutilisé dans SCR-019, 020, 012)
    searchProducts: (q: string, siteId: string) =>
      api.get<{ produits: ProduitSearchResult[] }>('/api/v1/produits/search', { params: { q, siteId, limit: 8 } }),
  };


TYPES TYPESCRIPT PARTAGÉS
---------------------------
Créer dans packages/shared/src/types/stock.types.ts :

  export type StockStatut = 'OK' | 'ALERTE' | 'RUPTURE';
  export type MouvementType =
    | 'ENTREE'
    | 'SORTIE_VENTE'
    | 'TRANSFERT_DEPART'
    | 'TRANSFERT_ARRIVEE'
    | 'AJUSTEMENT_INVENTAIRE';
  export type TransfertStatut = 'EN_TRANSIT' | 'RECU' | 'ANNULE';
  export type CategorieType = 'SMARTPHONES' | 'ACCESSOIRES' | 'AUDIO' | 'INFORMATIQUE' | 'AUTRE';

  export interface StockSite {
    produitId: string;
    sku: string;
    produitNom: string;
    categorie: CategorieType;
    prixVente: number;
    prixAchat: number;
    siteId: string;
    siteNom: string;
    quantite: number;
    seuilAlerte: number;
    statut: StockStatut;     // calculé : OK / ALERTE / RUPTURE
    updatedAt: string;
  }

  export interface MouvementStock {
    id: string;
    produitId: string;
    siteId: string;
    type: MouvementType;
    quantite: number;
    quantiteAvant: number;
    quantiteApres: number;
    reference: string | null;
    agentNom: string;
    siteNom: string;
    createdAt: string;
  }

  export interface Transfert {
    id: string;
    produitId: string;
    produitNom: string;
    sku: string;
    siteSourceId: string;
    siteSourceNom: string;
    siteDestinationId: string;
    siteDestinationNom: string;
    quantiteEnvoyee: number;
    quantiteRecue: number | null;
    motif: string | null;
    statut: TransfertStatut;
    initiePar: string;
    createdAt: string;
    updatedAt: string;
  }


HOOK useStocks — useStocks.ts
-------------------------------
  interface UseStocksParams {
    siteId: string | null;
    search?: string;
    categorie?: string;
    statut?: StockStatut;
    page?: number;
    limit?: number;
  }

  export function useStocks(params: UseStocksParams) {
    // TanStack Query v5
    // queryKey : ['stocks', params]
    // staleTime : 2 * 60 * 1000
    // placeholderData : keepPreviousData
    // enabled : !!params.siteId || user.role IN ['SUPER_ADMIN', 'DIR_REGIONAL']
    return { stocks, meta, isLoading, isFetching, error, refetch };
  }

Recherche avec useDebouncedValue(search, 300).
Filtres synchronisés avec useSearchParams (URL partageable).


FILTRES ET COMPORTEMENTS
--------------------------
Filtre Site (Select shadcn) :
  - AGENT          : MASQUÉ, siteId forcé = user.siteId
  - GERANT         : MASQUÉ, siteId forcé = user.siteId
  - DIR_REGIONAL / SUPER_ADMIN : VISIBLE — Goma | Bukavu | Kinshasa

Filtre Catégorie :
  Tous | Smartphones | Accessoires | Audio | Informatique

Filtre Statut stock :
  Tous | OK | Alerte | Rupture

Boutons d'action (Header de la page) :
  [ + Entrée ]     → navigate('/stocks/entry')
    MASQUÉ pour AGENT (lecture seule)
  [ ⇄ Transfert ]  → navigate('/stocks/transfer')
    MASQUÉ pour AGENT (lecture seule)

Sur mobile :
  - Tableau remplacé par des cards (une card par produit)
  - Card : SKU + Nom + Stock actuel + Badge statut + Prix

Tri des colonnes :
  - Clic sur en-tête "Stock" → tri croissant/décroissant
  - Clic sur en-tête "Nom"   → tri alphabétique
  - Tri par défaut : RUPTURE d'abord, ALERTE ensuite, OK en dernier


ÉTATS DE LA PAGE
-----------------
État CHARGEMENT : 8 lignes skeleton (Skeleton shadcn)
État VIDE (aucun produit) :
  "Aucun produit en stock sur ce site." + icône Package grisée
État VIDE (filtres actifs) :
  "Aucun résultat pour ces critères." + bouton "Réinitialiser les filtres"
État ERREUR :
  Alert rouge + bouton "Réessayer"
Badge compteurs en haut du tableau :
  "X produits en alerte · Y en rupture" (visible si > 0)
  → Fond orange-100 si alertes > 0, fond red-100 si ruptures > 0


APPELS API
-----------
GET /api/v1/stocks
  Query params :
    siteId     : string (requis sauf SUPER_ADMIN / DIR_REGIONAL)
    search?    : string
    categorie? : CategorieType
    statut?    : 'OK' | 'ALERTE' | 'RUPTURE'
    page       : number (défaut 1)
    limit      : number (défaut 50)
  Succès 200 :
    {
      stocks: StockSite[],
      meta: { total, page, limit, totalPages, totalAlertes, totalRuptures }
    }

GET /api/v1/produits/search
  Query params : { q: string, siteId: string, limit: number }
  Succès 200 : { produits: ProduitSearchResult[] }


BACK-END — stocks.service.ts : findAll()
------------------------------------------
  1. Si AGENT ou GERANT → forcer siteId = user.siteId
  2. Construire la clause WHERE Prisma sur StockSite :
     - Si search → OR [{ produit.nom: contains }, { produit.sku: contains }]
     - Si categorie → produit.categorie = categorie
     - Si statut :
         'OK'      → quantite > seuilAlerte
         'ALERTE'  → AND quantite > 0, quantite <= seuilAlerte
         'RUPTURE' → quantite = 0
  3. findMany avec include: { produit: true }
     ORDER BY : quantite ASC (ruptures en haut), puis nom ASC
  4. Calculer le statut pour chaque ligne (OK / ALERTE / RUPTURE)
  5. Compter alertes et ruptures pour le meta
  6. Cache Redis 60 secondes : clé stocks:inventory:{siteId}:{hash(params)}


TESTS — StocksInventoryPage.test.tsx
--------------------------------------
  describe('StocksInventoryPage', () => {
    describe('Rendu et accès', () => {
      test('1  — Tableau avec SKU, Nom, Prix, Stock, Statut affiché')
      test('2  — Filtre Site masqué pour AGENT')
      test('3  — Boutons Entrée et Transfert masqués pour AGENT')
      test('4  — Boutons Entrée et Transfert visibles pour GERANT')
    })

    describe('Couleurs et badges', () => {
      test('5  — Ligne RUPTURE : fond red-50 + badge rouge')
      test('6  — Ligne ALERTE : fond orange-50 + badge orange')
      test('7  — Ligne OK : badge vert')
      test('8  — getStockStatut(0, 5) retourne RUPTURE')
      test('9  — getStockStatut(2, 5) retourne ALERTE')
      test('10 — getStockStatut(10, 5) retourne OK')
    })

    describe('Recherche et filtres', () => {
      test('11 — Recherche avec debounce 300ms')
      test('12 — Filtre catégorie fonctionne')
      test('13 — Filtre statut RUPTURE ne montre que les ruptures')
      test('14 — Filtres synchronisés avec l\'URL (query params)')
    })

    describe('Navigation', () => {
      test('15 — Clic ligne navigue vers /stocks/:produitId')
      test('16 — Bouton Entrée navigue vers /stocks/entry')
      test('17 — Bouton Transfert navigue vers /stocks/transfer')
    })

    describe('États', () => {
      test('18 — 8 lignes skeleton pendant le chargement')
      test('19 — Badge "X en alerte · Y en rupture" si > 0')
      test('20 — Empty state si aucun produit')
      test('21 — Alert erreur + bouton réessayer si API échoue')
    })
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Tableau avec SKU, Nom, Catégorie, Prix CDF, Stock, Seuil, Badge statut
[ ] Lignes RUPTURE en fond red-50, ALERTE en fond orange-50
[ ] StockStatusBadge : 3 statuts avec icônes et couleurs correctes
[ ] getStockStatut() exporté et testé unitairement
[ ] Filtre Site masqué pour AGENT et GERANT
[ ] Boutons Entrée + Transfert masqués pour AGENT
[ ] Recherche + filtres synchronisés avec query params URL
[ ] ProductSearchCombobox fonctionnel avec debounce et badge stock
[ ] Tri RUPTURE → ALERTE → OK par défaut
[ ] Skeleton chargement + empty states + état erreur
[ ] GET /api/v1/stocks filtre par rôle, cache Redis 60s
[ ] npm run test — 21 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 7 — SCR-018 : DÉTAIL PRODUIT — STOCK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : TechShop Manager
Fichier cible principal : apps/client/src/pages/stocks/StockProductDetailPage.tsx
Route       : /stocks/:produitId
Accès       : Protégé — rôle minimum : GERANT (lecture + édition seuil)
              AGENT : accessible en lecture seule (sans bouton Modifier seuil)
Dépendances : SCR-017 terminé (stocks.api.ts, StockStatusBadge, formatCDF)


OBJECTIF
--------
Créer la fiche détail stock d'un produit (SCR-018). Elle affiche les informations
du produit, le stock par site avec statuts, et l'historique complet des mouvements
filtrable. Permet de modifier le seuil d'alerte par site via une modal dédiée.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/stocks/StockProductDetailPage.tsx           ← CRÉER
2.  apps/client/src/pages/stocks/StockProductDetailPage.test.tsx      ← CRÉER
3.  apps/client/src/hooks/useStockProductDetail.ts                    ← CRÉER
4.  apps/client/src/components/stocks/StockBySiteTable.tsx            ← CRÉER
5.  apps/client/src/components/stocks/StockMovementHistory.tsx        ← CRÉER
6.  apps/client/src/components/stocks/EditSeuilModal.tsx              ← CRÉER (réutilisé SCR-022)

BACK-END :
7.  apps/server/src/modules/stocks/stocks.controller.ts               ← MODIFIER
8.  apps/server/src/modules/stocks/stocks.service.ts                  ← MODIFIER


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Stocks   SAM-A54 — Samsung Galaxy A54                        │
  │                                                                  │
  │  ┌─────────────────────────────────────────────────────────┐     │
  │  │  SAM-A54  │  Samsung Galaxy A54    │  Smartphones       │     │
  │  │  Prix vente : 450 000 CDF  │  Prix achat : 320 000 CDF │     │
  │  │  Description : Smartphone Android 6.4" 128Go...         │     │
  │  └─────────────────────────────────────────────────────────┘     │
  │                                                                  │
  │  Stock par site                                                  │
  │  ┌───────────────────────────────────────────────────────────┐   │
  │  │ Site    │ Stock │ Seuil │ Statut  │ Màj           │ [⚙]  │   │
  │  │ Goma    │  12   │   5   │ ● OK    │ 12/01 14:22   │ [⚙]  │   │
  │  │ Bukavu  │   2   │   3   │ ⚠ Alerte│ 11/01 09:15   │ [⚙]  │   │
  │  │ Kinshasa│   0   │   2   │ 🔴 Rupt.│ 10/01 16:40   │ [⚙]  │   │
  │  └───────────────────────────────────────────────────────────┘   │
  │                                                                  │
  │  Historique des mouvements                                       │
  │  [Type ▼] [Site ▼] [Du __/__/__] [Au __/__/__]                  │
  │  ┌───────────────────────────────────────────────────────────┐   │
  │  │ Date        │ Type        │ Qté │ Avant │ Après │ Réf     │   │
  │  │ 12/01 10:34 │ ↑ ENTRÉE    │ +20 │  0    │  20   │ BL-001  │   │
  │  │ 12/01 14:22 │ ↓ VENTE     │  -1 │  20   │  19   │ GOM-... │   │
  │  │ 11/01 09:15 │ ⇄ TRANSFERT │  -7 │  26   │  19   │ TRF-005 │   │
  │  └───────────────────────────────────────────────────────────┘   │
  └──────────────────────────────────────────────────────────────────┘


COMPOSANT StockBySiteTable — StockBySiteTable.tsx
---------------------------------------------------
  interface StockBySiteTableProps {
    stocksBySite: StockSiteRow[];
    onEditSeuil?: (siteId: string, currentSeuil: number) => void;  // si GERANT
    isLoading: boolean;
  }

  interface StockSiteRow {
    siteId: string;
    siteNom: string;
    quantite: number;
    seuilAlerte: number;
    statut: StockStatut;
    updatedAt: string;
  }

Affichage :
  - 3 lignes (une par site) + éventuellement ligne "Total"
  - Colonne Stock : Roboto Mono, gras si RUPTURE ou ALERTE
  - Colonne Seuil : Roboto Mono
  - Colonne Statut : StockStatusBadge
  - Colonne Màj : date relative (date-fns/fr)
  - Colonne Action : bouton icône Settings (lucide-react) → ouvre EditSeuilModal
    MASQUÉ si user.role === 'AGENT'
  - Ligne en fond red-50 si RUPTURE, orange-50 si ALERTE


COMPOSANT EditSeuilModal — EditSeuilModal.tsx
----------------------------------------------
Modal de modification du seuil d'alerte. Réutilisé dans SCR-022.

  interface EditSeuilModalProps {
    open: boolean;
    onClose: () => void;
    produitId: string;
    produitNom: string;
    siteId: string;
    siteNom: string;
    currentSeuil: number;
    currentStock: number;
    onSuccess: () => void;
  }

Contenu de la modal :
  Titre : "Modifier le seuil d'alerte"
  Sous-titre : "Samsung Galaxy A54 — Goma"

  Stock actuel : 12 unités (affiché en lecture seule)
  Seuil d'alerte actuel : [5]  (Input number, min=0, max=9999)

  Aperçu en temps réel (mis à jour à chaque changement de valeur) :
    "Avec ce seuil, le statut sera : ● OK" (recalculé depuis getStockStatut)

  [ Annuler ]  [ Enregistrer ]

Comportement :
  - Spinner sur "Enregistrer" pendant le PATCH
  - Toast succès : "Seuil mis à jour — [Produit] sur [Site] : seuil = X"
  - Invalidation du cache TanStack Query (['stocks'], ['stock-product', produitId])
  - Fermeture auto après succès


COMPOSANT StockMovementHistory — StockMovementHistory.tsx
-----------------------------------------------------------
  interface StockMovementHistoryProps {
    produitId: string;
    defaultSiteId?: string;
  }

Filtres :
  [Type ▼]  [Site ▼]  [Du __/__/__]  [Au __/__/__]  [ Réinitialiser ]

Types de mouvements avec icônes et couleurs :
  ENTREE               → ↑ vert    — "+X"
  SORTIE_VENTE         → ↓ rouge   — "-X" — Réf = lien vers /sales/:venteId
  TRANSFERT_DEPART     → ⇄ orange  — "-X" — Réf = lien vers /stocks/transfer/:id
  TRANSFERT_ARRIVEE    → ⇄ bleu    — "+X" — Réf = lien vers /stocks/transfer/:id
  AJUSTEMENT_INVENTAIRE→ ≈ violet  — "+X" ou "-X"

Table :
  Date | Type (icône + label) | Qté (coloré) | Avant | Après | Référence | Site | Agent

Pagination propre (10 mouvements / page).
Si aucun mouvement : "Aucun mouvement pour ces critères."


HOOK useStockProductDetail — useStockProductDetail.ts
------------------------------------------------------
  export function useStockProductDetail(produitId: string) {
    const productQuery = useQuery({
      queryKey: ['stock-product', produitId],
      queryFn: () => stocksApi.getProductDetail(produitId),
      staleTime: 3 * 60 * 1000,
    });

    const updateSeuilMutation = useMutation({
      mutationFn: ({ siteId, seuilAlerte }) =>
        stocksApi.updateSeuil(siteId, produitId, seuilAlerte),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stock-product', produitId] });
        queryClient.invalidateQueries({ queryKey: ['stocks'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
    });

    return { product, stocksBySite, isLoading, error, updateSeuil, isUpdating };
  }


APPELS API
-----------
GET /api/v1/produits/:id/stocks
  Succès 200 :
    {
      produit: {
        id, sku, nom, description, categorie,
        prixVente: number, prixAchat: number
      },
      stocksBySite: StockSiteRow[],   // 3 entrées (une par site)
      totalStock: number,              // somme des 3 sites
    }
  Erreur 404 : produit non trouvé → page 404

GET /api/v1/stocks/:produitId/movements
  Query params :
    type?      : MouvementType
    siteId?    : string
    dateFrom?  : string (ISO)
    dateTo?    : string (ISO)
    page       : number (défaut 1)
    limit      : number (défaut 10)
  Succès 200 :
    { mouvements: MouvementStock[], meta: { total, page, totalPages } }

PATCH /api/v1/stocks/:siteId/:produitId/seuil
  Corps : { seuilAlerte: number }
  Succès 200 : { stockSite: StockSiteRow }
  Erreur 400 : seuilAlerte < 0


BACK-END — stocks.service.ts
------------------------------
getProductDetail(produitId) :
  1. Prisma Product findUnique avec include: { stockSites: { include: { site: true } } }
  2. Calculer le statut pour chaque stockSite
  3. Calculer totalStock

getMovements(produitId, filters) :
  1. WHERE produitId = produitId + filtres optionnels
  2. JOIN agent (nom) et site (nom)
  3. ORDER BY createdAt DESC

updateSeuil(siteId, produitId, seuilAlerte) :
  1. Prisma StockSite update WHERE siteId+produitId
  2. Invalider cache Redis


TESTS — StockProductDetailPage.test.tsx
-----------------------------------------
  describe('StockProductDetailPage', () => {
    test('1  — Carte produit : SKU, nom, prix vente + achat, description')
    test('2  — Tableau stock par site : 3 lignes avec badges statuts')
    test('3  — Ligne Kinshasa en fond red-50 (RUPTURE)')
    test('4  — Bouton seuil ⚙ masqué pour AGENT')
    test('5  — Bouton seuil ⚙ visible pour GERANT')
    test('6  — Modal EditSeuil s\'ouvre au clic ⚙')
    test('7  — Aperçu statut mis à jour en temps réel dans la modal')
    test('8  — PATCH seuil appelé à la soumission')
    test('9  — Cache invalidé + toast succès après PATCH')
    test('10 — Historique : 10 mouvements avec types colorés')
    test('11 — Filtre Type ENTREE ne montre que les entrées')
    test('12 — Filtre Date range fonctionne')
    test('13 — Référence SORTIE_VENTE est un lien vers /sales/:id')
    test('14 — Pagination historique fonctionne')
    test('15 — 404 si produit inexistant')
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Carte produit : SKU, nom, catégorie, prix vente + achat CDF, description
[ ] StockBySiteTable : 3 sites avec stock, seuil, statut, date màj
[ ] Bouton ⚙ masqué pour AGENT, visible GERANT+
[ ] EditSeuilModal : input seuil + aperçu statut temps réel + PATCH
[ ] Cache TanStack Query invalidé (stocks + stock-product + dashboard)
[ ] StockMovementHistory : 5 types avec icônes et couleurs distinctes
[ ] Filtres historique (type, site, plage de dates) fonctionnels
[ ] Pagination historique (10 / page)
[ ] GET /api/v1/produits/:id/stocks retourne les 3 sites
[ ] GET /api/v1/stocks/:produitId/movements avec filtres
[ ] PATCH seuil valide seuilAlerte >= 0
[ ] npm run test — 15 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 7 — SCR-019 : ENTRÉE DE STOCK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : TechShop Manager
Fichier cible principal : apps/client/src/pages/stocks/StockEntryPage.tsx
Route       : /stocks/entry
Accès       : Protégé — rôle minimum : GERANT
Dépendances : SCR-017 terminé (stocks.api.ts, ProductSearchCombobox, formatCDF)


OBJECTIF
--------
Créer la page d'entrée de stock (SCR-019) : enregistrement d'une réception
de marchandises depuis un fournisseur. Le formulaire est simple mais critique —
chaque entrée génère un mouvement ENTREE dans l'historique et incrémente le stock.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/stocks/StockEntryPage.tsx           ← CRÉER
2.  apps/client/src/pages/stocks/StockEntryPage.test.tsx      ← CRÉER
3.  apps/client/src/hooks/useStockEntry.ts                    ← CRÉER

BACK-END :
4.  apps/server/src/modules/stocks/stocks.controller.ts       ← MODIFIER
5.  apps/server/src/modules/stocks/stocks.service.ts          ← MODIFIER (createEntry)


UI — STRUCTURE VISUELLE
------------------------
Page dans AppLayout. Zone contenu — carte centrée max-w-lg :

  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Stocks   Entrée de stock                                      │
  │                                                                  │
  │  Site destinataire *     [Goma ▼]                                │
  │                                                                  │
  │  Produit *               [ Rechercher par SKU ou nom... ]        │
  │                          ↳ SAM-A54 — Samsung A54 (Stock Goma: 12)│
  │                                                                  │
  │  Quantité reçue *        [ 20        ]  unités                   │
  │                                                                  │
  │  Stock après réception   → 32 unités  (calculé en temps réel)   │
  │                                                                  │
  │  Référence fournisseur   [ BL-2025-001 ]  (optionnel)            │
  │  Date de réception *     [ 13/01/2025 ▼ ]                        │
  │  Notes                   [ _________________________ ]           │
  │                          (optionnel, max 200 chars)              │
  │                                                                  │
  │              [ ↑ ENREGISTRER L'ENTRÉE DE STOCK ]                 │
  └──────────────────────────────────────────────────────────────────┘


LOGIQUE FORMULAIRE
-------------------
React Hook Form + Zod :
  siteId          : z.string().min(1, 'Site requis')
  produitId       : z.string().min(1, 'Produit requis')
  quantite        : z.number().int().min(1, 'Quantité minimum : 1').max(99999)
  referenceFournisseur : z.string().max(100).optional()
  dateReception   : z.date()
    .max(new Date(), 'Date future interdite')
    .min(new Date(Date.now() - 365 * 86400000), 'Date trop ancienne')
  notes           : z.string().max(200).optional()

Comportements spécifiques :
  - Champ Site : pré-rempli + DISABLED pour GERANT (= user.siteId)
    Éditable pour DIR_REGIONAL et SUPER_ADMIN
  - Après sélection du produit via ProductSearchCombobox :
      → Afficher "Stock actuel : 12 unités" sous le combobox
      → Calculer et afficher "Stock après réception : 32 unités" en temps réel
      → Si stock = 0 (RUPTURE) avant l'entrée → badge rouge "⚠ En rupture actuellement"
  - Le champ Quantité : uniquement des entiers positifs
  - Date de réception : DatePicker shadcn, aujourd'hui par défaut, date future interdite
  - Bouton "ENREGISTRER" disabled si :
      • produitId ou siteId manquant
      • quantite < 1 ou non entier
      • mutation en cours


CONFIRMATION AVANT ENVOI
--------------------------
Avant de soumettre, afficher une Dialog de confirmation :

  Titre : "Confirmer l'entrée de stock ?"
  Corps :
    Produit   : Samsung Galaxy A54 (SAM-A54)
    Site      : Goma
    Quantité  : +20 unités
    Stock après : 32 unités
    Référence : BL-2025-001
  Boutons : [ Annuler ] [ ↑ Confirmer l'entrée ]


ÉCRAN DE SUCCÈS
----------------
Après enregistrement réussi, remplacer le formulaire par :

  ┌──────────────────────────────────────────────────────────────────┐
  │              ✅  Entrée enregistrée avec succès !                │
  │                                                                  │
  │   Samsung Galaxy A54 — Goma                                      │
  │   +20 unités  →  Stock désormais : 32 unités   ● OK             │
  │   Référence : BL-2025-001                                        │
  │                                                                  │
  │   [ + Nouvelle entrée ]    [ Voir le stock Goma ]                │
  └──────────────────────────────────────────────────────────────────┘


APPELS API
-----------
POST /api/v1/stocks/entree
  Corps :
    {
      siteId: string,
      produitId: string,
      quantite: number,
      referenceFournisseur?: string,
      dateReception: string,    // ISO date "2025-01-13"
      notes?: string,
    }
  Succès 201 :
    {
      mouvement: MouvementStock,
      stockApres: number,
      statut: StockStatut,      // recalculé après l'entrée
    }
  Erreur 404 : produit ou site introuvable
  Erreur 400 : quantite ≤ 0


BACK-END — stocks.service.ts : createEntry()
----------------------------------------------
  1. Vérifier que le produit et le site existent
  2. Si GERANT → forcer siteId = user.siteId
  3. Prisma transaction :
     a. GET stockSite actuel (quantiteAvant)
     b. UPDATE StockSite : quantite += body.quantite
     c. CREATE MouvementStock : type='ENTREE', quantiteAvant, quantiteApres
  4. Invalider cache Redis du stock
  5. Retourner mouvement + stockApres + statut recalculé


TESTS — StockEntryPage.test.tsx
---------------------------------
  describe('StockEntryPage', () => {
    test('1  — Accès refusé pour AGENT → AccessDenied')
    test('2  — Accès accordé pour GERANT')
    test('3  — Champ Site pré-rempli et disabled pour GERANT')
    test('4  — ProductSearchCombobox affiche stock actuel après sélection')
    test('5  — "Stock après réception" calculé en temps réel')
    test('6  — Badge rupture visible si stock actuel = 0')
    test('7  — Quantité non entière : erreur de validation')
    test('8  — Date future interdite dans le DatePicker')
    test('9  — Dialog de confirmation s\'ouvre avant soumission')
    test('10 — POST entree appelé après confirmation')
    test('11 — Écran de succès avec stockApres et statut')
    test('12 — Bouton "Nouvelle entrée" reset le formulaire')
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé AGENT, accordé GERANT+
[ ] Champ Site pré-rempli + disabled pour GERANT
[ ] ProductSearchCombobox intégré avec affichage stock actuel
[ ] "Stock après réception" calculé en temps réel (quantite + stockActuel)
[ ] Badge rupture si stock = 0 avant l'entrée
[ ] DatePicker : aujourd'hui par défaut, date future interdite
[ ] Dialog de confirmation avant soumission
[ ] POST /api/v1/stocks/entree : transaction Prisma atomique (update + create mouvement)
[ ] Écran de succès avec stockApres + statut recalculé + badge
[ ] Cache Redis invalidé après création
[ ] npm run test — 12 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 7 — SCR-020 : TRANSFERT INTER-SITES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : TechShop Manager
Fichier cible principal : apps/client/src/pages/stocks/StockTransferPage.tsx
Route       : /stocks/transfer
Accès       : Protégé — rôle minimum : GERANT
Dépendances : SCR-017 terminé (stocks.api.ts, ProductSearchCombobox, formatCDF)


OBJECTIF
--------
Créer la page de transfert inter-sites (SCR-020). Un GERANT de Goma initie
un transfert vers Bukavu — le stock source est immédiatement décrémenté,
le stock destination n'est incrémenté qu'à la validation de réception (SCR-021).
La page affiche un récapitulatif avant/après en temps réel.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/stocks/StockTransferPage.tsx          ← CRÉER
2.  apps/client/src/pages/stocks/StockTransferPage.test.tsx     ← CRÉER
3.  apps/client/src/hooks/useStockTransfer.ts                   ← CRÉER
4.  apps/client/src/components/stocks/TransferPreviewCard.tsx   ← CRÉER

BACK-END :
5.  apps/server/src/modules/stocks/stocks.controller.ts         ← MODIFIER
6.  apps/server/src/modules/stocks/stocks.service.ts            ← MODIFIER (createTransfer)


UI — STRUCTURE VISUELLE
------------------------
Page dans AppLayout. Zone contenu — carte centrée max-w-xl :

  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Stocks   Transfert inter-sites                                │
  │                                                                  │
  │  Site source *        [Goma ▼]         Site destination *  [Bukavu ▼]│
  │                                                                  │
  │  Produit *            [ Rechercher par SKU ou nom... ]           │
  │                       ↳ SAM-A54 — Samsung A54                   │
  │                                                                  │
  │  Quantité à transférer *    [ 5 ]  unités                        │
  │                                                                  │
  │  Motif                [ Réapprovisionnement Bukavu ]  (optionnel)│
  │                                                                  │
  │  ┌── Récapitulatif ─────────────────────────────────────────┐    │
  │  │                                                          │    │
  │  │   Samsung Galaxy A54 (SAM-A54)                           │    │
  │  │   Goma    : 12 → 7 unités    ● OK → ● OK                │    │
  │  │   Bukavu  :  3 → 8 unités    ⚠ Alerte → ● OK            │    │
  │  │                                                          │    │
  │  │   ⚠ Attention : Bukavu sera en attente de réception.     │    │
  │  │   Le stock Bukavu ne sera mis à jour qu'après            │    │
  │  │   confirmation de réception par le Gérant de Bukavu.     │    │
  │  └──────────────────────────────────────────────────────────┘    │
  │                                                                  │
  │         [ ⇄ INITIER LE TRANSFERT — Notif. envoyée à Bukavu ]     │
  └──────────────────────────────────────────────────────────────────┘


RÈGLES DE SÉLECTION DES SITES
-------------------------------
  - Site source :
      GERANT          → pré-rempli + DISABLED = user.siteId
      DIR_REGIONAL / SUPER_ADMIN → Select éditable
  - Site destination :
      Ne peut PAS être identique au site source
      → Si même valeur sélectionnée → message rouge : "Le site de destination doit être différent du site source."
  - Quand site source et produit sélectionnés → charger automatiquement les stocks des 2 sites


COMPOSANT TransferPreviewCard — TransferPreviewCard.tsx
---------------------------------------------------------
Carte de récapitulatif mise à jour en temps réel à chaque modification du formulaire.

  interface TransferPreviewCardProps {
    produitNom: string;
    sku: string;
    siteSource: { nom: string; stockActuel: number; seuilAlerte: number };
    siteDestination: { nom: string; stockActuel: number; seuilAlerte: number };
    quantite: number;
  }

Calculs temps réel :
  stockSourceApres      = siteSource.stockActuel - quantite
  stockDestinationApres = siteDestination.stockActuel + quantite  // PRÉVISUALISATION SEULEMENT
  statutSourceAvant     = getStockStatut(siteSource.stockActuel, siteSource.seuilAlerte)
  statutSourceApres     = getStockStatut(stockSourceApres, siteSource.seuilAlerte)
  statutDestAvant       = getStockStatut(siteDestination.stockActuel, siteDestination.seuilAlerte)
  statutDestApres       = getStockStatut(stockDestinationApres, siteDestination.seuilAlerte)

Affichage :
  Ligne source      : "[Site source]  : X → Y unités   [badge avant] → [badge après]"
  Ligne destination : "[Site dest.]   : X → Y unités   [badge avant] → [badge après]" (prévisualisation)

Alertes conditionnelles (Alert shadcn) :
  ⚠ ORANGE si stockSourceApres < 0 :
    "Stock insuffisant — [Site source] n'a que X unités disponibles."
    → Bouton INITIER disabled

  ⚠ ORANGE si stockSourceApres <= siteSource.seuilAlerte ET stockSourceApres > 0 :
    "Ce transfert passera [Site source] en alerte (seuil : Y unités)."
    → Bouton INITIER reste actif (warning, pas bloquant)

  ℹ BLEU — toujours visible :
    "Le stock [Site destination] sera mis à jour après confirmation de réception."


VALIDATION FORMULAIRE
----------------------
React Hook Form + Zod :
  siteSourceId      : z.string().min(1)
  siteDestinationId : z.string().min(1)
    .refine(val => val !== siteSourceId, 'Sites identiques interdits')
  produitId         : z.string().min(1)
  quantite          : z.number().int().min(1).max(9999)
    .refine(val => val <= stockSourceActuel, 'Quantité supérieure au stock disponible')
  motif             : z.string().max(200).optional()

Bouton "INITIER" disabled si :
  - Champs requis manquants
  - siteSource = siteDestination
  - quantite > stockSourceActuel
  - Mutation en cours


CONFIRMATION ET NOTIFICATION
------------------------------
Dialog de confirmation :
  Titre : "Confirmer le transfert ?"
  Corps :
    Produit     : Samsung Galaxy A54
    De → Vers   : Goma → Bukavu
    Quantité    : 5 unités
    ⚠ Le stock Goma sera immédiatement décrémenté de 5 unités.
       Le stock Bukavu sera mis à jour après confirmation de réception.
  Boutons : [ Annuler ] [ ⇄ Confirmer le transfert ]

Après succès :
  Toast vert : "Transfert initié. Une notification a été envoyée au Gérant de Bukavu."
  navigate('/stocks') après 2 secondes
  OU bouton "Voir les transferts en cours" → navigate('/stocks/transfer/pending') (page future)


APPELS API
-----------
GET /api/v1/stocks (call interne) :
  → Charger le stock du produit sur site source ET destination
  → Appelé automatiquement quand siteSourceId + produitId sélectionnés

POST /api/v1/stocks/transfert
  Corps :
    {
      siteSourceId: string,
      siteDestinationId: string,
      produitId: string,
      quantite: number,
      motif?: string,
    }
  Succès 201 :
    {
      transfert: Transfert,
      stockSourceApres: number,
      statut: 'EN_TRANSIT',
    }
  Erreur 400 ERR_VALIDATION       : quantite ≤ 0
  Erreur 409 ERR_STOCK_INSUFFISANT : quantite > stock source actuel
  Erreur 400                       : siteSource = siteDestination


BACK-END — stocks.service.ts : createTransfer()
-------------------------------------------------
  1. Si GERANT → forcer siteSourceId = user.siteId
  2. Vérifier siteSourceId ≠ siteDestinationId
  3. Vérifier stock source actuel >= quantite → sinon 409 ERR_STOCK_INSUFFISANT
  4. Prisma transaction :
     a. UPDATE StockSite source : quantite -= body.quantite (immédiat)
     b. CREATE MouvementStock : type='TRANSFERT_DEPART', ref=transfertId
     c. CREATE Transfert : statut='EN_TRANSIT'
  5. Envoyer notification (log / future notification push) au gérant destination
  6. Invalider cache Redis
  7. Retourner { transfert, stockSourceApres }


TESTS — StockTransferPage.test.tsx
------------------------------------
  describe('StockTransferPage', () => {
    test('1  — Accès refusé AGENT → AccessDenied')
    test('2  — Site source pré-rempli + disabled pour GERANT')
    test('3  — Même site source et destination : message erreur rouge')
    test('4  — ProductSearchCombobox charge les stocks des 2 sites après sélection')
    test('5  — TransferPreviewCard : stocks avant/après calculés en temps réel')
    test('6  — Badge statut source change si quantite dépasse le seuil')
    test('7  — Alert rouge si quantite > stockSource → bouton disabled')
    test('8  — Alert orange (warning) si transfert met source en alerte')
    test('9  — Dialog de confirmation s\'ouvre avant soumission')
    test('10 — POST transfert appelé avec les bonnes données')
    test('11 — Erreur 409 stock insuffisant : message rouge affiché')
    test('12 — Toast succès + navigate après confirmation')
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé AGENT, accordé GERANT+
[ ] Site source pré-rempli + disabled pour GERANT
[ ] Guard sites identiques avec message d'erreur clair
[ ] TransferPreviewCard : calcul temps réel avant/après avec badges
[ ] Alert rouge bloquante si quantite > stock source
[ ] Alert orange non-bloquante si mise en alerte du site source
[ ] Note informative sur le comportement différé du stock destination
[ ] Dialog de confirmation avec détail du transfert
[ ] POST /api/v1/stocks/transfert : décrémente IMMÉDIATEMENT le stock source (transaction)
[ ] Notification gérant destination créée
[ ] Cache Redis invalidé
[ ] npm run test — 12 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 5 / 7 — SCR-021 : VALIDATION RÉCEPTION TRANSFERT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : TechShop Manager
Fichier cible principal : apps/client/src/pages/stocks/StockTransferReceivePage.tsx
Route       : /stocks/transfer/:id/receive
Accès       : Protégé — rôle minimum : GERANT (du site destinataire uniquement)
Dépendances : SCR-017 terminé (stocks.api.ts, StockStatusBadge, formatCDF)
              SCR-020 terminé (Transfert type)


OBJECTIF
--------
Créer la page de validation de réception d'un transfert (SCR-021). Le Gérant
du site destinataire confirme les quantités reçues, signale d'éventuels écarts
et finalise le transfert. C'est seulement à ce moment que le stock destination
est incrémenté. Une alerte automatique est prévue si le transfert dépasse 72h.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/stocks/StockTransferReceivePage.tsx          ← CRÉER
2.  apps/client/src/pages/stocks/StockTransferReceivePage.test.tsx     ← CRÉER
3.  apps/client/src/hooks/useTransferReceive.ts                        ← CRÉER
4.  apps/client/src/components/stocks/EcartAlert.tsx                   ← CRÉER

BACK-END :
5.  apps/server/src/modules/stocks/stocks.controller.ts                ← MODIFIER
6.  apps/server/src/modules/stocks/stocks.service.ts                   ← MODIFIER (receiveTransfer)


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Stocks   Réception de transfert                               │
  │                                                                  │
  │  ┌── Détail du transfert ─────────────────────────────────────┐  │
  │  │  Produit        : Samsung Galaxy A54 (SAM-A54)             │  │
  │  │  Expéditeur     : Goma — initié par MASUDI Jean            │  │
  │  │  Destinataire   : Bukavu (vous)                            │  │
  │  │  Quantité envoyée : 5 unités                               │  │
  │  │  Date d'envoi   : 12/01/2025 à 14:22                       │  │
  │  │  Statut         : 🔵 EN TRANSIT  (depuis 2 heures)         │  │
  │  └────────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  Quantité réellement reçue *   [ 5 ]  (pré-rempli = envoyée)   │
  │                                                                  │
  │  Observations  [ _________________________________ ]             │
  │                (obligatoire si quantité ≠ envoyée)               │
  │                                                                  │
  │  ── Composant EcartAlert (visible si quantite ≠ envoyée) ─────  │
  │                                                                  │
  │  [ ⚑ Signaler un problème ]    [ ✓ CONFIRMER LA RÉCEPTION ]    │
  └──────────────────────────────────────────────────────────────────┘


GARDE D'ACCÈS STRICT
---------------------
Cette page vérifie que l'utilisateur est bien le Gérant du SITE DESTINATAIRE.
  - Charger le transfert via GET /api/v1/stocks/transfert/:id
  - Si transfert.siteDestinationId ≠ user.siteId ET user.role ≠ 'SUPER_ADMIN' :
    → Afficher AccessDenied avec message spécifique :
      "Ce transfert est destiné au site [Nom]. Vous n'êtes pas autorisé à valider cette réception."
  - Si transfert.statut ≠ 'EN_TRANSIT' :
    → Alert bleue : "Ce transfert a déjà été traité." + lien "← Retour aux stocks"


ALERTE 72 HEURES
-----------------
Si Date.now() - transfert.createdAt > 72 * 3600 * 1000 :
  → Banner rouge en haut de la page (hors de la carte) :
    "⚠ Ce transfert est en attente depuis plus de 72 heures. Veuillez le traiter immédiatement."


COMPOSANT EcartAlert — EcartAlert.tsx
---------------------------------------
Affiché si quantiteRecue ≠ quantiteEnvoyee (mis à jour en temps réel).

  interface EcartAlertProps {
    quantiteEnvoyee: number;
    quantiteRecue: number;
    produitNom: string;
  }

  Cas 1 — Réception partielle (quantiteRecue < quantiteEnvoyee) :
    Alert orange :
    "⚠ Écart détecté — Vous avez reçu [X] unités sur [Y] envoyées.
     Différence : -[Z] unités. Une observation est obligatoire."

  Cas 2 — Surplus (quantiteRecue > quantiteEnvoyee) :
    Alert rouge :
    "⚠ Surplus détecté — Vous avez reçu [X] unités alors que [Y] étaient envoyées.
     Différence : +[Z] unités. Une observation est obligatoire."

  Dans les deux cas :
    - Le champ Observations devient requis (validation Zod conditionnelle)
    - Mention : "L'expéditeur sera notifié de cet écart."


BOUTON "SIGNALER UN PROBLÈME"
-------------------------------
Ouvre un Dialog séparé (Button variant="outline") :

  Titre : "Signaler un problème"
  Options radio :
    ○ Produit endommagé à la réception
    ○ Produit différent de celui attendu
    ○ Emballage défectueux
    ○ Autre (champ texte libre)
  Bouton : [ Envoyer le signalement ]
  → POST /api/v1/stocks/transfert/:id/report avec { raison, details? }
  → Toast : "Problème signalé. Le Gérant de Goma a été notifié."
  → Le transfert peut toujours être confirmé après signalement


VALIDATION FORMULAIRE
----------------------
React Hook Form + Zod :
  quantiteRecue  : z.number().int().min(0, 'Quantité ≥ 0').max(99999)
  observations   : z.string().max(500).optional()
    .refine(val => {
      if (quantiteRecue !== transfert.quantiteEnvoyee && !val) return false;
      return true;
    }, { message: 'Observation obligatoire si écart détecté' })


APPELS API
-----------
GET /api/v1/stocks/transfert/:id
  Succès 200 : { transfert: Transfert }
  Erreur 404 : transfert non trouvé

PATCH /api/v1/stocks/transfert/:id/recevoir
  Corps :
    { quantiteRecue: number, observations?: string }
  Succès 200 :
    {
      transfert: { statut: 'RECU', quantiteRecue, updatedAt },
      stockDestinationApres: number,
      statut: StockStatut,
      ecart: number | null,       // null si pas d'écart
    }
  Erreur 403 : utilisateur non Gérant du site destination
  Erreur 409 : transfert déjà reçu ou annulé

POST /api/v1/stocks/transfert/:id/report
  Corps : { raison: string, details?: string }
  Succès 200 : { success: true }


BACK-END — stocks.service.ts : receiveTransfer()
--------------------------------------------------
  1. Charger le transfert, vérifier statut = 'EN_TRANSIT'
  2. Vérifier user.siteId = transfert.siteDestinationId (sauf SUPER_ADMIN)
  3. Calculer l'écart : body.quantiteRecue - transfert.quantiteEnvoyee
  4. Prisma transaction :
     a. UPDATE StockSite destination : quantite += body.quantiteRecue (pas envoyee !)
     b. CREATE MouvementStock : type='TRANSFERT_ARRIVEE', quantite=body.quantiteRecue
     c. UPDATE Transfert : statut='RECU', quantiteRecue, observations
     d. Si écart < 0 → le stock source n'est PAS ajusté (les unités manquantes sont perdues)
  5. Invalider cache Redis des 2 sites
  6. Retourner résultat + statut recalculé du stock destination


TESTS — StockTransferReceivePage.test.tsx
------------------------------------------
  describe('StockTransferReceivePage', () => {
    test('1  — AccessDenied si Gérant d\'un site différent du destinataire')
    test('2  — Page accessible pour Gérant du site destinataire')
    test('3  — Page accessible pour SUPER_ADMIN (tout site)')
    test('4  — Détail du transfert affiché (produit, expéditeur, quantité)')
    test('5  — Bannière 72h visible si délai dépassé')
    test('6  — Quantité pré-remplie avec quantiteEnvoyee')
    test('7  — EcartAlert masqué si quantiteRecue = quantiteEnvoyee')
    test('8  — EcartAlert orange si réception partielle')
    test('9  — EcartAlert rouge si surplus')
    test('10 — Observations requises si écart détecté')
    test('11 — Dialog signalement problème s\'ouvre')
    test('12 — PATCH recevoir appelé avec quantiteRecue + observations')
    test('13 — Toast succès + stockDestinationApres affiché')
    test('14 — Alert bleue si transfert déjà traité (statut ≠ EN_TRANSIT)')
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Guard : AccessDenied si mauvais site destinataire
[ ] Alert si transfert déjà traité (statut ≠ EN_TRANSIT)
[ ] Banner 72h si délai dépassé
[ ] Détail transfert : produit, expéditeur, quantité, date, durée depuis envoi
[ ] Quantité pré-remplie avec quantiteEnvoyee, modifiable
[ ] EcartAlert conditionnel (réception partielle vs surplus) avec message distinct
[ ] Observations obligatoires si écart
[ ] Dialog "Signaler un problème" avec options radio
[ ] PATCH /api/v1/stocks/transfert/:id/recevoir : transaction atomique Prisma
[ ] Le stock destination incrémenté de quantiteRecue (pas quantiteEnvoyee)
[ ] Les 2 caches Redis invalidés (source + destination)
[ ] npm run test — 14 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 6 / 7 — SCR-022 : ALERTES ET SEUILS STOCK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : TechShop Manager
Fichier cible principal : apps/client/src/pages/stocks/StockAlertsPage.tsx
Route       : /stocks/alerts
Accès       : Protégé — rôle minimum : GERANT
Dépendances : SCR-017 terminé (stocks.api.ts, StockStatusBadge)
              SCR-018 terminé (EditSeuilModal — réutilisé ici)


OBJECTIF
--------
Créer la page de gestion des alertes et seuils de stock (SCR-022). Elle liste
tous les produits en alerte ou en rupture, permet de marquer les produits comme
"En cours de commande" et de modifier les seuils directement depuis la liste.
C'est la page cible du lien "Gérer →" du Dashboard (SCR-003).


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/stocks/StockAlertsPage.tsx           ← CRÉER
2.  apps/client/src/pages/stocks/StockAlertsPage.test.tsx      ← CRÉER
3.  apps/client/src/hooks/useStockAlerts.ts                    ← CRÉER

BACK-END :
4.  apps/server/src/modules/stocks/stocks.controller.ts        ← MODIFIER
5.  apps/server/src/modules/stocks/stocks.service.ts           ← MODIFIER (getAlerts, markOrdering)


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Stocks   Alertes stock                  [Site ▼] [Type ▼]   │
  │                                                                  │
  │  ┌── Résumé ─────────────────────────────────────────────────┐  │
  │  │  🔴 3 produits en RUPTURE · ⚠ 5 produits en ALERTE        │  │
  │  └────────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌─────────────────────────────────────────────────────────────┐ │
  │  │ Produit      │ Site   │ Stock │ Seuil │ Statut  │ Depuis   │ │
  │  │ Actions                                                     │ │
  │  ├──────────────────── fond red-50 ──────────────────────────┤ │
  │  │ Samsung A54  │ Bukavu │   0   │   3   │🔴 Rupture│ 2 jours │ │
  │  │ [🛒 Commander]  [⚙ Modifier seuil]                         │ │
  │  ├──────────────────── fond orange-50 ───────────────────────┤ │
  │  │ iPhone 14    │ Goma   │   2   │   3   │⚠ Alerte │ 5 heures│ │
  │  │ [🛒 En cours de commande ✓]  [⚙ Modifier seuil]           │ │
  │  └─────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ✅ Si aucune alerte : "Tous les stocks sont suffisants."        │
  └──────────────────────────────────────────────────────────────────┘


RÉSUMÉ EN HAUT DE PAGE
------------------------
Deux stat cards côte à côte :
  Ruptures (fond red-100) :
    🔴 [count] produits en RUPTURE
    Sous-texte : "Stock = 0"

  Alertes (fond orange-100) :
    ⚠ [count] produits en ALERTE
    Sous-texte : "Stock ≤ seuil"

Mis à jour automatiquement quand les données chargent.


TABLE DES ALERTES
------------------
Colonnes :
  Produit (SKU + Nom) | Site | Stock actuel | Seuil | Statut (badge) | Depuis | Actions

Colonne "Depuis" :
  Calculé depuis updatedAt du stockSite (date-fns/fr : "2 jours", "5 heures")

Colonne "Actions" (2 boutons par ligne) :

  Bouton [🛒 Commander] :
    - Variante outline, icône ShoppingCart
    - Marque l'alerte comme "en cours de commande" dans Redis
    → PATCH /api/v1/stocks/alertes/:siteId/:produitId/ordering
    - Après succès : le bouton devient [🛒 En cours de commande ✓] (fond vert clair, disabled)
    - L'état "en cours de commande" persiste 24h (TTL Redis)

  Bouton [⚙ Modifier seuil] :
    - Icône Settings, variante ghost
    → Ouvre EditSeuilModal (importé de SCR-018)
    - Après modification → refetch de la liste + invalidation cache dashboard

Tri par défaut : RUPTURE d'abord (stock=0), puis ALERTE (stock > 0 et <= seuil),
  dans chaque groupe tri par "depuis" décroissant (plus ancienne en haut).

Filtres :
  Site : [Tous] | [Goma] | [Bukavu] | [Kinshasa]
    → Masqué pour GERANT (son site uniquement)
  Type : [Tous] | [Ruptures uniquement] | [Alertes uniquement]


ÉTAT VIDE
----------
Si aucune alerte :
  Fond vert clair (green-50), icône CheckCircle2 verte, texte centré :
    "✅ Tous les stocks sont suffisants."
    Sous-texte : "Aucun produit en rupture ni en alerte en ce moment."


HOOK useStockAlerts — useStockAlerts.ts
-----------------------------------------
  export function useStockAlerts(params: AlertQueryParams) {
    // queryKey : ['stock-alerts', params]
    // staleTime : 60 * 1000 (1 minute — données critiques, fraîcheur importante)
    // refetchOnWindowFocus : true
    return { alerts, summary, isLoading, error, refetch };
  }

  interface AlertSummary {
    totalRuptures: number;
    totalAlertes: number;
  }


APPELS API
-----------
GET /api/v1/stocks/alertes
  Query params :
    siteId? : string    (forcé = user.siteId si GERANT)
    type?   : 'ALERTE' | 'RUPTURE'
  Succès 200 :
    {
      alertes: Array<{
        produitId: string,
        produitNom: string,
        sku: string,
        siteId: string,
        siteNom: string,
        stockActuel: number,
        seuilAlerte: number,
        type: 'ALERTE' | 'RUPTURE',
        depuis: string,             // ISO date de la dernière mise à jour
        isOrdering: boolean,        // true si marqué "en cours de commande" en Redis
      }>,
      summary: AlertSummary,
    }

PATCH /api/v1/stocks/alertes/:siteId/:produitId/ordering
  Succès 200 : { success: true, expiresAt: string }   // TTL 24h
  → Stocker en Redis : SET "ordering:{siteId}:{produitId}" true EX 86400


BACK-END — stocks.service.ts : getAlerts()
--------------------------------------------
  1. Si GERANT → forcer siteId = user.siteId
  2. Prisma findMany StockSite WHERE quantite <= seuilAlerte, ORDER BY quantite ASC
  3. Pour chaque résultat → vérifier Redis "ordering:{siteId}:{produitId}"
  4. Calculer summary (count RUPTURE / ALERTE)
  5. Cache Redis 60 secondes : clé stocks:alerts:{siteIds}


TESTS — StockAlertsPage.test.tsx
----------------------------------
  describe('StockAlertsPage', () => {
    test('1  — Accès refusé AGENT → AccessDenied')
    test('2  — Résumé : "3 en rupture · 5 en alerte" affiché')
    test('3  — Ligne rupture en fond red-50')
    test('4  — Ligne alerte en fond orange-50')
    test('5  — Colonne "Depuis" affichée en relatif (date-fns/fr)')
    test('6  — Bouton Commander → PATCH ordering appelé')
    test('7  — Bouton Commander → devient "En cours ✓" après succès')
    test('8  — Bouton Modifier seuil → EditSeuilModal s\'ouvre')
    test('9  — Filtre Type "Ruptures" ne montre que les ruptures')
    test('10 — Filtre Site masqué pour GERANT')
    test('11 — Empty state vert si aucune alerte')
    test('12 — isOrdering=true depuis l\'API → bouton déjà en état "En cours ✓"')
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé AGENT, accordé GERANT+
[ ] Résumé : 2 stat cards ruptures + alertes
[ ] Table triée RUPTURE → ALERTE, puis par ancienneté
[ ] Lignes colorées (red-50 / orange-50) selon le type
[ ] Colonne "Depuis" en temps relatif (date-fns/fr)
[ ] Bouton Commander → PATCH + état "En cours ✓" persisté 24h via Redis
[ ] EditSeuilModal réutilisé depuis SCR-018 (pas recréé)
[ ] Filtre Type (Tous / Ruptures / Alertes) fonctionnel
[ ] Filtre Site masqué pour GERANT
[ ] Empty state vert si aucune alerte
[ ] GET /api/v1/stocks/alertes avec check Redis "ordering"
[ ] PATCH /api/v1/stocks/alertes/.../ordering : SET Redis TTL 24h
[ ] npm run test — 12 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 7 / 7 — SCR-023 : INVENTAIRE PHYSIQUE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : TechShop Manager
Fichier cible principal : apps/client/src/pages/stocks/StockPhysicalInventoryPage.tsx
Route       : /stocks/inventory
Accès       : Protégé — rôle minimum : GERANT
Dépendances : SCR-017 terminé (stocks.api.ts, StockStatusBadge, formatCDF, Pagination)


OBJECTIF
--------
Créer la page d'inventaire physique (SCR-023). Le Gérant saisit les quantités
comptées pour chaque produit de son site. Le système calcule les écarts en temps
réel et génère des mouvements AJUSTEMENT_INVENTAIRE pour corriger le stock système.
C'est une opération critique et irréversible — elle nécessite une confirmation explicite.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/stocks/StockPhysicalInventoryPage.tsx          ← CRÉER
2.  apps/client/src/pages/stocks/StockPhysicalInventoryPage.test.tsx     ← CRÉER
3.  apps/client/src/hooks/usePhysicalInventory.ts                        ← CRÉER
4.  apps/client/src/components/stocks/InventoryResultTable.tsx           ← CRÉER

BACK-END :
5.  apps/server/src/modules/stocks/stocks.controller.ts                  ← MODIFIER
6.  apps/server/src/modules/stocks/stocks.service.ts                     ← MODIFIER (submitInventory)


UI — STRUCTURE VISUELLE — PHASE 1 (Saisie)
--------------------------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Stocks   Inventaire physique — Goma         [ ? Aide ]       │
  │                                                                  │
  │  Date d'inventaire *  [ 13/01/2025 ]   Site : Goma (pré-rempli) │
  │                                                                  │
  │  Progression : ████████░░░░░░  18 / 24 produits comptés         │
  │                                                                  │
  │  [ 🔍 Filtrer par nom ou SKU ]   [ Afficher ▼ : Tous ]          │
  │                                                                  │
  │  SKU      │ Nom produit      │ Stock système │ Compté │  Écart  │
  │  ─────────┼──────────────────┼───────────────┼────────┼─────────│
  │  SAM-A54  │ Samsung A54      │      12       │ [ 10 ] │  -2 🔴  │
  │  APL-14   │ iPhone 14        │       2       │ [  2 ] │   0 ✅  │
  │  JBL-T110 │ Écouteurs JBL    │      45       │ [ 47 ] │  +2 🟡  │
  │  CHG-65W  │ Chargeur 65W     │       0       │ [  - ] │  —      │
  │                                                                  │
  │  Légende : ✅ = 0  🔴 = négatif  🟡 = positif  [ — ] = non compté │
  │                                                                  │
  │         [ ✓ VALIDER L'INVENTAIRE (18 / 24 produits) ]           │
  │         ⚠ Les produits non comptés ne seront pas ajustés.        │
  └──────────────────────────────────────────────────────────────────┘


TABLEAU DE SAISIE ÉDITABLE
----------------------------
Chaque ligne est un produit du site sélectionné.

Colonne "Compté" :
  - Input number, min=0, max=99999, placeholder="—"
  - Pas de valeur par défaut (champ vide = non compté)
  - Sur mobile : large (48px min), type="number", inputMode="numeric"
  - Tabulation entre lignes (tabIndex séquentiel)
  - Mise à jour de la progression à chaque saisie

Colonne "Écart" (calculée en temps réel) :
  écart = compté - stockSystème (si compté renseigné, sinon "—")

  Affichage de l'écart :
    écart = 0  → "0" vert + icône ✅
    écart < 0  → "-X" rouge + icône ↓ (perte)
    écart > 0  → "+X" orange + icône ↑ (surplus)
    non compté → "—" gris

Filtre "Afficher" :
  Tous | Avec écart seulement | Non comptés seulement | OK (écart=0)

Barre de progression :
  Progress shadcn mis à jour en temps réel
  Label : "18 / 24 produits comptés"
  Couleur : bleue (#2E86C1)


LOGIQUE D'ÉTAT LOCAL
----------------------
L'inventaire est géré en état local React (pas de sauvegarde API intermédiaire).
En cas de rechargement de page → les données sont perdues → avertir l'utilisateur.

  // État local
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  // key = produitId, value = quantité comptée (null = non compté)

Persistance temporaire dans sessionStorage :
  - Sauvegarder counts à chaque modification (JSON.stringify)
  - Au montage : restaurer depuis sessionStorage si clé = "inventory_{siteId}_{date}"
  - Nettoyer sessionStorage après validation réussie

Alerte navigation :
  useBeforeUnload : si counts non vide et inventaire non validé :
    → window.confirm : "L'inventaire en cours sera perdu. Quitter quand même ?"


CONFIRMATION AVANT VALIDATION
-------------------------------
Dialog de confirmation obligatoire :

  Titre : "Valider l'inventaire physique ?"
  Corps :
    "Cette action est IRRÉVERSIBLE. Les stocks du site Goma seront
    ajustés selon les quantités comptées."

    Résumé des écarts :
      Produits comptés     : 18 sur 24
      Produits avec écart  : 4
      Ajustements positifs : +2 (surplus)
      Ajustements négatifs : -7 (pertes)
      Produits non comptés : 6 (non ajustés)

    Champ de confirmation texte :
      "Tapez VALIDER pour confirmer"
      → Input text → disabled le bouton tant que value ≠ "VALIDER"

  Boutons : [ Annuler ] [ ✓ VALIDER L'INVENTAIRE ] (rouge, requis texte correct)


UI — PHASE 2 (Résultat post-validation)
-----------------------------------------
Remplacer le tableau de saisie par le tableau de résultats.

COMPOSANT InventoryResultTable :

  ┌──────────────────────────────────────────────────────────────────┐
  │              ✅  Inventaire validé avec succès !                 │
  │              Goma — 13 janvier 2025                              │
  │                                                                  │
  │  ┌────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
  │  │ 18 │  │   +9 uts │  │  -11 uts │  │    6     │              │
  │  │cpté│  │ surplus  │  │  pertes  │  │ non cptés│              │
  │  └────┘  └──────────┘  └──────────┘  └──────────┘              │
  │                                                                  │
  │  SKU      │ Nom produit  │ Avant │ Après │ Écart │ Statut       │
  │  SAM-A54  │ Samsung A54  │  12   │  10   │  -2   │ ▼ Ajusté    │
  │  JBL-T110 │ Écouteurs JBL│  45   │  47   │  +2   │ ▲ Ajusté    │
  │  APL-14   │ iPhone 14    │   2   │   2   │   0   │ ✅ Inchangé  │
  │                                                                  │
  │  [ Télécharger le rapport (.csv) ]   [ ← Retour aux stocks ]    │
  └──────────────────────────────────────────────────────────────────┘

Le rapport CSV contient : SKU, Nom, Avant, Après, Écart, Type ajustement.


APPELS API
-----------
GET /api/v1/stocks/inventaire/produits
  Query params : { siteId: string }
  Succès 200 :
    {
      produits: Array<{
        produitId: string,
        sku: string,
        nom: string,
        categorie: string,
        stockSysteme: number,    // stock actuel en base
      }>,
      total: number,
    }

POST /api/v1/stocks/inventaire
  Corps :
    {
      siteId: string,
      dateInventaire: string,   // ISO date
      lignes: Array<{
        produitId: string,
        quantiteComptee: number,
      }>
      // Seules les lignes avec quantiteComptee renseignée sont envoyées
    }
  Succès 200 :
    {
      ajustements: Array<{
        produitId: string,
        produitNom: string,
        sku: string,
        avant: number,
        apres: number,
        ecart: number,
      }>,
      totalAjustements: number,
      totalSurplus: number,
      totalPertes: number,
      nonComptes: number,
    }
  Erreur 400 : aucune ligne fournie
  Erreur 409 : un inventaire a déjà été soumis pour ce site dans les 24h


BACK-END — stocks.service.ts : submitInventory()
--------------------------------------------------
  1. Si GERANT → forcer siteId = user.siteId
  2. Vérifier qu'aucun inventaire récent (< 24h) pour ce site
     (Redis : GET "inventory_lock:{siteId}")
  3. Prisma transaction (pour chaque ligne) :
     a. GET stockSite actuel (quantiteAvant)
     b. UPDATE StockSite : quantite = ligne.quantiteComptee
     c. CREATE MouvementStock : type='AJUSTEMENT_INVENTAIRE',
        quantite = ecart (positif ou négatif)
  4. SET Redis "inventory_lock:{siteId}" EX 86400 (24h)
  5. Retourner le rapport d'ajustements


HOOK usePhysicalInventory — usePhysicalInventory.ts
------------------------------------------------------
  export function usePhysicalInventory(siteId: string) {
    const productsQuery = useQuery({
      queryKey: ['inventory-products', siteId],
      queryFn: () => stocksApi.getPhysicalInventoryProducts(siteId),
      staleTime: 0,               // toujours fresh pour l'inventaire
      refetchOnWindowFocus: false, // éviter les rechargements intempestifs
    });

    const submitMutation = useMutation({
      mutationFn: stocksApi.submitPhysicalInventory,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stocks'] });
        queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        sessionStorage.removeItem(`inventory_${siteId}_${date}`);
      },
    });

    return { products, isLoading, submitInventory, isSubmitting, result };
  }


TESTS — StockPhysicalInventoryPage.test.tsx
--------------------------------------------
  describe('StockPhysicalInventoryPage', () => {
    describe('Accès et initialisation', () => {
      test('1  — Accès refusé AGENT → AccessDenied')
      test('2  — Liste des produits chargée et affichée')
      test('3  — Champs comptage vides par défaut (placeholder "—")')
    })

    describe('Saisie et calcul écarts', () => {
      test('4  — Écart "0 ✅" si quantité comptée = stock système')
      test('5  — Écart "-2 🔴" si quantité comptée < stock système')
      test('6  — Écart "+2 🟡" si quantité comptée > stock système')
      test('7  — "—" si ligne non comptée')
      test('8  — Progression : "18 / 24" après saisie de 18 lignes')
      test('9  — Filtre "Avec écart" ne montre que les lignes avec écart ≠ 0')
      test('10 — Persistance sessionStorage : données restaurées après rechargement simulé')
      test('11 — useBeforeUnload : confirmation demandée si données non validées')
    })

    describe('Validation', () => {
      test('12 — Dialog de confirmation s\'ouvre au clic Valider')
      test('13 — Résumé dans la dialog : comptés, écarts positifs, négatifs')
      test('14 — Bouton "VALIDER" disabled tant que texte "VALIDER" non saisi')
      test('15 — POST inventaire appelé avec les lignes comptées seulement')
      test('16 — Erreur 409 (inventaire récent) : message explicatif affiché')
    })

    describe('Résultat', () => {
      test('17 — InventoryResultTable affichée après validation réussie')
      test('18 — 4 stat cards (comptés, surplus, pertes, non comptés)')
      test('19 — Tableau ajustements avec avant/après/écart')
      test('20 — Bouton téléchargement CSV génère le rapport')
      test('21 — Cache invalidé (stocks + stock-alerts + dashboard)')
    })
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé AGENT, accordé GERANT+
[ ] Tableau de saisie : tous les produits du site, inputs tabulables
[ ] Colonne Écart calculée en temps réel (0 ✅ / négatif 🔴 / positif 🟡 / — gris)
[ ] Barre de progression mise à jour à chaque saisie
[ ] Filtre "Afficher" : Tous / Avec écart / Non comptés / OK
[ ] Persistance sessionStorage (restauration si rechargement)
[ ] Alerte useBeforeUnload si données non sauvegardées
[ ] Dialog confirmation : résumé des écarts + texte "VALIDER" requis
[ ] POST /api/v1/stocks/inventaire : transaction Prisma par lot, un mouvement par ligne
[ ] Verrou Redis 24h pour éviter double inventaire
[ ] InventoryResultTable : 4 stat cards + tableau + export CSV
[ ] Caches invalidés (stocks + stock-alerts + dashboard)
[ ] npm run test — 21 tests passent, couverture ≥ 75%
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. RÈGLE D'OR DU STOCK — Atomicité :
   → Toute modification de stock (entrée, sortie, transfert, ajustement) doit
     être encapsulée dans une transaction Prisma qui crée SIMULTANÉMENT :
       a. La mise à jour du StockSite (quantite)
       b. Le MouvementStock (ENTREE / SORTIE / TRANSFERT / AJUSTEMENT)
     → Jamais l'un sans l'autre. Un stock sans trace de mouvement est une anomalie.

2. TRANSFERT — Règle du stock différé :
   → À l'INITIATION : stock source DÉCRÉMENTÉ immédiatement.
   → À la RÉCEPTION : stock destination INCRÉMENTÉ avec quantiteRecue (pas envoyee).
   → Si quantiteRecue < quantiteEnvoyee → les unités manquantes sont une perte.
     Le stock source N'EST PAS ajusté pour récupérer les manquants.
   → Un transfert non réceptionné après 72h déclenche une alerte automatique
     (job CRON côté serveur — à implémenter dans un module scheduler NestJS).

3. INVENTAIRE PHYSIQUE — Verrou de sécurité :
   → Un seul inventaire physique par site par 24h (verrou Redis).
   → Les lignes non saisies sont IGNORÉES (stock non modifié pour ces produits).
   → La confirmation textuelle ("VALIDER") est obligatoire — UX intentionnelle
     pour éviter les validations accidentelles sur une opération irréversible.

4. SEUILS D'ALERTE — Calcul et invalidation :
   → getStockStatut() est la SEULE source de calcul du statut (OK/ALERTE/RUPTURE).
   → Le statut n'est JAMAIS stocké en base — toujours calculé à la volée.
   → Après toute modification de stock ou de seuil → invalider le cache Redis
     du dashboard (les KPI "alertes stock" dépendent de ce calcul).

5. OFFLINE — Règle du module Stocks :
   → SCR-017 (liste inventaire) : affichage en cache Dexie possible (lecture seule)
   → SCR-018 (détail produit) : affichage en cache Dexie possible (lecture seule)
   → SCR-019 (entrée stock) : NÉCESSITE internet — désactiver le bouton si offline
   → SCR-020 (transfert) : NÉCESSITE internet — désactiver le bouton si offline
   → SCR-021 (réception) : NÉCESSITE internet — désactiver le bouton si offline
   → SCR-022 (alertes) : affichage en cache Dexie possible, actions nécessitent internet
   → SCR-023 (inventaire) : NÉCESSITE internet — page entière désactivée si offline

6. CACHE REDIS — Stratégie :
   → stocks:inventory:{siteId}:{hash(params)} — TTL 60s
   → stocks:alerts:{siteIds}                  — TTL 60s
   → ordering:{siteId}:{produitId}            — TTL 24h (marquage "en commande")
   → inventory_lock:{siteId}                  — TTL 24h (verrou inventaire physique)
   → Toute mutation invalide le(s) cache(s) concerné(s) immédiatement.

7. PERMISSIONS TABLEAU — Rappel :
   → AGENT : accès /stocks en lecture seule, boutons Entrée/Transfert MASQUÉS
   → GERANT : toutes les actions mais sur son site uniquement (forcé serveur)
   → DIR_REGIONAL : lecture multi-sites, pas d'actions d'écriture
   → SUPER_ADMIN : toutes les actions sur tous les sites
   → Jamais désactiver un bouton inaccessible — le MASQUER complètement.
```

---

*TechShop Manager — Prompts Développement Module Stocks SCR-017 à SCR-023 — Goma, RDC — v1.0 — 2025*
