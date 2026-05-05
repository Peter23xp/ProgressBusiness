# 🛒 PROGRESS BUSINESS — PROMPTS DE DÉVELOPPEMENT
## Module VENTES | Écrans SCR-012 à SCR-016 | 5 écrans

> **MODE D'EMPLOI :**
> Ce fichier contient **5 prompts indépendants**, un par écran du module Ventes.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Le module Clients (SCR-005 à SCR-011) doit être TERMINÉ avant de commencer ce module.

---

## CONTEXTE GLOBAL (rappel rapide pour chaque prompt)

```
Projet      : Progress Business — Système de Gestion Commercial Multi-Sites
Stack       : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State       : Zustand (auth + cart + UI) + TanStack Query v5 (serveur)
Offline     : Dexie.js (IndexedDB) + Service Worker (Workbox)
Backend     : Node.js + NestJS + Prisma ORM + PostgreSQL 15 + Redis 7
Tests       : Vitest + Testing Library (front) | Jest + Supertest (back)
Palette     : Bleu foncé #1E3A5F (primary) | Bleu accent #2E86C1 | Blanc #FFFFFF
              Vert #1A6B3A (succès/actif) | Orange #E65100 (alerte) | Rouge #B71C1C (danger)
Monorepo    : apps/client + apps/server + packages/shared
Devise      : Franc Congolais (CDF) — format : 1 200 000 CDF (séparateur espace)
Sites       : Goma (siège), Bukavu, Kinshasa
Impression  : Imprimante thermique ESC/POS 80mm et 58mm (via navigateur ou USB)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 5 — SCR-012 : INTERFACE DE CAISSE (POS)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : Progress Business
Fichier cible: apps/client/src/pages/sales/PosPage.tsx
Route        : /sales/pos
Accès        : Authentifié — rôle AGENT minimum
Rôle minimum : AGENT | GERANT | SUPER_ADMIN
Dépendances  : Module Auth terminé (useAuth, api.ts, ProtectedRoute)
               Module Clients terminé (types Client, hook useClientSearch)


OBJECTIF
--------
Créer l'interface de caisse Point Of Sale (POS) complète (SCR-012).
C'est l'écran le PLUS UTILISÉ de l'application — il doit être ultra-rapide,
intuitif et fonctionner en mode hors-ligne (ventes enregistrées localement
puis synchronisées à la reconnexion).

L'écran est divisé en deux panneaux côte à côte :
  - Panneau gauche (60%) : recherche et catalogue de produits
  - Panneau droit  (40%) : panier + client + paiement


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/sales/PosPage.tsx                    ← CRÉER (composant principal)
2.  apps/client/src/pages/sales/PosPage.test.tsx               ← CRÉER (tests Vitest)
3.  apps/client/src/components/sales/ProductSearchPanel.tsx    ← CRÉER (panneau produits)
4.  apps/client/src/components/sales/CartPanel.tsx             ← CRÉER (panneau panier)
5.  apps/client/src/components/sales/CartItem.tsx              ← CRÉER (ligne article panier)
6.  apps/client/src/components/sales/ClientSelector.tsx        ← CRÉER (sélection client POS)
7.  apps/client/src/components/sales/PaymentSection.tsx        ← CRÉER (section paiement)
8.  apps/client/src/components/sales/FidelityBadge.tsx         ← CRÉER (badge remise fidélité)
9.  apps/client/src/stores/cart.store.ts                       ← CRÉER (store Zustand panier)
10. apps/client/src/hooks/useProductSearch.ts                  ← CRÉER (hook recherche produits)
11. apps/client/src/hooks/usePosClient.ts                      ← CRÉER (hook client POS)
12. apps/client/src/hooks/useSaleSubmit.ts                     ← CRÉER (hook soumission vente)
13. apps/client/src/lib/pos-offline.ts                         ← CRÉER (ventes offline Dexie)
14. apps/client/src/lib/currency.ts                            ← CRÉER (utils formatage CDF)
15. packages/shared/src/types/ventes.types.ts                  ← CRÉER (interfaces TypeScript)

BACK-END :
16. apps/server/src/modules/ventes/ventes.module.ts            ← CRÉER
17. apps/server/src/modules/ventes/ventes.controller.ts        ← CRÉER
18. apps/server/src/modules/ventes/ventes.service.ts           ← CRÉER
19. apps/server/src/modules/ventes/dto/create-vente.dto.ts     ← CRÉER
20. apps/server/src/modules/produits/produits.controller.ts    ← VÉRIFIER / COMPLÉTER


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
Layout global : flex row, hauteur 100vh, pas de scroll vertical sur le conteneur.
Header de la page : bandeau 48px fixe en haut.

  ┌──────────────────────────────────────────────────────────────────────┐
  │  CAISSE — Goma          Vendeur : Jean-Pierre B.    [Fermer caisse]  │  ← header 48px
  ├──────────────────────────────────────────────────────────────────────┤
  │                                    │                                 │
  │  PANNEAU GAUCHE (60%)              │  PANNEAU DROIT (40%)            │
  │                                    │                                 │
  │  [ 🔍 Rechercher un produit...   ] │  ┌───────────────────────────┐  │
  │                                    │  │  PANIER (3 articles)       │  │
  │  ┌──────────────────────────────┐  │  │                            │  │
  │  │ Samsung Galaxy A54           │  │  │  Samsung A54       ×1      │  │
  │  │ SAM-A54 | Smartphones        │  │  │  450 000 CDF    [−][+][🗑] │  │
  │  │ 450 000 CDF | Stock : 12 [+] │  │  │  ─────────────────────     │  │
  │  └──────────────────────────────┘  │  │  Chargeur 65W      ×2      │  │
  │  ┌──────────────────────────────┐  │  │   56 000 CDF    [−][+][🗑] │  │
  │  │ iPhone 14                    │  │  │  ─────────────────────     │  │
  │  │ APL-14  | Smartphones        │  │  │  JBL T110          ×1      │  │
  │  │ 1 200 000 CDF | Stock : 2    │  │  │   35 000 CDF    [−][+][🗑] │  │
  │  │ ⚠️ Stock faible              │  │  │                            │  │
  │  └──────────────────────────────┘  │  │  Sous-total : 541 000 CDF  │  │
  │  ┌──────────────────────────────┐  │  ├───────────────────────────┤  │
  │  │ Chargeur rapide 65W          │  │  │ CLIENT                     │  │
  │  │ CHG-65W | Accessoires        │  │  │ [ 🔍 Nom ou téléphone... ] │  │
  │  │ 28 000 CDF | Stock : 30  [+] │  │  │ > BAHATI Jean-Pierre       │  │
  │  └──────────────────────────────┘  │  │   ■ Or | 2 450 pts         │  │
  │                                    │  │   🏷 Remise : -27 050 CDF  │  │
  │  [Catégorie ▼] [Tous les stocks]   │  ├───────────────────────────┤  │
  │                                    │  │ PAIEMENT                   │  │
  │                                    │  │ Sous-total :  541 000 CDF  │  │
  │                                    │  │ Remise Or :  −27 050 CDF   │  │
  │                                    │  │ ━━━━━━━━━━━━━━━━━━━━━━━━   │  │
  │                                    │  │ TOTAL :      513 950 CDF   │  │
  │                                    │  │                            │  │
  │                                    │  │ [Cash] [M-Pesa] [Virement] │  │
  │                                    │  │ Montant reçu : [________]  │  │
  │                                    │  │ Monnaie :      73 950 CDF  │  │
  │                                    │  │                            │  │
  │                                    │  │ [ ✓ VALIDER LA VENTE ]     │  │
  └────────────────────────────────────┴──┴───────────────────────────┘


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Input (+ SearchIcon lucide)      → barre de recherche produits et client
- Card, CardContent                → cartes produits dans le catalogue
- Badge                            → stock, catégorie, niveau fidélité, remise
- Button (variant="default")       → ajouter produit [+], valider vente
- Button (variant="outline")       → modes de paiement (Cash / M-Pesa / Virement)
- Button (variant="ghost", size="icon") → [−] [+] quantité, [🗑] supprimer
- Separator                        → séparateurs dans le panier
- ScrollArea                       → zone scrollable des produits (panneau gauche)
- ScrollArea                       → zone scrollable du panier
- Select                           → filtre catégorie
- Alert, AlertDescription          → erreur stock insuffisant, erreur réseau
- Dialog, DialogContent            → modal confirmation vente, modal vente hors-ligne
- Skeleton                         → chargement des produits
- Toast (Sonner)                   → confirmations et erreurs


STORE ZUSTAND — cart.store.ts
------------------------------
Interface TypeScript complète du store panier :

  // packages/shared/src/types/ventes.types.ts
  export interface CartItem {
    produitId: string;
    sku: string;
    nom: string;
    categorie: string;
    prixUnitaire: number;          // en CDF
    quantite: number;
    stockDisponible: number;       // stock actuel sur ce site
    sousTotal: number;             // prixUnitaire × quantite (calculé)
  }

  export interface CartClient {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    niveauFidelite: 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE';
    pointsFidelite: number;
    remisePct: number;             // 0 | 3 | 5 | 8 selon le niveau
    remiseMontant: number;         // calculé : montantBrut × remisePct / 100
  }

  // apps/client/src/stores/cart.store.ts
  interface CartState {
    // Données du panier
    items: CartItem[];
    client: CartClient | null;
    modePaiement: 'CASH' | 'MPESA' | 'AIRTEL_MONEY' | 'VIREMENT' | null;
    montantRecu: number;           // si CASH : montant donné par le client
    appliquerRemiseFidelite: boolean;

    // Totaux calculés (computed — jamais stockés directement)
    montantBrut: number;           // somme des sousTotal
    remiseMontant: number;         // si client + fidélité activée
    montantNet: number;            // montantBrut - remiseMontant
    monnaieARendre: number;        // montantRecu - montantNet (si CASH)

    // État UI
    isSubmitting: boolean;
    lastVenteId: string | null;    // après soumission réussie

    // Actions
    addItem: (produit: Produit, quantite?: number) => void;
    removeItem: (produitId: string) => void;
    updateQuantite: (produitId: string, quantite: number) => void;
    setClient: (client: CartClient | null) => void;
    setModePaiement: (mode: CartState['modePaiement']) => void;
    setMontantRecu: (montant: number) => void;
    toggleRemiseFidelite: () => void;
    clearCart: () => void;
    resetAfterSale: () => void;
  }

Règles du store :
  ✓ montantBrut, remiseMontant, montantNet sont des getters computed (Zustand)
  ✓ addItem vérifie que quantite ≤ stockDisponible avant d'ajouter
  ✓ Si l'article existe déjà → incrémenter la quantité (pas dupliquer)
  ✓ Si quantite === 0 → supprimer l'article automatiquement
  ✓ clearCart et resetAfterSale effacent aussi le client et le mode de paiement
  ✓ Le panier est persisté dans Dexie (table currentCart) pour résister aux refreshs
  ✓ Le panier Dexie est rechargé au montage de PosPage (hydratation)


PANNEAU GAUCHE — ProductSearchPanel.tsx
-----------------------------------------
Fonctionnalité principale : recherche de produits en temps réel.

Barre de recherche :
  - Placeholder : "Rechercher par nom ou SKU..."
  - Debounce : 300ms avant envoi de la requête
  - Raccourci clavier : focus automatique au chargement de la page (autoFocus)
  - Raccourci clavier : Escape → vider le champ
  - Input de type "search" (affiche le bouton × natif pour effacer)

Filtres complémentaires (sous la barre de recherche) :
  - Select [Catégorie ▼] : Tous | Smartphones | Accessoires | Audio | Informatique | Autres
  - Badge cliquable [Stock disponible] pour filtrer uniquement les articles en stock

Résultats — carte produit :
  - Chaque produit affiché dans une Card avec :
      Ligne 1 : Nom du produit (text-sm font-semibold)
      Ligne 2 : SKU en monospace + séparateur | + Catégorie (text-xs text-muted)
      Ligne 3 : Prix en CDF (text-base font-bold couleur #1E3A5F) + Stock badge
  - Badge stock coloré :
      Stock > seuil   → Badge vert "Stock : 12"
      0 < stock ≤ seuil → Badge orange "⚠ 2"
      Stock = 0        → Badge rouge "Rupture" + bouton [+] disabled
  - Bouton [+] à droite de chaque carte → ajoute 1 unité au panier
  - Clic sur la carte entière → ouvre un mini Dialog avec :
      Quantité à ajouter (input number, min=1, max=stockDisponible)
      Bouton "Ajouter au panier"
  - Hover sur la carte → légère ombre + cursor pointer

Skeleton pendant le chargement :
  - Afficher 6 cartes skeleton (Skeleton shadcn) pendant la requête API

État vide :
  - Aucun résultat : "Aucun produit trouvé pour 'iPhone 15'. Vérifiez le SKU."
  - Si recherche vide : afficher les 8 derniers produits vendus (historique local Dexie)


HOOK useProductSearch — useProductSearch.ts
---------------------------------------------
  export function useProductSearch(siteId: string) {
    // Paramètres
    const [query, setQuery] = useState('');
    const [categorie, setCategorie] = useState<string>('');
    const [stockOnly, setStockOnly] = useState(false);

    // TanStack Query avec debounce 300ms
    const { data, isLoading, isError } = useQuery({
      queryKey: ['produits', 'search', siteId, debouncedQuery, categorie, stockOnly],
      queryFn: () => produitsApi.search({ q: debouncedQuery, siteId, categorie, stockOnly }),
      enabled: debouncedQuery.length >= 1 || categorie !== '',
      staleTime: 30_000,          // 30 secondes (les stocks changent souvent)
      gcTime: 60_000,
    });

    // Cache offline : si navigator.onLine === false → interroger Dexie.produits
    // Sinon → requête API normale

    return { produits, isLoading, isError, query, setQuery, categorie, setCategorie,
             stockOnly, setStockOnly };
  }


PANNEAU DROIT — CartPanel.tsx + PaymentSection.tsx
----------------------------------------------------
Le panneau droit est une ScrollArea fixe qui ne dépasse jamais la hauteur de l'écran.
Il est divisé en 3 sections séparées par des Separator :

SECTION 1 — PANIER :
  - Header : "PANIER (X articles)" avec badge du nombre d'articles
  - Si panier vide : empty state avec icône ShoppingCart + "Aucun article"
  - Chaque CartItem (CartItem.tsx) affiche :
      Nom du produit (text-sm font-medium, tronqué si trop long)
      SKU en text-xs text-muted-foreground
      Boutons [−] et [+] pour modifier la quantité
        → [−] disabled si quantite === 1
        → [+] disabled si quantite === stockDisponible
      Icône [🗑] pour supprimer l'article (avec confirmation si panier > 3 articles)
      Prix unitaire × quantité = sous-total (text-sm text-right font-semibold)
  - Sous-total affiché en bas de la section (text-base font-bold)

SECTION 2 — CLIENT :
  - Titre "CLIENT"
  - Si aucun client : Alert info (bleu) "Vente sans client — points non attribués"
  - Composant ClientSelector.tsx :
      Input de recherche : "Nom ou téléphone..."
      Résultats en dropdown : nom + téléphone + badge niveau fidélité
      Seulement les clients ACTIF sont cherchés
      Clic sur un client → sélectionner + afficher FidelityBadge
  - Si client sélectionné : FidelityBadge.tsx affiche :
      Nom complet + badge niveau (Bronze/Argent/Or/Platine avec couleur)
      Points fidélité actuels
      Remise applicable : "🏷 Remise Or : -27 050 CDF (5%)"
      Toggle switch "Appliquer la remise fidélité" (activé par défaut)
      Bouton [×] pour désélectionner le client

SECTION 3 — PAIEMENT (PaymentSection.tsx) :
  Récapitulatif financier :
    Sous-total : [montantBrut] CDF
    Remise [niveau] : −[remiseMontant] CDF    ← visible seulement si remise active
    ━━━━━━━━━━━━━━━━━━━━━━
    TOTAL : [montantNet] CDF                  ← texte large, font-bold

  Sélection mode de paiement (3 boutons Button variant="outline" cliquables) :
    [💵 Cash]   [📱 M-Pesa]   [💳 Virement]
    → Le bouton sélectionné passe en variant="default" (plein, bleu foncé)

  Si Cash sélectionné → apparaît :
    Label "Montant reçu par le client"
    Input number (min=montantNet, placeholder=montantNet)
    → Si montantRecu < montantNet → Input en rouge + message "Montant insuffisant"
    → Si montantRecu >= montantNet → Ligne verte : "Monnaie à rendre : [X] CDF"

  Si M-Pesa ou Airtel Money → apparaît :
    Label "Numéro de transaction Mobile Money"
    Input text (placeholder "ex: MPesa-XXXXXXXX")
    Ce champ est optionnel mais recommandé (tooltip ?)

  Bouton [ ✓ VALIDER LA VENTE ] :
    → Plein largeur, variant="default", taille lg, fond #1E3A5F
    → Disabled si :
        panier vide
        OU mode de paiement non sélectionné
        OU (Cash ET montantRecu < montantNet)
    → Pendant la soumission : spinner + "Enregistrement en cours..."


COMPOSANT FidelityBadge — FidelityBadge.tsx
---------------------------------------------
  interface FidelityBadgeProps {
    client: CartClient;
    appliquerRemise: boolean;
    onToggleRemise: () => void;
    onDeselectClient: () => void;
  }

Couleurs des badges niveau :
  BRONZE  → bg-amber-700   text-white
  ARGENT  → bg-gray-400    text-white
  OR      → bg-yellow-500  text-white
  PLATINE → bg-purple-800  text-white


HOOK useSaleSubmit — useSaleSubmit.ts
--------------------------------------
Ce hook gère toute la logique de soumission d'une vente :

  export function useSaleSubmit() {
    const submitSale = async (cart: CartState): Promise<SubmitResult> => {
      // 1. Valider le panier côté client (quantités, totaux)
      // 2. Construire le payload CreateVenteDto
      // 3. Si navigator.onLine === false :
      //      → Appeler posOffline.saveOfflineSale(payload)
      //      → Retourner { success: true, offline: true, localId: uuid }
      // 4. Si online :
      //      → Appeler ventesApi.create(payload)
      //      → Si succès : cartStore.resetAfterSale(), retourner venteId
      //      → Si 409 STOCK_INSUFFISANT : afficher produit(s) concerné(s)
      //      → Si erreur réseau : basculer en offline et appeler posOffline
    }
    return { submitSale, isSubmitting };
  }


GESTION OFFLINE — pos-offline.ts
----------------------------------
  // apps/client/src/lib/pos-offline.ts

  // Table Dexie à ajouter dans db.ts :
  //   pendingSales: '++id, status, siteId, createdAt'

  interface PendingSale {
    id?: number;
    localId: string;             // UUID généré localement
    siteId: string;
    agentId: string;
    payload: string;             // JSON.stringify(CreateVenteDto)
    createdAt: Date;
    status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR';
    errorMessage?: string;
  }

  export async function saveOfflineSale(payload: CreateVenteDto): Promise<string>
  // → Générer un localId (crypto.randomUUID())
  // → Sauvegarder dans Dexie.pendingSales avec status='PENDING'
  // → Décrémencter le stock localement dans Dexie.stocksCache
  // → Retourner le localId

  export async function syncPendingSales(): Promise<SyncResult>
  // → Appelé quand navigator.onLine redevient true
  // → Pour chaque sale PENDING :
  //     1. Marquer status='SYNCING'
  //     2. POST /api/v1/ventes avec le payload
  //     3. Si succès → status='SYNCED', mettre à jour Dexie.stocksCache
  //     4. Si 409 STOCK_INSUFFISANT → status='ERROR', errorMessage explicatif
  //     5. Si autre erreur réseau → laisser PENDING pour réessai
  // → Notifier l'utilisateur via toast : "X ventes synchronisées avec succès"

  export async function getPendingCount(): Promise<number>
  // → COUNT Dexie.pendingSales WHERE status='PENDING' OR 'ERROR'


UTILITAIRES — currency.ts
---------------------------
  // apps/client/src/lib/currency.ts

  export function formatCDF(amount: number): string
  // → Formater en "1 200 000 CDF" (séparateur espace, pas de virgule)
  // → Si amount === 0 → retourner "0 CDF"
  // → Si amount < 0  → retourner "-1 200 CDF" (rouge dans le composant)

  export function parseCDF(str: string): number
  // → Parser "1 200 000" ou "1200000" → 1200000

  export const NIVEAUX_REMISE: Record<NiveauFidelite, number> = {
    BRONZE:  0,
    ARGENT:  3,
    OR:      5,
    PLATINE: 8,
  };

  export function calculerRemise(montantBrut: number, niveau: NiveauFidelite): number
  // → montantBrut × NIVEAUX_REMISE[niveau] / 100 (arrondi à l'entier)


APPELS API
-----------
GET /api/v1/produits/search
  En-têtes : Authorization: Bearer <accessToken>
  Query : { q?: string, siteId: string, categorie?: string, stockOnly?: boolean, limit?: number }
  Succès 200 :
    {
      produits: [
        {
          id: string,
          sku: string,
          nom: string,
          description?: string,
          categorie: string,
          prixVente: number,
          stockDisponible: number,
          seuilAlerte: number,
          statutStock: 'OK' | 'ALERTE' | 'RUPTURE'
        }
      ]
    }

GET /api/v1/clients/search
  Query : { q: string, statut: 'ACTIF', siteId?: string, limit?: number }
  Succès 200 :
    {
      clients: [
        {
          id: string,
          nom: string,
          prenom: string,
          telephone: string,
          niveauFidelite: 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE',
          pointsFidelite: number,
          remisePct: number
        }
      ]
    }

POST /api/v1/ventes
  Corps (CreateVenteDto) :
    {
      clientId?: string,                         // optionnel (vente anonyme)
      siteId: string,
      lignes: [
        {
          produitId: string,
          quantite: number,
          prixUnitaire: number                   // snapshot du prix au moment de la vente
        }
      ],
      modePaiement: 'CASH' | 'MPESA' | 'AIRTEL_MONEY' | 'VIREMENT',
      referenceTransaction?: string,             // N° Mobile Money
      montantRecu?: number,                      // si CASH
      appliquerRemiseFidelite: boolean
    }
  Succès 201 :
    {
      vente: {
        id: string,
        numeroVente: string,                     // ex: "GOM-202501-0047"
        montantBrut: number,
        remiseFidelite: number,
        montantNet: number,
        pointsAttribues?: number,
        createdAt: string
      }
    }
  Erreur 409 :
    {
      error: {
        code: "STOCK_INSUFFISANT",
        message: string,
        produits: [{ produitId, nom, stockActuel, quantiteDemandee }]
      }
    }
  Erreur 403 :
    { error: { code: "CLIENT_NOT_ACTIVE", message: string } }


COMPORTEMENTS ET ÉTATS DE L'ÉCRAN
------------------------------------
État 1 — DÉFAUT (panier vide)
  - Panneau droit : "Aucun article dans le panier" (empty state avec icône)
  - Bouton "VALIDER LA VENTE" disabled
  - Section paiement masquée (affichée uniquement si panier non vide)

État 2 — PANIER AVEC ARTICLES
  - Sous-total mis à jour en temps réel à chaque changement de quantité
  - Total recalculé immédiatement si remise fidélité activée/désactivée

État 3 — CHARGEMENT (soumission de la vente)
  - Spinner sur le bouton "VALIDER LA VENTE"
  - Texte : "Enregistrement en cours..."
  - Toute la section paiement disabled (pointer-events-none + opacity-60)

État 4 — SUCCÈS (vente validée)
  - Toast vert en haut à droite : "Vente GOM-202501-0047 enregistrée ! 500 pts attribués"
  - Dialog modal de confirmation affichant :
      Le numéro de vente
      Le total payé
      Les points attribués (si client sélectionné)
      Boutons : [Imprimer le reçu →] et [Nouvelle vente]
  - Clic "Nouvelle vente" → clearCart() + fermer modal + focus sur la barre de recherche
  - Clic "Imprimer le reçu" → navigate('/sales/:id/receipt') dans un nouvel onglet

État 5 — ERREUR STOCK INSUFFISANT (409)
  - Dialog d'erreur avec la liste des produits concernés :
      "Samsung Galaxy A54 : demandé 3, disponible 1"
  - Bouton "Corriger le panier" → fermer le dialog + focus sur le produit concerné dans le panier
  - Les produits en rupture sont mis en surbrillance rouge dans le panier

État 6 — MODE HORS-LIGNE
  - Bannière orange en haut de l'écran (OfflineBanner depuis Module Auth)
  - Badge "Hors-ligne" à côté du nom de l'agent dans le header
  - Les ventes soumises sont sauvegardées localement (Dexie pendingSales)
  - Toast bleu : "Vente enregistrée localement. Synchronisation en attente."
  - Bouton "VALIDER LA VENTE" reste fonctionnel (pas de blocage offline)
  - Le stock affiché est le stock en cache Dexie (mis à jour à chaque sync)

État 7 — RETOUR EN LIGNE (re-connexion)
  - syncPendingSales() appelé automatiquement
  - Toast vert : "X ventes synchronisées avec succès."
  - Si erreur de sync (stock insuffisant côté serveur) :
      Toast rouge : "1 vente non synchronisée — stock insuffisant. Vérifiez le panier."


BACK-END NESTJS — Module Ventes
---------------------------------
apps/server/src/modules/ventes/dto/create-vente.dto.ts :
  import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
  import { Type } from 'class-transformer';

  class LigneVenteDto {
    @IsString() produitId: string;
    @IsNumber() quantite: number;
    @IsNumber() prixUnitaire: number;
  }

  export class CreateVenteDto {
    @IsString() @IsOptional() clientId?: string;
    @IsString() siteId: string;
    @IsArray() @ValidateNested({ each: true }) @Type(() => LigneVenteDto) lignes: LigneVenteDto[];
    @IsEnum(['CASH','MPESA','AIRTEL_MONEY','VIREMENT']) modePaiement: string;
    @IsString() @IsOptional() referenceTransaction?: string;
    @IsNumber() @IsOptional() montantRecu?: number;
    @IsBoolean() appliquerRemiseFidelite: boolean;
  }

apps/server/src/modules/ventes/ventes.service.ts — méthode create() :
  1. Vérifier les droits : l'agent peut uniquement créer des ventes pour son siteId
  2. Démarrer une transaction Prisma (atomique)
  3. Pour chaque ligne :
     a. Récupérer StockSite.quantite WHERE produitId AND siteId (SELECT FOR UPDATE)
     b. Si quantite < ligne.quantite → collecter l'erreur (ne pas throw encore)
     c. Si toutes les lignes ont du stock → procéder
     d. Sinon → throw ConflictException({ code: 'STOCK_INSUFFISANT', produits: [...] })
  4. Créer la Vente avec toutes ses lignes (Prisma nested write)
  5. Pour chaque ligne : décrémenter StockSite.quantite
  6. Créer un MouvementStock (type SORTIE_VENTE) pour chaque ligne
  7. Si clientId + appliquerRemiseFidelite :
     a. Calculer remiseFidelite (montantBrut × remisePct / 100)
     b. Calculer pointsAttribues (Math.floor(montantNet / 1000))
     c. UPDATE Client.pointsFidelite += pointsAttribues
     d. Créer MouvementPoints (type ACHAT)
     e. Recalculer Client.niveauFidelite selon les seuils configurés
  8. Générer numeroVente : format {SITE_CODE}-{AAAAMM}-{SEQ:04d}
     → SEQ est un compteur mensuel par site (stocké en Redis ou en base)
  9. Retourner la vente créée avec tous les champs


TESTS — PosPage.test.tsx
--------------------------
Créer les tests suivants avec Vitest + @testing-library/react :

  describe('PosPage', () => {
    describe('Recherche produits', () => {
      test('1  — Barre de recherche reçoit le focus au chargement')
      test('2  — Debounce 300ms avant appel API sur frappe')
      test('3  — Affiche les cartes produits avec stock et prix CDF')
      test('4  — Badge RUPTURE sur produit stockDisponible=0, bouton [+] disabled')
      test('5  — Badge ALERTE sur produit stock ≤ seuilAlerte')
      test('6  — Skeleton visible pendant le chargement initial')
      test('7  — Empty state si aucun résultat de recherche')
    })

    describe('Panier', () => {
      test('8  — Clic [+] ajoute un article au panier')
      test('9  — Clic [+] deux fois → quantite=2 (pas de doublon)')
      test('10 — Bouton [−] disabled quand quantite === 1')
      test('11 — Bouton [+] disabled quand quantite === stockDisponible')
      test('12 — Icône [🗑] supprime l\'article du panier')
      test('13 — Sous-total recalculé après chaque modification quantite')
      test('14 — Empty state si panier vide')
    })

    describe('Sélection client et fidélité', () => {
      test('15 — ClientSelector affiche les résultats de recherche client')
      test('16 — Sélection client affiche FidelityBadge avec remise')
      test('17 — Badge niveau OR : remisePct = 5%')
      test('18 — Toggle remise fidélité met à jour le total en temps réel')
      test('19 — Bouton [×] désélectionne le client et retire la remise')
      test('20 — Vente sans client : Alert info "points non attribués" visible')
    })

    describe('Section paiement', () => {
      test('21 — Bouton VALIDER disabled si panier vide')
      test('22 — Bouton VALIDER disabled si mode paiement non sélectionné')
      test('23 — Sélection Cash affiche le champ "Montant reçu"')
      test('24 — Montant reçu < total → input rouge + "Montant insuffisant"')
      test('25 — Montant reçu > total → affiche "Monnaie à rendre : X CDF"')
      test('26 — Mode M-Pesa affiche le champ référence transaction')
    })

    describe('Soumission de vente', () => {
      test('27 — Spinner visible pendant la soumission')
      test('28 — Succès 201 : toast vert + modal de confirmation affiché')
      test('29 — Modal succès affiche le numéro de vente et les points')
      test('30 — "Nouvelle vente" vide le panier et ferme le modal')
      test('31 — Erreur 409 STOCK_INSUFFISANT : dialog avec produits concernés')
      test('32 — Erreur réseau : bascule en mode offline, toast bleu')
    })

    describe('Mode offline', () => {
      test('33 — Soumission offline : vente sauvegardée dans Dexie pendingSales')
      test('34 — Retour en ligne : syncPendingSales() appelé automatiquement')
      test('35 — Stock affiché correspond au cache Dexie en mode offline')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-012
---------------------------------------------
[ ] La page se charge en moins de 2 secondes (mesure avec React DevTools Profiler)
[ ] La recherche produits fonctionne avec debounce 300ms
[ ] Les badges de stock (OK/ALERTE/RUPTURE) sont correctement colorés
[ ] L'ajout au panier ne crée pas de doublon (quantite incrémentée)
[ ] Le total est recalculé en temps réel à chaque modification
[ ] La sélection client affiche la remise fidélité avec le bon pourcentage
[ ] Le toggle remise fidélité met à jour le total immédiatement
[ ] Le mode CASH affiche le calcul de la monnaie à rendre
[ ] Le bouton VALIDER est disabled dans tous les cas invalides
[ ] Une vente réussie vide le panier et affiche le modal de confirmation
[ ] L'erreur 409 affiche les produits concernés sans crasher
[ ] Une vente en mode offline est sauvegardée dans Dexie
[ ] La synchronisation se lance automatiquement au retour en ligne
[ ] Tous les montants sont formatés en CDF avec séparateur espace
[ ] La page est responsive (375px mobile et 1280px desktop)
[ ] npm run test passe : 35 tests PosPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 5 — SCR-013 : HISTORIQUE DES VENTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : Progress Business
Fichier cible: apps/client/src/pages/sales/SalesHistoryPage.tsx
Route        : /sales
Accès        : Authentifié — rôle GERANT minimum
Rôle minimum : GERANT | DIR_REGIONAL | SUPER_ADMIN
Dépendances  : SCR-012 terminé (ventesApi, types Vente, formatCDF)


OBJECTIF
--------
Créer la page d'historique des ventes (SCR-013).
Un tableau paginé et filtrable listant toutes les ventes du site (ou de tous les sites
pour les rôles supérieurs), avec export et navigation vers le détail.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/sales/SalesHistoryPage.tsx             ← CRÉER
2. apps/client/src/pages/sales/SalesHistoryPage.test.tsx        ← CRÉER
3. apps/client/src/components/sales/SalesFiltersBar.tsx         ← CRÉER (barre de filtres)
4. apps/client/src/components/sales/SalesTable.tsx              ← CRÉER (tableau principal)
5. apps/client/src/components/sales/SaleStatusBadge.tsx         ← CRÉER (badge statut)
6. apps/client/src/components/sales/SalesTotalCard.tsx          ← CRÉER (carte total période)
7. apps/client/src/hooks/useSalesHistory.ts                     ← CRÉER (hook TanStack Query)

BACK-END :
8. apps/server/src/modules/ventes/ventes.controller.ts          ← AJOUTER route GET /ventes


UI — STRUCTURE VISUELLE
------------------------
Layout standard : sidebar + zone de contenu principale.

  ┌──────────────────────────────────────────────────────────────────────┐
  │  Historique des ventes                          [ ↓ Exporter ]      │
  ├──────────────────────────────────────────────────────────────────────┤
  │  ┌────────────────────┐ ┌─────────────────┐ ┌────────────────────┐  │
  │  │ CA total           │ │ Nb de ventes    │ │ Panier moyen       │  │
  │  │ 8 475 000 CDF      │ │ 24 ventes       │ │ 353 125 CDF        │  │
  │  └────────────────────┘ └─────────────────┘ └────────────────────┘  │
  ├──────────────────────────────────────────────────────────────────────┤
  │  [Période ▼] [Site ▼] [Mode paiement ▼] [Recherche client/N°...]    │
  ├──────────────────────────────────────────────────────────────────────┤
  │  N° vente       │ Date        │ Client          │ Montant │ Mode │ ☰ │
  │  GOM-202501-047 │ 17/01 14:32 │ BAHATI J.P.     │ 427 500 │ 💵  │ → │
  │  GOM-202501-046 │ 17/01 11:15 │ —               │ 35 000  │ 📱  │ → │
  │  GOM-202501-045 │ 16/01 16:48 │ KAMBALE Marie   │ 850 000 │ 💳  │ → │
  │  ...                                                                 │
  ├──────────────────────────────────────────────────────────────────────┤
  │  < Précédent   Page 1 / 3   Suivant >            50 ventes / page    │
  └──────────────────────────────────────────────────────────────────────┘


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Card, CardContent, CardHeader       → cartes KPI (CA, nb ventes, panier moyen)
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell → tableau principal
- Select                               → filtres Période, Site, Mode paiement
- Input (+ SearchIcon)                 → recherche par client ou numéro de vente
- Button (variant="outline")           → Exporter, Précédent, Suivant
- Badge                                → statut vente (VALIDE/RETOURNEE/ANNULEE)
- Skeleton                             → chargement du tableau
- DateRangePicker                      → filtre de période personnalisée
  (utiliser la lib react-day-picker déjà dans le projet si disponible,
   sinon créer un composant simple avec 2 Input type="date")


BARRE DE FILTRES — SalesFiltersBar.tsx
-----------------------------------------
Filtres disponibles (sur une seule ligne, responsive en colonne sur mobile) :

  Filtre 1 — Période :
    Options : Aujourd'hui | Cette semaine | Ce mois | Mois dernier | Personnalisé
    Si "Personnalisé" → apparaît un DateRangePicker inline (dateDebut + dateFin)
    Valeur par défaut : "Ce mois"

  Filtre 2 — Site :
    Visible seulement pour GERANT (son site uniquement, sélecteur masqué),
    DIR_REGIONAL (ses sites assignés) et SUPER_ADMIN (tous les sites).
    Options dynamiques depuis GET /api/v1/sites

  Filtre 3 — Mode de paiement :
    Options : Tous | Cash | M-Pesa | Airtel Money | Virement

  Filtre 4 — Recherche libre :
    Placeholder : "N° vente ou nom du client..."
    Debounce 400ms

  Bouton [Réinitialiser les filtres] → visible uniquement si au moins un filtre actif
  → Remet tous les filtres à leur valeur par défaut


TABLEAU PRINCIPAL — SalesTable.tsx
-------------------------------------
Colonnes du tableau :
  1. N° de vente     (text-xs font-mono, lien cliquable vers SCR-014)
  2. Date/Heure      (format "17 jan. 14:32" — date-fns/fr)
  3. Agent           (prénom + initiale nom, text-sm)
  4. Client          (nom complet, text-sm; "—" si vente anonyme en italic)
  5. Montant         (formatCDF, text-right font-semibold)
  6. Mode paiement   (icône + libellé court : "💵 Cash" / "📱 M-Pesa" / etc.)
  7. Statut          (SaleStatusBadge)
  8. Actions         (icône ChevronRight → navigate vers SCR-014)

Comportements :
  - Clic sur une ligne entière → navigate(`/sales/${vente.id}`)
  - Tri par colonnes : Date (défaut desc), Montant
  - Les lignes avec statut RETOURNEE ont un fond légèrement rouge (bg-red-50)
  - Les lignes avec statut ANNULEE ont une opacité réduite (opacity-60)

Totaux en bas du tableau (sticky) :
  Si la liste est filtrée : "Affichage de 24 résultats sur 156 ventes totales"
  Total de la sélection courante (page) : "Total page : 1 284 000 CDF"

Skeleton pendant le chargement :
  Afficher 10 lignes skeleton avec les bonnes largeurs de colonnes.

Empty state :
  "Aucune vente trouvée pour la période sélectionnée."
  Si filtre actif : bouton "Réinitialiser les filtres"


COMPOSANT SaleStatusBadge — SaleStatusBadge.tsx
-------------------------------------------------
  interface SaleStatusBadgeProps {
    statut: 'VALIDE' | 'RETOURNEE_PARTIELLE' | 'RETOURNEE' | 'ANNULEE';
  }

Rendu :
  VALIDE              → Badge vert        "✓ Validée"
  RETOURNEE_PARTIELLE → Badge orange      "↩ Part. retournée"
  RETOURNEE           → Badge rouge       "↩ Retournée"
  ANNULEE             → Badge gris        "✗ Annulée"


HOOK useSalesHistory — useSalesHistory.ts
------------------------------------------
  export function useSalesHistory(filters: SalesFilters) {
    // TanStack Query avec pagination côté serveur
    const query = useQuery({
      queryKey: ['ventes', filters],
      queryFn: () => ventesApi.list(filters),
      staleTime: 60_000,           // 1 minute
      placeholderData: keepPreviousData,   // pas de flash pendant changement de page
    });

    // Calcul des KPIs depuis les données paginées côté serveur
    // (les totaux sont retournés par l'API, pas calculés côté client)

    return { ventes, kpis, isLoading, pagination, error };
  }


APPELS API
-----------
GET /api/v1/ventes
  Query :
    siteId?           : string
    dateDebut?        : string (ISO 8601)
    dateFin?          : string (ISO 8601)
    modePaiement?     : string
    search?           : string (numéro vente ou nom client)
    statut?           : string
    agentId?          : string
    page              : number (défaut 1)
    limit             : number (défaut 50)
    sortBy            : 'createdAt' | 'montantNet' (défaut 'createdAt')
    sortOrder         : 'asc' | 'desc' (défaut 'desc')
  Succès 200 :
    {
      ventes: [
        {
          id: string,
          numeroVente: string,
          createdAt: string,
          agent: { id, nom, prenom },
          client?: { id, nom, prenom },
          montantNet: number,
          modePaiement: string,
          statut: 'VALIDE' | 'RETOURNEE_PARTIELLE' | 'RETOURNEE' | 'ANNULEE'
        }
      ],
      meta: {
        total: number,
        page: number,
        limit: number,
        totalPages: number
      },
      kpis: {
        totalCA: number,
        nbVentes: number,
        panierMoyen: number
      }
    }


EXPORT — Bouton "↓ Exporter"
------------------------------
Clic sur le bouton Exporter → ouvre un Popover avec 2 options :
  [📄 Exporter en CSV]   → téléchargement direct (généré côté client depuis les données)
  [📑 Exporter en PDF]   → appel API GET /api/v1/rapports/export + polling

Export CSV côté client :
  - Colonnes : N° Vente, Date, Agent, Client, Montant CDF, Mode Paiement, Statut
  - Utiliser la lib papaparse (déjà dans le projet ou à installer)
  - Nom du fichier : "ventes-progress-business-{AAAAMM}.csv"

Export PDF côté serveur (déclenche SCR-034 en arrière-plan) :
  - POST /api/v1/rapports/export { type: 'VENTES', format: 'PDF', filtres }
  - Polling GET /api/v1/rapports/export/:jobId toutes les 2s
  - Bouton "Exporter" : spinner + "Génération en cours..."
  - Quand READY : téléchargement automatique via window.open(downloadUrl)
  - Timeout 30s → toast erreur "La génération a échoué. Réessayez."


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT INITIAL
  - 3 cartes KPI : skeleton (Card avec Skeleton h-8)
  - Tableau : 10 lignes skeleton

État 2 — LISTE CHARGÉE
  - KPIs calculés et affichés
  - Tableau avec les ventes + pagination

État 3 — CHANGEMENT DE FILTRE
  - keepPreviousData (TanStack Query) : pas de flash — les données précédentes
    restent affichées avec une légère opacité (opacity-70) pendant le rechargement
  - Pagination réinitialisée à la page 1

État 4 — LISTE VIDE
  - Empty state centré avec icône Receipt (lucide-react)
  - Message "Aucune vente pour la période sélectionnée."
  - Bouton "Réinitialiser les filtres" si filtre actif

État 5 — ERREUR API
  - Alert rouge en haut du tableau : "Erreur de chargement — Réessayer"
  - Bouton "Réessayer" → refetch() TanStack Query


TESTS — SalesHistoryPage.test.tsx
-----------------------------------
  describe('SalesHistoryPage', () => {
    test('1  — KPIs CA, nb ventes, panier moyen affichés')
    test('2  — Tableau affiche les colonnes correctes')
    test('3  — Lignes RETOURNEE ont fond rouge')
    test('4  — Filtre Période "Aujourd\'hui" déclenche la bonne query')
    test('5  — Filtre Mode paiement "Cash" filtre la liste')
    test('6  — Recherche libre debounce 400ms avant appel API')
    test('7  — Clic ligne → navigate vers /sales/:id')
    test('8  — Pagination : clic "Suivant" passe à la page 2')
    test('9  — keepPreviousData : pas de flash pendant changement de filtre')
    test('10 — Empty state si aucune vente')
    test('11 — Skeleton visible pendant le chargement')
    test('12 — Filtre Site masqué pour rôle AGENT')
    test('13 — Export CSV déclenche le téléchargement')
    test('14 — Export PDF lance le polling et télécharge quand READY')
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-013
---------------------------------------------
[ ] Les 3 cartes KPI affichent CA total, nb ventes, panier moyen
[ ] Le tableau affiche toutes les colonnes avec le bon formatage
[ ] Les filtres fonctionnent : Période, Site (selon rôle), Mode paiement, Recherche
[ ] La pagination côté serveur fonctionne (changement de page sans rechargement)
[ ] keepPreviousData évite le flash lors du changement de filtre
[ ] Le statut badge (VALIDE/RETOURNEE/ANNULEE) est correctement coloré
[ ] Le filtre Site est masqué pour le rôle AGENT
[ ] L'export CSV télécharge un fichier valide
[ ] L'export PDF lance le polling et télécharge quand prêt
[ ] Clic sur une ligne redirige vers /sales/:id
[ ] npm run test : 14 tests SalesHistoryPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 5 — SCR-014 : DÉTAIL D'UNE VENTE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : Progress Business
Fichier cible: apps/client/src/pages/sales/SaleDetailPage.tsx
Route        : /sales/:id
Accès        : Authentifié — rôle GERANT minimum
Rôle minimum : GERANT | DIR_REGIONAL | SUPER_ADMIN
Dépendances  : SCR-013 terminé (SaleStatusBadge, formatCDF, ventesApi)


OBJECTIF
--------
Créer la page de détail d'une vente (SCR-014).
Vue complète d'une transaction : en-tête, client, lignes d'articles,
récapitulatif financier, informations de paiement.
Donne accès à l'impression du reçu (SCR-015) et à l'initiation d'un retour (SCR-016).


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/sales/SaleDetailPage.tsx              ← CRÉER
2. apps/client/src/pages/sales/SaleDetailPage.test.tsx         ← CRÉER
3. apps/client/src/components/sales/SaleHeader.tsx             ← CRÉER
4. apps/client/src/components/sales/SaleLineItems.tsx          ← CRÉER
5. apps/client/src/components/sales/SaleFinancialSummary.tsx   ← CRÉER
6. apps/client/src/components/sales/SalePaymentInfo.tsx        ← CRÉER
7. apps/client/src/hooks/useSaleDetail.ts                      ← CRÉER

BACK-END :
8. apps/server/src/modules/ventes/ventes.controller.ts         ← AJOUTER route GET /ventes/:id


UI — STRUCTURE VISUELLE
------------------------

  ┌──────────────────────────────────────────────────────────────────────┐
  │  ← Historique   GOM-202501-047 — Vente du 17 jan. 2025 à 14:32     │
  │                                               [ Imprimer ] [Retour] │
  ├──────────────────────────────────────────────────────────────────────┤
  │  ┌─────────────────────────────────┐  ┌─────────────────────────┐   │
  │  │ INFORMATIONS GÉNÉRALES          │  │ PAIEMENT                │   │
  │  │ N° Vente   : GOM-202501-047     │  │ Mode    : 💵 Cash       │   │
  │  │ Date       : 17/01/2025 14:32   │  │ Montant : 513 950 CDF   │   │
  │  │ Agent      : Jean-Pierre B.     │  │ Reçu    : 550 000 CDF   │   │
  │  │ Site       : Progress Business Goma      │  │ Monnaie : 36 050 CDF    │   │
  │  │ Statut     : ✓ Validée         │  └─────────────────────────┘   │
  │  └─────────────────────────────────┘                                │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │ CLIENT                                                       │    │
  │  │ BAHATI Jean-Pierre | +243 81 234 5678 | Niveau : ■ Or        │    │
  │  │ Points avant : 2 450 pts → Points après : 2 963 pts (+513)   │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ARTICLES ACHETÉS                                                    │
  │  ┌──────────────┬───────────────────┬──────┬─────────┬──────────┐   │
  │  │ SKU          │ Produit           │ Qté  │ P.U.    │ Sous-tot.│   │
  │  ├──────────────┼───────────────────┼──────┼─────────┼──────────┤   │
  │  │ SAM-A54      │ Samsung Galaxy A54│  1   │ 450 000 │ 450 000  │   │
  │  │ CHG-65W      │ Chargeur 65W      │  2   │  28 000 │  56 000  │   │
  │  │ JBL-T110     │ Écouteurs JBL     │  1   │  35 000 │  35 000  │   │
  │  ├──────────────┴───────────────────┴──────┴─────────┼──────────┤   │
  │  │                                        Sous-total  │ 541 000  │   │
  │  │                                   Remise Or (5%)   │ −27 050  │   │
  │  │                                        ━━━━━━━━━   │━━━━━━━━━ │   │
  │  │                                   TOTAL PAYÉ       │ 513 950  │   │
  │  └─────────────────────────────────────────────────────┴──────────┘  │
  │                                                                       │
  │  [ ↩ Initier un retour ]   (visible si < 7 jours ET statut VALIDE)  │
  └──────────────────────────────────────────────────────────────────────┘


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Card, CardContent, CardHeader, CardTitle  → sections (Infos, Paiement, Client)
- Table, TableHeader, TableBody etc.        → tableau des articles
- Badge                                     → statut, niveau fidélité
- Button (variant="outline")                → "← Historique", "Imprimer"
- Button (variant="destructive")            → "Initier un retour" (rouge)
- Separator                                 → séparations visuelles
- Skeleton                                  → état de chargement
- Alert                                     → bannière "vente retournée" si applicable


COMPOSANT SaleHeader — SaleHeader.tsx
---------------------------------------
  interface SaleHeaderProps {
    vente: VenteDetail;
    onPrint: () => void;
    onRetour: () => void;
    canRetour: boolean;    // false si > 7 jours ou statut !== VALIDE
  }

Contenu :
  - Breadcrumb : "← Historique des ventes"
  - Titre : N° de vente en police monospace + date formatée
  - Bouton [Imprimer le reçu] → navigate(`/sales/${id}/receipt`, { target: '_blank' })
  - Bouton [Initier un retour] visible uniquement si canRetour === true
    → Couleur destructive (rouge) avec icône RotateCcw (lucide-react)
    → Au clic : navigate(`/sales/returns?venteId=${id}`)


COMPOSANT SaleLineItems — SaleLineItems.tsx
---------------------------------------------
Tableau des articles achetés :
  - Colonnes : SKU | Produit | Quantité | Prix Unitaire | Sous-total
  - Toutes les valeurs monétaires formatées avec formatCDF
  - Ligne de sous-total
  - Ligne de remise fidélité (si applicable) en vert
  - Ligne de total net en gras et taille légèrement plus grande

Comportement :
  - Si la vente a des retours partiels → les lignes retournées affichent
    le texte barré avec badge orange "↩ Retourné: X unité(s)"


COMPOSANT SaleFinancialSummary — SaleFinancialSummary.tsx
-----------------------------------------------------------
  interface SaleFinancialSummaryProps {
    montantBrut: number;
    remiseFidelite: number;
    montantNet: number;
    niveauFidelite?: string;
    pointsAttribues?: number;
  }

Rendu en tableau à 2 colonnes (libellé / valeur) :
  Sous-total brut       : [montantBrut] CDF
  Remise [Niveau] (X%)  : −[remiseFidelite] CDF     ← en vert, visible si > 0
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TOTAL PAYÉ            : [montantNet] CDF            ← bold, text-lg


COMPOSANT SalePaymentInfo — SalePaymentInfo.tsx
-------------------------------------------------
Carte avec les infos de paiement :
  - Mode de paiement avec icône (💵/📱/💳)
  - Référence transaction (si M-Pesa ou Virement)
  - Montant reçu + Monnaie rendue (si Cash)

Mapping icônes modes de paiement :
  CASH          → Banknote  (lucide-react)
  MPESA         → Smartphone (lucide-react)
  AIRTEL_MONEY  → Smartphone (lucide-react)
  VIREMENT      → CreditCard (lucide-react)


HOOK useSaleDetail — useSaleDetail.ts
--------------------------------------
  export function useSaleDetail(id: string) {
    const { data, isLoading, isError } = useQuery({
      queryKey: ['ventes', id],
      queryFn: () => ventesApi.getById(id),
      staleTime: 5 * 60_000,           // 5 minutes (une vente ne change quasiment plus)
      retry: 2,
    });

    // Calculer canRetour :
    const canRetour = useMemo(() => {
      if (!data?.vente) return false;
      const daysSince = differenceInDays(new Date(), new Date(data.vente.createdAt));
      return daysSince <= 7 && data.vente.statut === 'VALIDE';
    }, [data]);

    return { vente, isLoading, isError, canRetour };
  }


APPELS API
-----------
GET /api/v1/ventes/:id
  Params : { id: string }
  Succès 200 :
    {
      vente: {
        id: string,
        numeroVente: string,
        createdAt: string,
        statut: 'VALIDE' | 'RETOURNEE_PARTIELLE' | 'RETOURNEE' | 'ANNULEE',
        agent: { id, nom, prenom },
        site: { id, nom, ville },
        client?: {
          id, nom, prenom, telephone,
          niveauFidelite, pointsAvant, pointsApres, pointsAttribues
        },
        lignes: [
          {
            id: string,
            produit: { id, sku, nom, categorie },
            quantite: number,
            prixUnitaire: number,
            sousTotal: number,
            retournee: boolean,
            quantiteRetournee: number
          }
        ],
        montantBrut: number,
        remiseFidelite: number,
        montantNet: number,
        modePaiement: string,
        referenceTransaction?: string,
        montantRecu?: number,
        monnaieRendue?: number
      }
    }
  Erreur 404 :
    { error: { code: 'VENTE_NOT_FOUND' } }


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - SaleHeader : skeleton (Card skeleton)
  - SaleLineItems : tableau avec 3 lignes skeleton
  - SalePaymentInfo : Card skeleton

État 2 — CHARGÉE
  - Affichage de tous les composants avec les vraies données

État 3 — ERREUR 404
  - Page d'erreur centrée : icône Receipt barré + "Vente introuvable"
  - Bouton "← Retour à l'historique" → navigate('/sales')

État 4 — VENTE RETOURNÉE/ANNULÉE
  - Alert jaune en haut de page (vente retournée partielle)
    "↩ Cette vente a été partiellement retournée le [date]. Montant remboursé : [X] CDF"
  - Alert rouge (vente entièrement retournée ou annulée)
    "Cette vente a été annulée."
  - Bouton [Initier un retour] masqué

État 5 — RETOUR POSSIBLE (< 7 jours ET statut VALIDE)
  - Bouton rouge [↩ Initier un retour] visible en bas de page
  - Tooltip au survol : "Un retour est possible jusqu'au [date + 7j]"


TESTS — SaleDetailPage.test.tsx
----------------------------------
  describe('SaleDetailPage', () => {
    test('1  — Skeleton visible pendant le chargement')
    test('2  — Page 404 si vente inexistante')
    test('3  — N° vente, date, agent, site affichés correctement')
    test('4  — Client affiché avec niveau fidélité et points attribués')
    test('5  — Tableau des articles avec SKU, nom, quantité, prix, sous-total')
    test('6  — Remise fidélité en vert si applicable')
    test('7  — Total payé en gras, formaté en CDF')
    test('8  — Mode Cash : montant reçu et monnaie rendue affichés')
    test('9  — Mode M-Pesa : référence transaction affichée')
    test('10 — Bouton "Initier un retour" visible si vente < 7 jours ET VALIDE')
    test('11 — Bouton "Initier un retour" masqué si vente > 7 jours')
    test('12 — Bouton "Initier un retour" masqué si statut RETOURNEE')
    test('13 — Alert jaune si vente RETOURNEE_PARTIELLE')
    test('14 — Bouton "Imprimer" navigue vers /sales/:id/receipt')
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-014
---------------------------------------------
[ ] La page se charge avec les vraies données de la vente
[ ] Les composants SaleHeader, SaleLineItems, SaleFinancialSummary, SalePaymentInfo fonctionnent
[ ] La page 404 s'affiche si la vente n'existe pas
[ ] Les lignes partiellement retournées sont barrées avec badge orange
[ ] Le bouton "Initier un retour" respecte la règle des 7 jours et le statut
[ ] L'Alert s'affiche correctement pour les ventes retournées/annulées
[ ] Tous les montants sont en CDF formaté
[ ] npm run test : 14 tests SaleDetailPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 5 — SCR-015 : REÇU / FACTURE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : Progress Business
Fichier cible: apps/client/src/pages/sales/ReceiptPage.tsx
Route        : /sales/:id/receipt
Accès        : Authentifié — tout rôle ayant accès à la vente
Rôle minimum : AGENT | GERANT | SUPER_ADMIN
Dépendances  : SCR-014 terminé (useSaleDetail, VenteDetail type, formatCDF)


OBJECTIF
--------
Créer la page de reçu / facture (SCR-015).
Cette page s'ouvre dans un NOUVEL ONGLET (target="_blank") depuis SCR-012 (après vente)
ou depuis SCR-014 (bouton Imprimer).
Elle est optimisée pour l'IMPRESSION (@media print) et compatible avec les imprimantes
thermiques ESC/POS 58mm et 80mm via le navigateur.
Elle permet également d'envoyer le récapitulatif par SMS au client.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/sales/ReceiptPage.tsx                  ← CRÉER
2. apps/client/src/pages/sales/ReceiptPage.test.tsx             ← CRÉER
3. apps/client/src/components/sales/ThermalReceipt.tsx          ← CRÉER (layout reçu)
4. apps/client/src/components/sales/ReceiptActions.tsx          ← CRÉER (boutons actions)
5. apps/client/src/styles/thermal-print.css                     ← CRÉER (@media print)

BACK-END :
6. apps/server/src/modules/ventes/ventes.controller.ts          ← AJOUTER POST /ventes/:id/sms-recu


UI — STRUCTURE VISUELLE
------------------------
La page en mode ÉCRAN (avant impression) :

  ┌─────────────────────────────────────────────────────────────────┐
  │  ← Retour à la vente                                           │
  │  [ 🖨 Imprimer le reçu ]   [ 📱 Envoyer par SMS ]              │
  ├─────────────────────────────────────────────────────────────────┤
  │                                                                 │
  │  ┌─────────────────────────────────────┐                       │
  │  │           PROGRESS BUSINESS          │                       │
  │  │          Progress Business Goma              │                       │
  │  │      Q. Himbi, Av. des Volcans      │                       │
  │  │        Goma, Nord-Kivu, RDC         │                       │
  │  │       Tél : +243 81 XXX XXXX        │                       │
  │  │─────────────────────────────────────│                       │
  │  │  N° Reçu  : GOM-202501-047          │                       │
  │  │  Date     : 17/01/2025 14:32        │                       │
  │  │  Agent    : Jean-Pierre B.          │                       │
  │  │─────────────────────────────────────│                       │
  │  │  CLIENT : BAHATI Jean-Pierre        │                       │
  │  │─────────────────────────────────────│                       │
  │  │  Samsung A54            1 × 450 000 │                       │
  │  │  Chargeur 65W           2 ×  28 000 │                       │
  │  │  JBL T110               1 ×  35 000 │                       │
  │  │─────────────────────────────────────│                       │
  │  │  Sous-total :             541 000   │                       │
  │  │  Remise Or (5%) :         -27 050   │                       │
  │  │  ═════════════════════════════════  │                       │
  │  │  TOTAL :                  513 950   │                       │
  │  │  Payé en : Cash                     │                       │
  │  │  Reçu    :                550 000   │                       │
  │  │  Monnaie :                 36 050   │                       │
  │  │─────────────────────────────────────│                       │
  │  │  Points gagnés : +513 pts           │                       │
  │  │  Solde points  : 2 963 pts (■ Or)   │                       │
  │  │─────────────────────────────────────│                       │
  │  │  Merci pour votre achat !           │                       │
  │  │  Progress Business — www.progress_business.cd │                       │
  │  └─────────────────────────────────────┘                       │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘


COMPOSANT ThermalReceipt — ThermalReceipt.tsx
----------------------------------------------
Ce composant génère un reçu au format thermique, avec un layout adapté
aussi bien à l'écran qu'à l'impression 80mm (ou 58mm).

  interface ThermalReceiptProps {
    vente: VenteDetail;
    siteInfo: SiteInfo;       // { nom, adresse, telephone, ville }
    format: '80mm' | '58mm';  // paramètre query de l'URL (?format=80mm)
  }

Règles de mise en page :
  ✓ Largeur fixe : 72 caractères (80mm) ou 32 caractères (58mm) en monospace
  ✓ Pas de CSS complexe — uniquement des styles inline simples et compatibles print
  ✓ Police : "Courier New" ou monospace system
  ✓ Séparateurs : ligne de tirets "─────────────────"
  ✓ Séparateur double : "═══════════════════" pour le total
  ✓ Alignement des prix : right-align avec espacement manuel
  ✓ Si vente anonyme → ne pas afficher la section "CLIENT"
  ✓ Si aucun point attribué → ne pas afficher la section "Points gagnés"

Pied de page du reçu :
  "Merci pour votre achat !"
  "Ce reçu est votre preuve d'achat."
  "Progress Business — Goma, RDC"


FICHIER thermal-print.css
---------------------------
Créer le CSS d'impression spécifique :

  /* apps/client/src/styles/thermal-print.css */

  @media print {
    /* Masquer tout sauf le reçu */
    body * { visibility: hidden; }
    #thermal-receipt, #thermal-receipt * { visibility: visible; }
    #thermal-receipt {
      position: absolute;
      left: 0;
      top: 0;
    }

    /* Format 80mm */
    @page {
      size: 80mm auto;           /* largeur fixe, hauteur auto */
      margin: 2mm;
    }

    /* Éviter les coupures dans les lignes */
    .receipt-line { page-break-inside: avoid; }

    /* Masquer les boutons d'action */
    .receipt-actions { display: none !important; }
  }

  /* Aperçu écran du format thermique */
  #thermal-receipt {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    line-height: 1.4;
    max-width: 300px;            /* 80mm approximatif en écran */
    margin: 0 auto;
    padding: 8px;
    border: 1px solid #e0e0e0;
    background: white;
  }


COMPOSANT ReceiptActions — ReceiptActions.tsx
----------------------------------------------
Barre d'actions en haut de la page (masquée à l'impression) :

  interface ReceiptActionsProps {
    venteId: string;
    clientTelephone?: string;    // pour pré-remplir le SMS
    onPrint: () => void;
    onSendSms: (telephone: string) => Promise<void>;
  }

Boutons :
  1. [← Retour à la vente] → navigate(`/sales/${venteId}`)
  2. [🖨 Imprimer le reçu] → appeler window.print()
     → Déclenche le CSS @media print (masque tout sauf le reçu)
  3. [📱 Envoyer par SMS]
     → Dialog shadcn avec :
         Champ téléphone pré-rempli si clientTelephone fourni
         Placeholder : "+243 XX XXX XXXX"
         Bouton [Envoyer le SMS]
         État chargement : spinner + "Envoi en cours..."
         État succès : toast vert "SMS envoyé au +243 81 *** ****"
         État erreur : toast rouge avec message explicatif

Sélecteur de format (discret, petit) :
  Toggle pill : [80mm] [58mm]
  → Change le format du reçu en temps réel
  → Persisté dans localStorage (préférence de l'agent)


PARAMÈTRES D'URL SUPPORTÉS
----------------------------
  /sales/:id/receipt                   → format 80mm (défaut)
  /sales/:id/receipt?format=58mm       → format 58mm
  /sales/:id/receipt?autoprint=true    → déclenche window.print() au chargement


APPELS API
-----------
GET /api/v1/ventes/:id
  → Réutiliser useSaleDetail (déjà créé en SCR-014, cache TanStack Query)
  → Pas de nouvel appel API si la vente est déjà en cache

GET /api/v1/sites/:id
  → Récupérer les infos du site (nom, adresse, téléphone) pour l'en-tête du reçu
  → En-tête : Authorization: Bearer <accessToken>
  Succès 200 : { site: { id, nom, adresse, telephone, ville } }

POST /api/v1/ventes/:id/sms-recu
  Corps : { telephone: string }         // format +243XXXXXXXXX
  Succès 200 : { success: true, messageId: string, maskedPhone: string }
  Erreur 400 : { error: { code: 'INVALID_PHONE' } }
  Erreur 429 : { error: { code: 'TOO_MANY_SMS', retryAfter: number } }
  Erreur 500 : { error: { code: 'SMS_SEND_FAILED' } }

Back-end — POST /api/v1/ventes/:id/sms-recu :
  1. Récupérer la vente avec ses lignes
  2. Générer un résumé SMS compact (max 160 chars) :
     "Progress Business Goma | Recu N°GOM-202501-047 | Total: 513 950 CDF | Merci !"
  3. Envoyer via SmsService (Africa's Talking) au numéro fourni
  4. Logger l'envoi dans la table SmsLog (venteId, telephone, status, sentAt)
  5. Vérifier le rate limit : max 3 SMS par vente par heure (Redis)


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - Skeleton du reçu (quelques lignes grises)
  - Boutons d'action : spinner + disabled

État 2 — REÇU AFFICHÉ
  - ThermalReceipt avec toutes les informations
  - ReceiptActions disponibles

État 3 — AUTOPRINT (?autoprint=true)
  - Attendre que les données soient chargées (isLoading === false)
  - Puis appeler window.print() automatiquement après 500ms
  - Toast informatif : "Impression en cours..."

État 4 — ENVOI SMS EN COURS
  - Dialog ouvert avec spinner + "Envoi en cours..."
  - Bouton "Envoyer le SMS" disabled

État 5 — SMS ENVOYÉ
  - Dialog fermé
  - Toast vert : "SMS envoyé au +243 81 *** ****"

État 6 — ERREUR SMS
  - Toast rouge : "Échec de l'envoi. Vérifiez le numéro et réessayez."


TESTS — ReceiptPage.test.tsx
------------------------------
  describe('ReceiptPage', () => {
    test('1  — Reçu affiché avec toutes les informations de la vente')
    test('2  — Section CLIENT masquée si vente anonyme')
    test('3  — Section Points masquée si aucun point attribué')
    test('4  — Format 58mm via paramètre URL ?format=58mm')
    test('5  — Format 80mm par défaut')
    test('6  — Préférence de format persistée en localStorage')
    test('7  — window.print() appelé au clic sur "Imprimer"')
    test('8  — ?autoprint=true déclenche window.print() automatiquement')
    test('9  — Dialog SMS s\'ouvre avec téléphone client pré-rempli')
    test('10 — SMS envoyé : toast vert avec numéro masqué')
    test('11 — Erreur SMS : toast rouge avec message')
    test('12 — Erreur 429 SMS : message retryAfter affiché')
    test('13 — Bouton retour redirige vers /sales/:id')
    test('14 — Skeleton visible pendant le chargement de la vente')
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-015
---------------------------------------------
[ ] Le reçu s'affiche correctement avec toutes les infos de la vente
[ ] La section CLIENT est masquée pour les ventes anonymes
[ ] L'impression @media print masque tout sauf le reçu
[ ] Le format 80mm et 58mm sont fonctionnels et commutables
[ ] Le sélecteur de format est persisté en localStorage
[ ] L'autoprint via ?autoprint=true fonctionne
[ ] Le Dialog SMS s'ouvre avec le téléphone pré-rempli
[ ] L'envoi SMS affiche un toast vert/rouge selon le résultat
[ ] La police monospace est utilisée pour un alignement correct
[ ] npm run test : 14 tests ReceiptPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 5 / 5 — SCR-016 : RETOURS ET AVOIRS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : Progress Business
Fichier cible: apps/client/src/pages/sales/ReturnPage.tsx
Route        : /sales/returns?venteId=:id
Accès        : Authentifié — rôle GERANT minimum
Rôle minimum : GERANT | SUPER_ADMIN
Dépendances  : SCR-014 terminé (useSaleDetail, SaleLineItems type, formatCDF)


OBJECTIF
--------
Créer la page de traitement des retours de marchandises (SCR-016).
Un retour peut être PARTIEL (certains articles) ou TOTAL (tous les articles).
Le remboursement peut se faire en cash, crédit Mobile Money, ou avoir en points.
À la validation, le stock est réapprovisionné automatiquement et les points
de fidélité éventuellement déduits.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/sales/ReturnPage.tsx                   ← CRÉER
2. apps/client/src/pages/sales/ReturnPage.test.tsx              ← CRÉER
3. apps/client/src/components/sales/ReturnItemsList.tsx         ← CRÉER
4. apps/client/src/components/sales/ReturnSummary.tsx           ← CRÉER
5. apps/client/src/hooks/useReturnForm.ts                       ← CRÉER

BACK-END :
6. apps/server/src/modules/ventes/ventes.controller.ts          ← AJOUTER POST /ventes/:id/retour
7. apps/server/src/modules/ventes/ventes.service.ts             ← AJOUTER méthode createRetour()


UI — STRUCTURE VISUELLE
------------------------

  ┌──────────────────────────────────────────────────────────────────────┐
  │  ← Retour à la vente GOM-202501-047                                 │
  │                                                                      │
  │  RETOUR DE MARCHANDISE                                               │
  │  Vente du 17/01/2025 — BAHATI Jean-Pierre                           │
  ├──────────────────────────────────────────────────────────────────────┤
  │  ARTICLES À RETOURNER                                                │
  │                                                                      │
  │  ☐  Samsung Galaxy A54   ×1   450 000 CDF   [Qté retournée : 1 ▼]   │
  │  ☑  Chargeur rapide 65W  ×2    56 000 CDF   [Qté retournée : 1 ▼]   │
  │  ☐  Écouteurs JBL T110   ×1    35 000 CDF   [Qté retournée : 1 ▼]   │
  │                                                                      │
  │  ☑ Tout sélectionner                                                 │
  ├──────────────────────────────────────────────────────────────────────┤
  │  MOTIF DU RETOUR *                                                   │
  │  [ Produit défectueux ▼ ]                                           │
  │  Description (optionnel) [______________________________________]    │
  ├──────────────────────────────────────────────────────────────────────┤
  │  MODE DE REMBOURSEMENT *                                             │
  │  ○ Remboursement Cash      (27 500 CDF à remettre au client)        │
  │  ○ Crédit Mobile Money     (+243 81 234 5678)                       │
  │  ○ Avoir en points fidélité (275 pts ajoutés au compte)             │
  ├──────────────────────────────────────────────────────────────────────┤
  │  RÉCAPITULATIF DU RETOUR                                             │
  │  Articles retournés   : 1 article (Chargeur 65W × 1)               │
  │  Montant remboursé    : 27 500 CDF    ← calculé sur lignes cochées  │
  │  Points à déduire     : 27 pts        ← calculé proportionnellement │
  │  Stock réapprovisionné: Chargeur 65W (+1 sur Goma)                  │
  ├──────────────────────────────────────────────────────────────────────┤
  │  ☐ Je confirme que le(s) produit(s) retourné(s) sont bien récupérés │
  │                                                                      │
  │               [ ↩ VALIDER LE RETOUR ]                               │
  └──────────────────────────────────────────────────────────────────────┘


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Checkbox                              → sélection des articles à retourner
- Select                                → quantité retournée par article, motif
- RadioGroup, RadioGroupItem            → mode de remboursement
- Textarea                              → description du motif
- Button (variant="destructive")        → "VALIDER LE RETOUR"
- Card, CardContent, CardHeader         → sections (articles, motif, remboursement)
- Alert, AlertDescription               → résumé + avertissement (déduction points)
- Badge                                 → statut article (Retournable / Déjà retourné)
- Separator                             → séparations de sections
- Dialog                                → modal de confirmation finale


COMPOSANT ReturnItemsList — ReturnItemsList.tsx
-------------------------------------------------
  interface ReturnItemsListProps {
    lignes: LigneVente[];
    selectedLines: ReturnSelection;       // Map<produitId, quantiteRetournee>
    onToggleLine: (produitId: string) => void;
    onChangeQuantite: (produitId: string, quantite: number) => void;
    onSelectAll: () => void;
  }

  interface LigneVente {
    id: string;
    produit: { id: string; sku: string; nom: string };
    quantite: number;
    quantiteRetournee: number;           // déjà retournée dans le passé
    prixUnitaire: number;
    sousTotal: number;
    retournee: boolean;                  // si déjà totalement retournée
  }

Règles d'affichage :
  ✓ Si ligne.retournee === true → Checkbox disabled + badge orange "Déjà retourné"
  ✓ Si ligne.quantiteRetournee > 0 → badge info "X déjà retourné(s)"
  ✓ Le select [Qté retournée] va de 1 à (ligne.quantite - ligne.quantiteRetournee)
  ✓ Si toutes les lignes sont déjà retournées → Alert rouge "Toutes les lignes
    de cette vente ont déjà été retournées."
  ✓ "Tout sélectionner" coche toutes les lignes retournables avec leur quantité max


COMPOSANT ReturnSummary — ReturnSummary.tsx
--------------------------------------------
  interface ReturnSummaryProps {
    selectedLines: ReturnSelection;
    lignes: LigneVente[];
    client?: CartClient;
    modeRemboursement: ReturnMode;
    vente: VenteDetail;
  }

Calculs effectués dans ce composant :
  - montantARembouser :
      Somme (quantiteRetournee × prixUnitaire) pour chaque ligne sélectionnée
      Si la vente avait une remise fidélité → appliquer la remise proportionnellement
      (ex: remise 5% → déduire 5% du montant retourné)
  - pointsADeduire :
      Math.floor(montantARembouser / 1000)  (même ratio que l'attribution)
      → Visible seulement si client + pointsAttribues > 0 sur la vente

  - stockReapprovisionne :
      Liste "{nomProduit} (+X sur {nomSite})" pour chaque ligne sélectionnée


HOOK useReturnForm — useReturnForm.ts
--------------------------------------
  export function useReturnForm(venteId: string) {
    // State
    const [selectedLines, setSelectedLines]   = useState<ReturnSelection>(new Map());
    const [motif, setMotif]                   = useState<ReturnMotif>('');
    const [motifDescription, setMotifDescription] = useState('');
    const [modeRemboursement, setModeRemboursement] = useState<ReturnMode | null>(null);
    const [confirmed, setConfirmed]           = useState(false);
    const [isSubmitting, setIsSubmitting]     = useState(false);

    // Validation
    const isValid = useMemo(() => {
      return (
        selectedLines.size > 0 &&
        motif !== '' &&
        modeRemboursement !== null &&
        confirmed
      );
    }, [selectedLines, motif, modeRemboursement, confirmed]);

    // Soumission
    const submitReturn = async (): Promise<void> => { ... }

    return {
      selectedLines, setSelectedLines,
      motif, setMotif,
      motifDescription, setMotifDescription,
      modeRemboursement, setModeRemboursement,
      confirmed, setConfirmed,
      isValid, isSubmitting, submitReturn
    };
  }


MOTIFS DE RETOUR DISPONIBLES
------------------------------
  const MOTIFS_RETOUR = [
    { value: 'DEFECTUEUX',         label: 'Produit défectueux / endommagé' },
    { value: 'MAUVAISE_COMMANDE',  label: 'Erreur de commande' },
    { value: 'NON_CONFORME',       label: 'Produit non conforme à la description' },
    { value: 'CHANGE_AVIS',        label: 'Changement d\'avis du client' },
    { value: 'AUTRE',              label: 'Autre (préciser dans la description)' },
  ] as const;

  Si motif === 'AUTRE' → champ description devient OBLIGATOIRE (required=true)


MODES DE REMBOURSEMENT
------------------------
  type ReturnMode = 'CASH' | 'MOBILE_MONEY' | 'AVOIR_POINTS';

  CASH :
    → Afficher le montant à remettre physiquement au client : "[montantARembouser] CDF"
    → Case à cocher supplémentaire : "☐ Remboursement cash effectué"

  MOBILE_MONEY :
    → Afficher le téléphone du client (si client sélectionné, pré-rempli)
    → Champ pour saisir le numéro MM si non pré-rempli
    → Champ pour la référence de transaction (optionnel)

  AVOIR_POINTS :
    → Visible uniquement si un client est rattaché à la vente
    → Afficher le calcul : "[montantARembouser / 1000] pts ajoutés au compte"
    → Les points de la vente originale sont d'abord déduits puis les points avoir ajoutés


MODAL DE CONFIRMATION FINALE
------------------------------
Avant de valider, afficher un Dialog de confirmation avec :
  Titre : "Confirmer le retour"
  Corps :
    "Vous êtes sur le point de retourner [X article(s)] pour [montant] CDF."
    Si client : "Les points de fidélité seront ajustés : −[X] pts + [Y] pts avoir."
    "Cette action est irréversible."
  Boutons :
    [Annuler] → fermer le dialog
    [Confirmer le retour] → variant destructive → soumettre


APPELS API
-----------
POST /api/v1/ventes/:id/retour
  Params : { id: string }
  Corps (CreateRetourDto) :
    {
      lignes: [
        {
          ligneVenteId: string,
          produitId: string,
          quantiteRetournee: number
        }
      ],
      motif: 'DEFECTUEUX' | 'MAUVAISE_COMMANDE' | 'NON_CONFORME' | 'CHANGE_AVIS' | 'AUTRE',
      motifDescription?: string,
      modeRemboursement: 'CASH' | 'MOBILE_MONEY' | 'AVOIR_POINTS',
      telephoneMM?: string,              // si MOBILE_MONEY
      referenceTransactionMM?: string    // si MOBILE_MONEY
    }
  Succès 201 :
    {
      retour: {
        id: string,
        numeroRetour: string,            // ex: "RET-GOM-202501-047-01"
        montantRembourse: number,
        pointsDeduits: number,
        pointsAvoir?: number,
        stocksReapprovisionnes: [{ produitNom, quantite, siteNom }]
      }
    }
  Erreur 400 :
    { error: { code: 'INVALID_RETURN_QUANTITY', message: string } }
  Erreur 403 :
    { error: { code: 'RETURN_PERIOD_EXPIRED', maxDays: 7, daysSince: number } }
  Erreur 409 :
    { error: { code: 'ALREADY_RETURNED', lignesIds: string[] } }

Back-end — ventes.service.ts — méthode createRetour() :
  1. Vérifier que la vente existe et appartient au siteId de l'agent
  2. Vérifier que daysSince(vente.createdAt) <= 7 (règle des 7 jours)
  3. Pour chaque ligne du retour :
     a. Vérifier que ligneVenteId existe et appartient à la vente
     b. Vérifier que quantiteRetournee <= (quantite - quantiteDejaRetournee)
  4. Démarrer une transaction Prisma
  5. Créer l'entité Retour avec toutes ses lignes
  6. Mettre à jour statut de la vente :
     → Si toutes lignes retournées → RETOURNEE
     → Sinon → RETOURNEE_PARTIELLE
  7. Pour chaque ligne retournée :
     → Incrémenter StockSite.quantite (réapprovisionner sur le site d'origine)
     → Créer MouvementStock (type RETOUR_CLIENT)
     → Mettre à jour LigneVente.quantiteRetournee
  8. Si client + modeRemboursement = CASH ou MOBILE_MONEY :
     → Calculer pointsADed = Math.floor(montantRembourse / 1000)
     → UPDATE Client.pointsFidelite -= pointsADed
     → Créer MouvementPoints (type RETOUR, valeur négative)
  9. Si modeRemboursement = AVOIR_POINTS :
     → Calculer pointsAvoir = montantRembourse (1 CDF = 1 point pour les avoirs)
     → UPDATE Client.pointsFidelite += pointsAvoir
     → Créer MouvementPoints (type AVOIR_RETOUR)
  10. Générer numeroRetour : "RET-" + numeroVente + "-XX"
  11. Retourner le retour créé avec tous les détails


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - Skeleton des lignes d'articles
  - Section motif et remboursement masquées

État 2 — PRÊT À REMPLIR
  - Toutes les sections visibles
  - Bouton "VALIDER LE RETOUR" disabled

État 3 — VALIDATION (progression)
  - ✓ Au moins 1 article sélectionné → section Motif s'active
  - ✓ Motif sélectionné → section Remboursement s'active
  - ✓ Mode de remboursement sélectionné → Resumé mis à jour
  - ✓ Case confirmation cochée → bouton "VALIDER" s'active

État 4 — SOUMISSION
  - Modal de confirmation affiché
  - Clic "Confirmer" : spinner + "Traitement en cours..."
  - Toute la page disabled (pointer-events-none)

État 5 — SUCCÈS
  - Toast vert : "Retour RET-GOM-202501-047-01 enregistré. Stock réapprovisionné."
  - Navigate vers /sales/{venteId} (la vente affiche maintenant RETOURNEE_PARTIELLE)

État 6 — ERREUR (articles déjà retournés)
  - Alert rouge : "Ces articles ont déjà été retournés : [liste]"
  - Décocher automatiquement les lignes concernées dans la liste

État 7 — ERREUR (période dépassée)
  - Pleine page Alert rouge : "Retour impossible — délai de 7 jours dépassé
    (vente effectuée il y a 9 jours)."
  - Bouton "← Retour à la vente" uniquement (plus de formulaire)


TESTS — ReturnPage.test.tsx
------------------------------
  describe('ReturnPage', () => {
    describe('Liste des articles', () => {
      test('1  — Articles affichés avec checkbox, quantité et prix')
      test('2  — Lignes déjà retournées : checkbox disabled + badge orange')
      test('3  — "Tout sélectionner" coche toutes les lignes retournables')
      test('4  — Select quantité limité à (quantite - quantiteDejaRetournee)')
    })

    describe('Motif et remboursement', () => {
      test('5  — Section Motif activée uniquement après sélection d\'au moins 1 article')
      test('6  — Si motif AUTRE → champ description obligatoire')
      test('7  — Mode remboursement AVOIR_POINTS masqué si vente anonyme')
      test('8  — Mode MOBILE_MONEY affiche le champ téléphone pré-rempli')
    })

    describe('Résumé du retour', () => {
      test('9  — Montant à rembourser calculé correctement (avec remise déduite)')
      test('10 — Points à déduire calculés proportionnellement')
      test('11 — Récapitulatif stock réapprovisionné affiché')
    })

    describe('Validation et soumission', () => {
      test('12 — Bouton "VALIDER" disabled si formulaire incomplet')
      test('13 — Modal de confirmation s\'ouvre au clic sur "VALIDER"')
      test('14 — Annuler le modal ferme sans soumettre')
      test('15 — Soumission réussie : toast vert + redirect vers la vente')
      test('16 — Erreur 409 : lignes déjà retournées décochées automatiquement')
    })

    describe('Garde-fous', () => {
      test('17 — Erreur 403 période dépassée : formulaire masqué + message erreur')
      test('18 — Vente avec toutes lignes retournées : Alert rouge + formulaire vide')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-016
---------------------------------------------
[ ] Les articles de la vente s'affichent avec les checkboxes et selects de quantité
[ ] Les articles déjà retournés ont la checkbox disabled et un badge
[ ] "Tout sélectionner" fonctionne correctement
[ ] La section Motif s'active seulement après sélection d'un article
[ ] Si motif "Autre" → description devient obligatoire
[ ] Le mode AVOIR_POINTS est masqué pour les ventes anonymes
[ ] Le résumé (montant, points, stock) est calculé correctement en temps réel
[ ] Le bouton VALIDER respecte toutes les conditions de validation
[ ] Le modal de confirmation s'affiche avec les bonnes informations
[ ] Après validation : toast vert + redirection vers la vente mise à jour
[ ] L'erreur "période dépassée" (403) affiche le message adapté sans formulaire
[ ] npm run test : 18 tests ReturnPage.test.tsx ✓
```

