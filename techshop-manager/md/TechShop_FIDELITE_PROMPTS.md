# 🏆 PROGRESS BUSINESS — PROMPTS DE DÉVELOPPEMENT
## Module FIDÉLITÉ | Écrans SCR-027 à SCR-029 | 3 écrans

> **MODE D'EMPLOI :**
> Ce fichier contient **3 prompts indépendants**, un par écran du module Fidélité.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Les modules Auth, Clients, Ventes et Parrainage doivent être TERMINÉS avant de commencer.

---

## CONTEXTE GLOBAL (rappel rapide pour chaque prompt)

```
Projet      : Progress Business — Système de Gestion Commercial Multi-Sites
Stack       : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State       : Zustand (auth + cart) + TanStack Query v5 (serveur)
Offline     : Dexie.js (IndexedDB) + Service Worker (Workbox)
Backend     : Node.js + NestJS + Prisma ORM + PostgreSQL 15 + Redis 7
Tests       : Vitest + Testing Library (front) | Jest + Supertest (back)
Palette     : Bleu foncé #1E3A5F (primary) | Bleu accent #2E86C1 | Blanc #FFFFFF
              Vert #1A6B3A (succès/actif) | Orange #E65100 (alerte) | Rouge #B71C1C (danger)
Monorepo    : apps/client + apps/server + packages/shared
Devise      : Franc Congolais (CDF) — format : 1 200 000 CDF (séparateur espace)
Sites       : Goma (siège), Bukavu, Kinshasa

NIVEAUX FIDÉLITÉ PAR DÉFAUT (configurables dans SCR-029) :
  BRONZE  : 0 – 499 pts    | remise 0%  | couleur : #92400E (amber-800)
  ARGENT  : 500 – 1 999 pts| remise 3%  | couleur : #6B7280 (gray-500)
  OR      : 2 000 – 4 999  | remise 5%  | couleur : #B45309 (yellow-700)
  PLATINE : 5 000+ pts     | remise 8%  | couleur : #6D28D9 (violet-700)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 3 — SCR-027 : PROGRAMME DE FIDÉLITÉ (VUE GLOBALE)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : Progress Business
Fichier cible: apps/client/src/pages/fidelite/FidelitePage.tsx
Route        : /fidelite
Accès        : Authentifié — rôle GERANT minimum
Rôle minimum : GERANT | DIR_REGIONAL | SUPER_ADMIN
Dépendances  : Module Clients terminé (types Client, NiveauFidelite, formatCDF)
               Module Ventes terminé (MouvementPoints types)


OBJECTIF
--------
Créer la page de tableau de bord du programme de fidélité (SCR-027).
Cette page offre au gérant une vue d'ensemble du programme : statistiques clés,
répartition des clients par niveau, top clients fidèles, et historique récent
des attributions de points. Elle sert de page d'entrée vers les détails
individuels (SCR-028) et la configuration (SCR-029).


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/fidelite/FidelitePage.tsx                    ← CRÉER (principal)
2.  apps/client/src/pages/fidelite/FidelitePage.test.tsx               ← CRÉER (tests Vitest)
3.  apps/client/src/components/fidelite/FideliteKpiCards.tsx           ← CRÉER (cartes KPI)
4.  apps/client/src/components/fidelite/NiveauxRepartition.tsx         ← CRÉER (répartition)
5.  apps/client/src/components/fidelite/TopClientsFideles.tsx          ← CRÉER (top clients)
6.  apps/client/src/components/fidelite/PointsHistoryFeed.tsx          ← CRÉER (historique)
7.  apps/client/src/components/fidelite/NiveauBadge.tsx                ← CRÉER (badge niveau)
8.  apps/client/src/components/fidelite/FideliteFiltersBar.tsx         ← CRÉER (filtres)
9.  apps/client/src/hooks/useFideliteGlobal.ts                         ← CRÉER (hook TQ)
10. packages/shared/src/types/fidelite.types.ts                        ← CRÉER (interfaces TS)

BACK-END :
11. apps/server/src/modules/fidelite/fidelite.module.ts                ← CRÉER
12. apps/server/src/modules/fidelite/fidelite.controller.ts            ← CRÉER
13. apps/server/src/modules/fidelite/fidelite.service.ts               ← CRÉER


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Fidélité                        [Ce mois ▼]  [Site ▼]             │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
  │  │ Points distribués│  │ Remises accordées│  │ Clients actifs  │     │
  │  │  124 580 pts    │  │  847 500 CDF    │  │  1 248          │     │
  │  │  ↑ +18%         │  │  ↑ +22%         │  │  ↑ +12 ce mois  │     │
  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
  │                                                                      │
  ├───────────────────────────────────┬──────────────────────────────────┤
  │  RÉPARTITION PAR NIVEAU           │  TOP 10 CLIENTS FIDÈLES          │
  │                                   │                                  │
  │  Bronze  ████████████  68%  849   │  #1  MASUDI Serge    6 200 pts  │
  │  Argent  █████          18%  224  │      ■ Platine                  │
  │  Or      ████            9%  113  │  #2  BAHATI J.P.     4 850 pts  │
  │  Platine  ██             5%   62  │      ■ Or                       │
  │                                   │  #3  KAMBALE Marie   3 210 pts  │
  │  Total : 1 248 clients ACTIFS     │      ■ Or                       │
  │                                   │  ...                             │
  │                                   │  [ Voir tout le classement ]     │
  ├───────────────────────────────────┴──────────────────────────────────┤
  │  DERNIÈRES ATTRIBUTIONS DE POINTS                                    │
  │                                                                      │
  │  17/01 14:32  BAHATI J.P.    Achat 450 000 CDF    + 450 pts  → 2963 │
  │  17/01 11:15  KAMBALE Marie  Parrainage NGABO Y.  + 500 pts  → 3710 │
  │  16/01 16:48  MASUDI Serge   Achat 1 200 000 CDF  +1200 pts  → 6200 │
  │  ...                          [ Voir tout l'historique ]             │
  └──────────────────────────────────────────────────────────────────────┘


TYPES TYPESCRIPT — fidelite.types.ts
---------------------------------------
  // packages/shared/src/types/fidelite.types.ts

  export type NiveauFidelite = 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE';

  export type TypeMouvementPoints =
    | 'ACHAT'              // points gagnés lors d'un achat
    | 'PARRAINAGE'         // points reçus pour avoir parrainé un client activé
    | 'AVOIR_RETOUR'       // points ajoutés lors d'un retour (avoir)
    | 'RETOUR'             // points déduits lors d'un retour
    | 'EXPIRATION'         // points expirés (si configuré)
    | 'AJUSTEMENT_ADMIN';  // ajustement manuel par un admin

  export interface MouvementPoints {
    id: string;
    clientId: string;
    clientNom: string;
    clientPrenom: string;
    type: TypeMouvementPoints;
    description: string;       // ex: "Achat #GOM-202501-047" ou "Parrainage BAHATI J.P."
    deltaPoints: number;       // positif = gain, négatif = déduction
    soldeBefore: number;
    soldeAfter: number;
    createdAt: string;
    siteId: string;
    venteId?: string;          // si lié à une vente
    parrainageId?: string;     // si lié à un parrainage
  }

  export interface NiveauConfig {
    niveau: NiveauFidelite;
    seuilMin: number;
    seuilMax: number | null;   // null pour PLATINE (pas de plafond)
    remisePct: number;
    couleurHex: string;
    avantages: string[];       // liste des avantages textuels
  }

  export interface FideliteConfig {
    id: string;
    ratioPtsCDF: number;       // 1 pt pour X CDF dépensés (défaut: 1000)
    niveaux: NiveauConfig[];
    dureeValiditeMois: number; // 0 = pas d'expiration
    periodeInactiviteMois: number; // 0 = désactivé
    cumulRemises: boolean;     // peut-on cumuler remise fidelité + bon parrainage
    updatedAt: string;
    updatedBy: { id: string; nom: string; prenom: string };
  }

  export interface FideliteStats {
    pointsDistribues: number;
    pointsDistribuesdelta: number;       // % vs période précédente
    remisesAccordees: number;            // en CDF
    remisesAccordeesDelta: number;       // % vs période précédente
    clientsActifsTotal: number;
    clientsActifsDelta: number;          // nb nouveaux actifs
    repartitionNiveaux: {
      niveau: NiveauFidelite;
      count: number;
      pct: number;
    }[];
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


COMPOSANT NiveauBadge — NiveauBadge.tsx
-----------------------------------------
Composant réutilisable dans TOUT le projet pour afficher un niveau fidélité.

  interface NiveauBadgeProps {
    niveau: NiveauFidelite;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showLabel?: boolean;       // afficher le texte ou juste le carré de couleur
    showPoints?: boolean;      // afficher le solde de points à côté
    points?: number;
  }

Rendu selon niveau :
  BRONZE  → carré #92400E + texte "Bronze"
  ARGENT  → carré #6B7280 + texte "Argent"
  OR      → carré #B45309 + texte "Or"
  PLATINE → carré #6D28D9 + texte "Platine"

Le carré est un rectangle 12×12px (size=sm) à 20×20px (size=lg) arrondi.
Font-weight : medium pour le texte.
Si showPoints=true → afficher "[X] pts" en text-muted-foreground juste après.

Export nommé + export d'un helper :
  export function getNiveauColor(niveau: NiveauFidelite): string
  // → retourne le code hex du niveau
  export function getNiveauLabel(niveau: NiveauFidelite): string
  // → retourne le label FR


COMPOSANT FideliteKpiCards — FideliteKpiCards.tsx
---------------------------------------------------
Trois cartes KPI côte à côte :

  Carte 1 — Points distribués :
    - Valeur principale : nombre total de points distribués sur la période
    - Delta (%) vs période précédente avec flèche colorée (vert/rouge)
    - Icône Star (lucide-react) dans le coin
    - Tooltip : "Points attribués lors des achats + parrainages sur la période"

  Carte 2 — Remises accordées :
    - Valeur en CDF (formatCDF)
    - Delta (%) vs période précédente
    - Icône Tag (lucide-react) dans le coin
    - Tooltip : "Montant total des remises fidélité déduites lors des ventes"

  Carte 3 — Clients actifs :
    - Nombre total de clients ACTIF
    - Delta : "+[X] nouveaux clients ce mois"
    - Icône Users (lucide-react) dans le coin
    - Sous-ligne : "dont [Y] ont utilisé leur remise ce mois"

Comportement :
  - Si deltaPoints > 0 → delta en vert avec "↑ +X%"
  - Si deltaPoints < 0 → delta en rouge avec "↓ -X%"
  - Si deltaPoints = 0 → delta en gris "= stable"


COMPOSANT NiveauxRepartition — NiveauxRepartition.tsx
-------------------------------------------------------
Répartition visuelle des clients par niveau de fidélité.

  interface NiveauxRepartitionProps {
    repartition: { niveau: NiveauFidelite; count: number; pct: number }[];
    total: number;
  }

Rendu :
  Pour chaque niveau (Bronze, Argent, Or, Platine) :
    - Badge NiveauBadge (size="sm") avec le nom du niveau
    - Barre de progression horizontale (shadcn Progress) colorée
      selon la couleur du niveau (utiliser style={{ '--progress-color': hex }})
    - Pourcentage affiché à droite de la barre (text-sm font-medium)
    - Nombre de clients absolus en text-xs text-muted-foreground
  
  Barre de référence : la barre la plus grande = 100% de largeur, les autres proportionnelles.

  Pied de section :
    "Total : [X] clients ACTIFS inscrits au programme"
    Lien "Voir la distribution complète" → navigate('/clients?niveau=all')


COMPOSANT TopClientsFideles — TopClientsFideles.tsx
-----------------------------------------------------
Liste des 10 meilleurs clients par points actuels.

  interface TopClientsFidelesProps {
    topClients: TopClientFidele[];
    isLoading: boolean;
  }

Pour chaque client :
  - Badge de rang (#1, #2, #3 avec couleurs or/argent/bronze, #4-10 en gris)
  - Avatar avec initiales (bg couleur du niveau fidélité)
  - Nom + Prénom (font-medium) + téléphone en text-xs muted
  - NiveauBadge (size="xs") à droite du nom
  - Points actuels en font-bold text-right (couleur primaire)
  - Sous-ligne : "Points gagnés ce mois : +[X]" en text-xs muted

Hover : léger bg-neutral-50 + cursor pointer → navigate(`/fidelite/client/${id}`)

Bouton "Voir tout le classement" en bas → ouvre un Dialog avec le top 50 complet.
Le top 50 est chargé en lazy (requête séparée seulement à l'ouverture du dialog).


COMPOSANT PointsHistoryFeed — PointsHistoryFeed.tsx
-----------------------------------------------------
Feed chronologique des dernières attributions de points.

  interface PointsHistoryFeedProps {
    mouvements: MouvementPoints[];
    isLoading: boolean;
    onViewAll: () => void;
  }

Chaque ligne du feed :
  - Date/heure : "17 jan. · 14:32" (date-fns/fr, text-xs muted)
  - Avatar initiales du client + Nom (text-sm font-medium)
  - Description du mouvement (text-sm muted)
    ex : "Achat #GOM-202501-047 — 450 000 CDF"
    ex : "Parrainage NGABO Yvette activée"
  - Delta points avec signe et couleur :
      Positif → text-green-600 font-semibold "+ 450 pts"
      Négatif → text-red-600 font-semibold "- 150 pts"
  - Solde après le mouvement : "→ 2 963 pts" en text-xs muted
  - Icône selon typeMovement :
      ACHAT         → ShoppingBag (lucide)
      PARRAINAGE    → Users (lucide)
      RETOUR        → RotateCcw (lucide)
      AVOIR_RETOUR  → PlusCircle (lucide)
      EXPIRATION    → Clock (lucide)
      AJUSTEMENT    → Settings2 (lucide)

Afficher les 10 mouvements les plus récents.
Bouton "Voir tout l'historique" en bas → navigate('/fidelite') avec onglet Historique actif.


HOOK useFideliteGlobal — useFideliteGlobal.ts
----------------------------------------------
  export function useFideliteGlobal(filters: FideliteFilters) {
    // Query 1 : Stats KPI (cache 3 minutes)
    const statsQuery = useQuery({
      queryKey: ['fidelite', 'stats', filters],
      queryFn: () => fideliteApi.getStats(filters),
      staleTime: 3 * 60_000,
    });

    // Query 2 : Top clients (cache 5 minutes)
    const topQuery = useQuery({
      queryKey: ['fidelite', 'top', filters.siteId, filters.period],
      queryFn: () => fideliteApi.getTopClients({ ...filters, limit: 10 }),
      staleTime: 5 * 60_000,
    });

    // Query 3 : Derniers mouvements de points (cache 1 minute)
    const mouvementsQuery = useQuery({
      queryKey: ['fidelite', 'mouvements', filters],
      queryFn: () => fideliteApi.getRecentMouvements({ ...filters, limit: 10 }),
      staleTime: 60_000,
    });

    return {
      stats, topClients, mouvements,
      isLoading: statsQuery.isLoading || topQuery.isLoading,
      isError: statsQuery.isError,
    };
  }


APPELS API
-----------
GET /api/v1/fidelite/stats
  Query : { siteId?: string, period: 'today' | 'week' | 'month' | 'all' }
  Succès 200 :
    {
      stats: FideliteStats
    }

Back-end — fidelite.service.ts — méthode getStats() :
  1. SUM MouvementPoints.deltaPoints WHERE > 0 AND siteId AND createdAt IN période
     → pointsDistribues
  2. Calculer le delta vs période précédente équivalente (% de variation)
  3. SUM Vente.remiseFidelite WHERE siteId AND createdAt IN période
     → remisesAccordees
  4. COUNT Client WHERE statut='ACTIF' AND siteInscriptionId = siteId
     → clientsActifsTotal
  5. COUNT Client WHERE statut='ACTIF' AND dateActivation IN période
     → clientsActifsDelta
  6. GROUP BY Client.niveauFidelite COUNT(*) → repartitionNiveaux

GET /api/v1/fidelite/top-clients
  Query : { siteId?: string, period?: string, limit?: number (max 50) }
  Succès 200 :
    {
      clients: [TopClientFidele]
    }

GET /api/v1/fidelite/mouvements
  Query : { siteId?: string, period?: string, limit?: number }
  Succès 200 :
    {
      mouvements: [MouvementPoints]
    }


COMPORTEMENTS ET ÉTATS DE LA PAGE
------------------------------------
État 1 — CHARGEMENT
  - 3 cartes KPI : skeleton Card h-28
  - Répartition niveaux : 4 barres skeleton animées
  - Top clients : 5 lignes skeleton
  - Feed historique : 5 lignes skeleton

État 2 — DONNÉES CHARGÉES
  - Tous les composants affichent les données réelles
  - Les 3 queries se chargent en parallèle (pas de waterfall)

État 3 — PROGRAMME NON UTILISÉ (aucune donnée)
  - KPIs à 0
  - Empty state global : icône Star (lucide-react) centré
    "Le programme de fidélité est actif mais n'a pas encore de données.
    Les points seront automatiquement attribués lors des prochaines ventes."

État 4 — FILTRE SITE OU PÉRIODE CHANGÉ
  - keepPreviousData : les données précédentes restent avec opacity-70
  - Spinner discret dans le corner supérieur droit de chaque section


STYLE ET DESIGN
-----------------
- Fond page              : bg-neutral-50
- Cartes KPI             : bg-white border border-neutral-100 rounded-xl shadow-sm
- Section répartition    : bg-white border border-neutral-100 rounded-xl
- Section top clients    : bg-white border border-neutral-100 rounded-xl
- Feed historique        : bg-white border border-neutral-100 rounded-xl
- Barre Bronze           : style={{ '--progress-color': '#92400E' }}
- Barre Argent           : style={{ '--progress-color': '#6B7280' }}
- Barre Or               : style={{ '--progress-color': '#B45309' }}
- Barre Platine          : style={{ '--progress-color': '#6D28D9' }}
- Badge rang #1          : bg-yellow-400 text-yellow-900
- Badge rang #2          : bg-gray-300 text-gray-700
- Badge rang #3          : bg-amber-600 text-white


TESTS — FidelitePage.test.tsx
--------------------------------
  describe('FidelitePage', () => {
    describe('KPI Cards', () => {
      test('1  — Points distribués, remises CDF, clients actifs affichés')
      test('2  — Delta vert si points distribués en hausse')
      test('3  — Delta rouge si points distribués en baisse')
      test('4  — Skeleton visible pendant le chargement')
    })

    describe('Répartition niveaux', () => {
      test('5  — 4 niveaux affichés avec leurs barres de progression')
      test('6  — Pourcentage Bronze plus large que les autres si majority')
      test('7  — Total clients affiché en pied de section')
    })

    describe('Top clients', () => {
      test('8  — Top 10 affiché avec rang, nom, niveau, points')
      test('9  — Badge or pour rang #1, argent #2, bronze #3')
      test('10 — Clic ligne → navigate vers /fidelite/client/:id')
      test('11 — Dialog top 50 s\'ouvre en lazy (requête au clic uniquement)')
    })

    describe('Feed historique', () => {
      test('12 — 10 mouvements récents affichés')
      test('13 — Delta positif affiché en vert')
      test('14 — Delta négatif affiché en rouge')
      test('15 — Icône correcte selon typeMovement')
      test('16 — Lien "Voir tout l\'historique" fonctionne')
    })

    describe('Filtres', () => {
      test('17 — Filtre Période "Ce mois" par défaut')
      test('18 — Filtre Site masqué pour rôle GERANT')
      test('19 — keepPreviousData : pas de flash lors changement de filtre')
    })

    describe('NiveauBadge component', () => {
      test('20 — Bronze : couleur #92400E')
      test('21 — Or : couleur #B45309')
      test('22 — Platine : couleur #6D28D9')
      test('23 — showPoints=true : affiche le solde à côté du badge')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-027
---------------------------------------------
[ ] Les 3 cartes KPI affichent les bonnes données avec les bons deltas colorés
[ ] La répartition par niveau affiche 4 barres avec les bonnes couleurs et %
[ ] Le top 10 s'affiche avec les bons badges de rang
[ ] Le Dialog "top 50" se charge en lazy (requête seulement à l'ouverture)
[ ] Le feed historique affiche les 10 mouvements avec icônes et couleurs
[ ] Le composant NiveauBadge est fonctionnel et réutilisable depuis tout le projet
[ ] Les filtres Période et Site fonctionnent correctement
[ ] Le filtre Site est masqué pour le rôle GERANT
[ ] Empty state s'affiche si aucune donnée de fidélité
[ ] La page est responsive (375px mobile / 1280px desktop)
[ ] npm run test : 23 tests FidelitePage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 3 — SCR-028 : HISTORIQUE POINTS D'UN CLIENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : Progress Business
Fichier cible: apps/client/src/pages/fidelite/ClientPointsPage.tsx
Route        : /fidelite/client/:clientId
Accès        : Authentifié — rôle AGENT minimum
Rôle minimum : AGENT | GERANT | DIR_REGIONAL | SUPER_ADMIN
Dépendances  : SCR-027 terminé (NiveauBadge, fideliteApi, types MouvementPoints)
               SCR-006 terminé (types Client, lien depuis fiche client)


OBJECTIF
--------
Créer la page de détail des points de fidélité d'un client (SCR-028).
Accessible depuis la liste SCR-027 (clic sur top client), depuis la fiche client
SCR-006 (onglet Points), et depuis le portail client SCR-037.
Elle affiche le solde actuel, la progression vers le niveau suivant, et
l'historique complet paginé de tous les mouvements de points du client.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/fidelite/ClientPointsPage.tsx             ← CRÉER (principal)
2. apps/client/src/pages/fidelite/ClientPointsPage.test.tsx        ← CRÉER (tests Vitest)
3. apps/client/src/components/fidelite/ClientPointsHeader.tsx      ← CRÉER (en-tête client)
4. apps/client/src/components/fidelite/NiveauProgressBar.tsx       ← CRÉER (barre progression)
5. apps/client/src/components/fidelite/PointsMouvementsTable.tsx   ← CRÉER (tableau mouvements)
6. apps/client/src/components/fidelite/PointsFilterBar.tsx         ← CRÉER (filtres tableau)
7. apps/client/src/hooks/useClientPoints.ts                        ← CRÉER (hook TQ)

BACK-END :
8. apps/server/src/modules/fidelite/fidelite.controller.ts         ← AJOUTER GET /client/:id
9. apps/server/src/modules/fidelite/fidelite.service.ts            ← AJOUTER getClientPoints()


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
  ┌──────────────────────────────────────────────────────────────────────┐
  │  ← Fidélité    Points de fidélité — MASUDI Serge (TSG-0005)         │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  [Avatar MS]  MASUDI Serge | +243 81 999 0011 | Goma        │    │
  │  │               ■ PLATINE — 6 200 points                      │    │
  │  │               Remise applicable : 8%                         │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  PROGRESSION VERS LE PROCHAIN NIVEAU                        │    │
  │  │                                                              │    │
  │  │  ■ PLATINE (niveau maximum atteint !)                       │    │
  │  │  ████████████████████████████████  6 200 pts               │    │
  │  │  "Félicitations ! Vous êtes au niveau maximum."             │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
  │  │ Total gagné  │  │ Total déduit │  │ Solde actuel │              │
  │  │  +8 450 pts  │  │  -2 250 pts  │  │   6 200 pts  │              │
  │  └──────────────┘  └──────────────┘  └──────────────┘              │
  │                                                                      │
  │  HISTORIQUE DES MOUVEMENTS                                           │
  │  [Tous ▼] [Période ▼] [Recherche...]                               │
  │                                                                      │
  │  Date       │ Type        │ Description        │ Points │ Solde     │
  │  17/01 14:32│ 🛍 Achat    │ #GOM-202501-047    │ +450   │ 6 200    │
  │  15/01 10:05│ 👥 Parrain  │ Parrainage NGABO Y.│ +500   │ 5 750    │
  │  12/01 09:20│ 🛍 Achat    │ #GOM-202501-031    │ +1 200 │ 5 250    │
  │  08/01 11:00│ ↩ Retour    │ Retour #RET-01     │  -150  │ 4 050    │
  │  ...                                                                │
  │  < Préc.  Page 1/8  Suiv. >                    30 lignes / page    │
  └──────────────────────────────────────────────────────────────────────┘


COMPOSANT ClientPointsHeader — ClientPointsHeader.tsx
-------------------------------------------------------
En-tête avec les informations essentielles du client :

  interface ClientPointsHeaderProps {
    client: {
      id: string;
      nom: string;
      prenom: string;
      telephone: string;
      siteNom: string;
      niveauFidelite: NiveauFidelite;
      pointsFidelite: number;
      remisePct: number;
    };
    onNavigateToFiche: () => void;
  }

Contenu :
  - Avatar 48×48px avec initiales (fond = couleur du niveau fidélité)
  - Nom complet en text-lg font-bold
  - Téléphone + séparateur + site en text-sm muted
  - NiveauBadge (size="md") + solde points en font-bold couleur primaire
  - Ligne "Remise applicable : X%" en text-sm (vert si > 0, gris si 0)
  - Bouton ghost "Voir la fiche client →" → navigate(`/clients/${id}`)
  - Breadcrumb en haut : "← Fidélité" → navigate('/fidelite')


COMPOSANT NiveauProgressBar — NiveauProgressBar.tsx
-----------------------------------------------------
Barre de progression vers le prochain niveau de fidélité.

  interface NiveauProgressBarProps {
    niveauActuel: NiveauFidelite;
    pointsActuels: number;
    niveaux: NiveauConfig[];      // configuration des 4 niveaux
  }

Calculs à effectuer :
  1. Trouver la config du niveau actuel (seuilMin, seuilMax)
  2. Trouver la config du niveau suivant
  3. Calculer le pourcentage de progression :
       progress = (pointsActuels - seuilMin) / (seuilMax - seuilMin) × 100
  4. Calculer les points manquants : seuilMax - pointsActuels

Rendu :
  - Ligne info : "[NiveauBadge actuel] · [X pts]" à gauche
  - Ligne info : "[NiveauBadge suivant] · [Y pts]" à droite
  - Barre de progression shadcn pleine largeur :
      couleur du niveau ACTUEL (utiliser CSS var ou inline style)
      hauteur : 12px
      valeur : progress %
  - Texte sous la barre :
    Si niveau < PLATINE : "[X] points avant le niveau [suivant]  ·  Remise actuelle : X%"
    Si PLATINE : "🏆 Niveau maximum atteint ! Vous bénéficiez de la remise maximale (8%)."

  Cas particulier BRONZE → ARGENT :
    Afficher aussi : "À 500 pts : débloque la remise de 3% sur vos achats !"
  Cas particulier ARGENT → OR :
    "À 2 000 pts : débloque la remise de 5% !"
  Cas particulier OR → PLATINE :
    "À 5 000 pts : débloque la remise maximale de 8% !"


COMPOSANT PointsMouvementsTable — PointsMouvementsTable.tsx
-------------------------------------------------------------
Tableau paginé de l'historique complet des mouvements de points.

Colonnes :
  1. Date/heure   : "17 jan. 14:32" (date-fns/fr)
  2. Type         : icône + libellé (ACHAT, PARRAINAGE, RETOUR, etc.)
  3. Description  : lien cliquable si venteId ou parrainageId disponible
                    ex: "#GOM-202501-047" → navigate(`/sales/${venteId}`)
                    ex: "Parrainage NGABO Yvette" → navigate(`/clients/${clientId}`)
  4. Points       : delta avec signe + couleur (vert/rouge) + unité "pts"
  5. Solde après  : soldeAfter en text-sm muted

Comportements :
  - Lignes positives (deltaPoints > 0) : fond bg-green-50/20 subtil
  - Lignes négatives (deltaPoints < 0) : fond bg-red-50/20 subtil
  - Tri par date (défaut desc)
  - Hover cursor pointer seulement si lien disponible (venteId ou parrainageId)

Pagination : 30 lignes par page (server-side).


COMPOSANT PointsFilterBar — PointsFilterBar.tsx
-------------------------------------------------
Filtres pour le tableau de mouvements :

  Filtre 1 — Type de mouvement :
    Options : Tous | Achats | Parrainage | Retours | Expirations | Ajustements admin

  Filtre 2 — Période :
    Options : Tout | Ce mois | 3 derniers mois | Cette année | Personnalisé
    Personnalisé → DateRangePicker (2 inputs date)

  Filtre 3 — Recherche :
    Placeholder : "N° vente ou description..."
    Debounce 400ms

  Résumé filtré (sous la barre) :
    "[X mouvements] · Total période : [+Y pts gagnés] · [−Z pts déduits]"


HOOK useClientPoints — useClientPoints.ts
------------------------------------------
  export function useClientPoints(clientId: string, filters: PointsFilters) {
    // Query 1 : Données du client + solde actuel (cache 2 min)
    const clientQuery = useQuery({
      queryKey: ['fidelite', 'client', clientId],
      queryFn: () => fideliteApi.getClientData(clientId),
      staleTime: 2 * 60_000,
      retry: 1,
    });

    // Query 2 : Historique paginé des mouvements (cache 1 min)
    const mouvementsQuery = useQuery({
      queryKey: ['fidelite', 'mouvements', clientId, filters],
      queryFn: () => fideliteApi.getClientMouvements(clientId, filters),
      staleTime: 60_000,
      placeholderData: keepPreviousData,
    });

    // Query 3 : Config niveaux (cache 10 min, partagée avec SCR-029)
    const configQuery = useQuery({
      queryKey: ['fidelite', 'config'],
      queryFn: () => fideliteApi.getConfig(),
      staleTime: 10 * 60_000,
    });

    return {
      client, mouvements, niveaux: configQuery.data?.niveaux,
      isLoading, isError, pagination,
      totalGagne, totalDeduit,
    };
  }


APPELS API
-----------
GET /api/v1/fidelite/client/:clientId
  Params : { clientId: string }
  Succès 200 :
    {
      client: {
        id, nom, prenom, telephone, siteNom,
        niveauFidelite, pointsFidelite, remisePct,
        totalPointsGagnes,
        totalPointsDeduits
      }
    }
  Erreur 404 : { error: { code: 'CLIENT_NOT_FOUND' } }

GET /api/v1/fidelite/client/:clientId/mouvements
  Params : { clientId: string }
  Query :
    type?         : TypeMouvementPoints
    dateDebut?    : string (ISO 8601)
    dateFin?      : string (ISO 8601)
    search?       : string
    page          : number (défaut 1)
    limit         : number (défaut 30)
    sortOrder     : 'asc' | 'desc' (défaut 'desc')
  Succès 200 :
    {
      mouvements: [MouvementPoints],
      meta: { total, page, limit, totalPages },
      summary: {
        totalGagne: number,            // somme des deltaPoints positifs
        totalDeduit: number            // valeur absolue somme deltaPoints négatifs
      }
    }

Back-end — fidelite.service.ts — méthode getClientMouvements() :
  1. Vérifier que le client appartient au siteId de l'agent demandeur (ou droits supérieurs)
  2. Requête Prisma avec filtres dynamiques
  3. Inclure venteId et parrainageId pour les liens cliquables
  4. Calculer summary depuis les données filtrées
  5. Retourner mouvements + meta + summary


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - ClientPointsHeader : skeleton (Card avec avatar + lignes grises)
  - NiveauProgressBar : skeleton (barre grise animée)
  - 3 mini-cartes KPI : skeleton
  - Tableau : 8 lignes skeleton

État 2 — DONNÉES CHARGÉES
  - Tous les composants avec données réelles

État 3 — CLIENT INTROUVABLE (404)
  - Page centée : "Client introuvable"
  - Bouton "← Retour à la fidélité" → navigate('/fidelite')

État 4 — AUCUN MOUVEMENT (compte tout neuf)
  - Tableau : empty state "Aucun mouvement de points enregistré pour ce client."
  - Les 3 KPI sont à 0 (ce n'est pas une erreur)

État 5 — FILTRES ACTIFS SANS RÉSULTAT
  - "Aucun mouvement correspondant aux filtres sélectionnés."
  - Bouton "Réinitialiser les filtres"


TESTS — ClientPointsPage.test.tsx
------------------------------------
  describe('ClientPointsPage', () => {
    describe('Header client', () => {
      test('1  — Nom, téléphone, site, niveau, solde points affichés')
      test('2  — Bouton "Voir la fiche client" navigue vers /clients/:id')
      test('3  — Breadcrumb "← Fidélité" navigue vers /fidelite')
    })

    describe('Barre de progression', () => {
      test('4  — Barre colorée avec la couleur du niveau actuel')
      test('5  — Points manquants affichés correctement (ex: 300 pts avant Or)')
      test('6  — Message "niveau maximum" affiché pour PLATINE')
      test('7  — Message motivant selon le niveau (Bronze→Argent etc.)')
    })

    describe('Mini-cartes KPI', () => {
      test('8  — Total gagné, total déduit, solde actuel affichés')
      test('9  — Skeleton pendant le chargement')
    })

    describe('Tableau mouvements', () => {
      test('10 — Tableau affiche date, type, description, points, solde')
      test('11 — Lignes positives : fond vert clair')
      test('12 — Lignes négatives : fond rouge clair')
      test('13 — Description avec venteId : lien cliquable vers /sales/:id')
      test('14 — Filtre Type "Achats" filtre correctement la liste')
      test('15 — Filtre Période applique les bonnes dates')
      test('16 — Pagination : clic "Suivant" passe à la page 2')
      test('17 — keepPreviousData : pas de flash lors du changement de filtre')
      test('18 — Empty state si aucun mouvement')
      test('19 — Résumé filtré "X mouvements · +Y pts · -Z pts" affiché')
    })

    describe('Erreurs', () => {
      test('20 — Page 404 si clientId inexistant')
      test('21 — Skeleton visible pendant le chargement')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-028
---------------------------------------------
[ ] Le header client affiche toutes les informations avec le bon niveau et solde
[ ] La barre de progression utilise la bonne couleur et les bons seuils
[ ] Le message de motivation change selon le niveau actuel
[ ] Le message "niveau maximum" s'affiche pour les clients PLATINE
[ ] Les 3 mini-cartes KPI (gagné, déduit, solde) sont correctes
[ ] Le tableau affiche toutes les colonnes avec les bonnes couleurs de fond
[ ] Les descriptions avec venteId sont des liens cliquables
[ ] Les filtres (type, période, recherche) fonctionnent correctement
[ ] La pagination côté serveur fonctionne
[ ] Le résumé filtré (X mouvements, totaux) est affiché sous les filtres
[ ] La page 404 s'affiche si le client n'existe pas
[ ] npm run test : 21 tests ClientPointsPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 3 — SCR-029 : CONFIGURATION DES NIVEAUX DE FIDÉLITÉ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : Progress Business
Fichier cible: apps/client/src/pages/fidelite/FideliteConfigPage.tsx
Route        : /fidelite/config
Accès        : Authentifié — rôle SUPER_ADMIN uniquement
Rôle minimum : SUPER_ADMIN
Dépendances  : SCR-027 terminé (types NiveauConfig, FideliteConfig, NiveauBadge, fideliteApi)


OBJECTIF
--------
Créer la page de configuration complète du programme de fidélité (SCR-029).
Seul le Super Admin y accède. Il configure ici :
  - Le ratio points/CDF (combien de CDF pour 1 point)
  - Les seuils de points pour chaque niveau (Bronze, Argent, Or, Platine)
  - La remise (%) accordée à chaque niveau
  - La durée de validité des points (expiration optionnelle)
  - La période d'inactivité avant expiration
  - Le cumul des remises fidélité + parrainage

Un simulateur interactif et un aperçu visuel permettent de valider les choix
avant de sauvegarder. L'historique des changements est affiché en bas.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/fidelite/FideliteConfigPage.tsx               ← CRÉER (principal)
2. apps/client/src/pages/fidelite/FideliteConfigPage.test.tsx          ← CRÉER (tests Vitest)
3. apps/client/src/components/fidelite/NiveauxConfigTable.tsx          ← CRÉER (tableau niveaux)
4. apps/client/src/components/fidelite/FideliteSimulator.tsx           ← CRÉER (simulateur)
5. apps/client/src/components/fidelite/FideliteConfigHistory.tsx       ← CRÉER (historique)
6. apps/client/src/components/fidelite/NiveauxPreview.tsx              ← CRÉER (aperçu visuel)
7. apps/client/src/hooks/useFideliteConfig.ts                          ← CRÉER (hook TQ)

BACK-END :
8. apps/server/src/modules/fidelite/fidelite.controller.ts             ← AJOUTER GET/PUT /config
9. apps/server/src/modules/fidelite/fidelite.service.ts                ← AJOUTER getConfig/updateConfig
10. apps/server/src/modules/fidelite/dto/update-fidelite-config.dto.ts ← CRÉER


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Configuration de la fidélité                [ ⚠ Non sauvegardé ]  │
  │                                        [ Annuler ] [ Enregistrer ]  │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ⚠ Cette configuration s'applique à TOUS les sites (1 248 clients)  │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  RÈGLES DE BASE                                             │    │
  │  │                                                              │    │
  │  │  Ratio points / dépenses *                                  │    │
  │  │  1 point pour [1 000] CDF dépensés (arrondi inférieur)     │    │
  │  │                                                              │    │
  │  │  Durée de validité des points (optionnel)                    │    │
  │  │  [  0  ] mois  (0 = les points n'expirent jamais)           │    │
  │  │                                                              │    │
  │  │  Expiration si inactif depuis                                │    │
  │  │  [  0  ] mois  (0 = désactivé)                              │    │
  │  │                                                              │    │
  │  │  Cumul remises fidélité + parrainage   ◉ Autorisé  ○ Bloqué │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  NIVEAUX DE FIDÉLITÉ                                        │    │
  │  │                                                              │    │
  │  │  Niveau  │ Seuil min │ Seuil max  │ Remise % │ Avantages   │    │
  │  │  Bronze  │    0      │  [499    ] │  [ 0  ]% │ [________]  │    │
  │  │  Argent  │ [500    ] │ [1 999   ] │  [ 3  ]% │ [________]  │    │
  │  │  Or      │ [2 000  ] │ [4 999   ] │  [ 5  ]% │ [________]  │    │
  │  │  Platine │ [5 000  ] │     ∞      │  [ 8  ]% │ [________]  │    │
  │  │                                                              │    │
  │  │  ⚠ Les seuils doivent être croissants et sans chevauchement │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  APERÇU VISUEL          │  SIMULATEUR                       │    │
  │  │  [Bronze ──── Argent]   │  Pour 200 000 CDF d'achat :       │    │
  │  │  [Argent ──── Or    ]   │  → 200 pts attribués              │    │
  │  │  [Or ──── Platine   ]   │  → Remise si Argent : 6 000 CDF  │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  HISTORIQUE DES MODIFICATIONS                                        │
  │  17/01 │ ADMIN J.P. │ Seuil Or : 3 000 → 2 000 pts                │
  └──────────────────────────────────────────────────────────────────────┘


COMPOSANT NiveauxConfigTable — NiveauxConfigTable.tsx
-------------------------------------------------------
Tableau éditable des 4 niveaux de fidélité.
Chaque ligne correspond à un niveau et ses cellules sont des inputs éditables.

  interface NiveauxConfigTableProps {
    niveaux: NiveauConfig[];
    onChange: (niveaux: NiveauConfig[]) => void;
    errors?: Record<string, string>;     // erreurs Zod par champ
  }

Colonnes :
  1. Niveau    : Badge NiveauBadge (non éditable)
  2. Seuil min : Input number (non éditable — calculé depuis seuil max du niveau précédent)
  3. Seuil max : Input number SAUF Platine (affiche "∞" — pas de plafond)
  4. Remise %  : Input number (0–50, step=0.5)
  5. Avantages : Textarea courte (max 200 chars, placeholder "ex: Accès prioritaire...")

Règles de cohérence inter-lignes (validation croisée) :
  - seuilMin[Argent] = seuilMax[Bronze] + 1 (calculé automatiquement)
  - seuilMin[Or]     = seuilMax[Argent] + 1 (calculé automatiquement)
  - seuilMin[Platine]= seuilMax[Or] + 1     (calculé automatiquement)
  - Les seuilMin sont donc en lecture seule (calculés, non éditables)

Message d'erreur en bas si incohérence :
  "⚠ Les seuils doivent être croissants : Bronze < Argent < Or < Platine"
  "⚠ La remise doit être croissante (ex: 0% → 3% → 5% → 8%)"

Mise en surbrillance rouge des cellules en erreur.


COMPOSANT FideliteSimulator — FideliteSimulator.tsx
-----------------------------------------------------
Simulateur interactif mis à jour en temps réel.

  interface FideliteSimulatorProps {
    config: Partial<FideliteConfig>;   // valeurs actuelles du formulaire (watch())
  }

Inputs du simulateur :
  - "Montant de l'achat simulé (CDF) : [200 000]"
  - "Niveau actuel du client simulé : [Bronze ▼]"

Résultats calculés en temps réel :
  pointsAttribues = Math.floor(montantSimule / ratioPtsCDF)
  remiseMontant   = montantSimule × remisePct[niveauSimule] / 100

Affichage :
  "Pour un achat de [200 000] CDF :"
  "→ Points attribués : [200] pts  (1 pt / [1 000] CDF)"
  "→ Remise applicable (client Bronze) : 0 CDF (0%)"
  "→ Remise applicable (client Argent) : 6 000 CDF (3%)"
  "→ Remise applicable (client Or) : 10 000 CDF (5%)"
  "→ Remise applicable (client Platine) : 16 000 CDF (8%)"
  (afficher toutes les lignes en simultané ou seulement pour le niveau sélectionné ?)
  → Afficher toutes les lignes pour permettre la comparaison.

Si cumulRemises=true :
  Ajouter : "+ Remise parrainage applicable en même temps (si bon valide)"
Si cumulRemises=false :
  Ajouter : "Remise parrainage et fidélité non cumulables"


COMPOSANT NiveauxPreview — NiveauxPreview.tsx
----------------------------------------------
Représentation visuelle stylisée du chemin de progression.

  interface NiveauxPreviewProps {
    niveaux: NiveauConfig[];    // config en cours d'édition (pas encore sauvegardée)
  }

Rendu :
  Ligne horizontale avec 4 nœuds colorés et les seuils entre chaque nœud :

    [Bronze]──0──────499──[Argent]──500──────1999──[Or]──2000──4999──[Platine]──5000+

  Chaque nœud est un cercle de 32px avec la couleur du niveau.
  Les chiffres entre les nœuds sont mis à jour en temps réel quand on modifie les seuils.
  Les libellés de remise sous chaque nœud :
    Bronze → "0%", Argent → "3%", Or → "5%", Platine → "8%"

  Si un seuil est invalide (non croissant) → la flèche entre les nœuds concernés
  passe en rouge et un icône AlertTriangle apparaît.


COMPOSANT FideliteConfigHistory — FideliteConfigHistory.tsx
-------------------------------------------------------------
Identique à ConfigHistoryTable du module Parrainage, adapté à la fidélité.

Colonnes :
  1. Date/heure  : "17 jan. 2025 à 14:32"
  2. Admin       : Nom + Prénom
  3. Champ modifié : libellé lisible (ex: "Seuil minimum Or")
  4. Avant       : ancienne valeur
  5. Après       : nouvelle valeur

Pagination : 10 entrées par page, max 30 entrées affichées.

Génération des libellés de champ :
  'ratioPtsCDF'            → "Ratio points/CDF"
  'niveaux.*.seuilMax'     → "Seuil maximum [Niveau]"
  'niveaux.*.remisePct'    → "Remise [Niveau]"
  'dureeValiditeMois'      → "Durée de validité (mois)"
  'periodeInactiviteMois'  → "Période d'inactivité (mois)"
  'cumulRemises'           → "Cumul des remises"


HOOK useFideliteConfig — useFideliteConfig.ts
----------------------------------------------
  export function useFideliteConfig() {
    // Lire la config actuelle
    const { data, isLoading } = useQuery({
      queryKey: ['fidelite', 'config'],
      queryFn: () => fideliteApi.getConfig(),
      staleTime: 10 * 60_000,
    });

    // Historique
    const { data: history } = useQuery({
      queryKey: ['fidelite', 'config', 'history'],
      queryFn: () => fideliteApi.getConfigHistory(),
      staleTime: 5 * 60_000,
    });

    // Mutation pour sauvegarder
    const mutation = useMutation({
      mutationFn: (config: UpdateFideliteConfigDto) => fideliteApi.updateConfig(config),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['fidelite'] });
        queryClient.invalidateQueries({ queryKey: ['clients'] });  // niveaux recalculés
        toast.success(
          `Configuration mise à jour. ${data.clientsRecomputes} clients recalculés.`
        );
      },
    });

    return { config, history, isLoading, saveConfig: mutation.mutate, isSaving: mutation.isPending };
  }


APPELS API
-----------
GET /api/v1/fidelite/config
  Succès 200 :
    {
      config: FideliteConfig,
      history: [{ id, changedAt, changedBy, fieldName, oldValue, newValue }]
    }

PUT /api/v1/fidelite/config
  Corps (UpdateFideliteConfigDto) :
    {
      ratioPtsCDF: number,                // min 1, max 10000
      niveaux: [
        {
          niveau: NiveauFidelite,
          seuilMax?: number,              // null pour PLATINE
          remisePct: number,              // 0-50
          avantages?: string[]
        }
      ],
      dureeValiditeMois: number,          // 0 = jamais
      periodeInactiviteMois: number,      // 0 = désactivé
      cumulRemises: boolean
    }
  Succès 200 :
    {
      config: FideliteConfig,
      clientsRecomputes: number,          // nb de clients dont le niveau a changé
      modifiedFields: string[]
    }
  Erreur 400 :
    {
      error: {
        code: 'INVALID_CONFIG',
        details: [
          { field: 'niveaux[1].seuilMax', message: 'Doit être supérieur au seuil Bronze' }
        ]
      }
    }

Back-end — fidelite.service.ts — méthode updateConfig() :
  1. Vérifier rôle SUPER_ADMIN (guard NestJS)
  2. Valider les seuils (croissants, sans chevauchement, seuilMin Bronze = 0)
  3. Valider les remises (croissantes : Bronze ≤ Argent ≤ Or ≤ Platine)
  4. Sauvegarder la nouvelle config (UPDATE en base)
  5. Créer les entrées ConfigHistory pour chaque champ modifié
  6. Lancer un JOB ASYNCHRONE (Bull Queue) :
       Pour chaque client ACTIF → recalculer Client.niveauFidelite
       selon les nouveaux seuils (SELECT avec UPDATE)
       Ce job peut affecter des milliers de clients → async impératif
  7. Invalider le cache Redis des stats fidélité
  8. Retourner { config, clientsRecomputes: estimatedCount, modifiedFields }


GESTION DU FORMULAIRE REACT-HOOK-FORM
---------------------------------------
  // Schéma Zod complet
  const fideliteConfigSchema = z.object({

    ratioPtsCDF: z.number({
      required_error: "Ce champ est requis"
    })
    .int("Doit être un entier")
    .min(100, "Minimum 100 CDF par point")
    .max(10000, "Maximum 10 000 CDF par point"),

    niveaux: z.array(z.object({
      niveau: z.enum(['BRONZE', 'ARGENT', 'OR', 'PLATINE']),
      seuilMax: z.number().int().min(0).optional().nullable(),
      remisePct: z.number().min(0, "Minimum 0%").max(50, "Maximum 50%"),
      avantages: z.array(z.string()).optional(),
    })).length(4, "Doit contenir exactement 4 niveaux")
    .refine(
      (n) => n[0].seuilMax !== null && n[0].seuilMax !== undefined && n[0].seuilMax > 0,
      { message: "Le seuil max Bronze est requis", path: ["[0].seuilMax"] }
    )
    .refine(
      (n) => n[1].seuilMax !== null && n[1].seuilMax !== undefined &&
             n[1].seuilMax > (n[0].seuilMax ?? 0),
      { message: "Le seuil max Argent doit être supérieur au seuil Bronze", path: ["[1].seuilMax"] }
    )
    .refine(
      (n) => n[2].seuilMax !== null && n[2].seuilMax !== undefined &&
             n[2].seuilMax > (n[1].seuilMax ?? 0),
      { message: "Le seuil max Or doit être supérieur au seuil Argent", path: ["[2].seuilMax"] }
    )
    .refine(
      (n) => n[0].remisePct <= n[1].remisePct &&
             n[1].remisePct <= n[2].remisePct &&
             n[2].remisePct <= n[3].remisePct,
      { message: "Les remises doivent être croissantes (Bronze ≤ Argent ≤ Or ≤ Platine)" }
    ),

    dureeValiditeMois: z.number().int().min(0).max(60),
    periodeInactiviteMois: z.number().int().min(0).max(36),
    cumulRemises: z.boolean(),
  });


MODAL DE CONFIRMATION AVANT SAUVEGARDE
-----------------------------------------
  Titre : "Confirmer la modification de la configuration"

  Corps :
    "Cette configuration s'applique à TOUS les sites."
    "Le recalcul des niveaux concernera [X] clients actifs."
    (X est obtenu depuis un GET /api/v1/fidelite/count-affected envoyé en
    background quand le formulaire est dirty)

  Si changement du ratioPtsCDF :
    Alert orange : "Attention : modifier le ratio points/CDF changera les points
    attribués sur TOUTES les prochaines ventes. Les points déjà acquis ne sont pas affectés."

  Si seuils réduits (ex: seuil Or passe de 3 000 à 2 000) :
    Alert info bleue : "Certains clients peuvent passer au niveau supérieur suite
    à ce changement."

  Si seuils augmentés (ex: seuil Or passe de 2 000 à 3 000) :
    Alert rouge : "Certains clients peuvent descendre de niveau suite à ce changement."

  Boutons : [Annuler] | [Confirmer et enregistrer] (destructive si descente de niveau)


COMPORTEMENTS ET ÉTATS DE LA PAGE
------------------------------------
État 1 — CHARGEMENT
  - Skeleton du formulaire entier (sections grises animées)
  - Skeleton de l'historique

État 2 — CONFIG CHARGÉE (non modifiée)
  - Formulaire prérempli
  - Badge "Non sauvegardé" MASQUÉ
  - Bouton "Enregistrer" DISABLED
  - Bouton "Annuler" MASQUÉ
  - Simulateur et aperçu actifs avec config actuelle

État 3 — FORMULAIRE MODIFIÉ (isDirty = true)
  - Badge "⚠ Non sauvegardé" VISIBLE dans le header
  - Bouton "Enregistrer" ACTIF
  - Bouton "Annuler" VISIBLE
  - Simulateur et aperçu se mettent à jour en temps réel via watch()
  - Si erreur de validation → cellule concernée en rouge + message sous le tableau

État 4 — SAUVEGARDE EN COURS
  - Modal de confirmation affiché
  - Clic "Confirmer" → spinner + "Recalcul en cours..."
  - Formulaire désactivé

État 5 — SAUVEGARDE RÉUSSIE
  - Toast vert : "Configuration mise à jour. 1 248 clients recalculés en arrière-plan."
  - Badge "Non sauvegardé" MASQUÉ
  - Historique rechargé (invalidateQueries)
  - Bouton "Enregistrer" DISABLED (isDirty revient à false)

État 6 — ACCÈS NON AUTORISÉ
  - ProtectedRoute → redirect('/dashboard')
  - Toast rouge "Accès refusé — Super Admin requis"


STYLE ET DESIGN
-----------------
- Fond page              : bg-neutral-50
- Card sections          : bg-white border-neutral-100 rounded-xl shadow-sm
- Alert config globale   : Alert variant="warning" amber-50 bordure amber-400
- Table niveaux          : bg-white sticky header, alternance blanc/neutral-50
- Cell erreur            : border-red-500 bg-red-50 ring-1 ring-red-500
- Badge "non sauvegardé" : bg-yellow-100 text-yellow-800 border border-yellow-300
- Simulateur card        : bg-sky-50 border-sky-100
- Aperçu visuel          : bg-white border-neutral-100
- NiveauxPreview flèche  : stroke="#94A3B8" (normale) → stroke="#EF4444" (si erreur)


TESTS — FideliteConfigPage.test.tsx
--------------------------------------
  describe('FideliteConfigPage', () => {
    describe('Chargement et préremplissage', () => {
      test('1  — Skeleton visible pendant le chargement')
      test('2  — Formulaire prérempli avec la config actuelle')
      test('3  — Bouton "Enregistrer" disabled si aucun changement')
      test('4  — Badge "Non sauvegardé" masqué initialement')
    })

    describe('Tableau des niveaux', () => {
      test('5  — Seuils min recalculés automatiquement en lecture seule')
      test('6  — Seuil max Bronze modifié → seuil min Argent mis à jour')
      test('7  — Erreur si seuil Bronze > seuil Argent')
      test('8  — Erreur si remise Bronze > remise Argent')
      test('9  — Cellule en rouge si erreur de validation Zod')
    })

    describe('Règles de base', () => {
      test('10 — Input ratioPtsCDF : minimum 100, maximum 10 000')
      test('11 — Input dureeValiditeMois : 0 = jamais, placeholder explicatif')
      test('12 — Toggle cumulRemises : ON/OFF fonctionne')
    })

    describe('Simulateur en temps réel', () => {
      test('13 — Simulateur recalcule au changement de ratioPtsCDF')
      test('14 — Simulateur recalcule au changement d\'une remise')
      test('15 — Toutes les remises par niveau affichées en simultané')
    })

    describe('Aperçu visuel NiveauxPreview', () => {
      test('16 — Seuils affichés entre les nœuds du chemin visuel')
      test('17 — Flèche rouge si seuils incohérents')
      test('18 — Seuils mis à jour en temps réel à la frappe')
    })

    describe('Sauvegarde', () => {
      test('19 — Badge "Non sauvegardé" visible après modification')
      test('20 — Bouton "Annuler" restaure les valeurs initiales')
      test('21 — Modal de confirmation s\'ouvre avant la sauvegarde')
      test('22 — Alert rouge dans le modal si seuils augmentés (descente niveau)')
      test('23 — Alert bleue si seuils réduits (montée niveau)')
      test('24 — Sauvegarde réussie : toast vert + nb clients recalculés')
      test('25 — Erreur 400 : messages d\'erreur par champ dans le tableau')
    })

    describe('Historique', () => {
      test('26 — Historique affiché avec date, admin, champ, avant, après')
      test('27 — Historique paginé à 10 entrées par page')
    })

    describe('Sécurité', () => {
      test('28 — Accès non SUPER_ADMIN → redirect /dashboard')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-029
---------------------------------------------
[ ] La page est accessible UNIQUEMENT pour le rôle SUPER_ADMIN
[ ] Le formulaire est prérempli avec la configuration actuelle
[ ] Le tableau NiveauxConfigTable permet d'éditer les seuils et remises
[ ] Les seuilsMin sont recalculés automatiquement en lecture seule
[ ] Les validations Zod croisées bloquent les seuils non croissants
[ ] Les validations bloquent les remises non croissantes
[ ] Les cellules en erreur sont surlignées en rouge
[ ] Le simulateur se met à jour en temps réel (via watch())
[ ] L'aperçu NiveauxPreview affiche les seuils corrects entre les nœuds
[ ] Le badge "Non sauvegardé" apparaît dès une modification
[ ] Le bouton "Annuler" restaure toutes les valeurs sans rechargement
[ ] Le modal de confirmation affiche le nb de clients impactés
[ ] Les Alerts rouge/bleue s'affichent selon le sens du changement de seuils
[ ] La sauvegarde déclenche le recalcul async + toast avec nb de clients
[ ] L'historique des modifications est affiché et paginé
[ ] npm run test : 28 tests FideliteConfigPage.test.tsx ✓
```

