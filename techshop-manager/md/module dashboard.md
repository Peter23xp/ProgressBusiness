

# 🛒 TECHSHOP MANAGER — PROMPTS DE DÉVELOPPEMENT
## Module DASHBOARD | Écrans SCR-003 & SCR-004

> **MODE D'EMPLOI :**
> Ce fichier contient **2 prompts indépendants**, un par écran du module Dashboard.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Le module AUTH (SCR-001 & SCR-002) doit être **entièrement terminé** avant de commencer ce module.

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

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 2 — SCR-003 : TABLEAU DE BORD PRINCIPAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : TechShop Manager
Fichier cible principal : apps/client/src/pages/dashboard/DashboardPage.tsx
Route       : /dashboard
Accès       : Protégé — rôle minimum : AGENT
Rôle minimum requis : AGENT
Dépendances : Module AUTH complet (useAuth, ProtectedRoute, api.ts, OfflineBanner)


OBJECTIF
--------
Créer le composant React complet du tableau de bord principal (SCR-003).
Ce composant est le POINT D'ENTRÉE principal de l'application après connexion
pour les rôles SUPER_ADMIN, DIR_REGIONAL, GERANT et AGENT.
Il affiche des KPIs en temps réel, un graphique de ventes sur 7 jours,
les transactions récentes et les alertes de stock actives.
Il doit fonctionner en mode connecté ET afficher des données en cache en mode hors-ligne.
Il crée également le layout principal de l'application (sidebar, header, zone contenu)
réutilisé par TOUS les modules suivants.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/dashboard/DashboardPage.tsx          ← CRÉER (composant principal)
2.  apps/client/src/pages/dashboard/DashboardPage.test.tsx     ← CRÉER (tests Vitest)
3.  apps/client/src/layouts/AppLayout.tsx                      ← CRÉER (layout principal réutilisable)
4.  apps/client/src/layouts/Sidebar.tsx                        ← CRÉER (navigation latérale)
5.  apps/client/src/layouts/Header.tsx                         ← CRÉER (barre supérieure)
6.  apps/client/src/components/dashboard/KpiCard.tsx           ← CRÉER (carte KPI réutilisable)
7.  apps/client/src/components/dashboard/SalesChart.tsx        ← CRÉER (graphique barres Chart.js)
8.  apps/client/src/components/dashboard/RecentTransactions.tsx ← CRÉER (liste 5 transactions)
9.  apps/client/src/components/dashboard/StockAlerts.tsx       ← CRÉER (liste 3 alertes)
10. apps/client/src/hooks/useDashboard.ts                      ← CRÉER (hook TanStack Query)
11. apps/client/src/hooks/usePolling.ts                        ← CRÉER (hook polling 5 min)
12. apps/client/src/lib/db.ts                                  ← MODIFIER (ajouter table dashboardCache)
13. apps/client/src/router/index.tsx                           ← MODIFIER (ajouter route /dashboard)

BACK-END :
14. apps/server/src/modules/dashboard/dashboard.module.ts      ← CRÉER
15. apps/server/src/modules/dashboard/dashboard.controller.ts  ← CRÉER
16. apps/server/src/modules/dashboard/dashboard.service.ts     ← CRÉER
17. apps/server/src/modules/dashboard/dto/dashboard.dto.ts     ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
La page utilise le layout AppLayout (sidebar gauche fixe + header haut + zone contenu scrollable).

  ┌──────────────────────────────────────────────────────────────────┐
  │  TECHSHOP   [GOMA ▼]                  Jean-Pierre ▾ [Déco.]    │  ← Header
  ├──────────────┬───────────────────────────────────────────────────┤
  │  Dashboard   │  Tableau de Bord           Aujourd'hui ▾          │
  │  Clients     │                                                    │
  │  Ventes      │  ┌──────────────┐ ┌──────────────┐ ┌──────────┐  │
  │  Stocks      │  │ Clients      │ │ Ventes Jour  │ │ Alertes  │  │
  │  Parrainage  │  │ ACTIFS       │ │ 847 500 CDF  │ │ Stock    │  │
  │  Fidélité    │  │   1 248      │ │              │ │    3     │  │
  │  Rapports    │  └──────────────┘ └──────────────┘ └──────────┘  │
  │  ─────────── │  ┌──────────────┐                                 │
  │  Portail     │  │ Nvx Filleuls │  Ventes 7 derniers jours        │
  │  Paramètres  │  │   12 / mois  │  [Graphique barres Chart.js]    │
  │              │  └──────────────┘                                 │
  │              │  ┌───────────────────────┐ ┌───────────────────┐  │
  │              │  │ Transactions récentes │ │ Alertes stock     │  │
  │              │  │ [liste 5 lignes]      │ │ [liste 3 items]   │  │
  │              │  └───────────────────────┘ └───────────────────┘  │
  └──────────────┴───────────────────────────────────────────────────┘

Dimensions sidebar : 240px desktop, masquée sur mobile (drawer via hamburger).
Header : 64px de hauteur, fond #1E3A5F, texte blanc.
Zone contenu : padding p-6, fond #F5F5F5.


LAYOUT PRINCIPAL — AppLayout.tsx
----------------------------------
Créer le layout réutilisable utilisé par TOUS les modules de l'application.

  // apps/client/src/layouts/AppLayout.tsx
  interface AppLayoutProps {
    children: ReactNode;
  }

