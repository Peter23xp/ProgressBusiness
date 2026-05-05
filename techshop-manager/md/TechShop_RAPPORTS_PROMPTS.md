# 🛒 PROGRESS BUSINESS — PROMPTS DE DÉVELOPPEMENT
## Module RAPPORTS | Écrans SCR-030 · SCR-031 · SCR-032 · SCR-033 · SCR-034

> **MODE D'EMPLOI :**
> Ce fichier contient **5 prompts indépendants**, un par écran du module Rapports.
> Exécute-les **dans l'ordre numéroté**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Les modules AUTH, DASHBOARD, CLIENTS et STOCKS doivent être **entièrement terminés** avant de
> commencer — AppLayout, useAuth, api.ts, ProtectedRoute, formatCDF et Pagination sont des prérequis.
> Le module VENTES (SCR-012 à SCR-016) doit également être terminé car les rapports agrègent
> les données de ventes.

---

## CONTEXTE GLOBAL (rappel rapide pour chaque prompt)

```
Projet      : Progress Business — Système de Gestion Commercial Multi-Sites
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

## RÉCAPITULATIF DES 5 PROMPTS — MODULE RAPPORTS

| N° | Écran   | Route               | Fichier principal                               | Rôle min     | Priorité | Durée est. |
|----|---------|---------------------|-------------------------------------------------|--------------|----------|------------|
| 1  | SCR-030 | /reports            | pages/reports/ReportsDashboardPage.tsx          | Gérant       | **P0**   | ~3-4h      |
| 2  | SCR-031 | /reports/sales      | pages/reports/SalesDetailReportPage.tsx         | Dir. Régional| **P0**   | ~3h        |
| 3  | SCR-032 | /reports/stocks     | pages/reports/StocksReportPage.tsx              | Dir. Régional| **P0**   | ~2h        |
| 4  | SCR-033 | /reports/parrainage | pages/reports/ParrainageReportPage.tsx          | Gérant       | **P1**   | ~2-3h      |
| 5  | SCR-034 | /reports/export     | pages/reports/ExportPage.tsx                    | Gérant       | **P1**   | ~2h        |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Modules AUTH + DASHBOARD + CLIENTS + STOCKS + VENTES — TERMINÉS
  ↓ Fournit : AppLayout, useAuth, api.ts, ProtectedRoute, formatCDF,
              Pagination, SalesChart (SCR-003), SitesComparisonTable (SCR-004)
  ↓
Prompt 1 (SCR-030 — Rapports Dashboard)
  ↓ Crée : reports.api.ts, useReportsQuery hook, DateRangePicker (réutilisable),
            RevenueLineChart (si pas déjà en SCR-004), DoughnutSiteChart,
            SitesSummaryTable, TopProductsBarChart, PeriodSelector
  ↓
Prompt 2 (SCR-031 — Rapport Ventes Détaillé)
  ↓ Utilise : reports.api.ts, DateRangePicker, PeriodSelector, formatCDF, Pagination
  ↓ Crée : useSalesDetailReport hook, AdvancedFiltersPanel,
            SalesDetailTable, AgentPerformanceTable
  ↓
Prompt 3 (SCR-032 — Rapport Stocks Multi-Sites)
  ↓ Utilise : reports.api.ts, StockStatusBadge (SCR-017), formatCDF
  ↓ Crée : useStocksReport hook, ConsolidatedStockTable, StockValueCard
  ↓
Prompt 4 (SCR-033 — Rapport Parrainage)
  ↓ Utilise : reports.api.ts, DateRangePicker, formatCDF, Pagination
  ↓ Crée : useParrainageReport hook, OnboardingFunnelChart,
            TopParrainsRankedTable, RecompensesDuesTable
  ↓
Prompt 5 (SCR-034 — Export Excel / PDF)
  ↓ Utilise : reports.api.ts, DateRangePicker
  ↓ Crée : useExportJob hook (polling), ExportConfigForm, ExportProgressCard
  ↓
  → MODULE RAPPORTS COMPLET
  → Prêt pour :
        Module PARAMÈTRES (SCR-039 à SCR-042)
        Module PORTAIL CLIENT (SCR-035 à SCR-038)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 5 — SCR-030 : RAPPORTS DASHBOARD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/reports/ReportsDashboardPage.tsx
Route       : /reports
Accès       : Protégé — rôle minimum : GERANT
Dépendances : AppLayout, useAuth, api.ts, ProtectedRoute, formatCDF


OBJECTIF
--------
Créer la page principale du module Rapports (SCR-030). C'est une vue synthétique
avec 4 visualisations : une courbe d'évolution du CA, un camembert de répartition
par site, un tableau résumé par site et un graphique barres des top produits.
Elle crée le client API partagé (reports.api.ts) et les composants de période
réutilisés dans tous les autres écrans du module.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/reports/ReportsDashboardPage.tsx         ← CRÉER
2.  apps/client/src/pages/reports/ReportsDashboardPage.test.tsx    ← CRÉER
3.  apps/client/src/api/reports.api.ts                             ← CRÉER (client API module)
4.  apps/client/src/hooks/useReportsDashboard.ts                   ← CRÉER (TanStack Query)
5.  apps/client/src/components/reports/PeriodSelector.tsx          ← CRÉER (réutilisable)
6.  apps/client/src/components/reports/DateRangePicker.tsx         ← CRÉER (réutilisable)
7.  apps/client/src/components/reports/DoughnutSiteChart.tsx       ← CRÉER
8.  apps/client/src/components/reports/SitesSummaryTable.tsx       ← CRÉER
9.  apps/client/src/components/reports/TopProductsBarChart.tsx     ← CRÉER
10. apps/client/src/router/index.tsx                               ← MODIFIER (ajouter /reports/*)

BACK-END :
11. apps/server/src/modules/rapports/rapports.module.ts            ← CRÉER
12. apps/server/src/modules/rapports/rapports.controller.ts        ← CRÉER
13. apps/server/src/modules/rapports/rapports.service.ts           ← CRÉER
14. apps/server/src/modules/rapports/dto/rapports.dto.ts           ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
Page dans AppLayout. Zone contenu :

  ┌──────────────────────────────────────────────────────────────────┐
  │  Rapports                    [Ce mois ▼]  [Du __/__] [Au __/__] │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐  │
  │  │  Évolution du CA — par site (Chart.js Line)               │  │
  │  │  [courbe Goma] [courbe Bukavu] [courbe Kinshasa]          │  │
  │  │  Hauteur : 280px                                          │  │
  │  └────────────────────────────────────────────────────────────┘  │
  │                                                                  │
  │  ┌──────────────────┐  ┌─────────────────────────────────────┐   │
  │  │ Répartition par  │  │ Résumé par site                     │   │
  │  │ site (Doughnut)  │  │ Site | CA | Ventes | Nvx clients    │   │
  │  │ [camembert]      │  │ Alertes stock                       │   │
  │  │                  │  │ Goma    | 4 200 000 | 87 | 12 | 2  │   │
  │  │ Total :          │  │ Bukavu  | 2 850 000 | 56 |  8 | 5  │   │
  │  │ 8 150 000 CDF    │  │ Kinshasa| 1 100 000 | 23 |  3 | 0  │   │
  │  └──────────────────┘  │ TOTAL   | 8 150 000 |166 | 23 | 7  │   │
  │                        └─────────────────────────────────────┘   │
  │                                                                  │
  │  ┌────────────────────────────────────────────────────────────┐  │
  │  │  Top 5 produits — par quantité vendue (Chart.js Bar)      │  │
  │  │  Horizontal, triées par quantité DESC                     │  │
  │  │  Hauteur : 220px                                          │  │
  │  └────────────────────────────────────────────────────────────┘  │
  └──────────────────────────────────────────────────────────────────┘


COMPOSANT PeriodSelector — PeriodSelector.tsx
----------------------------------------------
Sélecteur de période réutilisé dans SCR-030, SCR-031, SCR-033.

  interface PeriodSelectorProps {
    value: PeriodPreset;
    onChange: (preset: PeriodPreset, range: DateRange) => void;
    allowedPresets?: PeriodPreset[];   // restreindre les options disponibles
    showCustom?: boolean;              // afficher l'option "Personnalisé" (défaut: true)
  }

  type PeriodPreset =
    | 'today'
    | 'this_week'
    | 'this_month'
    | 'last_month'
    | 'this_quarter'
    | 'this_year'
    | 'custom';

  interface DateRange { from: Date; to: Date }

Affichage Select shadcn :
  Aujourd'hui | Cette semaine | Ce mois | Mois dernier | Ce trimestre | Cette année | Personnalisé

Quand "Personnalisé" sélectionné → afficher DateRangePicker à côté.
Calcul automatique des DateRange selon le preset (utilitaire dateRange.utils.ts).

Exportée aussi :
  export function getDateRangeFromPreset(preset: PeriodPreset): DateRange
  // Utilisée par tous les hooks du module pour calculer dateDebut / dateFin


COMPOSANT DateRangePicker — DateRangePicker.tsx
------------------------------------------------
Sélecteur de plage de dates basé sur shadcn Popover + Calendar.

  interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    maxDate?: Date;          // défaut : aujourd'hui
    minDate?: Date;          // défaut : 2 ans en arrière
    placeholder?: string;
    disabled?: boolean;
  }

Affichage :
  Bouton avec icône CalendarRange (lucide-react) :
  "Du 01/01/2025 au 31/01/2025" — clic ouvre le Popover.

Popover contient :
  - 2 calendriers côte à côte (mois courant + mois suivant) sur desktop
  - 1 calendrier sur mobile
  - Sélection : clic premier = dateFrom, clic second = dateTo
  - Plage surlignée en bleu clair (#D6E4F0) entre les deux dates
  - Bouton "Appliquer" → ferme le Popover et appelle onChange
  - Bouton "Réinitialiser" → revient à la plage par défaut


CLIENT API — reports.api.ts
-----------------------------
  // apps/client/src/api/reports.api.ts
  import { api } from '../lib/api';

  export const reportsApi = {
    // SCR-030
    getVentesReport: (params: VentesReportParams) =>
      api.get<VentesReportResponse>('/api/v1/rapports/ventes', { params }),

    // SCR-031
    getVentesDetail: (params: VentesDetailParams) =>
      api.get<VentesDetailResponse>('/api/v1/rapports/ventes/detail', { params }),

    // SCR-032
    getStocksReport: (params: StocksReportParams) =>
      api.get<StocksReportResponse>('/api/v1/rapports/stocks', { params }),

    // SCR-033
    getParrainageReport: (params: ParrainageReportParams) =>
      api.get<ParrainageReportResponse>('/api/v1/rapports/parrainage', { params }),

    // SCR-034
    createExportJob: (body: ExportJobDto) =>
      api.post<{ jobId: string }>('/api/v1/rapports/export', body),

    getExportJobStatus: (jobId: string) =>
      api.get<ExportJobStatus>(`/api/v1/rapports/export/${jobId}`),
  };

  // Types partagés
  interface VentesReportParams {
    siteId?: string;
    dateDebut: string;    // ISO date "2025-01-01"
    dateFin: string;      // ISO date "2025-01-31"
    granularite: 'day' | 'week' | 'month';
  }

  interface VentesReportResponse {
    seriesCA: Array<{ label: string; values: Record<string, number> }>;
    totalCA: number;
    nbVentes: number;
    topProduits: Array<{ nom: string; sku: string; quantite: number; ca: number }>;
    parSite: Array<{
      siteId: string;
      siteNom: string;
      ca: number;
      nbVentes: number;
      nbNouveauxClients: number;
      alertesStock: number;
      pourcentageCA: number;   // % du CA total
    }>;
  }


COMPOSANT DoughnutSiteChart — DoughnutSiteChart.tsx
----------------------------------------------------
Graphique camembert (Doughnut) de répartition du CA par site.

  interface DoughnutSiteChartProps {
    data: Array<{ siteNom: string; ca: number; pourcentage: number }>;
    totalCA: number;
    isLoading: boolean;
  }

Configuration Chart.js :
  - Type : Doughnut
  - Couleurs : Goma=#2E86C1 · Bukavu=#1A6B3A · Kinshasa=#E65100
  - cutout: '65%' (anneau)
  - Légende : à droite (liste colorée)
  - Tooltip : "{Site} — {CA} CDF ({%})"
  - Centre du donut : Total CA en 2 lignes (Roboto Mono)
  - Si isLoading : Skeleton circulaire 200x200px
  - Si data vide : "Aucune vente sur la période" centré

Carte encapsulante :
  - Titre : "Répartition par site"
  - Sous-titre : totalCA formaté avec formatCDF()
  - Fond blanc, ombre légère


COMPOSANT SitesSummaryTable — SitesSummaryTable.tsx
----------------------------------------------------
  interface SitesSummaryTableProps {
    data: VentesReportResponse['parSite'];
    isLoading: boolean;
  }

Colonnes :
  Site | CA (CDF) | Nb ventes | Nvx clients | Alertes stock

Affichage :
  - En-tête : fond #1E3A5F, texte blanc
  - Ligne TOTAL en bas : bold, séparateur fort
  - CA formaté formatCDF()
  - Colonne Alertes : badge rouge si > 0, texte vert "0" si aucune
  - Ligne cliquable → navigate('/dashboard') + sélectionner ce site
  - Skeleton : 4 lignes (3 sites + total) pendant isLoading


COMPOSANT TopProductsBarChart — TopProductsBarChart.tsx
---------------------------------------------------------
  interface TopProductsBarChartProps {
    data: Array<{ nom: string; sku: string; quantite: number; ca: number }>;
    isLoading: boolean;
  }

Configuration Chart.js :
  - Type : Bar horizontal (indexAxis: 'y')
  - Barres bleues (#2E86C1) avec hover plus clair
  - Labels : noms des produits (tronqués à 25 chars si trop longs)
  - X-axis : quantités vendues (entiers)
  - Tooltip : "{Nom} — {Qté} unités · {CA} CDF"
  - Hauteur fixe : 220px
  - Legend cachée (indexAxis y, un seul dataset)
  - Si isLoading : Skeleton 220px
  - Si data vide : "Aucune vente sur la période"

Carte encapsulante :
  - Titre : "Top 5 produits — par quantité vendue"
  - Lien "Rapport détaillé →" → navigate('/reports/sales')


HOOK useReportsDashboard — useReportsDashboard.ts
---------------------------------------------------
  export function useReportsDashboard(params: VentesReportParams) {
    // queryKey : ['reports', 'dashboard', params]
    // staleTime : 5 * 60 * 1000 (5 minutes)
    // enabled : !!params.dateDebut && !!params.dateFin
    return { data, isLoading, error, refetch };
  }

Granularité calculée automatiquement selon la plage :
  - Plage ≤ 31 jours   → granularite = 'day'
  - Plage 32-90 jours  → granularite = 'week'
  - Plage > 90 jours   → granularite = 'month'


RÈGLES D'AFFICHAGE PAR RÔLE
-----------------------------
  GERANT :
    - Sélecteur site MASQUÉ (données forcées sur son site)
    - Camembert MASQUÉ (1 seul site = pas de répartition pertinente)
    - SitesSummaryTable : 1 seule ligne (son site) + pas de ligne TOTAL
    - Lien "Vue régionale →" MASQUÉ
    - Accès autorisé

  DIR_REGIONAL / SUPER_ADMIN :
    - Sélecteur site VISIBLE (Tous / Goma / Bukavu / Kinshasa)
    - Tous les graphiques visibles
    - SitesSummaryTable : 3 lignes + TOTAL
    - Lien "Vue régionale →" VISIBLE → navigate('/dashboard/regional')


ÉTATS DE LA PAGE
-----------------
État CHARGEMENT initial :
  - Skeleton 280px pour la courbe CA
  - Skeleton circulaire pour le camembert
  - Skeleton tableau (4 lignes)
  - Skeleton 220px pour le graphique barres

État ERREUR :
  Alert rouge : "Impossible de charger les données du rapport."
  Bouton "Réessayer" → refetch()

État DONNÉES VIDES (aucune vente sur la période) :
  Chaque graphique affiche son empty state propre.
  Pas d'erreur globale.

Comportement changement de période :
  → Invalider le cache TanStack Query et relancer la requête
  → Afficher les skeletons pendant le rechargement (pas de flash blanc)
  → Les graphiques précédents restent visibles (placeholderData: keepPreviousData)


APPELS API
-----------
GET /api/v1/rapports/ventes
  En-têtes : Authorization: Bearer <accessToken>
  Query params :
    siteId?      : string         (forcé = user.siteId si GERANT)
    dateDebut    : string         ISO date
    dateFin      : string         ISO date
    granularite  : 'day' | 'week' | 'month'
  Succès 200 : VentesReportResponse (voir ci-dessus)


BACK-END — rapports.service.ts : getVentesReport()
----------------------------------------------------
  1. Si GERANT → forcer siteId = user.siteId
  2. Calculer les labels selon la granularité :
       'day'   → jours de la plage (format "Lun 20 jan")
       'week'  → semaines (format "S3 jan")
       'month' → mois (format "Jan 2025")
  3. Pour chaque site dans [siteIds] :
     → Prisma : SELECT DATE_TRUNC(granularite, createdAt) as label,
                SUM(montantNet) as ca, COUNT(*) as nb
                FROM Vente WHERE createdAt BETWEEN dateDebut AND dateFin
                AND siteId = siteId AND statut = 'VALIDE'
                GROUP BY label ORDER BY label ASC
  4. Remplir les labels sans données avec 0
  5. Calculer les stats par site (ca, nbVentes, nouveauxClients, alertesStock)
  6. Calculer top 5 produits :
     SELECT p.nom, p.sku, SUM(lv.quantite) as quantite, SUM(lv.quantite * lv.prixUnitaire) as ca
     FROM LigneVente lv JOIN Produit p ON lv.produitId = p.id
     WHERE lv.vente.createdAt BETWEEN ... GROUP BY p.id ORDER BY quantite DESC LIMIT 5
  7. Cache Redis : clé rapports:ventes:{hash(params)}, TTL 300 secondes


TESTS — ReportsDashboardPage.test.tsx
---------------------------------------
  describe('ReportsDashboardPage', () => {
    describe('Accès et affichage', () => {
      test('1  — Accès refusé AGENT → AccessDenied')
      test('2  — Accès accordé GERANT')
      test('3  — Camembert MASQUÉ pour GERANT')
      test('4  — Camembert VISIBLE pour DIR_REGIONAL')
      test('5  — SitesSummaryTable : 1 ligne pour GERANT, 3+total pour DIR_REGIONAL')
    })

    describe('PeriodSelector', () => {
      test('6  — Sélection "Ce mois" calcule dateDebut/dateFin du mois courant')
      test('7  — Sélection "Personnalisé" affiche DateRangePicker')
      test('8  — Changement de période invalide le cache et relance la requête')
      test('9  — Données précédentes restent visibles pendant rechargement (keepPreviousData)')
    })

    describe('DateRangePicker', () => {
      test('10 — Affiche la plage sélectionnée dans le bouton')
      test('11 — Date future interdite')
      test('12 — Bouton Réinitialiser revient à la plage par défaut')
    })

    describe('Graphiques', () => {
      test('13 — Skeleton 280px courbe CA pendant chargement')
      test('14 — Skeleton 220px barres produits pendant chargement')
      test('15 — Empty state courbe CA si aucune vente')
      test('16 — Empty state camembert si aucune vente')
      test('17 — Empty state barres si aucune vente')
    })

    describe('SitesSummaryTable', () => {
      test('18 — Skeleton 4 lignes pendant chargement')
      test('19 — Ligne TOTAL = somme des sites')
      test('20 — Badge rouge alertes si > 0')
      test('21 — Clic ligne navigue vers /dashboard avec site sélectionné')
    })

    describe('Granularité automatique', () => {
      test('22 — Plage ≤ 31 jours → granularite=day')
      test('23 — Plage 32-90 jours → granularite=week')
      test('24 — Plage > 90 jours → granularite=month')
    })
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé AGENT, accordé GERANT+
[ ] PeriodSelector : 7 presets + "Personnalisé" avec DateRangePicker
[ ] DateRangePicker : Popover 2 calendriers, sélection plage, Appliquer / Réinitialiser
[ ] getDateRangeFromPreset() utilitaire exporté et testé unitairement
[ ] Courbe CA (Line Chart) : une courbe par site, labels dynamiques selon granularité
[ ] DoughnutSiteChart : camembert avec total au centre, légende colorée
[ ] Camembert masqué pour GERANT
[ ] SitesSummaryTable : 3 sites + total (DIR_REGIONAL) ou 1 site (GERANT)
[ ] TopProductsBarChart : barres horizontales, top 5, tooltip CA + quantité
[ ] Skeleton + empty states + état erreur pour chaque graphique
[ ] Granularité calculée automatiquement depuis la plage de dates
[ ] GET /api/v1/rapports/ventes : calcul SQL par granularité, cache Redis 5 min
[ ] npm run test — 24 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 5 — SCR-031 : RAPPORT VENTES DÉTAILLÉ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/reports/SalesDetailReportPage.tsx
Route       : /reports/sales
Accès       : Protégé — rôle minimum : DIR_REGIONAL
Dépendances : SCR-030 terminé (reports.api.ts, PeriodSelector, DateRangePicker, formatCDF)


OBJECTIF
--------
Créer le rapport de ventes détaillé (SCR-031) avec filtres avancés multi-critères,
un tableau ligne par ligne de chaque vente, et une section de performance par agent.
Destiné aux Directeurs Régionaux et Super Admins pour une analyse fine des ventes.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/reports/SalesDetailReportPage.tsx           ← CRÉER
2.  apps/client/src/pages/reports/SalesDetailReportPage.test.tsx      ← CRÉER
3.  apps/client/src/hooks/useSalesDetailReport.ts                     ← CRÉER
4.  apps/client/src/components/reports/AdvancedFiltersPanel.tsx       ← CRÉER (réutilisable)
5.  apps/client/src/components/reports/SalesDetailTable.tsx           ← CRÉER
6.  apps/client/src/components/reports/AgentPerformanceTable.tsx      ← CRÉER

BACK-END :
7.  apps/server/src/modules/rapports/rapports.controller.ts           ← MODIFIER
8.  apps/server/src/modules/rapports/rapports.service.ts              ← MODIFIER


UI — STRUCTURE VISUELLE
------------------------
Page dans AppLayout :

  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Rapports   Rapport Ventes Détaillé       [ Export PDF/XLSX ] │
  │                                                                  │
  │  ┌── Filtres ───────────────────────────────────────────────┐    │
  │  │  Période : [Ce mois ▼]  [Du __/__] [Au __/__]           │    │
  │  │  Site    : [Tous ▼]     Agent  : [Tous ▼]               │    │
  │  │  Mode paiement : [Tous ▼]   Catégorie : [Tous ▼]        │    │
  │  │  [ Appliquer ]   [ Réinitialiser ]                       │    │
  │  └──────────────────────────────────────────────────────────┘    │
  │                                                                  │
  │  ┌── Résumé ───────────────────────────────────────────────────┐ │
  │  │  Total CA : 8 150 000 CDF  │  Nb ventes : 166              │ │
  │  │  Remises accordées : 450 000 CDF  │  Ticket moy. : 49 096  │ │
  │  └─────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌── Tableau détaillé (50 lignes / page) ─────────────────────┐  │
  │  │  N° vente │ Date │ Client │ Produits │ Agent │ Site │ Mtt  │  │
  │  │  Mode paiement │ Remise │ Points attribués │ Statut        │  │
  │  │  ──────────────────────────────────────────────────────    │  │
  │  │  GOM-202501-0047 │ 12/01 14:22 │ BAHATI J.P │ Samsung A54 │  │
  │  │  KAMBALE M.      │ Goma        │ 427 500 CDF               │  │
  │  │  Cash            │ -22 500 CDF │ +427 pts   │ ● VALIDE     │  │
  │  └─────────────────────────────────────────────────────────────┘  │
  │  < Précédent   Page 1 / 4   Suivant >                            │
  │                                                                  │
  │  ┌── Performance par agent ────────────────────────────────────┐ │
  │  │  Agent │ Site │ Nb ventes │ CA total │ CA moy. │ Remises    │ │
  │  │  KAMBALE Marie │ Goma │ 45 │ 3 200 000 │ 71 111  │ 180 000 │ │
  │  └─────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────┘


COMPOSANT AdvancedFiltersPanel — AdvancedFiltersPanel.tsx
----------------------------------------------------------
Panneau de filtres avancés réutilisable (utilisé aussi dans SCR-033).

  interface AdvancedFiltersPanelProps {
    filters: SalesFilters;
    onChange: (filters: SalesFilters) => void;
    onApply: () => void;
    onReset: () => void;
    availableAgents: Agent[];
    isLoading?: boolean;
  }

  interface SalesFilters {
    period: PeriodPreset;
    dateRange: DateRange;
    siteId: string | null;        // null = tous les sites
    agentId: string | null;
    modePaiement: ModePaiement | null;
    categorie: string | null;
  }

Comportement :
  - Les filtres sont appliqués uniquement au clic de "Appliquer" (pas en temps réel)
  - Cela évite des requêtes inutiles pendant la configuration des filtres
  - "Réinitialiser" remet tous les filtres à leur valeur par défaut
  - Compteur de filtres actifs : "3 filtres actifs" en badge bleu sur le bouton du panneau
  - Sur mobile : panneau masqué par défaut, bouton "Filtres (3)" → Drawer

  Options du Select Site : Tous | Goma | Bukavu | Kinshasa
  Options du Select Agent : Tous | [liste des agents chargée depuis l'API]
  Options du Select Mode paiement : Tous | Cash | M-Pesa | Airtel Money | Virement
  Options du Select Catégorie : Tous | Smartphones | Accessoires | Audio | Informatique

Chargement des agents (pour le Select Agent) :
  GET /api/v1/users?role=AGENT&siteId=... (selon filtre site actif)
  → Si siteId sélectionné → agents de ce site uniquement
  → Si "Tous" → tous les agents de tous les sites


COMPOSANT SalesDetailTable — SalesDetailTable.tsx
---------------------------------------------------
Tableau paginé de chaque vente individuelle.

  interface SalesDetailTableProps {
    ventes: VenteDetail[];
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    isFetching: boolean;
  }

Colonnes du tableau (2 lignes par vente sur desktop) :
  Ligne 1 : N° vente | Date/Heure | Client | Produit(s) | Agent | Site
  Ligne 2 : Mode paiement | Remise (si applicable) | Points attribués | Montant total | Statut badge

Formatage :
  - N° vente : Roboto Mono, lien → navigate('/sales/:id')
  - Date : "12/01 14:22" (format court)
  - Client : "BAHATI J.P." (tronqué si trop long) ou "Anonyme" si null
  - Produit : premier produit + "et X autres" si plusieurs lignes
  - Montant : formatCDF(), Roboto Mono, bold
  - Remise : "-22 500 CDF (5%)" en rouge si > 0, sinon "—"
  - Points : "+427 pts" en vert si > 0, sinon "—"
  - Statut : badge coloré (VALIDE=vert, RETOURNEE=rouge, ANNULEE=gris)

Comportement :
  - Ligne RETOURNEE ou ANNULEE : fond légèrement grisé (gray-50)
  - Survol : fond bleu très clair (blue-50)
  - Tri : clic sur en-tête "Date" → tri ASC/DESC
  - Pagination avec Pagination.tsx (50 ventes/page desktop, 25 mobile)
  - Spinner discret pendant isFetching (données précédentes restent visibles)


SECTION RÉSUMÉ GLOBAL
-----------------------
4 stat cards sous les filtres :

  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
  │ CA Total         │ │ Nb ventes        │ │ Remises accordées│ │ Ticket moyen     │
  │ 8 150 000 CDF    │ │ 166              │ │ 450 000 CDF      │ │ 49 096 CDF       │
  │ vs mois préc. ↑  │ │ vs mois préc. ↑  │ │                  │ │                  │
  └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘

  ticket_moyen = totalCA / nbVentes (arrondi)
  Trends calculés par le back-end (vs période précédente de même durée).


COMPOSANT AgentPerformanceTable — AgentPerformanceTable.tsx
------------------------------------------------------------
  interface AgentPerformanceTableProps {
    data: AgentPerformance[];
    isLoading: boolean;
  }

  interface AgentPerformance {
    agentId: string;
    agentNom: string;
    agentPrenom: string;
    siteNom: string;
    nbVentes: number;
    caTotal: number;
    caMoyen: number;       // caTotal / nbVentes
    remisesAccordees: number;
  }

Colonnes : Agent | Site | Nb ventes | CA total | CA moyen | Remises accordées

Affichage :
  - Triée par caTotal DESC par défaut
  - Ligne "TOTAL" en bas (somme de toutes les colonnes numériques)
  - CA formaté formatCDF()
  - Clic sur une ligne → ajouter le filtre agentId dans AdvancedFiltersPanel + Appliquer
  - Si isLoading : 5 lignes skeleton


BOUTON EXPORT (Header de la page)
-----------------------------------
Bouton "Export PDF/XLSX" dans le header de la page.
→ navigate('/reports/export?type=VENTES_DETAIL&' + buildQueryString(currentFilters))
Pré-remplit la page SCR-034 avec les filtres courants.


HOOK useSalesDetailReport — useSalesDetailReport.ts
-----------------------------------------------------
  export function useSalesDetailReport(params: VentesDetailParams) {
    const detailQuery = useQuery({
      queryKey: ['reports', 'sales-detail', params],
      queryFn: () => reportsApi.getVentesDetail(params),
      staleTime: 3 * 60 * 1000,
      placeholderData: keepPreviousData,
      enabled: !!params.dateDebut && !!params.dateFin,
    });

    return {
      ventes,           // VenteDetail[]
      meta,             // PaginationMeta
      resume,           // { totalCA, nbVentes, remises, ticketMoyen, trends }
      totauxParAgent,   // AgentPerformance[]
      isLoading,
      isFetching,
      error,
    };
  }


APPELS API
-----------
GET /api/v1/rapports/ventes/detail
  Query params :
    siteId?       : string
    agentId?      : string
    dateDebut     : string
    dateFin       : string
    modePaiement? : ModePaiement
    categorie?    : string
    page          : number (défaut 1)
    limit         : number (défaut 50)
  Succès 200 :
    {
      ventes: VenteDetail[],
      meta: { total, page, limit, totalPages },
      resume: {
        totalCA: number,
        nbVentes: number,
        remisesAccordees: number,
        ticketMoyen: number,
        trends: { ca: number, ventes: number },   // % vs période précédente
      },
      totauxParAgent: AgentPerformance[],
    }

GET /api/v1/users
  Query params : { role: 'AGENT', siteId?: string }
  → Pour peupler le Select Agent dans AdvancedFiltersPanel


BACK-END — rapports.service.ts : getVentesDetail()
----------------------------------------------------
  1. Si DIR_REGIONAL → accès multi-sites autorisé (sans forçage siteId)
  2. Si GERANT → forcer siteId = user.siteId
  3. Construire clause WHERE Prisma :
     - dateDebut / dateFin sur Vente.createdAt
     - siteId si fourni
     - agentId si fourni
     - modePaiement si fourni
     - categorie → JOIN LigneVente → Produit.categorie
     - statut != 'ANNULEE' par défaut (sauf si filtre explicite)
  4. findMany avec include: { client, lignesVente: { include: { produit } }, agent, site }
  5. Calculer le résumé (totalCA = SUM(montantNet), remises = SUM(remiseFidelite))
  6. Calculer les trends (même requête sur la période précédente de même durée)
  7. Grouper par agentId pour totauxParAgent
  8. Cache Redis TTL 120 secondes : clé rapports:ventes_detail:{hash(params)}


TESTS — SalesDetailReportPage.test.tsx
----------------------------------------
  describe('SalesDetailReportPage', () => {
    describe('Accès', () => {
      test('1  — Accès refusé AGENT → AccessDenied')
      test('2  — Accès refusé GERANT → AccessDenied')
      test('3  — Accès accordé DIR_REGIONAL')
      test('4  — Accès accordé SUPER_ADMIN')
    })

    describe('AdvancedFiltersPanel', () => {
      test('5  — Filtres non appliqués avant clic "Appliquer"')
      test('6  — Badge "3 filtres actifs" si 3 filtres non par défaut')
      test('7  — Bouton Réinitialiser remet tous les filtres à zéro')
      test('8  — Select Agent se charge depuis GET /api/v1/users')
      test('9  — Select Agent filtré par site quand site sélectionné')
    })

    describe('Résumé global', () => {
      test('10 — 4 stat cards affichées avec valeurs correctes')
      test('11 — Ticket moyen = totalCA / nbVentes')
      test('12 — Trend positif : flèche verte sur CA')
    })

    describe('SalesDetailTable', () => {
      test('13 — 50 lignes skeleton pendant chargement')
      test('14 — Ligne retournée en fond grisé')
      test('15 — N° vente est un lien vers /sales/:id')
      test('16 — Remise affichée en rouge si > 0')
      test('17 — "Anonyme" si client null')
      test('18 — Tri par Date ASC/DESC au clic sur l\'en-tête')
      test('19 — Pagination : 50 ventes / page')
    })

    describe('AgentPerformanceTable', () => {
      test('20 — Agents triés par CA DESC')
      test('21 — Ligne TOTAL présente')
      test('22 — Clic agent ajoute le filtre agentId et applique')
    })

    describe('Export', () => {
      test('23 — Bouton Export navigue vers /reports/export avec params')
    })
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé AGENT et GERANT, accordé DIR_REGIONAL+
[ ] AdvancedFiltersPanel : 5 filtres, application au clic, compteur badges
[ ] Select Agent chargé dynamiquement depuis l'API, filtré par site
[ ] 4 stat cards résumé (CA, ventes, remises, ticket moyen) avec trends
[ ] SalesDetailTable : 2 lignes par vente, N° lien, remise rouge, tri, pagination
[ ] AgentPerformanceTable : trié CA DESC, ligne TOTAL, clic filtre agent
[ ] Bouton Export → /reports/export avec filtres pré-remplis
[ ] GET /api/v1/rapports/ventes/detail avec tous les filtres
[ ] Cache Redis 2 min, trends calculés vs période précédente
[ ] npm run test — 23 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 5 — SCR-032 : RAPPORT STOCKS MULTI-SITES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/reports/StocksReportPage.tsx
Route       : /reports/stocks
Accès       : Protégé — rôle minimum : DIR_REGIONAL
Dépendances : SCR-030 terminé (reports.api.ts, formatCDF)
              SCR-017 terminé (StockStatusBadge)


OBJECTIF
--------
Créer le rapport de stocks consolidé multi-sites (SCR-032). Il affiche une
vue en tableau croisé : chaque ligne = un produit, chaque colonne de stock =
un site. Il calcule aussi la valeur totale de l'inventaire et liste les produits
en rupture sur au moins un site.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/reports/StocksReportPage.tsx              ← CRÉER
2.  apps/client/src/pages/reports/StocksReportPage.test.tsx         ← CRÉER
3.  apps/client/src/hooks/useStocksReport.ts                        ← CRÉER
4.  apps/client/src/components/reports/ConsolidatedStockTable.tsx   ← CRÉER
5.  apps/client/src/components/reports/StockValueCard.tsx           ← CRÉER

BACK-END :
6.  apps/server/src/modules/rapports/rapports.controller.ts         ← MODIFIER
7.  apps/server/src/modules/rapports/rapports.service.ts            ← MODIFIER


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Rapports   Rapport Stocks Multi-Sites        [ Export XLSX ] │
  │                                                                  │
  │  ┌────────┐  ┌──────────────────────────┐  ┌──────────────────┐ │
  │  │ 3 sites│  │ 47 produits référencés   │  │ Valeur totale    │ │
  │  │ actifs │  │ 12 avec rupture/alerte   │  │ 68 400 000 CDF   │ │
  │  └────────┘  └──────────────────────────┘  └──────────────────┘ │
  │                                                                  │
  │  ┌── Produits en rupture sur ≥ 1 site ─────────────────────┐    │
  │  │  ⚠ 4 produits en rupture totale · 8 en rupture partielle│    │
  │  │  ─────────────────────────────────────────────────────   │    │
  │  │  CHG-65W  │ Chargeur 65W  │ Goma:0  Bukavu:0  Kins.:3  │    │
  │  │  APL-14   │ iPhone 14     │ Goma:0  Bukavu:5  Kins.:0  │    │
  │  └─────────────────────────────────────────────────────────┘    │
  │                                                                  │
  │  [ 🔍 Recherche ] [Catégorie ▼]                                  │
  │                                                                  │
  │  SKU      │ Nom        │ Cat.  │ Goma │ Bukavu │ Kinshasa │Total │
  │  Prix achat│                  │Valeur Goma│Valeur Buk.│...       │
  │  ──────────────────────────────────────────────────────────────  │
  │  SAM-A54  │ Samsung A54│ Phone │  12  │    3   │    8    │  23  │
  │           │            │       │3.8M  │  960K  │  2.56M  │7.36M │
  │  APL-14   │ iPhone 14  │ Phone │  🔴0 │    5   │   🔴0   │   5  │
  │  ─────────────────────────────────────────────────────────────── │
  │  TOTAL    │            │       │ 1 247│  876   │  341    │ 2 464│
  │           │            │       │398M  │  280M  │  109M   │ 787M │
  └──────────────────────────────────────────────────────────────────┘


COMPOSANT ConsolidatedStockTable — ConsolidatedStockTable.tsx
--------------------------------------------------------------
  interface ConsolidatedStockTableProps {
    produits: ProduitConsolide[];
    sites: Site[];                  // [Goma, Bukavu, Kinshasa]
    isLoading: boolean;
    search?: string;
    categorie?: string;
  }

  interface ProduitConsolide {
    produitId: string;
    sku: string;
    nom: string;
    categorie: string;
    prixAchat: number;
    stockParSite: Record<string, number>;   // { "goma-id": 12, "bukavu-id": 3, ... }
    totalStock: number;
    valeurParSite: Record<string, number>;  // prixAchat * stockParSite[siteId]
    valeurTotale: number;
    hasRupture: boolean;                    // au moins un site à 0
  }

Affichage (2 lignes par produit) :
  Ligne 1 : SKU | Nom | Catégorie | Stock Goma | Stock Bukavu | Stock Kinshasa | Total
  Ligne 2 : Prix achat | — | — | Valeur Goma | Valeur Bukavu | Valeur Kinshasa | Valeur totale

  - Stock = 0 : fond de la cellule red-100 + icône 🔴
  - Stock > 0 et ≤ seuil : fond orange-100 (si données seuil disponibles)
  - Stock > seuil : fond vert-50 (optionnel, discret)
  - Cellule valeur en Roboto Mono, formatCDF() abrégé ("3.8M CDF" si ≥ 1 000 000)
  - Ligne TOTAL en bas : sommes de chaque colonne stock + valeur
  - Lignes alternées : blanc / gris-50

Tri :
  Clic "Total" → tri croissant/décroissant du stock total
  Clic "Nom"   → tri alphabétique
  Défaut : produits avec hasRupture=true en haut, puis tri alphabétique

Filtre catégorie + recherche :
  - Filtrés côté client (pas de re-requête serveur — données déjà chargées)
  - Recherche debounce 200ms sur nom + SKU

Responsive mobile :
  - Tableau scrollable horizontalement
  - SKU + Nom sticky à gauche
  - Colonnes sites scrollables à droite


SECTION PRODUITS EN RUPTURE
-----------------------------
Alert shadcn (variant="destructive") au-dessus du tableau principal si hasRupture > 0 :

  Titre : "⚠ Produits nécessitant attention"
  Corps : sous-liste scrollable des produits avec rupture sur au moins 1 site

  Pour chaque produit en rupture :
    [SKU] [Nom] — Goma: [stock ou 🔴0] · Bukavu: [stock ou 🔴0] · Kinshasa: [stock ou 🔴0]

  Clic sur un produit → navigate('/stocks/:produitId')

Compteurs en haut :
  "X produits en rupture totale (tous les sites à 0)"
  "Y produits en rupture partielle (au moins 1 site à 0)"


COMPOSANT StockValueCard — StockValueCard.tsx
----------------------------------------------
Stat card spécialisée pour la valeur d'inventaire.

  interface StockValueCardProps {
    label: string;
    value: number;         // en CDF
    subLabel?: string;     // ex: "47 produits référencés"
    icon: LucideIcon;
    color?: string;
    isLoading?: boolean;
  }

  Affichage :
    [icône] [label]
    [valeur formatée CDF — Roboto Mono]
    [subLabel en gris]

  Utilisé pour :
    Card 1 : "3 sites actifs" (icône MapPin)
    Card 2 : "47 produits · 12 avec alerte/rupture" (icône Package)
    Card 3 : "Valeur totale inventaire" (icône BarChart2)
             → valeur = SUM(prixAchat × stock) tous sites confondus


HOOK useStocksReport — useStocksReport.ts
------------------------------------------
  export function useStocksReport(params: StocksReportParams) {
    // queryKey : ['reports', 'stocks', params]
    // staleTime : 10 * 60 * 1000 (10 minutes — données moins volatiles)
    // Pas de pagination — toutes les données en une requête
    return {
      produits,        // ProduitConsolide[]
      sites,           // Site[]
      valeurTotale,    // number
      ruptures,        // { totales: number, partielles: number, produits: ProduitConsolide[] }
      summary,         // { nbProduits, nbAvecAlerte }
      isLoading,
      error,
    };
  }


APPELS API
-----------
GET /api/v1/rapports/stocks
  Query params :
    dateDebut?   : string   (optionnel — pour historique de stock futur)
    dateFin?     : string
  Succès 200 :
    {
      sites: Site[],                        // [{id, nom, ville}] × 3
      produitsConsolides: ProduitConsolide[],
      valeurTotale: number,
      ruptures: {
        totales: number,                    // tous sites à 0
        partielles: number,                 // au moins 1 site à 0
        produits: ProduitConsolide[],       // liste des produits concernés
      },
      summary: { nbProduits: number, nbAvecAlerte: number }
    }


BACK-END — rapports.service.ts : getStocksReport()
----------------------------------------------------
  1. Vérifier rôle ≥ DIR_REGIONAL
  2. Prisma : SELECT produit.*, stockSite.* FROM Produit
       JOIN StockSite ON StockSite.produitId = Produit.id
       ORDER BY produit.nom ASC
  3. Grouper par produit → construire stockParSite, valeurParSite
  4. Calculer hasRupture, valeurTotale, nbAvecAlerte (stock <= seuilAlerte)
  5. Identifier les ruptures totales (tous sites = 0) et partielles (≥ 1 site = 0)
  6. Cache Redis TTL 600 secondes (10 minutes) : clé rapports:stocks


TESTS — StocksReportPage.test.tsx
------------------------------------
  describe('StocksReportPage', () => {
    describe('Accès', () => {
      test('1  — Accès refusé AGENT → AccessDenied')
      test('2  — Accès refusé GERANT → AccessDenied')
      test('3  — Accès accordé DIR_REGIONAL')
    })

    describe('Cards résumé', () => {
      test('4  — "3 sites actifs" affiché')
      test('5  — Nb produits + nb avec alerte/rupture')
      test('6  — Valeur totale inventaire en CDF')
    })

    describe('Section ruptures', () => {
      test('7  — Alert visible si ruptures > 0')
      test('8  — Alert absente si aucune rupture')
      test('9  — Compteurs ruptures totales vs partielles corrects')
      test('10 — Clic produit navigue vers /stocks/:produitId')
    })

    describe('ConsolidatedStockTable', () => {
      test('11 — Skeleton pendant chargement')
      test('12 — 2 lignes par produit (stock + valeur)')
      test('13 — Cellule stock=0 en fond red-100')
      test('14 — Produits avec rupture en haut du tableau')
      test('15 — Ligne TOTAL en bas avec sommes correctes')
      test('16 — Valeur CDF abrégée (3.8M si >= 1M)')
    })

    describe('Filtres côté client', () => {
      test('17 — Recherche filtre par nom')
      test('18 — Recherche filtre par SKU')
      test('19 — Filtre catégorie Smartphones ne montre que les smartphones')
      test('20 — Ligne TOTAL recalculée après filtrage')
    })

    describe('Export', () => {
      test('21 — Bouton Export XLSX navigue vers /reports/export?type=STOCKS')
    })
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé AGENT et GERANT, accordé DIR_REGIONAL+
[ ] 3 stat cards (sites, produits/alertes, valeur totale)
[ ] Alert ruptures : produits avec ≥ 1 site à 0, compteurs totales/partielles
[ ] ConsolidatedStockTable : 2 lignes/produit, stock + valeur par site
[ ] Cellules stock=0 en rouge, ruptures en haut du tableau
[ ] Valeurs CDF abrégées (3.8M, 280K) pour les colonnes valeur
[ ] Ligne TOTAL somme toutes colonnes
[ ] Filtres côté client (recherche + catégorie) sans re-requête
[ ] Tableau scrollable horizontalement sur mobile (SKU/Nom sticky)
[ ] GET /api/v1/rapports/stocks : consolidation Prisma, cache Redis 10 min
[ ] npm run test — 21 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 5 — SCR-033 : RAPPORT PARRAINAGE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/reports/ParrainageReportPage.tsx
Route       : /reports/parrainage
Accès       : Protégé — rôle minimum : GERANT
Dépendances : SCR-030 terminé (reports.api.ts, PeriodSelector, DateRangePicker, formatCDF)
              SCR-031 terminé (AdvancedFiltersPanel — réutilisé partiellement)


OBJECTIF
--------
Créer le rapport de parrainage (SCR-033) avec 3 sections :
1. Classement des meilleurs parrains
2. Funnel de conversion de l'onboarding (entonnoir)
3. Récompenses dues non encore versées

Ce rapport est stratégique pour mesurer l'efficacité du programme de parrainage
et identifier les récompenses à verser aux parrains les plus actifs.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/reports/ParrainageReportPage.tsx              ← CRÉER
2.  apps/client/src/pages/reports/ParrainageReportPage.test.tsx         ← CRÉER
3.  apps/client/src/hooks/useParrainageReport.ts                        ← CRÉER
4.  apps/client/src/components/reports/OnboardingFunnelChart.tsx        ← CRÉER
5.  apps/client/src/components/reports/TopParrainsRankedTable.tsx       ← CRÉER
6.  apps/client/src/components/reports/RecompensesDuesTable.tsx         ← CRÉER

BACK-END :
7.  apps/server/src/modules/rapports/rapports.controller.ts             ← MODIFIER
8.  apps/server/src/modules/rapports/rapports.service.ts                ← MODIFIER


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Rapports   Rapport Parrainage         [Ce mois ▼] [Site ▼]  │
  │                                                                  │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
  │  │ Parrainages│ │ Filleuls   │ │ Récompenses│ │ CA généré    │  │
  │  │ actifs : 87│ │ activés:34 │ │ dues : 12  │ │ par filleuls │  │
  │  │            │ │ ce mois    │ │            │ │ 2 400 000 CDF│  │
  │  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │
  │                                                                  │
  │  ┌── Funnel de conversion Onboarding ──────────────────────┐     │
  │  │   Récits vendus    ████████████████████████  145 (100%) │     │
  │  │   Formations       ████████████████████      130  (90%) │     │
  │  │   Fiches achetées  ████████████████          120  (83%) │     │
  │  │   Activations      ██████████████████         98  (68%) │     │
  │  │   Taux global de conversion : 68%                        │     │
  │  └─────────────────────────────────────────────────────────┘     │
  │                                                                  │
  │  ┌── Top Parrains ────────────────────────────────────────────┐  │
  │  │  Rang │ Parrain       │ Site   │ Filleuls │ CA filleuls    │  │
  │  │  Récompense due       │ Statut récompense                   │  │
  │  │  ─────────────────────────────────────────────────────     │  │
  │  │  🥇 1 │ MASUDI Serge  │ Goma   │ 12       │ 800 000 CDF   │  │
  │  │       │ 500 pts due   │ ● EN ATTENTE                       │  │
  │  └─────────────────────────────────────────────────────────────┘ │
  │                                                                  │
  │  ┌── Récompenses dues ────────────────────────────────────────┐  │
  │  │  Parrain │ Filleul │ Date activation │ Récomp. │ Statut   │  │
  │  │  MASUDI  │ BAHATI  │ 13/01/2025      │ 500 pts │ EN ATT.  │  │
  │  └─────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────┘


COMPOSANT OnboardingFunnelChart — OnboardingFunnelChart.tsx
------------------------------------------------------------
Graphique entonnoir horizontal représentant les 4 étapes de conversion.

  interface OnboardingFunnelChartProps {
    funnel: FunnelData;
    isLoading: boolean;
  }

  interface FunnelData {
    recits: number;
    formations: number;
    fiches: number;
    activations: number;
    tauxConversion: number;    // activations / recits * 100
  }

Affichage (barres horizontales avec largeur proportionnelle) :

  Étape      │ Barre (largeur proportionnelle) │ Count │ %
  ────────────────────────────────────────────────────────
  Récits      ██████████████████████████████     145    100%
  Formations  ████████████████████████████        130    90%
  Fiches      ██████████████████████████           120    83%
  Activations ████████████████████████             98     68%

  - Largeur de chaque barre = (valeur / recits) * 100%
  - Couleurs dégradées : Récits=#2E86C1 → Formations=#1A6B3A → Fiches=#E65100 → Activations=#1E3A5F
  - Taux de conversion entre étapes :
      Formations/Récits : "90% ont suivi la formation"
      Fiches/Formations : "92% ont acheté la fiche"
      Activations/Fiches: "82% ont été activés"
  - Taux global en bas : "Taux global de conversion : 68%"

  Implémentation : SVG pur (pas Chart.js — le funnel est plus simple en SVG).
  Hauteur : 200px. Responsive (viewBox adaptatif).

  Si isLoading : Skeleton 4 barres de hauteurs différentes.
  Si funnel.recits = 0 : "Aucune donnée sur cette période."


COMPOSANT TopParrainsRankedTable — TopParrainsRankedTable.tsx
--------------------------------------------------------------
  interface TopParrainsRankedTableProps {
    parrains: TopParrain[];
    isLoading: boolean;
  }

  interface TopParrain {
    rang: number;
    clientId: string;
    nom: string;
    prenom: string;
    siteNom: string;
    nbFilleulsActives: number;     // filleuls avec statut VALIDE ou RECOMPENSE_VERSEE
    caGenereParFilleuls: number;   // somme CA des filleuls sur la période
    recompenseDue: number;
    recompenseType: 'POINTS' | 'REMISE' | 'COMMISSION';
    statutRecompense: 'EN_ATTENTE' | 'VALIDE' | 'RECOMPENSE_VERSEE';
  }

Affichage (2 lignes par parrain) :
  Ligne 1 : [Rang medal] Avatar + Nom | Site | Nb filleuls | CA filleuls
  Ligne 2 : Récompense due | Statut récompense (badge coloré)

Médailles :
  Rang 1 → 🥇 badge doré (#FFC107)
  Rang 2 → 🥈 badge argenté (#78909C)
  Rang 3 → 🥉 badge bronze (#795548)
  Rang 4-10 → numéro sur fond gris

Statut récompense badge :
  EN_ATTENTE       → badge orange "En attente"
  VALIDE           → badge bleu "À verser"
  RECOMPENSE_VERSEE→ badge vert "Versée"

Récompense due :
  POINTS     → "500 pts"
  COMMISSION → formatCDF(recompenseDue)
  REMISE     → "{%} remise prochaine vente"

Clic sur ligne → navigate('/parrainage/tree/:clientId')
Lien "Voir tout →" → navigate('/parrainage')


COMPOSANT RecompensesDuesTable — RecompensesDuesTable.tsx
----------------------------------------------------------
Liste des récompenses en statut VALIDE (à verser) non encore versées.

  interface RecompensesDuesTableProps {
    recompenses: RecompenseDue[];
    isLoading: boolean;
  }

  interface RecompenseDue {
    id: string;
    parrainNom: string;
    parrainId: string;
    filleulNom: string;
    filleulId: string;
    dateActivation: string;
    recompenseType: 'POINTS' | 'REMISE' | 'COMMISSION';
    recompenseValeur: number;
    statutRecompense: 'VALIDE';    // seules les VALIDE sont affichées ici
    createdAt: string;
  }

Colonnes :
  Parrain (lien) | Filleul (lien) | Date activation | Récompense | Depuis

  - "Parrain" : lien → /clients/:parrainId
  - "Filleul" : lien → /clients/:filleulId
  - "Depuis" : date relative depuis dateActivation (date-fns/fr)
  - "Récompense" : formatée selon recompenseType

Tri par défaut : date d'activation ASC (plus ancienne en haut = à verser en priorité)

Bas du tableau :
  Total récompenses dues : "X récompenses · [montant total si COMMISSION]"

Si aucune récompense due :
  Fond vert clair : "✅ Toutes les récompenses ont été versées."


HOOK useParrainageReport — useParrainageReport.ts
---------------------------------------------------
  export function useParrainageReport(params: ParrainageReportParams) {
    // queryKey : ['reports', 'parrainage', params]
    // staleTime : 5 * 60 * 1000
    return {
      summary,           // { parrainagesActifs, filleulsActives, recompensesDues, caGenere }
      funnel,            // FunnelData
      topParrains,       // TopParrain[] (top 10)
      recompensesDues,   // RecompenseDue[]
      isLoading,
      error,
    };
  }


APPELS API
-----------
GET /api/v1/rapports/parrainage
  Query params :
    siteId?    : string     (forcé = user.siteId si GERANT)
    dateDebut  : string
    dateFin    : string
  Succès 200 :
    {
      summary: {
        parrainagesActifs: number,
        filleulsActives: number,       // dans la période
        recompensesDues: number,       // count statut VALIDE
        caGenereParFilleuls: number,   // SUM ventes des filleuls activés dans la période
      },
      funnel: FunnelData,
      topParrains: TopParrain[],       // 10 premiers par nbFilleulsActives DESC
      recompensesDues: RecompenseDue[],
    }


BACK-END — rapports.service.ts : getParrainageReport()
--------------------------------------------------------
  1. Si GERANT → forcer siteId = user.siteId
  2. Calculer le funnel :
     a. recits     = COUNT OnboardingEtape WHERE etape='RECIT' AND statut='COMPLETE' AND createdAt BETWEEN
     b. formations = COUNT OnboardingEtape WHERE etape='FORMATION' AND statut='COMPLETE' AND createdAt BETWEEN
     c. fiches     = COUNT OnboardingEtape WHERE etape='FICHE' AND statut='COMPLETE' AND createdAt BETWEEN
     d. activations= COUNT OnboardingEtape WHERE etape='ACTIVATION' AND statut='COMPLETE' AND createdAt BETWEEN
     e. tauxConversion = activations / recits * 100
  3. Calculer le top 10 parrains :
     Prisma : groupBy Parrainage.parrainId
       COUNT filleuls WHERE statut IN ['VALIDE', 'RECOMPENSE_VERSEE'] AND dateCreation BETWEEN
       SUM ventes des filleuls (JOIN Vente WHERE clientId = filleulId AND createdAt BETWEEN)
       ORDER BY COUNT DESC LIMIT 10
  4. Récupérer les récompenses dues :
     Prisma : findMany Parrainage WHERE statut='VALIDE' AND siteId IN [siteIds]
     ORDER BY dateCreation ASC
  5. Calculer le summary
  6. Cache Redis TTL 300 secondes


TESTS — ParrainageReportPage.test.tsx
---------------------------------------
  describe('ParrainageReportPage', () => {
    describe('Accès', () => {
      test('1  — Accès refusé AGENT → AccessDenied')
      test('2  — Accès accordé GERANT')
      test('3  — Accès accordé DIR_REGIONAL')
    })

    describe('Cards résumé', () => {
      test('4  — 4 stat cards avec valeurs correctes')
      test('5  — CA filleuls formaté en CDF')
    })

    describe('OnboardingFunnelChart', () => {
      test('6  — 4 barres avec largeurs proportionnelles')
      test('7  — Taux conversion entre étapes calculés correctement')
      test('8  — Taux global "68%" affiché')
      test('9  — Skeleton pendant chargement')
      test('10 — Empty state si recits = 0')
    })

    describe('TopParrainsRankedTable', () => {
      test('11 — Médaille 🥇 rang 1, 🥈 rang 2, 🥉 rang 3')
      test('12 — Badge statut "En attente" orange')
      test('13 — Récompense POINTS affichée en "X pts"')
      test('14 — Clic navigue vers /parrainage/tree/:clientId')
    })

    describe('RecompensesDuesTable', () => {
      test('15 — Triée par date activation ASC')
      test('16 — Lien parrain → /clients/:parrainId')
      test('17 — Lien filleul → /clients/:filleulId')
      test('18 — "Depuis" en relatif (date-fns/fr)')
      test('19 — Empty state vert si aucune récompense due')
    })

    describe('Filtres', () => {
      test('20 — PeriodSelector change les données')
      test('21 — Filtre Site masqué pour GERANT')
    })
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé AGENT, accordé GERANT+
[ ] 4 stat cards (parrainages, filleuls, récompenses dues, CA filleuls)
[ ] OnboardingFunnelChart : SVG pur, 4 barres proportionnelles, taux entre étapes
[ ] Taux global de conversion affiché
[ ] TopParrainsRankedTable : médailles, 2 lignes/parrain, badge statut récompense
[ ] RecompensesDuesTable : triée par ancienneté, liens clients, empty state vert
[ ] PeriodSelector + filtre site (masqué GERANT)
[ ] GET /api/v1/rapports/parrainage : funnel SQL, top 10 groupBy, récompenses VALIDE
[ ] Cache Redis 5 min
[ ] npm run test — 21 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 5 / 5 — SCR-034 : EXPORT EXCEL / PDF
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/reports/ExportPage.tsx
Route       : /reports/export
Accès       : Protégé — rôle minimum : GERANT
Dépendances : SCR-030 terminé (reports.api.ts, PeriodSelector, DateRangePicker)


OBJECTIF
--------
Créer la page d'export de rapports (SCR-034). Elle permet de générer des fichiers
XLSX, PDF ou CSV pour 5 types de rapports différents. La génération est asynchrone
(job serveur) avec polling du statut toutes les 2 secondes jusqu'au téléchargement
automatique. La page peut être pré-remplie via des query params depuis les autres
écrans du module.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/reports/ExportPage.tsx           ← CRÉER
2.  apps/client/src/pages/reports/ExportPage.test.tsx      ← CRÉER
3.  apps/client/src/hooks/useExportJob.ts                  ← CRÉER (polling)
4.  apps/client/src/components/reports/ExportConfigForm.tsx← CRÉER
5.  apps/client/src/components/reports/ExportProgressCard.tsx ← CRÉER

BACK-END :
6.  apps/server/src/modules/rapports/rapports.controller.ts← MODIFIER
7.  apps/server/src/modules/rapports/rapports.service.ts   ← MODIFIER
8.  apps/server/src/modules/rapports/export.worker.ts      ← CRÉER (worker génération)
9.  apps/server/src/modules/rapports/dto/export.dto.ts     ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
Page dans AppLayout. Zone contenu — carte centrée max-w-2xl :

  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Rapports   Export de rapports                                 │
  │                                                                  │
  │  ┌── Configuration ──────────────────────────────────────────┐   │
  │  │  Type de rapport *                                        │   │
  │  │  ○ Ventes (synthèse)     ○ Ventes détaillé               │   │
  │  │  ○ Stocks multi-sites    ○ Parrainage                     │   │
  │  │  ○ Clients               ○ Fidélité                       │   │
  │  │                                                           │   │
  │  │  Format *                                                 │   │
  │  │  ◉ XLSX  ○ PDF  ○ CSV                                     │   │
  │  │                                                           │   │
  │  │  Période *    [Ce mois ▼]  [Du __/__/__] [Au __/__/__]   │   │
  │  │                                                           │   │
  │  │  Site         [Tous ▼]   (si DIR_REGIONAL / SUPER_ADMIN)  │   │
  │  │                                                           │   │
  │  │  Aperçu :                                                 │   │
  │  │  "Export XLSX — Rapport Ventes — Du 01/01 au 31/01/2025  │   │
  │  │   Tous sites — ~166 lignes estimées"                      │   │
  │  │                                                           │   │
  │  │          [ ⬇ GÉNÉRER L'EXPORT ]                          │   │
  │  └───────────────────────────────────────────────────────────┘   │
  └──────────────────────────────────────────────────────────────────┘


PRÉ-REMPLISSAGE DEPUIS QUERY PARAMS
-------------------------------------
La page lit les query params à l'initialisation :

  /reports/export?type=VENTES_DETAIL&siteId=goma-id&dateDebut=2025-01-01&dateFin=2025-01-31

  Params supportés :
    type        : 'VENTES' | 'VENTES_DETAIL' | 'STOCKS' | 'PARRAINAGE' | 'CLIENTS' | 'FIDELITE'
    format      : 'XLSX' | 'PDF' | 'CSV'
    siteId      : string
    dateDebut   : string (ISO)
    dateFin     : string (ISO)

  → Pré-remplir ExportConfigForm avec ces valeurs
  → Permettre à l'utilisateur de modifier avant de lancer


COMPOSANT ExportConfigForm — ExportConfigForm.tsx
--------------------------------------------------
  interface ExportConfigFormProps {
    initialValues?: Partial<ExportConfig>;
    onSubmit: (config: ExportConfig) => void;
    isSubmitting: boolean;
  }

  interface ExportConfig {
    type: ExportType;
    format: 'XLSX' | 'PDF' | 'CSV';
    period: PeriodPreset;
    dateRange: DateRange;
    siteId: string | null;
  }

Types de rapport avec descriptions :
  VENTES           → "Rapport synthèse des ventes avec graphiques"
  VENTES_DETAIL    → "Détail ligne par ligne de chaque transaction"
  STOCKS           → "Inventaire consolidé multi-sites"
  PARRAINAGE       → "Classement parrains, funnel et récompenses"
  CLIENTS          → "Liste complète des clients avec statuts"
  FIDELITE         → "Historique des points et niveaux fidélité"

Format disponible par type :
  VENTES           → XLSX, PDF, CSV
  VENTES_DETAIL    → XLSX, CSV (pas PDF — trop de lignes)
  STOCKS           → XLSX, PDF, CSV
  PARRAINAGE       → XLSX, PDF
  CLIENTS          → XLSX, CSV
  FIDELITE         → XLSX, CSV

Estimation du nombre de lignes (affichée dans l'aperçu) :
  → Après sélection type + période → GET /api/v1/rapports/export/estimate
  → Afficher "~X lignes estimées"
  → Si > 50 000 lignes : Alert orange "Volume important — la génération peut prendre 2-3 minutes."

Aperçu textuel :
  "Export [FORMAT] — [Type rapport] — Du [dateDebut] au [dateFin] — [Site] — ~X lignes"
  Mis à jour en temps réel à chaque changement de configuration.


COMPOSANT ExportProgressCard — ExportProgressCard.tsx
------------------------------------------------------
Affiché après le clic "GÉNÉRER L'EXPORT", remplace le formulaire pendant la génération.

  interface ExportProgressCardProps {
    jobId: string;
    config: ExportConfig;
    onComplete: (downloadUrl: string) => void;
    onError: (message: string) => void;
    onReset: () => void;
  }

  États visuels :

  PENDING (génération en cours) :
    ┌──────────────────────────────────────────────────┐
    │  ⟳  Génération en cours...                       │
    │  Rapport Ventes XLSX — Du 01/01 au 31/01/2025    │
    │  ████████████░░░░░░░░░░░░  En attente...         │
    │  (Progress indéterminée, animate-pulse)           │
    │  Cela peut prendre jusqu'à 2 minutes.             │
    │  [ Annuler ]                                      │
    └──────────────────────────────────────────────────┘

  READY (terminé) :
    ┌──────────────────────────────────────────────────┐
    │  ✅  Export prêt !                                │
    │  Rapport Ventes.xlsx — 166 lignes — 1.2 MB       │
    │  [ ⬇ Télécharger maintenant ]                    │
    │  (téléchargement automatique déclenché)           │
    │                                                  │
    │  Lien valide 15 minutes.                          │
    │  [ Générer un autre export ]                      │
    └──────────────────────────────────────────────────┘

  ERROR :
    ┌──────────────────────────────────────────────────┐
    │  ✕  Erreur de génération                         │
    │  La génération du rapport a échoué.              │
    │  Message : "[message serveur]"                   │
    │  [ Réessayer ]   [ Générer un autre export ]     │
    └──────────────────────────────────────────────────┘


HOOK useExportJob — useExportJob.ts
-------------------------------------
Hook de gestion du cycle de vie d'un job d'export avec polling.

  export function useExportJob() {
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<ExportJobStatus | null>(null);

    // Polling actif uniquement si jobId présent ET statut === 'PENDING'
    const pollingQuery = useQuery({
      queryKey: ['export-job', jobId],
      queryFn: () => reportsApi.getExportJobStatus(jobId!),
      enabled: !!jobId && status?.statut === 'PENDING',
      refetchInterval: 2000,             // toutes les 2 secondes
      refetchIntervalInBackground: false, // arrêt si onglet masqué
    });

    // Quand statut passe à READY → déclencher window.open(downloadUrl)
    useEffect(() => {
      if (pollingQuery.data?.statut === 'READY') {
        window.open(pollingQuery.data.downloadUrl, '_blank');
      }
    }, [pollingQuery.data]);

    const startJob = useMutation({
      mutationFn: reportsApi.createExportJob,
      onSuccess: (data) => setJobId(data.jobId),
    });

    return {
      startJob: startJob.mutate,
      isStarting: startJob.isPending,
      jobId,
      status: pollingQuery.data,
      isPolling: !!jobId && pollingQuery.data?.statut === 'PENDING',
      reset: () => { setJobId(null); setStatus(null); },
    };
  }

  interface ExportJobStatus {
    jobId: string;
    statut: 'PENDING' | 'READY' | 'ERROR';
    downloadUrl?: string;
    fileName?: string;
    fileSize?: number;        // en octets
    rowCount?: number;
    errorMessage?: string;
    expiresAt?: string;       // ISO — URL valide 15 minutes
  }


APPELS API
-----------
GET /api/v1/rapports/export/estimate
  Query params : { type: ExportType, dateDebut: string, dateFin: string, siteId?: string }
  Succès 200 : { estimatedRows: number }
  → Résultat approximatif, pas de cache (COUNT rapide)

POST /api/v1/rapports/export
  Corps :
    {
      type: ExportType,
      format: 'XLSX' | 'PDF' | 'CSV',
      filtres: {
        dateDebut: string,
        dateFin: string,
        siteId?: string,
        // autres filtres spécifiques selon le type
      }
    }
  Succès 202 : { jobId: string }   // Accepted — traitement asynchrone
  Erreur 400 : format non supporté pour ce type de rapport
  Erreur 429 : trop de jobs en cours pour cet utilisateur (max 3 simultanés)

GET /api/v1/rapports/export/:jobId
  Succès 200 : ExportJobStatus
  Erreur 404 : jobId inconnu ou expiré


BACK-END — Architecture du système d'export
--------------------------------------------
Le traitement d'export est ASYNCHRONE pour ne pas bloquer le thread NestJS.

  rapports.service.ts : createExportJob()
    1. Vérifier le quota (max 3 jobs PENDING par utilisateur en Redis)
    2. Créer un jobId (UUID v4)
    3. Stocker en Redis : SET "export_job:{jobId}" { statut: 'PENDING', userId, config } EX 3600
    4. Envoyer la tâche au worker (BullMQ queue "export" ou setImmediate() en dev)
    5. Retourner { jobId }

  export.worker.ts : processExportJob()
    1. Lire la config depuis Redis
    2. Exécuter la requête Prisma correspondante au type de rapport
    3. Générer le fichier :
       - XLSX : utiliser exceljs (npm)
             → Créer un workbook, ajouter les en-têtes, remplir les données, apply styles
       - PDF  : utiliser puppeteer (rendu HTML → PDF)
             → Injecter les données dans un template HTML formaté
             → Convertir en PDF avec puppeteer.page.pdf()
       - CSV  : générer le CSV manuellement avec join(',')
    4. Sauvegarder le fichier dans /tmp/progress-business-exports/{jobId}.{ext}
    5. Générer une URL pré-signée (MinIO / S3) ou URL locale : GET /api/v1/rapports/download/{jobId}
    6. Mettre à jour Redis : SET "export_job:{jobId}" { statut: 'READY', downloadUrl, fileName, fileSize, rowCount, expiresAt }

  rapports.controller.ts : getExportStatus()
    → GET Redis "export_job:{jobId}", retourner le status

  Fichiers temporaires :
    - TTL : 15 minutes après READY → nettoyage automatique (CRON ou TTL Redis)
    - Dossier : EXPORT_TEMP_DIR=/tmp/progress-business-exports (variable d'env)
    - Taille max fichier : 50 000 lignes (configurable via EXPORT_MAX_ROWS)

Bibliothèques back-end requises :
  npm install exceljs puppeteer


FORMATS D'EXPORT — Spécifications
------------------------------------
XLSX (exceljs) :
  - En-tête : fond #1E3A5F, texte blanc, bold
  - Lignes alternées : blanc / #F5F5F5
  - Colonnes CDF : format nombre avec séparateurs ("1 200 000")
  - Colonnes dates : format "DD/MM/YYYY HH:mm"
  - Colonne statut : texte + couleur de fond (vert/orange/rouge)
  - Feuilles séparées si plusieurs sections (ex: Ventes + Résumé + Par Agent)
  - En-tête de page : "Progress Business — [Titre rapport] — Généré le [date]"
  - Ligne de pied : "Export confidentiel — Usage interne"

PDF (puppeteer) :
  - Template HTML injecté avec les données
  - Logo Progress Business en haut + titre rapport
  - Tableau stylisé (palette Progress Business)
  - Format A4 paysage pour les tableaux larges
  - Numérotation des pages : "Page X / Y"
  - Pied de page : site + date de génération

CSV :
  - Séparateur : virgule
  - Encodage : UTF-8 avec BOM (pour compatibilité Excel)
  - En-têtes en français
  - Dates format ISO (YYYY-MM-DD)
  - Montants sans séparateurs ni symbole CDF (nombre brut)
  - Guillemets sur les champs texte contenant des virgules


TESTS — ExportPage.test.tsx
------------------------------
  describe('ExportPage', () => {
    describe('Accès et initialisation', () => {
      test('1  — Accès refusé AGENT → AccessDenied')
      test('2  — Accès accordé GERANT')
      test('3  — Pré-remplissage depuis query params type=VENTES_DETAIL')
      test('4  — Pré-remplissage dateDebut et dateFin depuis params')
    })

    describe('ExportConfigForm', () => {
      test('5  — Sélection type VENTES : formats XLSX, PDF, CSV disponibles')
      test('6  — Sélection type VENTES_DETAIL : PDF absent (non supporté)')
      test('7  — Aperçu textuel mis à jour à chaque changement de config')
      test('8  — GET estimate appelé après sélection type + période')
      test('9  — Alert orange si estimatedRows > 50 000')
      test('10 — Bouton GÉNÉRER disabled si type ou format manquant')
    })

    describe('useExportJob — polling', () => {
      test('11 — POST export/create appelé au clic GÉNÉRER')
      test('12 — ExportProgressCard visible après création du job')
      test('13 — Polling toutes les 2 secondes tant que statut=PENDING')
      test('14 — Polling arrêté si statut=READY')
      test('15 — window.open appelé avec downloadUrl quand READY')
      test('16 — Polling arrêté si onglet masqué (refetchIntervalInBackground: false)')
    })

    describe('ExportProgressCard états', () => {
      test('17 — PENDING : progress bar indéterminée + spinner')
      test('18 — READY : "Export prêt !" + bouton télécharger')
      test('19 — ERROR : message erreur + bouton réessayer')
      test('20 — Bouton "Générer un autre export" reset le formulaire')
    })

    describe('Erreurs API', () => {
      test('21 — Erreur 429 (quota) : message "Trop de jobs en cours"')
      test('22 — Erreur 400 (format invalide) : message explicatif')
    })
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé AGENT, accordé GERANT+
[ ] Pré-remplissage depuis query params (type, format, dates, siteId)
[ ] ExportConfigForm : 6 types, formats filtrés par type, aperçu temps réel
[ ] GET estimate : nombre de lignes affiché + alert si > 50 000
[ ] POST /api/v1/rapports/export → jobId retourné (202 Accepted)
[ ] Polling GET /api/v1/rapports/export/:jobId toutes les 2 secondes
[ ] Polling arrêté si onglet masqué ou statut ≠ PENDING
[ ] window.open() déclenché automatiquement quand READY
[ ] ExportProgressCard : 3 états (PENDING / READY / ERROR)
[ ] Export XLSX : en-têtes colorés #1E3A5F, lignes alternées, CDF formaté
[ ] Export PDF : template HTML → puppeteer, A4 paysage, pagination
[ ] Export CSV : UTF-8 BOM, séparateur virgule, guillemets sur textes
[ ] Fichiers temporaires nettoyés après 15 minutes
[ ] Quota Redis : max 3 jobs simultanés par utilisateur
[ ] npm run test — 22 tests passent, couverture ≥ 80%
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. PERFORMANCE DES REQUÊTES SQL — Règle absolue :
   → Toutes les requêtes du module Rapports sont potentiellement lourdes
     (agrégations sur des milliers de ventes).
   → OBLIGATOIRE : index Prisma sur les champs filtrés fréquemment :
       Vente.createdAt, Vente.siteId, Vente.agentId, Vente.statut
       OnboardingEtape.etape, OnboardingEtape.statut, OnboardingEtape.createdAt
       Parrainage.statut, Parrainage.parrainId
   → Utiliser Prisma $queryRaw pour les requêtes GROUP BY complexes
     (les agrégations Prisma ORM sont limitées).
   → Toutes les requêtes de rapport sont mises en cache Redis (TTL 2-10 min).

2. GRANULARITÉ AUTOMATIQUE — Règle cohérence :
   → La fonction getDateRangeFromPreset() ET le calcul de granularité automatique
     sont dans packages/shared/src/utils/dateRange.utils.ts.
   → Cette fonction EST TESTÉE unitairement (100% de couverture).
   → Elle doit être importée par tous les hooks du module — jamais réimplémentée.

3. EXPORTS ASYNCHRONES — Architecture :
   → En développement (NODE_ENV=development) : utiliser setImmediate() pour simuler
     le worker (pas de BullMQ requis en dev).
   → En production (NODE_ENV=production) : utiliser BullMQ + Redis comme queue.
   → Les fichiers temporaires sont créés dans EXPORT_TEMP_DIR (/tmp/progress-business-exports).
   → Nettoyer les fichiers après 15 minutes (CRON ou TTL filesystem).
   → Quota : max 3 jobs PENDING simultanés par utilisateur (Redis counter).

4. OFFLINE — Règle du module Rapports :
   → Aucun écran du module Rapports ne fonctionne en mode hors-ligne.
   → Si offline → afficher Alert bleue sur toute la page :
     "Les rapports nécessitent une connexion internet pour charger les données."
   → Pas de cache Dexie pour les données de rapport (trop volumineuses).
   → Les exports (SCR-034) nécessitent également internet (jobs serveur).

5. PERMISSIONS FINES — Rappel :
   → SCR-030 (Rapports Dashboard) : GERANT+ — AGENT bloqué
   → SCR-031 (Ventes Détaillé)   : DIR_REGIONAL+ — GERANT bloqué
   → SCR-032 (Stocks Multi-Sites): DIR_REGIONAL+ — GERANT bloqué
   → SCR-033 (Parrainage)        : GERANT+ — AGENT bloqué
   → SCR-034 (Export)            : GERANT+ — AGENT bloqué
   → Le filtrage par siteId est FORCÉ côté serveur pour GERANT
     (ne jamais faire confiance au siteId envoyé par le client pour un GERANT).

6. CHART.JS — Réutilisation :
   → Les instances Chart.js (RevenueLineChart, SalesChart) créées dans le module
     DASHBOARD sont les mêmes que celles utilisées ici.
   → Importer depuis apps/client/src/components/dashboard/ si déjà créées.
   → Ne JAMAIS créer une seconde instance du même composant Chart.js — le partager.
   → L'enregistrement ChartJS.register(...) est fait UNE SEULE FOIS dans main.tsx.

7. EXPORT PDF — Contrainte serveur :
   → puppeteer requiert Chromium installé sur le serveur.
   → En développement local : puppeteer télécharge Chromium automatiquement.
   → En production : s'assurer que la dépendance système est disponible
     (Dockerfile : apt-get install -y chromium-browser).
   → Alternative légère si puppeteer pose problème : jsPDF (côté client) pour
     les PDF simples, mais uniquement pour les petits exports (< 1 000 lignes).
```

---

*Progress Business — Prompts Développement Module Rapports SCR-030 à SCR-034 — Goma, RDC — v1.0 — 2025*