---

## RÉCAPITULATIF DES 3 PROMPTS — MODULE FIDÉLITÉ

| N° | Écran   | Route                  | Fichier principal                                   | Priorité | Durée est. |
|----|---------|------------------------|-----------------------------------------------------|----------|------------|
| 1  | SCR-027 | /fidelite              | pages/fidelite/FidelitePage.tsx                     | **P0**   | ~3-4h      |
| 2  | SCR-028 | /fidelite/client/:id   | pages/fidelite/ClientPointsPage.tsx                 | **P0**   | ~2-3h      |
| 3  | SCR-029 | /fidelite/config       | pages/fidelite/FideliteConfigPage.tsx               | **P1**   | ~4-5h      |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Prompt 1 (SCR-027 Vue Globale Fidélité)
  ↓ Crée : fideliteApi, types fidelite.types.ts, NiveauBadge (réutilisable partout),
            FideliteKpiCards, NiveauxRepartition, TopClientsFideles,
            PointsHistoryFeed, fidelite.module.ts (NestJS)
  ↓
Prompt 2 (SCR-028 Historique Points Client)
  ↓ Utilise : fideliteApi, NiveauBadge, types MouvementPoints
  ↓ Crée    : ClientPointsHeader, NiveauProgressBar, PointsMouvementsTable
  ↓