Structure HTML :
  <div className="flex h-screen overflow-hidden">
    <Sidebar />                          {/* 240px fixe desktop, drawer mobile */}
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header />                         {/* 64px fixe */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <OfflineBanner />               {/* Bannière offline importée du module AUTH */}
        {children}
      </main>
    </div>
  </div>

Comportement responsive :
  - Desktop (>768px) : sidebar visible en permanence à gauche
  - Mobile (<768px) : sidebar masquée → hamburger dans le Header → Drawer shadcn


COMPOSANT Sidebar — Sidebar.tsx
---------------------------------
Navigation latérale complète de l'application.

Structure visuelle :
  ┌────────────────────────┐
  │  [LOGO] TechShop       │   ← Logo + nom, fond #1E3A5F
  ├────────────────────────┤
  │  ○ Dashboard           │   ← Lien actif : fond #2E86C1, texte blanc
  │  ○ Clients             │   ← Lien inactif : texte gris-200, hover fond #2E86C1/20
  │  ○ Ventes              │
  │  ○ Stocks              │
  │  ○ Parrainage          │
  │  ○ Fidélité            │
  │  ○ Rapports            │
  │  ────────────────────  │
  │  ○ Portail Client      │
  │  ○ Paramètres          │
  └────────────────────────┘

Icônes lucide-react à utiliser :
  Dashboard     → LayoutDashboard
  Clients       → Users
  Ventes        → ShoppingCart
  Stocks        → Package
  Parrainage    → GitBranch
  Fidélité      → Star
  Rapports      → BarChart2
  Portail       → Globe
  Paramètres    → Settings

Règles d'affichage selon rôle (utiliser useAuth().canAccess()) :
  - AGENT      : Dashboard, Clients, Ventes (Caisse uniquement), Stocks (lecture)
  - FORMATEUR  : Clients uniquement
  - GERANT     : Dashboard, Clients, Ventes, Stocks, Parrainage, Fidélité, Rapports
  - DIR_REGIONAL : idem GERANT + accès multi-sites
  - SUPER_ADMIN  : Tout, incluant Portail et Paramètres
  - CLIENT       : Portail uniquement → ne voit pas ce layout (portail séparé)

Les items non accessibles au rôle courant sont MASQUÉS (pas seulement désactivés).

Informations en bas de sidebar :
  - Nom de l'utilisateur connecté + rôle (badge)
  - Site actuel
  - Version : v1.0


COMPOSANT Header — Header.tsx
--------------------------------
Barre supérieure fixe de l'application.

Éléments de gauche → droite :
  [Hamburger mobile]  [Logo réduit mobile]  ...  [Sélecteur site]  [Notifications]  [Menu utilisateur]

Sélecteur de site (Select shadcn) :
  - Visible uniquement si user.role IN ['SUPER_ADMIN', 'DIR_REGIONAL']
  - Options : Goma | Bukavu | Kinshasa | Tous les sites
  - La valeur sélectionnée est stockée dans un store Zustand UI (uiStore)
  - Tout changement de site déclenche un refetch de toutes les données TanStack Query

Menu utilisateur (DropdownMenu shadcn) :
  - Affiche avatar initiales [JB] en fond #2E86C1
  - Items du dropdown :
      Mon profil     → navigate('/settings/profile')
      ──────────────
      Se déconnecter → authStore.logout() + navigate('/login')

Notifications (icône Bell lucide-react) :
  - Badge rouge avec count si alertes stock > 0
  - Clic → navigate('/stocks/alerts')


STORE UI — ui.store.ts
------------------------
Créer un store Zustand pour les préférences UI globales :

  // apps/client/src/stores/ui.store.ts
  interface UIState {
    selectedSiteId: string | null;   // null = tous les sites (Dir. Regional / Super Admin)
    sidebarOpen: boolean;            // état drawer mobile
    selectedPeriod: 'today' | 'week' | 'month';  // filtre période dashboard

    // Actions
    setSelectedSite: (siteId: string | null) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setSelectedPeriod: (period: 'today' | 'week' | 'month') => void;
  }

Règle : si user.role === 'AGENT' ou 'GERANT' ou 'FORMATEUR'
  → selectedSiteId est FORCÉ à user.siteId (non modifiable)
  → le sélecteur de site dans le Header est masqué


COMPOSANT KpiCard — KpiCard.tsx
---------------------------------
Carte KPI réutilisable dans tout le dashboard :

  interface KpiCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;          // couleur du fond de l'icône
    trend?: {
      value: number;             // pourcentage de variation
      label: string;             // ex: "vs hier"
      direction: 'up' | 'down' | 'neutral';
    };
    isLoading?: boolean;         // afficher skeleton si true
    onClick?: () => void;        // rend la carte cliquable (navigate vers detail)
    badge?: string;              // badge coloré optionnel (ex: "3 en rupture")
    badgeVariant?: 'success' | 'warning' | 'danger';
  }

Affichage :
  - Fond blanc, ombre légère (shadow-sm), border border-gray-100
  - Icône dans un carré 40x40 arrondi avec fond coloré (ex: bleu clair pour Clients)
  - Valeur en Roboto Mono, 24px, bold
  - Si isLoading : skeleton animé (Skeleton shadcn) sur titre + valeur
  - Si trend → flèche verte (↑) ou rouge (↓) + pourcentage à droite de la valeur
  - Si onClick → cursor-pointer + hover:shadow-md transition


4 KPIs du dashboard principal :
  ┌────────────────────────────────────────────────────────────────┐
  │ KPI 1 — Clients actifs                                        │
  │   Icône : Users (fond blue-100)                               │
  │   Valeur : clientsActifs (integer formaté avec séparateurs)   │
  │   Trend : variation vs le mois précédent                      │
  │   onClick : navigate('/clients?statut=ACTIF')                 │
  │                                                               │
  │ KPI 2 — Ventes du jour                                        │
  │   Icône : ShoppingCart (fond green-100)                       │
  │   Valeur : ventesJour formaté "847 500 CDF"                   │
  │   Trend : variation vs hier                                   │
  │   onClick : navigate('/sales')                                │
  │                                                               │
  │ KPI 3 — Alertes stock                                         │
  │   Icône : AlertTriangle (fond orange-100 ou red-100 si >5)    │
  │   Valeur : alertesStock (integer)                             │
  │   Badge : "X en rupture" si ruptures > 0 (rouge)             │
  │   onClick : navigate('/stocks/alerts')                        │
  │                                                               │
  │ KPI 4 — Nouveaux filleuls                                     │
  │   Icône : GitBranch (fond purple-100)                         │
  │   Valeur : nouveauxFilleuls (integer)                         │
  │   Trend : variation vs le mois précédent                      │
  │   onClick : navigate('/parrainage')                           │
  └────────────────────────────────────────────────────────────────┘


COMPOSANT SalesChart — SalesChart.tsx
---------------------------------------
Graphique en barres des ventes sur les 7 derniers jours.

  interface SalesChartProps {
    data: SalesChartData | undefined;
    isLoading: boolean;
    selectedSiteId: string | null;
  }

  interface SalesChartData {
    labels: string[];          // ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    datasets: Array<{
      site: string;
      siteId: string;
      data: number[];          // montants en CDF
      color: string;           // couleur hex de la courbe
    }>;
  }

Configuration Chart.js (chart.js v4 + react-chartjs-2) :
  - Type : Bar chart
  - Couleurs par site :
      Goma     → #2E86C1
      Bukavu   → #1A6B3A
      Kinshasa → #E65100
  - Si selectedSiteId !== null → afficher 1 seule dataset (site filtré)
  - Si selectedSiteId === null → afficher 3 datasets empilées (stacked: true)
  - Y-axis : format CDF avec séparateurs (ex: "1 200 000")
  - Tooltip : montant exact + nom du site
  - Responsive : true, maintainAspectRatio: false (hauteur fixe 280px)
  - Si isLoading : Skeleton de hauteur 280px + largeur 100%
  - Si data vide : Empty state centré "Aucune vente sur cette période"

Carte encapsulante :
  - Titre : "Ventes — 7 derniers jours"
  - Header de carte : titre à gauche + légende des sites (colored dots) à droite
  - Fond blanc, ombre légère