---

## RÉCAPITULATIF DES 5 PROMPTS — MODULE VENTES

| N° | Écran   | Route                  | Fichier principal                         | Priorité | Durée est. |
|----|---------|------------------------|-------------------------------------------|----------|------------|
| 1  | SCR-012 | /sales/pos             | pages/sales/PosPage.tsx                   | **P0**   | ~5-6h      |
| 2  | SCR-013 | /sales                 | pages/sales/SalesHistoryPage.tsx          | **P0**   | ~3-4h      |
| 3  | SCR-014 | /sales/:id             | pages/sales/SaleDetailPage.tsx            | **P0**   | ~2-3h      |
| 4  | SCR-015 | /sales/:id/receipt     | pages/sales/ReceiptPage.tsx               | **P1**   | ~2-3h      |
| 5  | SCR-016 | /sales/returns         | pages/sales/ReturnPage.tsx                | **P1**   | ~3-4h      |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Prompt 1 (SCR-012 Caisse POS)
  ↓ Crée : cart.store.ts, useProductSearch, useSaleSubmit, pos-offline.ts,
            currency.ts, CartPanel, PaymentSection, FidelityBadge,
            types ventes.types.ts, ventesApi (POST /ventes)
  ↓
Prompt 2 (SCR-013 Historique ventes)
  ↓ Utilise : ventesApi, formatCDF, types Vente
  ↓ Crée    : SalesFiltersBar, SalesTable, SaleStatusBadge, useSalesHistory
  ↓
