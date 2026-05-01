# 🤝 TECHSHOP MANAGER — PROMPTS DE DÉVELOPPEMENT
## Module PARRAINAGE | Écrans SCR-024 à SCR-026 | 3 écrans

> **MODE D'EMPLOI :**
> Ce fichier contient **3 prompts indépendants**, un par écran du module Parrainage.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Les modules Auth, Clients et Ventes doivent être TERMINÉS avant de commencer ce module.

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
Devise      : Franc Congolais (CDF) — format : 1 200 000 CDF (séparateur espace)
Sites       : Goma (siège), Bukavu, Kinshasa
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 3 — SCR-024 : VUE GLOBALE PARRAINAGE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : TechShop Manager
Fichier cible: apps/client/src/pages/parrainage/ParrainagePage.tsx
Route        : /parrainage
Accès        : Authentifié — rôle GERANT minimum
Rôle minimum : GERANT | DIR_REGIONAL | SUPER_ADMIN
Dépendances  : Module Clients terminé (types Client, formatCDF)
               Module Ventes terminé (ventesApi)


OBJECTIF
--------
Créer la page de vue globale du programme de parrainage (SCR-024).
Cette page donne au gérant une vision complète et en temps réel du réseau de
parrainage de son site : KPIs clés, liste des parrainages récents avec leurs
statuts, top parrains du mois, et accès vers l'arbre détaillé de chaque client.
Elle constitue le tableau de bord opérationnel du programme de parrainage.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/parrainage/ParrainagePage.tsx               ← CRÉER (principal)
2.  apps/client/src/pages/parrainage/ParrainagePage.test.tsx          ← CRÉER (tests Vitest)
3.  apps/client/src/components/parrainage/ParrainageKpiCards.tsx      ← CRÉER (cartes KPI)
4.  apps/client/src/components/parrainage/ParrainageTable.tsx         ← CRÉER (tableau liste)
5.  apps/client/src/components/parrainage/ParrainageStatusBadge.tsx   ← CRÉER (badge statut)
6.  apps/client/src/components/parrainage/TopParrainsList.tsx         ← CRÉER (top parrains)
7.  apps/client/src/components/parrainage/ParrainageFiltersBar.tsx    ← CRÉER (barre filtres)
8.  apps/client/src/hooks/useParrainageGlobal.ts                      ← CRÉER (hook TQ)
9.  packages/shared/src/types/parrainage.types.ts                     ← CRÉER (interfaces TS)

BACK-END :
10. apps/server/src/modules/parrainage/parrainage.module.ts           ← CRÉER
11. apps/server/src/modules/parrainage/parrainage.controller.ts       ← CRÉER
12. apps/server/src/modules/parrainage/parrainage.service.ts          ← CRÉER


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
Layout standard : sidebar gauche + zone de contenu principale avec header fixe.

  ┌──────────────────────────────────────────────────────────────────────┐
  │  Parrainage                    [Ce mois ▼]  [Site ▼]  [ Exporter ]  │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
  │  │  Parrainages     │  │  Récompenses     │  │  Meilleur parrain │  │
  │  │  actifs          │  │  versées         │  │  du mois          │  │
  │  │     248          │  │      45          │  │  MASUDI Serge     │  │
  │  │  ↑ +12 ce mois   │  │  ce mois         │  │  32 filleuls      │  │
  │  └──────────────────┘  └──────────────────┘  └───────────────────┘  │
  │                                                                      │
  ├───────────────────────────────────┬──────────────────────────────────┤
  │  PARRAINAGES RÉCENTS              │  TOP 5 PARRAINS DU MOIS          │
  │                                   │                                  │
  │  [ Rechercher parrain/filleul... ] │  #1  MASUDI Serge    32 filleuls │
  │  [Statut ▼]                        │  #2  BAHATI J.P.     18 filleuls │
  │                                   │  #3  KAMBALE Marie   14 filleuls │
  │  Parrain       │ Filleul  │Stat.  │  #4  NGABO Yvette    11 filleuls │
  │  MASUDI Serge  │BAHATI J.P│✓ VERS.│  #5  PALUKU David     9 filleuls │
  │  KAMBALE Marie │NGABO Y.  │⏳ ATT.│                                  │
  │  BAHATI J.P.   │MUNYANGA P│🔵 VAL.│  [ Voir le classement complet ]   │
  │  ...           │          │       │                                  │
  │  < Préc. Page 1/5 Suiv. > │       │                                  │
  └───────────────────────────┴──────────────────────────────────────────┘


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Card, CardContent, CardHeader, CardTitle  → cartes KPI + sections
- Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell                      → tableau parrainages
- Badge                                     → statut parrainage, rang top parrains
- Button (variant="outline")                → filtres, export, pagination
- Button (variant="ghost")                  → liens "Voir l'arbre"
- Select                                    → filtres Période, Site, Statut
- Input (+ SearchIcon)                      → recherche parrain/filleul
- Skeleton                                  → état de chargement
- Avatar, AvatarFallback                    → initiales client dans le top
- Separator                                 → séparateur visuel
- Tabs, TabsContent, TabsList, TabsTrigger  → onglets Parrainages / Top Parrains
  (sur mobile uniquement — desktop = côte à côte)


TYPES TYPESCRIPT — parrainage.types.ts
----------------------------------------
  // packages/shared/src/types/parrainage.types.ts

  export type ParrainageStatut =
    | 'EN_ATTENTE'       // filleul enregistré mais pas encore activé
    | 'VALIDE'           // filleul activé, récompense calculée, pas encore versée
    | 'RECOMPENSE_VERSEE'; // récompense effectivement attribuée au parrain

  export type TypeRecompense = 'POINTS' | 'REMISE_PROCHAINE_VENTE' | 'COMMISSION_CDF';

  export interface Parrainage {
    id: string;
    parrain: {
      id: string;
      nom: string;
      prenom: string;
      telephone: string;
      codeParrain: string;
      niveauFidelite: NiveauFidelite;
    };
    filleul: {
      id: string;
      nom: string;
      prenom: string;
      telephone: string;
      statut: 'EN_COURS' | 'ACTIF';
      dateActivation?: string;
    };
    niveau: 1 | 2;                    // 1 = parrain direct, 2 = parrain du parrain
    statut: ParrainageStatut;
    recompenseType?: TypeRecompense;
    recompenseValeur?: number;         // en CDF ou en points
    recompenseVerseAt?: string;
    dateCreation: string;
    siteId: string;
  }

  export interface ParrainageKpis {
    totalActifs: number;
    totalActifsDelta: number;          // évolution vs période précédente
    recompensesVersees: number;        // nb de récompenses versées sur la période
    meilleurParrain: {
      id: string;
      nom: string;
      prenom: string;
      nbFilleuls: number;
    } | null;
  }

  export interface TopParrain {
    rang: number;
    client: { id: string; nom: string; prenom: string; telephone: string };
    nbFilleulsActifs: number;
    nbFilleulsTotal: number;
    recompensesTotales: number;        // en CDF ou en points selon config
    caGenere: number;                  // CA total généré par les filleuls ce mois
  }

  export interface RegleParrainage {
    id: string;
    typeRecompense: TypeRecompense;
    valeurNiveau1: number;
    valeurNiveau2?: number;
    multiNiveaux: boolean;
    conditionDeclenchement: 'ACTIVATION' | 'PREMIER_ACHAT';
    plafondMensuel?: number;
    actif: boolean;
  }