COMPOSANT RecentTransactions — RecentTransactions.tsx
-------------------------------------------------------
Liste des 5 dernières transactions du site sélectionné.

  interface Transaction {
    id: string;
    numeroVente: string;        // ex: "GOM-202501-0047"
    clientNom: string;          // "BAHATI Jean-Pierre" ou "Client anonyme"
    produit: string;            // nom du premier produit (+ "et X autres" si >1)
    montant: number;            // en CDF
    site: string;               // nom du site
    statut: 'VALIDE' | 'RETOURNEE_PARTIELLE' | 'RETOURNEE' | 'ANNULEE';
    createdAt: string;          // ISO string
  }

Affichage :
  - Carte blanche avec titre "Transactions récentes" + lien "Voir tout →" navigate('/sales')
  - 5 lignes maximum, chacune sur une row :
      [Avatar initiales client] [Nom + N° vente] ... [Montant CDF] [Badge statut]
  - Avatar : 2 lettres du nom, fond #D6E4F0, texte #1E3A5F
  - Badge statut :
      VALIDE             → vert
      RETOURNEE_PARTIELLE → orange
      RETOURNEE          → rouge
      ANNULEE            → gris
  - Montant : Roboto Mono, formaté "427 500 CDF"
  - Date relative sous le nom (ex: "il y a 14 min") via date-fns/fr
  - Clic sur une ligne → navigate(`/sales/${transaction.id}`)
  - Si isLoading : 5 lignes skeleton
  - Si liste vide : "Aucune transaction aujourd'hui" + icône ShoppingCart grisée


COMPOSANT StockAlerts — StockAlerts.tsx
-----------------------------------------
Liste des 3 alertes de stock les plus critiques.

  interface StockAlert {
    produitNom: string;
    sku: string;
    siteNom: string;
    stockActuel: number;
    seuilAlerte: number;
    type: 'ALERTE' | 'RUPTURE';
  }