Prompt 3 (SCR-029 Configuration Niveaux)
  ↓ Utilise : fideliteApi, NiveauBadge, types NiveauConfig, FideliteConfig
  ↓ Crée    : NiveauxConfigTable, FideliteSimulator, FideliteConfigHistory, NiveauxPreview

  → MODULE FIDÉLITÉ COMPLET
  → NiveauBadge utilisé dans : Module Clients (fiche client), Caisse POS (FidelityBadge),
    Historique Ventes, Parrainage, Portail Client
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. COMPOSANT NiveauBadge — COMPOSANT PARTAGÉ CRITIQUE :
   → NiveauBadge.tsx est utilisé dans TOUS les modules (Clients, Ventes, Parrainage,
     Portail). Il doit être créé dans SCR-027 et immédiatement partagé.
   → Ne PAS dupliquer la logique de couleur des niveaux ailleurs — toujours importer
     getNiveauColor() et getNiveauLabel() depuis fidelite.types.ts.

2. RECALCUL DES NIVEAUX — JOB ASYNCHRONE OBLIGATOIRE :
   → La mise à jour de la config (SCR-029) peut impacter des MILLIERS de clients.
   → JAMAIS faire le recalcul dans la requête HTTP synchrone.
   → Utiliser NestJS Bull Queue (Redis) pour le job de recalcul.
   → Retourner immédiatement avec un estimatedCount (COUNT requête rapide).
   → Le statut du job peut être consulté via polling (optionnel pour cette version).