Prompt 3 (SCR-014 Détail vente)
  ↓ Utilise : useSaleDetail, SaleStatusBadge, formatCDF
  ↓ Crée    : SaleHeader, SaleLineItems, SaleFinancialSummary, SalePaymentInfo
  ↓
Prompt 4 (SCR-015 Reçu)
  ↓ Utilise : useSaleDetail (cache TanStack), formatCDF
  ↓ Crée    : ThermalReceipt, ReceiptActions, thermal-print.css
  ↓
Prompt 5 (SCR-016 Retours)
  ↓ Utilise : useSaleDetail, SaleLineItems type, formatCDF
  ↓ Crée    : ReturnItemsList, ReturnSummary, useReturnForm

  → MODULE VENTES COMPLET
  → Prêt pour les modules suivants :
        Module Stocks (utilise ventesApi pour les sorties de stock)
        Module Parrainage (utilise cart.store pour les remises)
        Module Rapports (utilise ventesApi pour les agrégations)
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. PERFORMANCE CAISSE (SCR-012) — Règle absolue :
   → L'ajout d'un article au panier ne doit JAMAIS déclencher un appel API.
   → Toutes les opérations panier sont purement locales (Zustand + calculs JS).
   → Seule la soumission finale (bouton VALIDER) déclenche un appel API.