Affichage :
  - Carte blanche avec titre "Alertes stock"
    + lien "Gérer →" navigate('/stocks/alerts') (masqué pour AGENT)
  - 3 lignes maximum, chacune :
      [Icône Package] [Nom produit + SKU] ... [Stock actuel / Seuil] [Badge type]
  - Badge RUPTURE → rouge (#B71C1C), badge ALERTE → orange (#E65100)
  - Ligne RUPTURE : fond légèrement rouge (red-50)
  - Ligne ALERTE : fond légèrement orange (orange-50)
  - Si aucune alerte : fond vert clair + "✓ Tous les stocks sont suffisants"
  - Si isLoading : 3 lignes skeleton


HOOK useDashboard — useDashboard.ts
-------------------------------------
Hook centralisé pour toutes les données du dashboard, basé sur TanStack Query v5.

  // apps/client/src/hooks/useDashboard.ts
  export function useDashboard(siteId: string | null, period: 'today' | 'week' | 'month') {
    return {
      stats,                  // UseQueryResult<DashboardStats>
      salesChart,             // UseQueryResult<SalesChartData>
      recentTransactions,     // UseQueryResult<Transaction[]>
      stockAlerts,            // UseQueryResult<StockAlert[]>
      isAnyLoading,           // boolean — true si au moins une query en cours
      refetchAll,             // () => void — force le refetch de toutes les queries
      isOfflineData,          // boolean — true si les données viennent du cache Dexie
    };
  }

Configuration TanStack Query :
  - staleTime : 2 * 60 * 1000 (2 minutes)
  - gcTime : 10 * 60 * 1000 (10 minutes)
  - refetchInterval : DÉSACTIVÉ ici (géré par usePolling)
  - queryKey : ['dashboard', 'stats', siteId, period]
               ['dashboard', 'chart', siteId]
               ['dashboard', 'transactions', siteId]
               ['dashboard', 'alerts', siteId]
  - Si navigator.onLine === false → ne pas lancer les requêtes (enabled: isOnline)
    → charger les données depuis Dexie.dashboardCache à la place
  - Si la requête échoue (erreur réseau) → fallback silencieux sur Dexie

Stratégie cache Dexie :
  - À chaque fetch réussi → sauvegarder dans Dexie.dashboardCache (clé: siteId + period)
  - Données Dexie valides max 1 heure (cachedAt + 3600000)
  - Si données Dexie trop anciennes → afficher badge "Données périmées"


HOOK usePolling — usePolling.ts
---------------------------------
Hook générique de polling pour le dashboard :

  // apps/client/src/hooks/usePolling.ts
  export function usePolling(
    callback: () => void,
    intervalMs: number,
    options?: { enabled?: boolean; immediate?: boolean }
  ): { isPolling: boolean; stop: () => void; start: () => void }

Comportement :
  - Ne poll PAS si navigator.onLine === false (arrêt automatique)
  - Ne poll PAS si document.visibilityState === 'hidden' (tab en arrière-plan)
  - Reprend automatiquement quand la page redevient visible
  - Utilisé dans DashboardPage : usePolling(refetchAll, 5 * 60 * 1000)
  - Affiche un indicateur discret "Mis à jour il y a X min" dans le Header du dashboard


CACHE DEXIE — Modification db.ts
-----------------------------------
Ajouter la table dashboardCache au schéma Dexie existant (version 2) :

  // Ajouter à la classe TechShopDB :
  dashboardCache!: EntityTable<DashboardCache, 'id'>;

  interface DashboardCache {
    id: string;              // clé composite : `${siteId ?? 'all'}_${period}`
    stats: DashboardStats;
    chart: SalesChartData;
    transactions: Transaction[];
    alerts: StockAlert[];
    cachedAt: Date;
  }

  // Dans le constructeur, passer à version 2 :
  this.version(2).stores({
    authSession: 'id, userId, expiresAt',
    offlineQueue: '++id, status, createdAt',
    dashboardCache: 'id, cachedAt',        // ← AJOUTER
  });


APPELS API
-----------
GET /api/v1/dashboard/stats
  En-têtes : Authorization: Bearer <accessToken>
  Query params : { siteId?: string, period: 'today' | 'week' | 'month' }
  Succès 200 :
    {
      clientsActifs: number,
      ventesJour: number,           // en CDF (centimes entiers)
      alertesStock: number,         // total alertes + ruptures
      rupturesStock: number,        // ruptures seulement (stock = 0)
      nouveauxFilleuls: number,
      trends: {
        clientsActifs: number,      // % variation vs période précédente
        ventesJour: number,
        nouveauxFilleuls: number
      }
    }

GET /api/v1/dashboard/sales-chart
  Query params : { siteId?: string, days: 7 }
  Succès 200 :
    {
      labels: string[],             // ["Lun 20", "Mar 21", ...]
      datasets: Array<{
        site: string,
        siteId: string,
        data: number[],
        color: string
      }>
    }

GET /api/v1/dashboard/recent-transactions
  Query params : { siteId?: string, limit: 5 }
  Succès 200 :
    { transactions: Transaction[] }

GET /api/v1/dashboard/stock-alerts
  Query params : { siteId?: string, limit: 3 }
  Succès 200 :
    { alerts: StockAlert[] }

Toutes les routes sont protégées par JwtAuthGuard.
Toutes les routes filtrent automatiquement par siteId selon le rôle :
  - Si AGENT/GERANT/FORMATEUR → forcer siteId = user.siteId (ignorer le param)
  - Si DIR_REGIONAL/SUPER_ADMIN → utiliser le siteId fourni (ou tous les sites si null)


LOGIQUE D'AFFICHAGE PAR RÔLE
------------------------------
Règles d'adaptation de l'affichage selon le rôle connecté :

  AGENT :
    - Sélecteur de site MASQUÉ (données forcées sur son site)
    - Sélecteur de période MASQUÉ (toujours "Aujourd'hui")
    - KPI "Alertes stock" MASQUÉ (pas dans son périmètre)
    - Graphique ventes MASQUÉ (pas dans son périmètre)
    - Seuls les KPIs "Ventes du jour" et "Clients actifs" sont visibles
    - Bouton "Voir tout →" des transactions visible → navigate('/sales')
    - Bouton "Gérer →" des alertes MASQUÉ

  GERANT :
    - Sélecteur de site MASQUÉ (données forcées sur son site)
    - Sélecteur de période VISIBLE (Aujourd'hui / Cette semaine / Ce mois)
    - Tous les KPIs visibles
    - Graphique ventes VISIBLE (données de son site uniquement)
    - Tous les liens visibles

  DIR_REGIONAL / SUPER_ADMIN :
    - Sélecteur de site VISIBLE (Goma / Bukavu / Kinshasa / Tous)
    - Sélecteur de période VISIBLE
    - Tous les KPIs visibles
    - Graphique ventes VISIBLE (multi-sites si "Tous" sélectionné)
    - Tous les liens visibles
    - Lien "Vue régionale →" visible → navigate('/dashboard/regional')


BACK-END NESTJS — Module Dashboard
------------------------------------
apps/server/src/modules/dashboard/dashboard.service.ts :

  méthode getStats(userId, siteId, period) :
    1. Déterminer le filtre siteId selon le rôle (cf. règles ci-dessus)
    2. Query Prisma — clientsActifs :
       COUNT Client WHERE statut='ACTIF' AND siteInscriptionId IN [siteIds]
    3. Query Prisma — ventesJour :
       SUM Vente.montantNet WHERE createdAt >= début_période AND siteId IN [siteIds]
       AND statut = 'VALIDE'
    4. Query Prisma — alertesStock :
       COUNT StockSite WHERE quantite <= seuilAlerte AND siteId IN [siteIds]
    5. Query Prisma — nouveauxFilleuls :
       COUNT Parrainage WHERE statut='VALIDE' AND dateCreation >= début_mois
       AND filleul.siteInscriptionId IN [siteIds]
    6. Calculer les trends : requêtes sur la période précédente, calcul % variation
    7. Mettre en cache Redis (TTL 60 secondes) avec clé dashboard:stats:{siteIds}:{period}

  méthode getSalesChart(userId, siteId, days: 7) :
    1. Générer les labels : 7 derniers jours (format "Lun 20")
    2. Pour chaque site dans [siteIds] :
       → SUM Vente.montantNet GROUP BY DATE(createdAt) sur les 7 derniers jours
    3. Remplir les jours sans vente avec 0
    4. Assigner la couleur hex par site
    5. Cache Redis TTL 120 secondes

  méthode getRecentTransactions(userId, siteId, limit: 5) :
    1. Prisma : findMany Vente INCLUDE client, lignesVente ORDER BY createdAt DESC
       LIMIT 5, filtré par siteId
    2. Mapper vers Transaction DTO (agrégation des produits "et X autres")
    3. Pas de cache Redis (données temps-réel)

  méthode getStockAlerts(userId, siteId, limit: 3) :
    1. Prisma : findMany StockSite WHERE quantite <= seuilAlerte
       ORDER BY quantite ASC (ruptures en premier), LIMIT 3
    2. Cache Redis TTL 300 secondes


ÉTATS DE LA PAGE
-----------------
État 1 — CHARGEMENT INITIAL
  - 4 cartes KPI en skeleton (Skeleton shadcn, hauteur 96px)
  - Graphique ventes en skeleton (hauteur 280px)
  - Sections transactions et alertes en skeleton (5 et 3 lignes)
  - Aucun message d'erreur visible

État 2 — DONNÉES CHARGÉES
  - Affichage normal de tous les composants
  - Indicateur discret en haut à droite : "Mis à jour il y a X min"
  - Badge vert "En direct" si polling actif

État 3 — ERREUR RÉSEAU (première charge, pas de cache Dexie)
  - Alert shadcn rouge sous le Header :
    "Impossible de charger les données du tableau de bord."
  - Bouton "Réessayer" → refetchAll()
  - Les composants affichent leur empty state respectif

État 4 — DONNÉES HORS-LIGNE (cache Dexie disponible)
  - Les données s'affichent normalement
  - Badge orange "Données en cache" sous le titre de la page
  - Tooltip sur le badge : "Dernière synchronisation : [date relative]"
  - Le polling est désactivé (navigator.onLine === false)

État 5 — DONNÉES HORS-LIGNE PÉRIMÉES (cache > 1 heure)
  - Badge rouge "Données périmées" sous le titre
  - Message discret : "Données de [date/heure]. Connectez-vous pour actualiser."


SÉLECTEUR DE PÉRIODE
---------------------
Select shadcn dans le Header du dashboard (visible GERANT, DIR_REGIONAL, SUPER_ADMIN) :

  Options :
    "Aujourd'hui"     → period = 'today'
    "Cette semaine"   → period = 'week'
    "Ce mois"         → period = 'month'

  Comportement :
    - La sélection est stockée dans uiStore.selectedPeriod
    - Tout changement invalide les caches TanStack Query et relance les 4 requêtes
    - Le graphique ventes reste toujours sur 7 jours (indépendant du sélecteur)
    - Le KPI "Ventes" change de label selon la période :
        'today'  → "Ventes aujourd'hui"
        'week'   → "Ventes cette semaine"
        'month'  → "Ventes ce mois"


FORMAT DES MONTANTS CDF
------------------------
Créer une fonction utilitaire réutilisable dans packages/shared/src/utils/format.ts :

  export function formatCDF(amount: number): string {
    // 1200000 → "1 200 000 CDF"
    // 847500  → "847 500 CDF"
    // 0       → "0 CDF"
    return new Intl.NumberFormat('fr-CD', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' CDF';
  }

  export function formatNumber(n: number): string {
    // 1248 → "1 248"
    return new Intl.NumberFormat('fr-CD').format(n);
  }

Cette fonction est utilisée dans KpiCard, SalesChart tooltip, RecentTransactions.


TESTS — DashboardPage.test.tsx
--------------------------------
Créer les tests suivants avec Vitest + @testing-library/react :

  describe('DashboardPage', () => {
    describe('Rendu et layout', () => {
      test('1  — Sidebar visible sur desktop (>768px)')
      test('2  — Sidebar masquée sur mobile, hamburger visible')
      test('3  — Header affiche le nom de l\'utilisateur connecté')
      test('4  — Sélecteur de site visible uniquement pour SUPER_ADMIN et DIR_REGIONAL')
      test('5  — Sélecteur de période masqué pour AGENT')
    })

    describe('KPIs', () => {
      test('6  — 4 cartes KPI en skeleton pendant le chargement')
      test('7  — Valeurs KPI affichées correctement après chargement')
      test('8  — KPI "Alertes stock" masqué pour AGENT')
      test('9  — Montant CDF formaté correctement (séparateurs milliers)')
      test('10 — Trend haussier affiche flèche verte')
      test('11 — Trend baissier affiche flèche rouge')
      test('12 — Clic sur KPI Clients navigue vers /clients?statut=ACTIF')
    })

    describe('Graphique ventes', () => {
      test('13 — Graphique skeleton pendant chargement')
      test('14 — Graphique rendu après chargement des données')
      test('15 — Graphique masqué pour AGENT')
      test('16 — Empty state si aucune vente sur la période')
    })

    describe('Transactions récentes', () => {
      test('17 — 5 lignes skeleton pendant chargement')
      test('18 — 5 transactions affichées après chargement')
      test('19 — Empty state si aucune transaction')
      test('20 — Clic sur transaction navigue vers /sales/:id')
      test('21 — Badge statut ANNULEE gris')
    })

    describe('Alertes stock', () => {
      test('22 — 3 lignes skeleton pendant chargement')
      test('23 — Badge RUPTURE rouge affiché')
      test('24 — Message succès vert si aucune alerte')
      test('25 — Bouton Gérer masqué pour AGENT')
    })

    describe('Mode hors-ligne', () => {
      test('26 — Badge "Données en cache" visible si offline avec cache')
      test('27 — Erreur affichée si offline sans cache')
      test('28 — Polling arrêté si navigator.onLine === false')
    })

    describe('Polling', () => {
      test('29 — refetchAll appelé après 5 minutes')
      test('30 — Polling arrêté si document.hidden === true')
    })
  })

  Mocks à créer :
    - vi.mock('../hooks/useDashboard') → mock des 4 queries
    - vi.mock('../hooks/useOnlineStatus') → simuler online/offline
    - vi.mock('react-chartjs-2') → mock Chart.js (éviter erreurs canvas JSDOM)
    - vi.mock('../stores/auth.store') → utilisateurs de différents rôles


DÉFINITION DE "TERMINÉ" — CHECKLIST
--------------------------------------
Avant de passer au Prompt 2, vérifier TOUS ces points :

LAYOUT
[ ] La sidebar s'affiche correctement à 1280px desktop
[ ] La sidebar se masque sur mobile et le hamburger ouvre un Drawer
[ ] Le Header affiche le nom + site + menu utilisateur
[ ] Le sélecteur de site est visible pour SUPER_ADMIN et DIR_REGIONAL uniquement
[ ] La déconnexion depuis le menu fonctionne (logout + redirect /login)
[ ] Le composant OfflineBanner du module AUTH est intégré dans le layout

KPIs
[ ] Les 4 KPIs s'affichent avec skeleton pendant le chargement
[ ] Les valeurs numériques sont formatées (séparateurs de milliers)
[ ] Les montants CDF utilisent formatCDF()
[ ] Les trends affichent flèche verte/rouge + pourcentage
[ ] Les clics naviguent vers les bonnes routes
[ ] Le KPI Alertes est masqué pour AGENT

GRAPHIQUE
[ ] Le graphique Chart.js s'affiche avec les bonnes couleurs par site
[ ] Le graphique est masqué pour AGENT
[ ] L'axe Y formate les montants en CDF
[ ] Le graphique est responsive (hauteur fixe 280px)

TRANSACTIONS & ALERTES
[ ] 5 transactions récentes avec avatar + badge statut + montant
[ ] 3 alertes stock avec badge RUPTURE/ALERTE coloré
[ ] Les empty states sont affichés quand les listes sont vides

OFFLINE
[ ] Les données sont sauvegardées dans Dexie.dashboardCache après chaque fetch
[ ] Le badge "Données en cache" s'affiche quand offline avec cache disponible
[ ] Le polling s'arrête automatiquement quand offline ou tab masquée

BACK-END
[ ] GET /api/v1/dashboard/stats retourne les 4 KPIs filtrés par rôle
[ ] GET /api/v1/dashboard/sales-chart retourne 7 jours de données
[ ] GET /api/v1/dashboard/recent-transactions retourne 5 transactions
[ ] GET /api/v1/dashboard/stock-alerts retourne 3 alertes triées par criticité
[ ] Le cache Redis est actif sur stats et stock-alerts

TESTS
[ ] npm run test passe sans erreur (30 tests DashboardPage.test.tsx)
[ ] Couverture DashboardPage.tsx ≥ 80%
[ ] Couverture KpiCard.tsx = 100%
[ ] Couverture useDashboard.ts ≥ 85%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 2 — SCR-004 : DASHBOARD DIRECTEUR RÉGIONAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : TechShop Manager
Fichier cible principal : apps/client/src/pages/dashboard/RegionalDashboardPage.tsx
Route       : /dashboard/regional
Accès       : Protégé — rôle minimum : DIR_REGIONAL
Rôle minimum requis : DIR_REGIONAL
Dépendances : SCR-003 doit être TERMINÉ (AppLayout, KpiCard, SalesChart, useDashboard)


OBJECTIF
--------
Créer la vue tableau de bord consolidée multi-sites (SCR-004) destinée au
Directeur Régional et au Super Admin.
Cette page offre une vue comparative des 3 sites (Goma, Bukavu, Kinshasa)
avec un tableau de performance, un graphique d'évolution du CA, un classement
des meilleurs produits et des meilleurs parrains.
Elle utilise le même AppLayout que SCR-003 mais un contenu entièrement différent.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/dashboard/RegionalDashboardPage.tsx          ← CRÉER
2.  apps/client/src/pages/dashboard/RegionalDashboardPage.test.tsx     ← CRÉER
3.  apps/client/src/components/dashboard/SitesComparisonTable.tsx      ← CRÉER
4.  apps/client/src/components/dashboard/RevenueLineChart.tsx          ← CRÉER
5.  apps/client/src/components/dashboard/TopProductsList.tsx           ← CRÉER
6.  apps/client/src/components/dashboard/TopParrainsList.tsx           ← CRÉER
7.  apps/client/src/hooks/useRegionalDashboard.ts                      ← CRÉER

BACK-END :
8.  apps/server/src/modules/dashboard/dashboard.controller.ts          ← MODIFIER (ajouter GET /regional)
9.  apps/server/src/modules/dashboard/dashboard.service.ts             ← MODIFIER (ajouter getRegional)


UI — STRUCTURE VISUELLE
------------------------
Même AppLayout que SCR-003 (sidebar + header). Contenu spécifique :

  ┌──────────────────────────────────────────────────────────────────┐
  │  TECHSHOP   [GOMA ▼]                  Jean-Pierre ▾ [Déco.]    │
  ├──────────────┬───────────────────────────────────────────────────┤
  │  Sidebar     │  Vue Régionale        [Ce mois ▾] [Export PDF]   │
  │  (identique) │                                                    │
  │              │  ┌───────────────────────────────────────────────┐ │
  │              │  │  PERFORMANCE PAR SITE                         │ │
  │              │  │  Site    | CA       | Ventes | Clients | Alrt │ │
  │              │  │  Goma    | 4 200 000| 87     | 1 248   |  2  │ │
  │              │  │  Bukavu  | 2 850 000| 56     | 876     |  5  │ │
  │              │  │  Kinshasa| 1 100 000| 23     | 341     |  0  │ │
  │              │  │  TOTAL   | 8 150 000| 166    | 2 465   |  7  │ │
  │              │  └───────────────────────────────────────────────┘ │
  │              │                                                    │
  │              │  [Graphique courbe CA — une courbe par site]       │
  │              │                                                    │
  │              │  ┌──────────────────────┐ ┌────────────────────┐  │
  │              │  │ TOP 5 PRODUITS       │ │ TOP 5 PARRAINS     │  │
  │              │  │ 1. Samsung A54  87u  │ │ 1. MASUDI Serge 12 │  │
  │              │  │ 2. JBL T110    45u   │ │ 2. BAHATI J.P.  9  │  │
  │              │  │ ...                  │ │ ...                │  │
  │              │  └──────────────────────┘ └────────────────────┘  │
  └──────────────┴───────────────────────────────────────────────────┘


ACCÈS ET GARDE DE ROUTE
------------------------
Cette route est protégée par ProtectedRoute avec allowedRoles=['DIR_REGIONAL', 'SUPER_ADMIN'].
Si un GERANT ou AGENT tente d'accéder → affichage du composant AccessDenied (créé en SCR-001).


SÉLECTEUR DE PÉRIODE
---------------------
Présent dans le Header de la page (propre à cette page, pas global) :
  Options :
    "Ce mois"      → period = 'month'
    "Ce trimestre" → period = 'quarter'
    "Cette année"  → period = 'year'
    "Personnalisé" → ouvre un DateRangePicker (shadcn Popover + Calendar)

  Comportement :
    - Stocké dans l'état local du composant (useState), pas dans uiStore
    - Tout changement invalide les queries et relance les 3 requêtes


COMPOSANT SitesComparisonTable — SitesComparisonTable.tsx
-----------------------------------------------------------
Tableau comparatif des 3 sites de l'entreprise.

  interface SitePerformance {
    siteId: string;
    siteNom: string;
    siteVille: string;
    ca: number;                  // Chiffre d'affaires en CDF
    nbVentes: number;
    nbClientsActifs: number;
    alertesStock: number;
    caVariation: number;         // % variation vs période précédente
  }

  interface ComparisonData {
    sites: SitePerformance[];
    totaux: {
      ca: number;
      nbVentes: number;
      nbClientsActifs: number;
      alertesStock: number;
    };
  }

Affichage :
  - Table shadcn avec colonnes : Site | CA | Ventes | Clients actifs | Alertes stock
  - Ligne d'en-tête : fond #1E3A5F, texte blanc
  - Lignes alternées : #FFFFFF et #F5F5F5
  - Ligne TOTAL en bas : bold, bordure top double
  - CA formaté avec formatCDF()
  - Colonne variation CA : flèche + % coloré (vert si hausse, rouge si baisse)
  - Colonne alertes : badge rouge si > 0, vert "0" si aucune alerte
  - Chaque ligne est cliquable → navigate('/dashboard') + sélectionner ce site dans uiStore
  - Si isLoading : 4 lignes skeleton (3 sites + total)
  - Responsive mobile : tableau scrollable horizontalement


COMPOSANT RevenueLineChart — RevenueLineChart.tsx
---------------------------------------------------
Graphique en courbes de l'évolution du CA par site.

  interface RevenueChartData {
    labels: string[];            // périodes selon le sélecteur
    datasets: Array<{
      site: string;
      siteId: string;
      data: number[];
      color: string;
    }>;
  }

Configuration Chart.js :
  - Type : Line chart, tension: 0.3 (courbes légèrement arrondies)
  - fill: false (pas de remplissage sous les courbes)
  - pointRadius: 4, pointHoverRadius: 6
  - Une couleur par site (identique à SalesChart : Goma=#2E86C1, etc.)
  - Légende en haut : sites avec point coloré
  - Y-axis : formatCDF() sur les ticks
  - Tooltip : nom du site + montant CDF exact
  - Hauteur fixe : 300px

Labels selon la période :
  'month'   → jours du mois ("1", "2", ..., "31")
  'quarter' → semaines ("S1 Jan", "S2 Jan", ...)
  'year'    → mois ("Jan", "Fév", ..., "Déc")


COMPOSANT TopProductsList — TopProductsList.tsx
-------------------------------------------------
Classement des 5 produits les plus vendus sur la période.

  interface TopProduct {
    rang: number;
    produitId: string;
    produitNom: string;
    sku: string;
    categorie: string;
    quantiteVendue: number;
    caGenere: number;           // en CDF
    siteLeader: string;         // site avec le plus de ventes de ce produit
  }

Affichage :
  - Carte blanche avec titre "Top 5 Produits" + "Sur la période sélectionnée"
  - 5 lignes : [Rang badge] [SKU Mono] [Nom produit] ... [Qté] [CA]
  - Rang 1 : badge doré (#FFC107), rang 2 : badge argenté, rang 3 : badge bronze
  - Rangs 4-5 : badge gris
  - Quantité en Roboto Mono
  - CA formaté avec formatCDF()
  - Clic sur une ligne → navigate(`/stocks/${product.produitId}`)
  - Si isLoading : 5 lignes skeleton
  - Si liste vide : "Aucune vente sur cette période"


COMPOSANT TopParrainsList — TopParrainsList.tsx
-------------------------------------------------
Classement des 5 meilleurs parrains du mois.

  interface TopParrain {
    rang: number;
    clientId: string;
    clientNom: string;
    clientPrenom: string;
    siteNom: string;
    nbFilleulsActives: number;
    recompenseDue: number;      // en CDF ou points selon la configuration
    recompenseType: 'POINTS' | 'REMISE' | 'COMMISSION';
  }

Affichage :
  - Carte blanche avec titre "Top 5 Parrains" + "Ce mois"
  - 5 lignes : [Rang badge] [Avatar initiales] [Nom + site] ... [Filleuls] [Récompense]
  - Même logique de badges rang que TopProductsList
  - Avatar : initiales sur fond coloré (identique aux transactions)
  - Filleuls : "12 filleuls" en Roboto Mono
  - Récompense : formatée selon recompenseType
      POINTS     → "500 pts"
      COMMISSION → formatCDF(recompenseDue)
      REMISE     → "5%"
  - Clic sur une ligne → navigate(`/parrainage/tree/${parrain.clientId}`)
  - Lien "Voir tout →" → navigate('/parrainage')


HOOK useRegionalDashboard — useRegionalDashboard.ts
------------------------------------------------------
  // apps/client/src/hooks/useRegionalDashboard.ts
  export function useRegionalDashboard(period: string, dateRange?: { from: Date; to: Date }) {
    return {
      comparison,           // UseQueryResult<ComparisonData>
      revenueChart,         // UseQueryResult<RevenueChartData>
      topProducts,          // UseQueryResult<TopProduct[]>
      topParrains,          // UseQueryResult<TopParrain[]>
      isAnyLoading,
      refetchAll,
    };
  }

Configuration TanStack Query :
  - staleTime : 5 * 60 * 1000 (5 minutes)
  - queryKey : ['regional', 'comparison', period, dateRange]
               ['regional', 'revenue', period, dateRange]
               ['regional', 'top-products', period, dateRange]
               ['regional', 'top-parrains', period]
  - Pas de polling sur cette page (données moins critiques)
  - Pas de cache Dexie (données trop volumineuses)
  - Si erreur réseau → Alert rouge avec bouton "Réessayer"


BOUTON EXPORT PDF
------------------
Bouton "Export PDF" dans le Header de la page (visible uniquement DIR_REGIONAL, SUPER_ADMIN) :

  Comportement au clic :
    1. Spinner sur le bouton, texte "Génération..."
    2. POST /api/v1/rapports/export avec { type: 'DASHBOARD_REGIONAL', format: 'PDF', filtres: { period } }
    3. Récupérer le jobId en réponse
    4. Polling GET /api/v1/rapports/export/:jobId toutes les 2 secondes
    5. Quand statut = 'READY' → télécharger via window.open(downloadUrl)
    6. Toast succès : "Rapport PDF téléchargé avec succès."
    7. Si erreur → Toast rouge : "Erreur lors de la génération du rapport."


APPELS API
-----------
GET /api/v1/dashboard/regional
  En-têtes : Authorization: Bearer <accessToken>
  Query params : { period: 'month'|'quarter'|'year', dateFrom?: string, dateTo?: string }
  Succès 200 :
    {
      comparison: ComparisonData,
      revenueChart: RevenueChartData,
      topProduits: TopProduct[],        // 5 items
      topParrains: TopParrain[]         // 5 items
    }
  Erreur 403 : si role non DIR_REGIONAL et non SUPER_ADMIN

Note d'optimisation back-end :
  Cette route lance 4 requêtes Prisma en parallèle (Promise.all) pour minimiser
  la latence. Cache Redis TTL 300 secondes avec clé dashboard:regional:{period}.


BACK-END — dashboard.service.ts : méthode getRegional()
---------------------------------------------------------
  async getRegional(userId, period, dateFrom?, dateTo?) {
    // 1. Vérifier le rôle (DIR_REGIONAL ou SUPER_ADMIN uniquement)
    // 2. Calculer dateStart et dateEnd selon period ou dateFrom/dateTo
    // 3. Lancer en parallèle (Promise.all) :
    //    a. getSitesComparison(dateStart, dateEnd)
    //    b. getRevenueChart(dateStart, dateEnd, period)
    //    c. getTopProducts(dateStart, dateEnd, 5)
    //    d. getTopParrains(period, 5)
    // 4. Retourner l'objet consolidé
  }

  async getSitesComparison(dateStart, dateEnd) {
    // Pour chaque site (Goma, Bukavu, Kinshasa) en parallèle :
    //   - SUM Vente.montantNet (filtre dateStart/dateEnd, statut=VALIDE)
    //   - COUNT Vente
    //   - COUNT Client WHERE statut=ACTIF
    //   - COUNT StockSite WHERE quantite <= seuilAlerte
    //   - Calcul caVariation vs même période précédente
    // Calculer les totaux
  }

  async getTopProducts(dateStart, dateEnd, limit) {
    // Prisma : groupBy LigneVente.produitId
    //   SUM quantite, SUM (quantite * prixUnitaire)
    //   filtre ventes dans la période
    //   ORDER BY SUM(quantite) DESC, LIMIT 5
    // Joindre avec Produit pour nom, SKU, catégorie
    // Identifier le siteLeader (site avec le plus de ventes du produit)
  }

  async getTopParrains(period, limit) {
    // Prisma : groupBy Parrainage.parrainId
    //   COUNT filleuls WHERE statut='VALIDE' ET dateCreation dans la période
    //   ORDER BY COUNT DESC, LIMIT 5
    // Calculer la récompense due selon la configuration active
    // Joindre avec Client pour nom, prénom, site
  }


TESTS — RegionalDashboardPage.test.tsx
----------------------------------------
  describe('RegionalDashboardPage', () => {
    describe('Accès et sécurité', () => {
      test('1  — Accès refusé pour AGENT → AccessDenied affiché')
      test('2  — Accès refusé pour GERANT → AccessDenied affiché')
      test('3  — Accès accordé pour DIR_REGIONAL')
      test('4  — Accès accordé pour SUPER_ADMIN')
    })

    describe('Tableau comparatif', () => {
      test('5  — 4 lignes skeleton pendant chargement (3 sites + total)')
      test('6  — Ligne Goma avec CA et ventes corrects')
      test('7  — Ligne TOTAL = somme des 3 sites')
      test('8  — Badge rouge affiché si alertes > 0')
      test('9  — Clic sur ligne Bukavu sélectionne Bukavu dans uiStore')
      test('10 — Variation CA positive : flèche verte')
      test('11 — Variation CA négative : flèche rouge')
    })

    describe('Graphique revenus', () => {
      test('12 — Skeleton pendant chargement')
      test('13 — 3 courbes rendues (une par site)')
      test('14 — Labels changent selon la période sélectionnée')
    })

    describe('Top 5 Produits', () => {
      test('15 — Skeleton 5 lignes pendant chargement')
      test('16 — Rang 1 avec badge doré')
      test('17 — Clic navigue vers /stocks/:produitId')
      test('18 — Empty state si aucune vente')
    })

    describe('Top 5 Parrains', () => {
      test('19 — Skeleton 5 lignes pendant chargement')
      test('20 — Rang 1 avec badge doré')
      test('21 — Clic navigue vers /parrainage/tree/:clientId')
      test('22 — Récompense POINTS affichée en "X pts"')
      test('23 — Récompense COMMISSION affichée en CDF')
    })

    describe('Sélecteur de période', () => {
      test('24 — Changement de période invalide les queries')
      test('25 — DateRangePicker s\'ouvre sur "Personnalisé"')
    })

    describe('Export PDF', () => {
      test('26 — Spinner visible pendant la génération')
      test('27 — window.open appelé quand statut=READY')
      test('28 — Toast erreur si génération échoue')
    })
  })

  Mocks à créer :
    - vi.mock('../hooks/useRegionalDashboard')
    - vi.mock('../stores/auth.store') → rôles DIR_REGIONAL et SUPER_ADMIN
    - vi.mock('react-chartjs-2')
    - vi.mock('../lib/api') → mock export PDF polling


DÉFINITION DE "TERMINÉ" — CHECKLIST
--------------------------------------
Avant de considérer ce module DASHBOARD comme terminé :

INTERFACE
[ ] La page RegionalDashboard utilise bien AppLayout (sidebar + header identiques)
[ ] Accès interdit pour AGENT et GERANT (composant AccessDenied)
[ ] Sélecteur de période fonctionnel (mois / trimestre / année / personnalisé)
[ ] DateRangePicker fonctionnel pour la période personnalisée

TABLEAU COMPARATIF
[ ] 3 lignes de sites + 1 ligne TOTAL affichées
[ ] CA formaté en CDF avec séparateurs de milliers
[ ] Variations colorées (vert/rouge) correctement calculées
[ ] Clic sur une ligne sélectionne le site dans uiStore

GRAPHIQUES
[ ] RevenueLineChart : 3 courbes (une par site) avec couleurs distinctes
[ ] Labels dynamiques selon la période (jours / semaines / mois)
[ ] Hauteur fixe 300px, responsive

CLASSEMENTS
[ ] Top 5 produits avec badges rang (or/argent/bronze/gris)
[ ] Top 5 parrains avec avatar + format récompense selon le type
[ ] Clics naviguent vers les bonnes routes

EXPORT
[ ] Bouton Export PDF déclenche la génération serveur
[ ] Polling de statut fonctionne jusqu'à READY
[ ] Téléchargement automatique via window.open()

BACK-END
[ ] GET /api/v1/dashboard/regional retourne les 4 blocs de données
[ ] Les 4 requêtes Prisma sont lancées en Promise.all
[ ] Cache Redis 5 minutes actif
[ ] Accès 403 si rôle insuffisant

TESTS
[ ] npm run test passe sans erreur (28 tests RegionalDashboardPage)
[ ] Couverture RegionalDashboardPage.tsx ≥ 75%
[ ] Couverture SitesComparisonTable.tsx ≥ 85%
[ ] Couverture useRegionalDashboard.ts ≥ 80%
```

---

## RÉCAPITULATIF DES 2 PROMPTS — MODULE DASHBOARD

| N° | Écran   | Route                 | Fichier principal                                    | Priorité | Durée est. |
|----|---------|-----------------------|------------------------------------------------------|----------|------------|
| 1  | SCR-003 | /dashboard            | pages/dashboard/DashboardPage.tsx                    | **P0**   | ~4-5h      |
| 2  | SCR-004 | /dashboard/regional   | pages/dashboard/RegionalDashboardPage.tsx            | **P0**   | ~2-3h      |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Module AUTH (SCR-001 & SCR-002) — TERMINÉ
  ↓ Fournit : useAuth, ProtectedRoute, api.ts, OfflineBanner, db.ts (Dexie)
  ↓
Prompt 1 (SCR-003 Dashboard Principal)
  ↓ Crée : AppLayout, Sidebar, Header, KpiCard, SalesChart,
            RecentTransactions, StockAlerts, useDashboard, usePolling,
            ui.store.ts, formatCDF() utilitaire
  ↓
Prompt 2 (SCR-004 Dashboard Régional)
  ↓ Utilise : AppLayout, KpiCard, useDashboard (partiel), formatCDF
  ↓ Crée : SitesComparisonTable, RevenueLineChart, TopProductsList,
            TopParrainsList, useRegionalDashboard
  ↓
  → MODULE DASHBOARD COMPLET
  → Prêt pour les modules suivants :
        SCR-005 Liste Clients     (utilise AppLayout + useAuth)
        SCR-006 Fiche Client      (utilise AppLayout + formatCDF)
        SCR-007 Onboarding        (utilise AppLayout + api.ts)
        SCR-012 Caisse POS        (utilise AppLayout + offline-queue.ts)
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. LAYOUT RÉUTILISABLE — Règle absolue :
   → AppLayout, Sidebar et Header créés dans ce module sont les SEULES
     sources de vérité pour le layout de l'application.
   → TOUS les modules suivants importent AppLayout — ne jamais le dupliquer.
   → Toute modification du Sidebar (ajout d'une route) se fait UNIQUEMENT
     dans apps/client/src/layouts/Sidebar.tsx.

2. STORE UI SÉPARÉ DU STORE AUTH :
   → ui.store.ts gère les préférences d'affichage (site sélectionné, période,
     état du sidebar) et est distinct de auth.store.ts.
   → Le selectedSiteId du uiStore est initialisé depuis user.siteId au montage
     de AppLayout si le rôle est AGENT, GERANT ou FORMATEUR.

3. CHART.JS — Règles d'implémentation :
   → Toujours enregistrer les composants Chart.js nécessaires via
     ChartJS.register(...) une seule fois dans main.tsx.
   → Dans les tests Vitest, mocker react-chartjs-2 pour éviter les erreurs
     de canvas non supporté en JSDOM.
   → Ne pas utiliser de version différente de chart.js entre SalesChart
     et RevenueLineChart — même instance partagée.

4. FORMAT CDF — Standardisation :
   → La fonction formatCDF() est définie dans packages/shared/src/utils/format.ts
     et exportée vers apps/client. Ne jamais formater les montants inline.
   → Standard : "1 200 000 CDF" (espace insécable entre milliers, "CDF" en suffixe).
   → Pour les tests : les assertions doivent utiliser
     expect(element).toHaveTextContent('847 500 CDF').

5. PERFORMANCES :
   → Les 4 requêtes du dashboard principal sont lancées en parallèle
     (TanStack Query gère cela automatiquement par défaut).
   → Le polling est conditionnel (online + tab visible) pour ne pas
     surcharger le serveur inutilement.
   → Le cache Redis côté serveur (60-300s) réduit la charge Prisma.
```

---

*TechShop Manager — Prompts Développement Dashboard SCR-003 & SCR-004 — Goma, RDC — v1.0 — 2025*