3. COHÉRENCE CART.STORE ↔ FIDÉLITÉ :
   → Le remisePct du CartClient (module Ventes) vient des niveaux configurés ici.
   → Après une mise à jour de config (SCR-029) → invalider le cache TanStack Query
     de la clé ['clients', 'search'] pour que la caisse utilise les nouvelles remises.

4. EXPIRATION DES POINTS :
   → Si dureeValiditeMois > 0, un CRON NestJS (@Cron) doit s'exécuter 1x/jour :
     → Trouver tous les points avec createdAt < now - dureeValiditeMois mois
     → Créer un MouvementPoints (type EXPIRATION, deltaPoints négatif)
     → Mettre à jour Client.pointsFidelite
   → Ce CRON est à implémenter dans fidelite.service.ts avec @nestjs/schedule.

5. PERFORMANCE QUERIES TABLEAU SCR-028 :
   → L'historique paginé peut atteindre des milliers de lignes pour un client actif.
   → Indexer impérativement : MouvementPoints(clientId, createdAt)
     → dans le schema Prisma : @@index([clientId, createdAt])
   → Utiliser un curseur de pagination si total > 10 000 lignes (éviter OFFSET).
```

---

*Progress Business — Prompts Développement Module Fidélité SCR-027 à SCR-029 — Goma, RDC — v1.0 — 2025*