2. ATOMICITÉ DES VENTES (Back-end) :
   → La création d'une vente (POST /ventes) DOIT être dans une transaction Prisma.
   → Si une mise à jour de stock échoue → rollback complet (aucune vente créée).
   → Utiliser SELECT FOR UPDATE sur les StockSite pour éviter les conditions de course.

3. OFFLINE-FIRST — Caisse uniquement :
   → SEULE la caisse (SCR-012) doit fonctionner hors-ligne.
   → SCR-013, 014, 015, 016 nécessitent une connexion internet.
   → Afficher un message clair si accès tenté hors-ligne sur ces pages.

4. FORMAT MONÉTAIRE — Règle stricte :
   → Toujours utiliser formatCDF() de currency.ts.
   → JAMAIS de toLocaleString() direct dans les composants.
   → Format : "1 200 000 CDF" (espace comme séparateur de milliers, pas de virgule).

5. IMPRESSION THERMIQUE :
   → Tester sur un vrai navigateur Chrome (window.print() se comporte différemment
     selon les navigateurs).
   → Valider avec une vraie imprimante thermique 80mm si possible.
   → Le CSS @media print doit masquer TOUT sauf #thermal-receipt.

6. SÉCURITÉ DES RETOURS :
   → Un AGENT ne peut PAS initier un retour (rôle minimum : GERANT).
   → La vérification du délai des 7 jours doit être faite CÔTÉ SERVEUR.
   → Ne jamais faire confiance au client pour la validation métier des retours.
```

---

*Progress Business — Prompts Développement Module Ventes SCR-012 à SCR-016 — Goma, RDC — v1.0 — 2025*