COMPOSANT ParrainageKpiCards — ParrainageKpiCards.tsx
-------------------------------------------------------
Trois cartes KPI côte à côte (3 colonnes sur desktop, 1 colonne sur mobile) :

  Carte 1 — Parrainages actifs :
    - Valeur principale en texte large (text-3xl font-bold couleur #1E3A5F)
    - Sous-titre "Parrainages actifs"
    - Badge vert si deltaActifs > 0 : "↑ +12 ce mois"
    - Badge rouge si deltaActifs < 0 : "↓ -3 ce mois"
    - Badge gris si deltaActifs === 0 : "= Stable"

  Carte 2 — Récompenses versées :
    - Valeur principale (nombre de récompenses)
    - Sous-titre "Récompenses versées"
    - Texte secondaire : "Sur la période sélectionnée"
    - Icône Award (lucide-react) dans le coin supérieur droit

  Carte 3 — Meilleur parrain du mois :
    - Avatar avec initiales du meilleur parrain
    - Nom complet en font-semibold
    - Sous-titre : "[nbFilleuls] filleuls activés"
    - Bouton ghost "Voir son réseau →" → navigate(`/parrainage/tree/${id}`)
    - Si aucune donnée disponible : "—" avec message "Aucune activation ce mois"


COMPOSANT ParrainageStatusBadge — ParrainageStatusBadge.tsx
-------------------------------------------------------------
  interface ParrainageStatusBadgeProps {
    statut: ParrainageStatut;
    size?: 'sm' | 'md';
  }

Rendu selon statut :
  EN_ATTENTE       → Badge gris clair    icône Clock        "⏳ En attente"
  VALIDE           → Badge bleu          icône CheckCircle  "🔵 Validé"
  RECOMPENSE_VERSEE→ Badge vert          icône Gift         "✓ Récompense versée"

Règle : le Badge affiche l'icône lucide-react en taille 12px à gauche du texte.


COMPOSANT ParrainageTable — ParrainageTable.tsx
-------------------------------------------------
Tableau principal des parrainages récents :

Colonnes :
  1. Parrain      : Avatar initiales + "Nom Prénom" + code parrain en text-xs mono
  2. Filleul      : Avatar initiales + "Nom Prénom" + téléphone en text-xs muted
  3. Date liaison : format "17 jan. 2025" (date-fns/fr)
  4. Statut       : <ParrainageStatusBadge>
  5. Récompense   : valeur formatée (ex: "500 pts" ou "2 000 CDF") ou "—" si EN_ATTENTE
  6. Niveau       : Badge bleu "Direct" (niveau 1) ou Badge violet "Indirect" (niveau 2)
  7. Actions      : icône ChevronRight → navigate(`/parrainage/tree/${parrain.id}`)

Comportements :
  - Clic sur la ligne entière → navigate(`/parrainage/tree/${parrain.id}`)
  - Lignes EN_ATTENTE : fond bg-yellow-50 (discret avertissement visuel)
  - Lignes RECOMPENSE_VERSEE : fond bg-green-50/30
  - Colonne "Niveau 2" visible seulement si multi-niveaux est activé dans la config
  - Tri par Date (défaut desc) et par Statut

Skeleton : 8 lignes skeleton pendant le chargement.

Empty state : 
  Icône Users (lucide-react) + "Aucun parrainage trouvé pour cette période."
  Si filtre actif → bouton "Réinitialiser les filtres"


COMPOSANT TopParrainsList — TopParrainsList.tsx
-------------------------------------------------
Liste verticale des 5 meilleurs parrains du mois :

Pour chaque TopParrain :
  - Badge rang : #1 = fond or, #2 = fond argent, #3 = fond bronze, #4-5 = fond gris
  - Avatar avec initiales + nom complet (font-medium)
  - Nb filleuls actifs en badge bleu
  - CA généré par les filleuls (text-sm text-muted-foreground)
  - Bouton ghost "→" → navigate(`/parrainage/tree/${id}`)

Hover sur une ligne : fond gris clair + cursor pointer.
Bouton "Voir le classement complet" en bas → ouvre un Dialog avec le top 20 complet.


COMPOSANT ParrainageFiltersBar — ParrainageFiltersBar.tsx
-----------------------------------------------------------
Filtres disponibles (une ligne, responsive) :

  Filtre 1 — Période :
    Options : Aujourd'hui | Cette semaine | Ce mois | Mois dernier | Tout
    Défaut : "Ce mois"

  Filtre 2 — Site :
    Visible seulement pour DIR_REGIONAL (ses sites) et SUPER_ADMIN (tous).
    GERANT : filtre masqué (son site automatiquement appliqué).

  Filtre 3 — Statut :
    Options : Tous | En attente | Validé | Récompense versée

  Filtre 4 — Recherche :
    Placeholder : "Nom parrain ou filleul..."
    Debounce 400ms
    Recherche sur nom + prénom + téléphone du parrain ET du filleul

  Bouton [Exporter] (variant="outline") :
    → Popover avec [Exporter CSV] et [Exporter PDF]
    → CSV généré côté client avec papaparse
    → PDF via GET /api/v1/rapports/export { type: 'PARRAINAGE', format: 'PDF' }


HOOK useParrainageGlobal — useParrainageGlobal.ts
---------------------------------------------------
  export function useParrainageGlobal(filters: ParrainageFilters) {
    // Query 1 : KPIs (cache 2 minutes)
    const kpisQuery = useQuery({
      queryKey: ['parrainage', 'stats', filters.siteId, filters.period],
      queryFn: () => parrainageApi.getStats(filters),
      staleTime: 2 * 60_000,
    });

    // Query 2 : Liste paginée des parrainages (cache 1 minute)
    const listQuery = useQuery({
      queryKey: ['parrainage', 'list', filters],
      queryFn: () => parrainageApi.list(filters),
      staleTime: 60_000,
      placeholderData: keepPreviousData,
    });

    // Query 3 : Top parrains du mois (cache 5 minutes)
    const topQuery = useQuery({
      queryKey: ['parrainage', 'top', filters.siteId, filters.period],
      queryFn: () => parrainageApi.getTop(filters),
      staleTime: 5 * 60_000,
    });

    return { kpis, parrainages, topParrains, isLoading, pagination };
  }


APPELS API
-----------
GET /api/v1/parrainage/stats
  En-têtes : Authorization: Bearer <accessToken>
  Query : { siteId?: string, period: 'today' | 'week' | 'month' | 'all' }
  Succès 200 :
    {
      kpis: {
        totalActifs: number,
        totalActifsDelta: number,
        recompensesVersees: number,
        meilleurParrain: {
          id: string,
          nom: string,
          prenom: string,
          nbFilleuls: number
        } | null
      }
    }

GET /api/v1/parrainage
  Query :
    siteId?       : string
    period?       : 'today' | 'week' | 'month' | 'all'
    statut?       : 'EN_ATTENTE' | 'VALIDE' | 'RECOMPENSE_VERSEE'
    search?       : string
    page          : number (défaut 1)
    limit         : number (défaut 50)
    sortBy        : 'dateCreation' | 'statut' (défaut 'dateCreation')
    sortOrder     : 'asc' | 'desc' (défaut 'desc')
  Succès 200 :
    {
      parrainages: [Parrainage],
      meta: { total, page, limit, totalPages }
    }

GET /api/v1/parrainage/top
  Query : { siteId?: string, period: string, limit?: number }
  Succès 200 :
    {
      topParrains: [TopParrain]
    }

Back-end — parrainage.service.ts — méthode getStats() :
  1. COUNT Parrainage WHERE siteId AND statut IN ['VALIDE', 'RECOMPENSE_VERSEE']
  2. Calculer deltaActifs : comparer avec la période précédente équivalente
  3. COUNT Parrainage WHERE statut='RECOMPENSE_VERSEE' AND recompenseVerseAt IN période
  4. GROUP BY parrainId ORDER BY COUNT(filleuls) DESC LIMIT 1 → meilleur parrain

Back-end — parrainage.service.ts — méthode list() :
  1. Appliquer les filtres (siteId via filleul.siteInscriptionId)
  2. Inclure parrain + filleul (Prisma include)
  3. Paginer et trier
  4. Retourner avec meta


COMPORTEMENTS ET ÉTATS DE LA PAGE
------------------------------------
État 1 — CHARGEMENT INITIAL
  - 3 cartes KPI : Skeleton (3 Card avec h-24 skeleton)
  - Tableau : 8 lignes skeleton
  - Top parrains : 5 lignes skeleton

État 2 — DONNÉES CHARGÉES
  - Tous les composants avec données réelles
  - Les KPIs, le tableau et le top se chargent en parallèle (pas de waterfall)

État 3 — CHANGEMENT DE FILTRE
  - keepPreviousData actif → pas de flash
  - Opacité 70% sur les données en cours de mise à jour

État 4 — VIDE (aucun parrainage)
  - Icône Users2 (lucide-react) centré
  - "Aucun parrainage enregistré pour la période sélectionnée."
  - Si premier accès (aucun parrainage tout court) :
    Alert info bleu : "Le programme de parrainage est actif.
    Les codes parrain sont générés automatiquement lors de l'activation d'un client."

État 5 — ERREUR API
  - Alert rouge : "Erreur de chargement des données de parrainage."
  - Bouton "Réessayer" → refetch() des trois queries


STYLE ET DESIGN
-----------------
- Fond page       : bg-neutral-50
- Cartes KPI      : bg-white shadow-sm border border-neutral-100 rounded-xl p-6
- Carte meilleur  : bg-gradient-to-br from-[#1E3A5F] to-[#2E86C1] text-white
- Tableau         : bg-white border border-neutral-100 rounded-xl
- Top parrains    : bg-white border border-neutral-100 rounded-xl p-4
- Badge rang #1   : bg-yellow-400 text-yellow-900 font-bold
- Badge rang #2   : bg-gray-300 text-gray-700 font-bold
- Badge rang #3   : bg-amber-600 text-white font-bold
- Badge rang #4-5 : bg-neutral-200 text-neutral-600


RÈGLES DE VALIDATION ZOD — côté client
----------------------------------------
  const parrainageFiltersSchema = z.object({
    period: z.enum(['today', 'week', 'month', 'all']).default('month'),
    siteId: z.string().optional(),
    statut: z.enum(['EN_ATTENTE', 'VALIDE', 'RECOMPENSE_VERSEE']).optional(),
    search: z.string().max(100).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(10).max(100).default(50),
  });


RÈGLES MÉTIER BACK-END (à implémenter dans le service)
--------------------------------------------------------
1. Un AGENT ne peut PAS accéder à ce module → 403 si rôle AGENT
2. Un GERANT voit uniquement les parrainages de son siteId — filtrage serveur auto
3. Un DIR_REGIONAL voit uniquement les sites qui lui sont assignés
4. Un SUPER_ADMIN voit tous les sites sans restriction
5. Le calcul des KPIs utilise toujours le fuseau horaire Africa/Kinshasa (UTC+2)


TESTS — ParrainagePage.test.tsx
---------------------------------
  describe('ParrainagePage', () => {
    describe('KPI Cards', () => {
      test('1  — Nombre de parrainages actifs affiché')
      test('2  — Delta positif : badge vert "↑ +12 ce mois"')
      test('3  — Delta négatif : badge rouge "↓ -3 ce mois"')
      test('4  — Meilleur parrain affiché avec nb filleuls')
      test('5  — Skeleton visible pendant le chargement des KPIs')
    })

    describe('Tableau des parrainages', () => {
      test('6  — Tableau affiche parrain, filleul, date, statut')
      test('7  — Badge EN_ATTENTE gris, VALIDE bleu, RECOMPENSE_VERSEE vert')
      test('8  — Colonne "Niveau 2" masquée si multi-niveaux désactivé')
      test('9  — Lignes EN_ATTENTE ont fond jaune clair')
      test('10 — Clic ligne → navigate vers /parrainage/tree/:parrainId')
      test('11 — Pagination : clic "Suivant" → page 2')
      test('12 — Empty state si aucun parrainage')
    })

    describe('Filtres', () => {
      test('13 — Filtre Période "Ce mois" appliqué par défaut')
      test('14 — Filtre Statut "En attente" filtre correctement la liste')
      test('15 — Recherche debounce 400ms avant appel API')
      test('16 — Filtre Site masqué pour rôle GERANT')
      test('17 — keepPreviousData : pas de flash lors du changement de filtre')
    })

    describe('Top Parrains', () => {
      test('18 — Top 5 affiché avec rang coloré')
      test('19 — Badge or pour le rang #1')
      test('20 — Bouton "Voir son réseau" → navigate vers /parrainage/tree/:id')
      test('21 — Dialog top 20 s\'ouvre au clic sur "Voir classement complet"')
    })

    describe('Export', () => {
      test('22 — Export CSV déclenche le téléchargement')
      test('23 — Popover export affiche les 2 options CSV et PDF')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-024
---------------------------------------------
[ ] Les 3 cartes KPI s'affichent avec les bonnes données et le delta coloré
[ ] Le tableau des parrainages est correctement paginé et filtrable
[ ] Les badges de statut (EN_ATTENTE/VALIDE/RECOMPENSE_VERSEE) sont bien colorés
[ ] La colonne "Niveau 2" n'apparaît que si multi-niveaux est actif
[ ] Le top 5 parrains s'affiche avec les bons badges de rang (or/argent/bronze)
[ ] Le Dialog "Top 20" s'ouvre et affiche les données
[ ] Les filtres (période, site, statut, recherche) fonctionnent correctement
[ ] Le filtre Site est masqué pour le rôle GERANT
[ ] L'export CSV télécharge un fichier valide
[ ] Les erreurs API affichent un message avec bouton "Réessayer"
[ ] La page est responsive (375px mobile / 1280px desktop)
[ ] npm run test : 23 tests ParrainagePage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 3 — SCR-025 : ARBRE DE PARRAINAGE CLIENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : TechShop Manager
Fichier cible: apps/client/src/pages/parrainage/ParrainageTreePage.tsx
Route        : /parrainage/tree/:clientId
Accès        : Authentifié — rôle AGENT minimum
Rôle minimum : AGENT | GERANT | DIR_REGIONAL | SUPER_ADMIN
Dépendances  : SCR-024 terminé (parrainageApi, types Parrainage, ParrainageStatusBadge)


OBJECTIF
--------
Créer la page de visualisation de l'arbre de parrainage d'un client (SCR-025).
Cette page est accessible depuis la liste SCR-024 (clic sur une ligne),
depuis la fiche client SCR-006 (onglet Parrainage), et depuis le portail client.

Elle affiche deux vues complémentaires :
  1. Une visualisation graphique SVG de l'arbre (nœuds connectés par des lignes)
  2. Un tableau liste des filleuls directs et indirects

L'arbre peut avoir jusqu'à 2 niveaux si le multi-niveaux est activé dans la config.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/parrainage/ParrainageTreePage.tsx           ← CRÉER (principal)
2. apps/client/src/pages/parrainage/ParrainageTreePage.test.tsx      ← CRÉER (tests Vitest)
3. apps/client/src/components/parrainage/ParrainageTreeSvg.tsx       ← CRÉER (arbre SVG)
4. apps/client/src/components/parrainage/ParrainageTreeNode.tsx      ← CRÉER (nœud SVG)
5. apps/client/src/components/parrainage/FilleulsTable.tsx           ← CRÉER (tableau liste)
6. apps/client/src/components/parrainage/ParrainageStats.tsx         ← CRÉER (stats client)
7. apps/client/src/hooks/useParrainageTree.ts                        ← CRÉER (hook TQ)

BACK-END :
8. apps/server/src/modules/parrainage/parrainage.controller.ts       ← AJOUTER GET /tree/:clientId
9. apps/server/src/modules/parrainage/parrainage.service.ts          ← AJOUTER getTree()


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
  ┌──────────────────────────────────────────────────────────────────────┐
  │  ← Parrainage    Réseau de parrainage — MASUDI Serge (TSG-0005)     │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  Parrain du client : BAHATI Jean-Pierre (TSG-0001)           │    │
  │  │  Récompenses reçues de ce parrainage : 500 pts              │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                    │
  │  │ Filleuls   │  │ Filleuls   │  │ Gains      │                    │
  │  │ directs    │  │ actifs     │  │ totaux     │                    │
  │  │    32      │  │    28      │  │  16 000 pts│                    │
  │  └────────────┘  └────────────┘  └────────────┘                    │
  │                                                                      │
  │  [ 🌳 Vue arbre ]  [ 📋 Vue liste ]          [Niveau ▼: 1 et 2]    │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  VUE ARBRE (SVG — panneau scrollable)                                │
  │                                                                      │
  │              ┌─────────────────┐                                    │
  │              │  MASUDI Serge   │  ← Nœud racine (bleu foncé)        │
  │              │  TSG-0005       │                                    │
  │              │  ■ Platine      │                                    │
  │              └────────┬────────┘                                    │
  │        ┌──────────────┼──────────────┐                              │
  │   ┌────┴────┐   ┌────┴────┐   ┌────┴────┐                          │
  │   │BAHATI J.│   │NGABO Y. │   │PALUKU D.│  ← Nœuds N1 (bleu clair) │
  │   │TSG-0001 │   │TSG-0004 │   │TSG-0007 │                          │
  │   │ ACTIF ● │   │ ACTIF ● │   │EN_COURS ○│                         │
  │   └─────────┘   └────┬────┘   └─────────┘                          │
  │                  ┌───┴────┐                                         │
  │             ┌────┴───┐ ┌──┴─────┐                                  │
  │             │MUSA K. │ │JOHN P. │  ← Nœuds N2 (violet clair)       │
  │             │TSG-0012 │ │TSG-0015│                                  │
  │             └─────────┘ └────────┘                                  │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘


COMPOSANT ParrainageTreeSvg — ParrainageTreeSvg.tsx
-----------------------------------------------------
Visualisation SVG de l'arbre de parrainage.
Utiliser une approche algorithmique pour calculer les positions des nœuds.

  interface ParrainageTreeSvgProps {
    racine: TreeNode;
    niveaux: 1 | 2;
    onNodeClick: (clientId: string) => void;
  }

  interface TreeNode {
    clientId: string;
    nom: string;
    prenom: string;
    codeParrain: string;
    statut: 'EN_COURS' | 'ACTIF' | 'SUSPENDU';
    niveauFidelite: NiveauFidelite;
    niveau: 0 | 1 | 2;              // 0 = racine, 1 = filleul direct, 2 = filleul indirect
    filleuls: TreeNode[];            // enfants de ce nœud
  }

Algorithme de placement des nœuds :
  1. Calculer la largeur requise par niveau :
       largeurNoeud = 140px, espaceHorizontal = 20px
       largeurNiveau = nbNoeudsNiveau × (largeurNoeud + espaceHorizontal)
  2. Centrer chaque nœud par rapport à ses enfants
  3. Espacer verticalement : 100px entre niveaux

Rendu SVG de chaque nœud (ParrainageTreeNode.tsx) :
  - Rectangle arrondi (rx=8) de 130×60px
  - Couleurs selon niveau :
      niveau 0 (racine)   : fond #1E3A5F, texte blanc, bordure épaisse #2E86C1
      niveau 1 (direct)   : fond #D6E4F0, texte #1E3A5F, bordure #2E86C1
      niveau 2 (indirect) : fond #EDE7F6, texte #4A148C, bordure #9C27B0
  - Couleur du fond modifiée si statut :
      ACTIF    → couleur normale
      EN_COURS → ajouter motif diagonal léger (ou bordure pointillée)
      SUSPENDU → couleur grisée (opacity 0.5)
  - Ligne 1 : "NOM Prénom" (tronqué à 15 chars)
  - Ligne 2 : code parrain en monospace (text-xs)
  - Indicateur statut : cercle 8px en bas à droite (vert=ACTIF, orange=EN_COURS, rouge=SUSPENDU)

Lignes de connexion :
  - SVG <line> ou <path> courbe (bezier) entre nœud parent et enfant
  - Couleur : #94A3B8 (gris doux)
  - Épaisseur : 1.5px pour les connexions N0→N1, 1px pour N1→N2

Tooltip au survol d'un nœud :
  Afficher au-dessus du nœud un rectangle SVG (ou foreignObject HTML) avec :
    Nom complet | Téléphone | Statut | Niveau fidélité | Date d'activation
  Le tooltip disparaît après 3s ou au mouseleave

Interactions :
  - Clic sur un nœud → appeler onNodeClick(clientId)
    → L'appelant redirige vers /clients/:id (fiche client)
  - Survol → afficher tooltip + légère ombre sur le nœud
  - Zoom/Pan : implémenter avec un viewBox dynamique + boutons [+] [-] [Reset]
    (pas de lib externe — pure manipulation SVG)

Si l'arbre dépasse la largeur du conteneur → ajouter une ScrollArea horizontale.

Message si aucun filleul :
  Icône Users (lucide-react) sous le nœud racine + "Ce client n'a pas encore de filleuls."


COMPOSANT FilleulsTable — FilleulsTable.tsx
--------------------------------------------
Vue alternative en tableau (onglet "Vue liste") :

Colonnes :
  1. Rang         : numéro d'ordre (1, 2, 3…)
  2. Filleul      : Avatar + Nom + Téléphone
  3. Niveau       : Badge "Direct" (N1, bleu) ou "Indirect" (N2, violet)
  4. Statut       : Badge statut client (ACTIF vert / EN_COURS orange)
  5. Date activ.  : "17 jan. 2025" ou "—" si EN_COURS
  6. Points générés : montant points que ce filleul a générés au parrain
  7. Actions      : bouton "Voir fiche" → navigate(`/clients/${id}`)

Filtres de la table :
  Toggle [Directs uniquement] / [Tous niveaux]
  Tri par : Date activation (défaut) / Points générés / Nom

Résumé en pied de table :
  "[X filleuls directs] · [Y filleuls indirects] · [Z total actifs]"


COMPOSANT ParrainageStats — ParrainageStats.tsx
-------------------------------------------------
Bande de 3 cartes stats au-dessus de la vue arbre/liste :

  interface ParrainageStatsProps {
    stats: {
      nbFilleulsTotal: number;
      nbFilleulsActifs: number;
      gainsTotaux: number;           // en points ou CDF selon typeRecompense
      typeRecompense: TypeRecompense;
    };
    parrain: { id: string; nom: string; prenom: string };
    parrainParent?: { id: string; nom: string; prenom: string; codeParrain: string };
  }

  Affichage si parrainParent existe :
    Alert info bleu en haut : "Ce client est lui-même filleul de [NomParrain] ([codeParrain])
    — Récompense reçue : [valeur]"

  Rendu des gains selon typeRecompense :
    POINTS              → "16 000 pts"
    REMISE_PROCHAINE    → "32 remises accordées"
    COMMISSION_CDF      → "64 000 CDF"


HOOK useParrainageTree — useParrainageTree.ts
----------------------------------------------
  export function useParrainageTree(clientId: string) {
    const { data, isLoading, isError } = useQuery({
      queryKey: ['parrainage', 'tree', clientId],
      queryFn: () => parrainageApi.getTree(clientId),
      staleTime: 3 * 60_000,         // 3 minutes
      retry: 1,
    });

    // Vue active : 'tree' | 'list'
    const [activeView, setActiveView] = useState<'tree' | 'list'>('tree');
    const [niveaux, setNiveaux]       = useState<1 | 2>(2);
    const [showIndirect, setShowIndirect] = useState(true);

    // Filtrer les nœuds selon le niveau sélectionné
    const filteredTree = useMemo(() => {
      if (niveaux === 1) return supprimerNiveau2(data?.arbre);
      return data?.arbre;
    }, [data, niveaux]);

    return { arbre: filteredTree, stats, parrainParent, filleuls,
             activeView, setActiveView, niveaux, setNiveaux,
             isLoading, isError };
  }


APPELS API
-----------
GET /api/v1/parrainage/tree/:clientId
  Params : { clientId: string }
  Query  : { niveaux?: 1 | 2 }
  Succès 200 :
    {
      arbre: TreeNode,                 // structure récursive racine → filleuls → filleuls
      stats: {
        nbFilleulsTotal: number,
        nbFilleulsActifs: number,
        gainsTotaux: number,
        typeRecompense: TypeRecompense
      },
      parrainParent?: {               // parrain du client (si ce client est lui-même filleul)
        id: string,
        nom: string,
        prenom: string,
        codeParrain: string,
        recompenseRecue: number
      },
      filleuls: [                     // liste plate pour la vue tableau
        {
          id: string,
          nom: string,
          prenom: string,
          telephone: string,
          niveau: 1 | 2,
          statut: string,
          dateActivation?: string,
          pointsGeneresPourParrain: number
        }
      ]
    }
  Erreur 404 : { error: { code: 'CLIENT_NOT_FOUND' } }

Back-end — parrainage.service.ts — méthode getTree() :
  1. Récupérer le client racine avec ses filleuls directs (niveau 1)
  2. Pour chaque filleul de niveau 1 : récupérer ses propres filleuls (niveau 2)
  3. Calculer les pointsGeneresPourParrain : somme des MouvementPoints type PARRAINAGE
     liés au couple (parrainId, filleulId)
  4. Calculer gainsTotaux : somme de toutes les récompenses RECOMPENSE_VERSEE
  5. Construire la structure TreeNode récursive
  6. Chercher le parrainParent du client racine (si il en a un)


COMPORTEMENTS ET ÉTATS DE LA PAGE
------------------------------------
État 1 — CHARGEMENT
  - Skeleton de l'arbre SVG (rectangles gris animés en position)
  - Skeleton des cartes stats

État 2 — ARBRE CHARGÉ AVEC FILLEULS
  - Vue SVG par défaut
  - Bascule fluide vers la vue liste au clic sur l'onglet

État 3 — CLIENT SANS FILLEUL
  - Nœud racine affiché seul (sans connexions)
  - Texte sous le nœud : "Aucun filleul enregistré pour l'instant."
  - Si client ACTIF : Alert info "Le code parrain TSG-XXXX peut être partagé pour recruter."

État 4 — CLIENT INTROUVABLE (404)
  - Page d'erreur : "Client introuvable" + bouton "← Retour au parrainage"

État 5 — ZOOM / PAN de l'arbre SVG
  - Bouton [+] → augmente le viewBox (zoom in)
  - Bouton [-] → réduit le viewBox (zoom out)
  - Bouton [↺ Reset] → remet le viewBox à sa valeur initiale
  - Contraindre le zoom entre 50% et 200%


STYLE ET DESIGN
-----------------
- Fond page       : bg-neutral-50
- Conteneur SVG   : bg-white border border-neutral-100 rounded-xl shadow-sm
                    overflow-hidden, min-height 400px
- Nœud racine     : fill="#1E3A5F" stroke="#2E86C1" strokeWidth="2"
- Nœud N1 actif   : fill="#D6E4F0" stroke="#2E86C1" strokeWidth="1"
- Nœud N1 en cours: fill="#FFF3E0" stroke="#E65100" strokeWidth="1" strokeDasharray="4 2"
- Nœud N2 actif   : fill="#EDE7F6" stroke="#9C27B0" strokeWidth="1"
- Lignes           : stroke="#94A3B8" strokeWidth="1.5"
- Tooltip          : bg-white border border-neutral-200 shadow-lg rounded-lg p-3 text-sm


TESTS — ParrainageTreePage.test.tsx
--------------------------------------
  describe('ParrainageTreePage', () => {
    describe('Composant SVG', () => {
      test('1  — Nœud racine affiché avec nom et code parrain')
      test('2  — Filleuls de niveau 1 connectés au nœud racine')
      test('3  — Filleuls de niveau 2 connectés aux nœuds N1 correspondants')
      test('4  — Nœud EN_COURS a une bordure pointillée orange')
      test('5  — Tooltip affiché au survol d\'un nœud')
      test('6  — Clic nœud → onNodeClick appelé avec le bon clientId')
      test('7  — Message "aucun filleul" si arbre sans enfants')
      test('8  — Bouton [+] augmente le zoom, [-] diminue')
    })

    describe('Vue liste FilleulsTable', () => {
      test('9  — Toggle "Vue liste" bascule depuis la vue arbre')
      test('10 — Filleuls directs affichent badge "Direct" bleu')
      test('11 — Filleuls indirects affichent badge "Indirect" violet')
      test('12 — Filtre "Directs uniquement" masque les filleuls N2')
      test('13 — Bouton "Voir fiche" → navigate vers /clients/:id')
    })

    describe('Stats et parrain parent', () => {
      test('14 — Stats : nb filleuls total, actifs, gains affichés')
      test('15 — Alert si client est lui-même filleul (parrainParent affiché)')
      test('16 — Gains affichés en pts ou CDF selon typeRecompense')
    })

    describe('États erreur', () => {
      test('17 — Skeleton visible pendant le chargement')
      test('18 — Page 404 si client inexistant')
      test('19 — Filtre "Niveau 1 uniquement" cache les nœuds N2')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-025
---------------------------------------------
[ ] Le nœud racine s'affiche correctement (couleur bleu foncé, nom, code parrain)
[ ] Les filleuls de niveau 1 sont positionnés horizontalement sous la racine
[ ] Les filleuls de niveau 2 sont positionnés sous leurs parents respectifs
[ ] Les lignes de connexion relient correctement les nœuds
[ ] Les nœuds EN_COURS ont une bordure pointillée orange distincte
[ ] Le tooltip au survol affiche les bonnes informations
[ ] Le clic sur un nœud redirige vers la fiche client
[ ] La bascule entre vue arbre et vue liste fonctionne sans rechargement
[ ] Le tableau FilleulsTable affiche les bonnes colonnes et valeurs
[ ] Le filtre "Directs uniquement" fonctionne
[ ] L'Alert "parrain parent" s'affiche si le client est lui-même filleul
[ ] Les boutons de zoom fonctionnent correctement
[ ] La page 404 s'affiche si le clientId n'existe pas
[ ] npm run test : 19 tests ParrainageTreePage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 3 — SCR-026 : CONFIGURATION DES RÉCOMPENSES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet       : TechShop Manager
Fichier cible: apps/client/src/pages/parrainage/ParrainageConfigPage.tsx
Route        : /parrainage/config
Accès        : Authentifié — rôle SUPER_ADMIN uniquement
Rôle minimum : SUPER_ADMIN
Dépendances  : SCR-024 terminé (types RegleParrainage, parrainageApi)


OBJECTIF
--------
Créer la page de configuration du programme de parrainage (SCR-026).
Seul le Super Admin peut accéder à cet écran.
Il définit ici toutes les règles qui régissent le système de parrainage :
type et valeur des récompenses, activation du multi-niveaux, condition de
déclenchement, plafond mensuel, et historique des changements de configuration.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/parrainage/ParrainageConfigPage.tsx          ← CRÉER (principal)
2. apps/client/src/pages/parrainage/ParrainageConfigPage.test.tsx     ← CRÉER (tests Vitest)
3. apps/client/src/components/parrainage/RecompenseForm.tsx           ← CRÉER (formulaire)
4. apps/client/src/components/parrainage/ParrainageSimulator.tsx      ← CRÉER (simulateur)
5. apps/client/src/components/parrainage/ConfigHistoryTable.tsx       ← CRÉER (historique)
6. apps/client/src/hooks/useParrainageConfig.ts                       ← CRÉER (hook TQ)

BACK-END :
7. apps/server/src/modules/parrainage/parrainage.controller.ts        ← AJOUTER GET/PUT /config
8. apps/server/src/modules/parrainage/parrainage.service.ts           ← AJOUTER getConfig/updateConfig
9. apps/server/src/modules/parrainage/dto/update-config.dto.ts        ← CRÉER


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Configuration du parrainage          [ Aperçu actuel ] [ Enreg. ]  │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  ⚠ Configuration globale — s'applique à TOUS les sites      │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  RÈGLES DE RÉCOMPENSE                                       │    │
  │  │                                                              │    │
  │  │  Type de récompense *                                        │    │
  │  │  ○ Points fidélité    ○ Remise prochaine vente  ○ Commission│    │
  │  │                                                              │    │
  │  │  Valeur récompense — Niveau 1 (parrain direct) *            │    │
  │  │  [500          ] pts  (ou CDF ou %)                         │    │
  │  │                                                              │    │
  │  │  ┄┄┄┄  Multi-niveaux  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄                │    │
  │  │  Activer le parrainage à 2 niveaux   ◉ ON  ○ OFF            │    │
  │  │                                                              │    │
  │  │  Valeur récompense — Niveau 2 (parrain du parrain)          │    │
  │  │  [200          ] pts  (affiché si multi-niveaux actif)      │    │
  │  │                                                              │    │
  │  │  Condition de déclenchement *                               │    │
  │  │  ○ À l'activation du filleul     ○ Au premier achat        │    │
  │  │                                                              │    │
  │  │  Plafond mensuel (optionnel)                                 │    │
  │  │  [ 0 = illimité   ] récompenses par mois par parrain        │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  SIMULATEUR DE RÉCOMPENSE                                   │    │
  │  │  Si un parrain recrute 3 filleuls qui achètent 150 000 CDF  │    │
  │  │  → Parrain reçoit : 1 500 pts (3 × 500)                     │    │
  │  │  → Parrain du parrain : 600 pts (3 × 200) si N2 actif       │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  HISTORIQUE DES MODIFICATIONS                                        │
  │  Date       │ Admin             │ Modification                       │
  │  17/01/2025 │ ADMIN Jean-Pierre │ Valeur N1 : 300 pts → 500 pts     │
  │  10/01/2025 │ ADMIN Jean-Pierre │ Multi-niveaux activé               │
  └──────────────────────────────────────────────────────────────────────┘


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Card, CardContent, CardHeader, CardTitle  → sections du formulaire
- RadioGroup, RadioGroupItem                → type récompense, condition déclenchement
- Switch                                    → toggle multi-niveaux ON/OFF
- Input (type="number")                     → valeurs numériques (pts, CDF, %)
- Label                                     → labels des champs
- Alert, AlertDescription                   → avertissement "configuration globale"
- Button (variant="default")                → "Enregistrer la configuration"
- Button (variant="outline")                → "Annuler les modifications"
- Badge                                     → unité selon type (pts / CDF / %)
- Separator                                 → séparations dans le formulaire
- Table                                     → historique des modifications
- Dialog                                    → confirmation avant sauvegarde
- Skeleton                                  → chargement de la config actuelle
- Tooltip, TooltipContent, TooltipTrigger   → aide contextuelle sur chaque champ


COMPOSANT RecompenseForm — RecompenseForm.tsx
---------------------------------------------
Formulaire géré avec react-hook-form + zodResolver :

  // Schéma Zod
  const recompenseConfigSchema = z.object({
    typeRecompense: z.enum(['POINTS', 'REMISE_PROCHAINE_VENTE', 'COMMISSION_CDF']),
    valeurNiveau1: z.number().int().min(1).max(100000),
    multiNiveaux: z.boolean(),
    valeurNiveau2: z.number().int().min(0).max(50000).optional(),
    conditionDeclenchement: z.enum(['ACTIVATION', 'PREMIER_ACHAT']),
    plafondMensuel: z.number().int().min(0).default(0),
  }).refine(
    (data) => !data.multiNiveaux || (data.valeurNiveau2 !== undefined && data.valeurNiveau2 > 0),
    {
      message: "La valeur du niveau 2 est requise si le multi-niveaux est activé.",
      path: ["valeurNiveau2"],
    }
  ).refine(
    (data) => !data.multiNiveaux || data.valeurNiveau2! < data.valeurNiveau1,
    {
      message: "La récompense du niveau 2 doit être inférieure à celle du niveau 1.",
      path: ["valeurNiveau2"],
    }
  );

Logique d'affichage dynamique :
  - L'unité affichée à droite du champ valeur change selon typeRecompense :
      POINTS              → "pts"
      REMISE_PROCHAINE    → "%"   (et valeur max = 50)
      COMMISSION_CDF      → "CDF"
  - Le champ valeurNiveau2 est affiché/masqué selon l'état du Switch multiNiveaux
  - Si plafondMensuel = 0 → afficher "Illimité" en placeholder
  - Tooltip sur chaque RadioGroup item (icône HelpCircle lucide 14px) :
      POINTS              → "Des points fidélité seront ajoutés au compte du parrain."
      REMISE_PROCHAINE    → "Le parrain recevra un bon de réduction sur sa prochaine vente."
      COMMISSION_CDF      → "Un montant en Francs Congolais sera crédité au parrain."
  - Tooltip sur conditionDeclenchement :
      ACTIVATION          → "La récompense est versée dès que le filleul complète les 4 étapes."
      PREMIER_ACHAT       → "La récompense n'est versée qu'après le premier achat du filleul."


COMPOSANT ParrainageSimulator — ParrainageSimulator.tsx
---------------------------------------------------------
Simulateur interactif qui se met à jour en temps réel à chaque changement du formulaire.

  interface ParrainageSimulatorProps {
    config: RecompenseConfig;    // valeurs actuelles du formulaire (pas encore sauvegardées)
  }

Affichage :
  - Input : "Nombre de filleuls à simuler : [3]"
  - Input : "Montant d'achat par filleul : [150 000 CDF]" (visible seulement si COMMISSION)
  - Résultats calculés en temps réel :

  Si POINTS + multiNiveaux actif :
    "→ Ce parrain recevrait : 3 × 500 = 1 500 pts"
    "→ Son parrain (N2) recevrait : 3 × 200 = 600 pts"

  Si REMISE_PROCHAINE (ex: 5%) :
    "→ Ce parrain recevrait : 3 bons de remise de 5% chacun"

  Si COMMISSION_CDF (ex: 2 000 CDF/filleul) :
    "→ Ce parrain recevrait : 3 × 2 000 = 6 000 CDF"

  Encadré de mise en contexte (Alert info) :
    "Ces calculs sont basés sur la configuration en cours d'édition,
    non sur la configuration actuellement active."


COMPOSANT ConfigHistoryTable — ConfigHistoryTable.tsx
-------------------------------------------------------
Tableau de l'historique des changements de configuration :

Colonnes :
  1. Date        : format "17 jan. 2025 à 14:32" (date-fns/fr)
  2. Admin       : Nom + Prénom de l'admin qui a fait le changement
  3. Modification: description textuelle générée (ex : "Valeur N1 : 300 pts → 500 pts")
  4. Ancienne val.: valeur avant le changement
  5. Nouvelle val.: valeur après le changement

Génération de la description de modification :
  Comparer l'objet config avant/après et générer du texte lisible pour chaque champ modifié.
  Si plusieurs champs modifiés en même temps → une ligne par champ.

Pagination : 10 entrées par page.
Limite : afficher les 30 derniers changements maximum.


HOOK useParrainageConfig — useParrainageConfig.ts
---------------------------------------------------
  export function useParrainageConfig() {
    // Lire la config actuelle
    const { data, isLoading } = useQuery({
      queryKey: ['parrainage', 'config'],
      queryFn: () => parrainageApi.getConfig(),
      staleTime: 10 * 60_000,         // 10 minutes (la config change rarement)
    });

    // Lire l'historique
    const { data: history } = useQuery({
      queryKey: ['parrainage', 'config', 'history'],
      queryFn: () => parrainageApi.getConfigHistory(),
      staleTime: 5 * 60_000,
    });

    // Mutation pour sauvegarder
    const mutation = useMutation({
      mutationFn: (config: UpdateConfigDto) => parrainageApi.updateConfig(config),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['parrainage', 'config'] });
        queryClient.invalidateQueries({ queryKey: ['parrainage'] });
        toast.success("Configuration du parrainage mise à jour avec succès.");
      },
      onError: (error) => {
        toast.error("Erreur lors de la sauvegarde. Vérifiez les valeurs saisies.");
      }
    });

    return { config, history, isLoading, saveConfig: mutation.mutate, isSaving: mutation.isPending };
  }


APPELS API
-----------
GET /api/v1/parrainage/config
  Succès 200 :
    {
      config: RegleParrainage,          // config active actuelle
      history: [
        {
          id: string,
          changedAt: string,
          changedBy: { id, nom, prenom },
          fieldName: string,
          oldValue: string,
          newValue: string
        }
      ]
    }

PUT /api/v1/parrainage/config
  Corps (UpdateConfigDto) :
    {
      typeRecompense: 'POINTS' | 'REMISE_PROCHAINE_VENTE' | 'COMMISSION_CDF',
      valeurNiveau1: number,
      multiNiveaux: boolean,
      valeurNiveau2?: number,
      conditionDeclenchement: 'ACTIVATION' | 'PREMIER_ACHAT',
      plafondMensuel: number          // 0 = illimité
    }
  Succès 200 :
    {
      config: RegleParrainage,
      modifiedFields: string[],       // liste des champs modifiés pour l'historique
      affectedParrainages: number     // nb de parrainages impactés par le changement
    }
  Erreur 400 :
    { error: { code: 'INVALID_CONFIG', details: string[] } }
  Erreur 403 :
    { error: { code: 'SUPER_ADMIN_REQUIRED' } }

Back-end — parrainage.service.ts — méthode updateConfig() :
  1. Vérifier rôle SUPER_ADMIN (guard NestJS)
  2. Récupérer la config actuelle
  3. Identifier les champs modifiés (diff)
  4. Valider les contraintes métier :
     - Si multiNiveaux → valeurNiveau2 doit être > 0 ET < valeurNiveau1
     - Si REMISE_PROCHAINE_VENTE → valeurNiveau1 doit être ≤ 50 (%)
  5. Sauvegarder la nouvelle config (UPDATE en base)
  6. Créer une entrée ConfigHistory par champ modifié
  7. Invalider le cache Redis des stats parrainage
  8. Compter les parrainages actifs potentiellement affectés
  9. Retourner la config mise à jour + modifiedFields + affectedParrainages


MODAL DE CONFIRMATION AVANT SAUVEGARDE
-----------------------------------------
Avant d'appeler l'API, ouvrir un Dialog de confirmation :

  Titre : "Confirmer la modification"
  Corps :
    "Cette configuration s'applique à TOUS les sites (Goma, Bukavu, Kinshasa)
    et impactera [X] parrainages actifs immédiatement."
    (afficher le nb d'affectedParrainages calculé en temps réel par une requête légère)
    Si changement de type de récompense :
      Alert rouge : "Attention : vous changez le type de récompense de
      [ancien type] vers [nouveau type]. Les récompenses EN_ATTENTE
      seront recalculées avec les nouveaux paramètres."
  Boutons :
    [Annuler] → fermer
    [Confirmer et enregistrer] → variant destructive → soumettre


COMPORTEMENTS ET ÉTATS DE LA PAGE
------------------------------------
État 1 — CHARGEMENT DE LA CONFIG
  - Skeleton de tout le formulaire (RadioGroup + Inputs + Switch)
  - Skeleton de l'historique

État 2 — CONFIG CHARGÉE (aucune modification)
  - Formulaire prérempli avec les valeurs actuelles
  - Bouton "Enregistrer" DISABLED (aucun changement)
  - Bouton "Annuler" MASQUÉ (rien à annuler)
  - Simulateur affiche les résultats avec la config actuelle

État 3 — FORMULAIRE MODIFIÉ (isDirty = true)
  - Bouton "Enregistrer" ACTIF
  - Bouton "Annuler les modifications" VISIBLE
  - Simulateur se met à jour en temps réel avec les nouvelles valeurs
  - Badge jaune "⚠ Modifications non sauvegardées" dans le header

État 4 — SAUVEGARDE EN COURS
  - Modal de confirmation affiché
  - Clic "Confirmer" : spinner sur bouton + "Enregistrement..."
  - Formulaire désactivé (pointer-events-none)

État 5 — SAUVEGARDE RÉUSSIE
  - Modal fermé
  - Toast vert "Configuration mise à jour avec succès."
  - Badge "⚠ Non sauvegardé" disparaît
  - Historique rechargé automatiquement (TanStack Query invalidate)

État 6 — ERREUR DE SAUVEGARDE
  - Modal fermé
  - Toast rouge avec le message d'erreur
  - Formulaire reste modifiable

État 7 — TENTATIVE D'ACCÈS PAR NON-SUPER-ADMIN
  - ProtectedRoute redirige vers /dashboard
  - Toast rouge : "Accès refusé — Super Admin requis"


RÈGLES DE VALIDATION ZOD — côté client
----------------------------------------
  const updateConfigSchema = z.object({
    typeRecompense: z.enum(['POINTS', 'REMISE_PROCHAINE_VENTE', 'COMMISSION_CDF']),

    valeurNiveau1: z.number({
      required_error: "La valeur du niveau 1 est requise",
      invalid_type_error: "Doit être un nombre"
    })
    .int("Doit être un nombre entier")
    .min(1, "Minimum 1")
    .max(100000, "Maximum 100 000"),

    multiNiveaux: z.boolean(),

    valeurNiveau2: z.number().int().min(0).optional(),

    conditionDeclenchement: z.enum(['ACTIVATION', 'PREMIER_ACHAT']),

    plafondMensuel: z.number().int().min(0, "Doit être positif ou 0").default(0),
  })
  .refine(
    (d) => d.typeRecompense !== 'REMISE_PROCHAINE_VENTE' || d.valeurNiveau1 <= 50,
    { message: "Le pourcentage de remise ne peut pas dépasser 50%.", path: ["valeurNiveau1"] }
  )
  .refine(
    (d) => !d.multiNiveaux || (d.valeurNiveau2 !== undefined && d.valeurNiveau2 > 0),
    { message: "La valeur N2 est requise quand le multi-niveaux est activé.", path: ["valeurNiveau2"] }
  )
  .refine(
    (d) => !d.multiNiveaux || !d.valeurNiveau2 || d.valeurNiveau2 < d.valeurNiveau1,
    { message: "La récompense N2 doit être inférieure à la récompense N1.", path: ["valeurNiveau2"] }
  );


STYLE ET DESIGN
-----------------
- Fond page            : bg-neutral-50
- Sections formulaire  : Card bg-white border-neutral-100 rounded-xl shadow-sm
- Alert globale        : Alert variant="warning" fond amber-50 bordure amber-400
- Simulateur           : Card bg-blue-50 border-blue-100
- Badge "non sauvegardé": bg-yellow-100 text-yellow-800 border-yellow-300
- Champ valeur + unité : flex row gap-2 items-center (Input + Badge unité)
- Historique table     : alternance bg-white / bg-neutral-50
- Tooltip aide         : max-w-xs bg-neutral-900 text-white text-xs


TESTS — ParrainageConfigPage.test.tsx
----------------------------------------
  describe('ParrainageConfigPage', () => {
    describe('Chargement', () => {
      test('1  — Skeleton visible pendant le chargement')
      test('2  — Formulaire prérempli avec la config actuelle')
      test('3  — Bouton "Enregistrer" disabled si aucun changement')
    })

    describe('Formulaire', () => {
      test('4  — Sélection POINTS : unité "pts" affichée')
      test('5  — Sélection REMISE : unité "%" + validation max 50')
      test('6  — Sélection COMMISSION : unité "CDF" affichée')
      test('7  — Toggle multi-niveaux ON : champ valeurNiveau2 apparaît')
      test('8  — Toggle multi-niveaux OFF : champ valeurNiveau2 masqué')
      test('9  — Erreur si valeurNiveau2 ≥ valeurNiveau1')
      test('10 — Erreur si remise > 50%')
      test('11 — Badge "non sauvegardé" visible après modification')
      test('12 — Bouton "Annuler" restaure les valeurs initiales')
    })

    describe('Simulateur', () => {
      test('13 — Simulateur recalcule en temps réel à chaque changement')
      test('14 — Si multi-niveaux actif : ligne N2 visible dans le simulateur')
      test('15 — Si multi-niveaux inactif : ligne N2 absente du simulateur')
    })

    describe('Sauvegarde', () => {
      test('16 — Dialog de confirmation s\'ouvre avant la sauvegarde')
      test('17 — Alert rouge si changement de typeRecompense')
      test('18 — Annuler le dialog ne soumet pas la config')
      test('19 — Sauvegarde réussie : toast vert + historique rechargé')
      test('20 — Erreur API : toast rouge, formulaire reste éditable')
    })

    describe('Accès et sécurité', () => {
      test('21 — Rôle non SUPER_ADMIN → redirect vers /dashboard')
      test('22 — Historique des modifications affiché')
      test('23 — Historique paginé à 10 entrées par page')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-026
---------------------------------------------
[ ] La page est accessible UNIQUEMENT pour le rôle SUPER_ADMIN
[ ] Le formulaire se prérempli avec la configuration actuelle au chargement
[ ] Le switch multi-niveaux affiche/masque le champ valeurNiveau2 dynamiquement
[ ] L'unité (pts / % / CDF) change selon le type de récompense sélectionné
[ ] Les validations Zod bloquent la soumission si les règles sont violées
[ ] Le simulateur se met à jour en temps réel à chaque changement de valeur
[ ] Le badge "non sauvegardé" apparaît dès qu'une valeur est modifiée
[ ] Le bouton "Annuler" restaure toutes les valeurs initiales
[ ] Le Dialog de confirmation s'affiche avec le nb de parrainages impactés
[ ] L'Alert rouge s'affiche dans le dialog si le type de récompense change
[ ] La sauvegarde réussie affiche un toast vert et recharge l'historique
[ ] L'historique des modifications est affiché et paginé
[ ] npm run test : 23 tests ParrainageConfigPage.test.tsx ✓
```

---

## RÉCAPITULATIF DES 3 PROMPTS — MODULE PARRAINAGE

| N° | Écran   | Route                   | Fichier principal                                   | Priorité | Durée est. |
|----|---------|-------------------------|-----------------------------------------------------|----------|------------|
| 1  | SCR-024 | /parrainage             | pages/parrainage/ParrainagePage.tsx                 | **P0**   | ~3-4h      |
| 2  | SCR-025 | /parrainage/tree/:id    | pages/parrainage/ParrainageTreePage.tsx             | **P0**   | ~4-5h      |
| 3  | SCR-026 | /parrainage/config      | pages/parrainage/ParrainageConfigPage.tsx           | **P1**   | ~3-4h      |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Prompt 1 (SCR-024 Vue Globale)
  ↓ Crée : parrainageApi, types parrainage.types.ts, ParrainageStatusBadge,
            ParrainageFiltersBar, parrainage.module.ts (NestJS)
  ↓
Prompt 2 (SCR-025 Arbre)
  ↓ Utilise : parrainageApi, types Parrainage, ParrainageStatusBadge
  ↓ Crée    : ParrainageTreeSvg, FilleulsTable, useParrainageTree
  ↓
Prompt 3 (SCR-026 Configuration)
  ↓ Utilise : parrainageApi, types RegleParrainage
  ↓ Crée    : RecompenseForm, ParrainageSimulator, ConfigHistoryTable

  → MODULE PARRAINAGE COMPLET
  → Prêt pour le Module Fidélité (utilise les types TypeRecompense,
    NiveauFidelite et le cart.store pour les remises parrainage)
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. SVG PERFORMANCE (SCR-025) :
   → Ne pas utiliser de lib externe (D3, React Flow) pour l'arbre SVG.
   → L'arbre TechShop est simple (max 2 niveaux, max ~50 nœuds).
   → Une implémentation SVG pure (< 200 lignes) est suffisante et plus performante.
   → Si les tests de performance montrent des problèmes → passer à React.memo sur
     ParrainageTreeNode.

2. PROPAGATION DES RÉCOMPENSES (Back-end) :
   → Quand un filleul est activé, déclencher un job asynchrone (NestJS Bull Queue)
     pour calculer et attribuer les récompenses aux parrains N1 et N2.
   → Ne JAMAIS bloquer la requête d'activation sur le calcul des récompenses.
   → Le statut parrainage passe à 'VALIDE' immédiatement → 'RECOMPENSE_VERSEE'
     une fois le job terminé (quelques secondes après).

3. CONFIGURATION GLOBALE — Attention :
   → La config parrainage s'applique à TOUS les sites sans exception.
   → Une modification peut impacter des centaines de parrainages en attente.
   → Toujours afficher le nb de parrainages affectés avant confirmation.

4. TEMPS RÉEL DU SIMULATEUR :
   → Le simulateur (SCR-026) utilise les valeurs du formulaire react-hook-form
     via watch() — pas de state local supplémentaire.
   → Utiliser const watched = watch() puis passer à ParrainageSimulator comme prop.

5. COHÉRENCE AVEC LE MODULE VENTES :
   → Les récompenses de type REMISE_PROCHAINE_VENTE sont stockées dans la table
     BonRemise et appliquées automatiquement dans la caisse POS (SCR-012).
   → Vérifier la cohérence lors de l'intégration avec cart.store.ts.
```

---

*TechShop Manager — Prompts Développement Module Parrainage SCR-024 à SCR-026 — Goma, RDC — v1.0 — 2025*