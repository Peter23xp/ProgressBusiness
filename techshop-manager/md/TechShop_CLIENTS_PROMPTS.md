# 🛒 PROGRESS BUSINESS — PROMPTS DE DÉVELOPPEMENT
## Module CLIENTS | Écrans SCR-005 · SCR-006 · SCR-007 · SCR-008 · SCR-009 · SCR-010 · SCR-011

> **MODE D'EMPLOI :**
> Ce fichier contient **7 prompts indépendants**, un par écran du module Clients + Onboarding.
> Exécute-les **dans l'ordre numéroté**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Les modules AUTH (SCR-001/002) et DASHBOARD (SCR-003/004) doivent être **entièrement terminés**
> avant de commencer ce module — AppLayout, useAuth, api.ts et ProtectedRoute sont des prérequis directs.

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

## RÉCAPITULATIF DES 7 PROMPTS — MODULE CLIENTS

| N° | Écran    | Route                        | Fichier principal                              | Rôle min   | Priorité | Durée est. |
|----|----------|------------------------------|------------------------------------------------|------------|----------|------------|
| 1  | SCR-005  | /clients                     | pages/clients/ClientsListPage.tsx              | Agent      | **P0**   | ~2-3h      |
| 2  | SCR-006  | /clients/:id                 | pages/clients/ClientDetailPage.tsx             | Agent      | **P0**   | ~3-4h      |
| 3  | SCR-007  | /clients/new/recit           | pages/clients/onboarding/OnboardingRecitPage.tsx   | Agent  | **P0**   | ~2-3h      |
| 4  | SCR-008  | /clients/:id/formation       | pages/clients/onboarding/OnboardingFormationPage.tsx | Formateur | **P0** | ~1-2h   |
| 5  | SCR-009  | /clients/:id/fiche           | pages/clients/onboarding/OnboardingFichePage.tsx   | Agent  | **P0**   | ~1-2h      |
| 6  | SCR-010  | /clients/:id/activate        | pages/clients/onboarding/OnboardingActivationPage.tsx | Agent | **P0** | ~1-2h    |
| 7  | SCR-011  | /clients/import              | pages/clients/ClientImportPage.tsx             | Gérant     | **P1**   | ~2h        |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Modules AUTH + DASHBOARD — TERMINÉS
  ↓ Fournit : AppLayout, useAuth, api.ts, ProtectedRoute, formatCDF, Dexie db.ts
  ↓
Prompt 1 (SCR-005 — Liste Clients)
  ↓ Crée : clients.api.ts, useClients hook, ClientStatusBadge, ClientLevelBadge, Pagination
  ↓
Prompt 2 (SCR-006 — Fiche Client)
  ↓ Utilise : clients.api.ts, ClientStatusBadge, ClientLevelBadge
  ↓ Crée : useClientDetail hook, OnboardingTimeline, ClientParrainageTab, ClientAchatsTab, ClientPointsTab
  ↓
Prompt 3 (SCR-007 — Onboarding Étape 1)
  ↓ Utilise : clients.api.ts, formatCDF
  ↓ Crée : OnboardingStepper (composant réutilisable étapes 1→4), PhoneInput, CodeParrainInput
  ↓
Prompt 4 (SCR-008 — Onboarding Étape 2)
  ↓ Utilise : OnboardingStepper, clients.api.ts
  ↓
Prompt 5 (SCR-009 — Onboarding Étape 3)
  ↓ Utilise : OnboardingStepper, clients.api.ts, formatCDF
  ↓
Prompt 6 (SCR-010 — Onboarding Activation)
  ↓ Utilise : OnboardingStepper, clients.api.ts, formatCDF, sms.service (back)
  ↓
Prompt 7 (SCR-011 — Import CSV)
  ↓ Utilise : clients.api.ts, AppLayout
  ↓
  → MODULE CLIENTS COMPLET
  → Prêt pour :
        Module VENTES  (utilise clients.api — recherche client caisse)
        Module PARRAINAGE (utilise Client, codeParrain)
        Module FIDÉLITÉ   (utilise pointsFidelite, niveauFidelite)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 7 — SCR-005 : LISTE DES CLIENTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/clients/ClientsListPage.tsx
Route       : /clients
Accès       : Protégé — rôle minimum : AGENT
Dépendances : AppLayout (SCR-003), useAuth, api.ts, ProtectedRoute


OBJECTIF
--------
Créer la page liste des clients (SCR-005) avec recherche temps réel,
filtres multi-critères, tableau paginé et navigation vers la fiche client.
Cette page crée également le client API partagé (clients.api.ts) et les
composants badges réutilisés dans TOUT le module Clients.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/clients/ClientsListPage.tsx             ← CRÉER
2.  apps/client/src/pages/clients/ClientsListPage.test.tsx        ← CRÉER
3.  apps/client/src/api/clients.api.ts                            ← CRÉER (client API partagé module)
4.  apps/client/src/hooks/useClients.ts                           ← CRÉER (TanStack Query)
5.  apps/client/src/components/clients/ClientStatusBadge.tsx      ← CRÉER (réutilisable)
6.  apps/client/src/components/clients/ClientLevelBadge.tsx       ← CRÉER (réutilisable)
7.  apps/client/src/components/ui/Pagination.tsx                  ← CRÉER (composant global)
8.  apps/client/src/router/index.tsx                              ← MODIFIER (ajouter /clients)

BACK-END :
9.  apps/server/src/modules/clients/clients.module.ts             ← CRÉER
10. apps/server/src/modules/clients/clients.controller.ts         ← CRÉER
11. apps/server/src/modules/clients/clients.service.ts            ← CRÉER
12. apps/server/src/modules/clients/dto/query-clients.dto.ts      ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
Page dans AppLayout. Zone contenu :

  ┌─────────────────────────────────────────────────────────────────┐
  │  Clients                               [ + Nouveau Client ]     │
  │                                                                 │
  │  [ 🔍 Rechercher par nom, tél, code, matricule... ]             │
  │  [Site ▼]  [Statut ▼]  [Niveau ▼]                              │
  │                                                                 │
  │  ┌──────────────────────────────────────────────────────────┐   │
  │  │ Code       │ Nom              │ Téléphone     │ Site     │   │
  │  │ Statut     │ Code Parrain     │ Points        │ Niveau   │   │
  │  ├──────────────────────────────────────────────────────────┤   │
  │  │ TSG-0001   │ BAHATI Jean-P.   │ +243 81 234   │ Goma     │   │
  │  │ ● ACTIF    │ TSG-0001         │ 2 450 pts     │ ■ Or     │   │
  │  ├──────────────────────────────────────────────────────────┤   │
  │  │ TSG-0003   │ MUNYANGA Patrick │ +243 85 111   │ Bukavu   │   │
  │  │ ○ EN_COURS │ —                │ 0 pts         │ Bronze   │   │
  │  └──────────────────────────────────────────────────────────┘   │
  │                                                                 │
  │  < Précédent   Page 1 / 12   Suivant >     50 clients/page      │
  └─────────────────────────────────────────────────────────────────┘

Desktop : 50 lignes/page | Mobile : 25 lignes/page
Sur mobile : affichage card au lieu du tableau (une card par client)


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Input (avec icône Search lucide-react)  → barre de recherche
- Select                                   → filtres Site / Statut / Niveau
- Table, TableHeader, TableRow, TableCell → tableau desktop
- Card, CardContent                        → affichage mobile
- Button (variant="default")              → "+ Nouveau Client"
- Badge                                    → statuts et niveaux


COMPOSANT ClientStatusBadge — ClientStatusBadge.tsx
----------------------------------------------------
Composant réutilisable dans TOUT le module (liste, fiche, onboarding) :

  interface ClientStatusBadgeProps {
    statut: 'ACTIF' | 'EN_COURS' | 'SUSPENDU' | 'ARCHIVE';
    size?: 'sm' | 'md';     // défaut : 'md'
  }

  Correspondances visuelles :
    ACTIF    → badge vert   (#1A6B3A)  — icône ● — texte "Actif"
    EN_COURS → badge orange (#E65100)  — icône ○ — texte "En cours"
    SUSPENDU → badge rouge  (#B71C1C)  — icône ✕ — texte "Suspendu"
    ARCHIVE  → badge gris   (#9E9E9E)  — icône — — texte "Archivé"


COMPOSANT ClientLevelBadge — ClientLevelBadge.tsx
---------------------------------------------------
  interface ClientLevelBadgeProps {
    niveau: 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE';
    showPoints?: boolean;    // si true, afficher les points à côté
    points?: number;
  }

  Correspondances visuelles :
    BRONZE  → fond #795548, texte blanc — icône ■
    ARGENT  → fond #78909C, texte blanc — icône ■
    OR      → fond #F9A825, texte blanc — icône ■
    PLATINE → fond #4A148C, texte blanc — icône ■ (violet)

  Si showPoints=true : "■ Or  2 450 pts"


COMPOSANT Pagination — Pagination.tsx
---------------------------------------
Composant de pagination générique, réutilisé dans TOUT le projet :

  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
  }

  Affichage :
    [ < Précédent ]  [ 1 ] [ 2 ] [3] [ 4 ] [ 5 ]  [ Suivant > ]
    "Page 3 / 12 — 587 résultats"

  Règles :
    - Toujours afficher max 5 numéros de page (fenêtre glissante)
    - Boutons Précédent/Suivant désactivés aux extrémités
    - Si isLoading → disabled sur tous les boutons


HOOK useClients — useClients.ts
---------------------------------
  // apps/client/src/hooks/useClients.ts
  interface UseClientsParams {
    search?: string;
    siteId?: string | null;
    statut?: string;
    niveau?: string;
    page?: number;
    limit?: number;
  }

  export function useClients(params: UseClientsParams) {
    // TanStack Query v5
    // queryKey : ['clients', params]
    // staleTime : 2 * 60 * 1000 (2 minutes)
    // placeholderData : keepPreviousData (évite le flash blanc lors de la pagination)
    return {
      clients,        // Client[]
      meta,           // { total, page, limit, totalPages }
      isLoading,
      isFetching,     // true pendant la pagination (données précédentes encore visibles)
      error,
    };
  }

Recherche avec debounce 300ms : utiliser useDebouncedValue(search, 300)
  → Créer apps/client/src/hooks/useDebouncedValue.ts


CLIENT API — clients.api.ts
-----------------------------
  // apps/client/src/api/clients.api.ts
  import { api } from '../lib/api';

  export const clientsApi = {
    // SCR-005
    getList: (params: ClientQueryParams) =>
      api.get<ClientListResponse>('/api/v1/clients', { params }),

    // SCR-006
    getById: (id: string) =>
      api.get<ClientDetailResponse>(`/api/v1/clients/${id}`),

    update: (id: string, body: UpdateClientDto) =>
      api.patch<{ client: Client }>(`/api/v1/clients/${id}`, body),

    // SCR-007
    checkPhone: (phone: string) =>
      api.get<{ exists: boolean; clientId?: string }>(`/api/v1/clients/check-phone/${phone}`),

    createOnboardingRecit: (body: OnboardingRecitDto) =>
      api.post<OnboardingRecitResponse>('/api/v1/clients/onboarding/recit', body),

    // SCR-008
    validateFormation: (clientId: string, body: OnboardingFormationDto) =>
      api.post<OnboardingStepResponse>(`/api/v1/clients/${clientId}/onboarding/formation`, body),

    // SCR-009
    validateFiche: (clientId: string, body: OnboardingFicheDto) =>
      api.post<OnboardingStepResponse>(`/api/v1/clients/${clientId}/onboarding/fiche`, body),

    // SCR-010
    activateAccount: (clientId: string) =>
      api.post<ActivationResponse>(`/api/v1/clients/${clientId}/onboarding/activate`),

    // SCR-011
    importPreview: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post<ImportPreviewResponse>('/api/v1/clients/import/preview', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    importExecute: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post<ImportExecuteResponse>('/api/v1/clients/import/execute', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    // Parrainage — utilisé dans SCR-007
    checkCodeParrain: (code: string) =>
      api.get<{ valid: boolean; parrainNom?: string }>(`/api/v1/parrainage/check-code/${code}`),

    // Recherche rapide — utilisé dans SCR-012 (Caisse)
    search: (q: string) =>
      api.get<{ clients: ClientSearchResult[] }>('/api/v1/clients/search', {
        params: { q, statut: 'ACTIF' },
      }),
  };


FILTRES ET ÉTATS
-----------------
Les filtres sont synchronisés avec les query params de l'URL (useSearchParams) :
  /clients?search=bahati&statut=ACTIF&niveau=OR&page=2

Ainsi, le lien est partageable et le retour en arrière depuis la fiche client
restaure exactement la même vue (page, filtres, recherche).

État CHARGEMENT initial :
  - 5 lignes skeleton dans le tableau (Skeleton shadcn)
  - Filtres non disabled (permettre de filtrer pendant le chargement)

État CHARGEMENT pagination (isFetching=true, données précédentes visibles) :
  - Spinner discret dans le coin haut droit du tableau
  - Overlay légèrement transparent (opacity-75) sur le tableau
  - Pagination non disabled

État LISTE VIDE :
  - Si search vide et aucun filtre → "Aucun client enregistré. Créez le premier client."
    + bouton "Nouveau Client"
  - Si filtres actifs → "Aucun résultat pour ces critères. Modifier les filtres."
    + bouton "Réinitialiser les filtres"

État ERREUR :
  - Alert rouge : "Impossible de charger la liste des clients."
  - Bouton "Réessayer" → refetch()


RÈGLES D'AFFICHAGE PAR RÔLE
-----------------------------
  AGENT :
    - Filtre Site MASQUÉ (données forcées sur son site)
    - Voit uniquement clients de son site (filtrage serveur)
    - Bouton "+ Nouveau Client" VISIBLE
    - Filtre ARCHIVE non disponible dans le Select Statut

  FORMATEUR :
    - Filtre Site MASQUÉ
    - Bouton "+ Nouveau Client" MASQUÉ
    - Peut uniquement consulter (pas de création)

  GERANT / DIR_REGIONAL / SUPER_ADMIN :
    - Filtre Site VISIBLE avec tous les sites
    - Tous les filtres accessibles y compris ARCHIVE
    - Bouton "+ Nouveau Client" VISIBLE


APPELS API
-----------
GET /api/v1/clients
  En-têtes : Authorization: Bearer <accessToken>
  Query params :
    search?    : string         // recherche sur nom, prénom, téléphone, code, matricule
    siteId?    : string         // filtré automatiquement si AGENT
    statut?    : 'ACTIF' | 'EN_COURS' | 'SUSPENDU' | 'ARCHIVE'
    niveau?    : 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE'
    page       : number         // défaut 1
    limit      : number         // défaut 50 desktop / 25 mobile
  Succès 200 :
    {
      data: Array<{
        id: string,
        codeParrain: string,           // "TSG-0001"
        prenom: string,
        nom: string,
        telephone: string,
        email: string | null,
        statut: ClientStatut,
        siteNom: string,
        siteVille: string,
        pointsFidelite: number,
        niveauFidelite: NiveauFidelite,
        dateInscription: string,
        parrainCode: string | null,    // code du parrain (si parrainé)
      }>,
      meta: {
        total: number,
        page: number,
        limit: number,
        totalPages: number,
      }
    }


BACK-END NESTJS — clients.service.ts : méthode findAll()
---------------------------------------------------------
  1. Récupérer le rôle de l'utilisateur depuis le JWT
  2. Si AGENT/FORMATEUR/GERANT → forcer siteId = user.siteId (ignorer le param)
  3. Construire la clause where Prisma :
     - Si search → OR [{ prenom: { contains: search, mode: 'insensitive' } },
                       { nom: { contains: search, mode: 'insensitive' } },
                       { telephone: { contains: search } },
                       { codeParrain: { contains: search } },
                       { matriculeExterne: { contains: search } }]
     - Si statut → where.statut = statut
     - Si statut absent → where.statut = { not: 'ARCHIVE' } (masquer archivés par défaut)
     - Si niveau → where.niveauFidelite = niveau
     - Si siteId → where.siteInscriptionId = siteId
  4. Prisma findMany avec skip=(page-1)*limit, take=limit, orderBy=nom ASC
  5. Prisma count avec les mêmes filtres
  6. Retourner { data, meta }


TYPES TYPESCRIPT PARTAGÉS
---------------------------
Créer dans packages/shared/src/types/client.types.ts :

  export type ClientStatut = 'EN_COURS' | 'ACTIF' | 'SUSPENDU' | 'ARCHIVE';
  export type NiveauFidelite = 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE';
  export type ModePaiement = 'CASH' | 'MPESA' | 'AIRTEL_MONEY' | 'VIREMENT';
  export type EtapeOnboarding = 'RECIT' | 'FORMATION' | 'FICHE' | 'ACTIVATION';
  export type StatutEtape = 'EN_ATTENTE' | 'EN_COURS' | 'COMPLETE';

  export interface Client {
    id: string;
    codeParrain: string;
    prenom: string;
    nom: string;
    telephone: string;
    email: string | null;
    matriculeExterne: string | null;
    statut: ClientStatut;
    siteInscriptionId: string;
    siteNom: string;
    siteVille: string;
    pointsFidelite: number;
    pointsCumules: number;
    niveauFidelite: NiveauFidelite;
    parrainId: string | null;
    dateInscription: string;
    dateActivation: string | null;
  }


TESTS — ClientsListPage.test.tsx
----------------------------------
  describe('ClientsListPage', () => {
    describe('Rendu initial', () => {
      test('1  — Titre "Clients" + bouton "+ Nouveau Client" visibles')
      test('2  — 5 lignes skeleton affichées pendant le chargement')
      test('3  — Liste de clients affichée après chargement')
      test('4  — Filtre Site masqué pour AGENT')
      test('5  — Filtre Site visible pour GERANT')
      test('6  — Bouton "+ Nouveau Client" masqué pour FORMATEUR')
    })

    describe('Recherche et filtres', () => {
      test('7  — Saisie dans la barre déclenche un debounce de 300ms')
      test('8  — Filtre Statut=ACTIF filtre la liste')
      test('9  — Filtre Niveau=OR filtre la liste')
      test('10 — Les filtres sont synchronisés avec les query params URL')
      test('11 — Retour en arrière restaure les filtres et la page')
    })

    describe('Pagination', () => {
      test('12 — Composant Pagination visible si totalPages > 1')
      test('13 — Clic "Suivant" incrémente la page dans l\'URL')
      test('14 — Spinner visible pendant le chargement de la page suivante')
      test('15 — Données précédentes restent visibles pendant isFetching')
    })

    describe('Badges', () => {
      test('16 — ClientStatusBadge ACTIF vert')
      test('17 — ClientStatusBadge EN_COURS orange')
      test('18 — ClientLevelBadge OR jaune')
      test('19 — ClientLevelBadge PLATINE violet')
    })

    describe('Navigation', () => {
      test('20 — Clic sur une ligne navigue vers /clients/:id')
      test('21 — Clic "+ Nouveau Client" navigue vers /clients/new/recit')
    })

    describe('États vides et erreurs', () => {
      test('22 — Empty state si aucun client et aucun filtre actif')
      test('23 — Empty state filtres si recherche sans résultat')
      test('24 — Alert erreur + bouton Réessayer si API échoue')
    })
  })

  Mocks :
    - vi.mock('../hooks/useClients')
    - vi.mock('../stores/auth.store') → rôles AGENT, FORMATEUR, GERANT
    - vi.mock('react-router-dom') → useSearchParams, useNavigate


DÉFINITION DE "TERMINÉ"
------------------------
[ ] La page s'affiche dans AppLayout avec sidebar et header
[ ] La barre de recherche filtre avec debounce 300ms
[ ] Les 3 filtres (Site, Statut, Niveau) fonctionnent et se combinent
[ ] Les filtres sont dans les query params URL (partageable, restauration)
[ ] Filtre Site masqué pour AGENT, visible pour GERANT+
[ ] Skeleton de chargement visible (pas d'écran blanc)
[ ] Pagination fonctionnelle (25 mobile / 50 desktop)
[ ] ClientStatusBadge affiche les 4 statuts avec les bonnes couleurs
[ ] ClientLevelBadge affiche les 4 niveaux avec les bonnes couleurs
[ ] Clic ligne → navigate('/clients/:id')
[ ] Clic bouton → navigate('/clients/new/recit')
[ ] Empty states et états d'erreur gérés
[ ] GET /api/v1/clients filtre par siteId selon le rôle côté serveur
[ ] npm run test — 24 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 7 — SCR-006 : FICHE DÉTAIL CLIENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/clients/ClientDetailPage.tsx
Route       : /clients/:id
Accès       : Protégé — rôle minimum : AGENT
Dépendances : SCR-005 terminé (clients.api.ts, ClientStatusBadge, ClientLevelBadge)


OBJECTIF
--------
Créer la fiche complète d'un client (SCR-006) avec 5 onglets :
Informations | Onboarding | Parrainage | Achats | Points.
Cette page est le hub central de consultation et d'édition des données client.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/clients/ClientDetailPage.tsx               ← CRÉER
2.  apps/client/src/pages/clients/ClientDetailPage.test.tsx          ← CRÉER
3.  apps/client/src/hooks/useClientDetail.ts                         ← CRÉER
4.  apps/client/src/components/clients/ClientHeader.tsx              ← CRÉER (en-tête fiche)
5.  apps/client/src/components/clients/tabs/ClientInfoTab.tsx        ← CRÉER
6.  apps/client/src/components/clients/tabs/ClientOnboardingTab.tsx  ← CRÉER
7.  apps/client/src/components/clients/tabs/ClientParrainageTab.tsx  ← CRÉER
8.  apps/client/src/components/clients/tabs/ClientAchatsTab.tsx      ← CRÉER
9.  apps/client/src/components/clients/tabs/ClientPointsTab.tsx      ← CRÉER
10. apps/client/src/components/clients/OnboardingTimeline.tsx        ← CRÉER (réutilisé dans Onboarding)
11. apps/client/src/components/clients/EditClientModal.tsx           ← CRÉER (modal édition)

BACK-END :
12. apps/server/src/modules/clients/clients.controller.ts            ← MODIFIER (ajouter GET :id + PATCH :id)
13. apps/server/src/modules/clients/clients.service.ts               ← MODIFIER (ajouter findById + update)


UI — STRUCTURE VISUELLE
------------------------
  ┌─────────────────────────────────────────────────────────────────┐
  │  ← Clients   TSG-0001 — BAHATI Jean-Pierre      [ Modifier ]   │
  │                                                                 │
  │  [JB]  BAHATI Jean-Pierre    ● ACTIF   ■ Or   2 450 pts        │
  │        +243 81 234 5678  |  Goma  |  Code : TSG-0001           │
  │        Matricule : NK-GOM-001-0001  |  Inscrit : 12 jan. 2025  │
  │                                                                 │
  │  [ Informations ] [ Onboarding ] [ Parrainage ] [ Achats ] [ Points ]
  │  ─────────────────────────────────────────────────────────────  │
  │  (contenu de l'onglet actif)                                    │
  └─────────────────────────────────────────────────────────────────┘

L'onglet actif est synchronisé avec le query param ?tab=onboarding (URL partageable).


COMPOSANT ClientHeader — ClientHeader.tsx
------------------------------------------
En-tête fixe de la fiche, affiché sur tous les onglets.

Éléments :
  - Breadcrumb : "← Clients" → navigate('/clients' + restaurer les filtres)
  - Avatar : 2 initiales [JB], 48x48px, fond #2E86C1, texte blanc, rounded-full
  - Nom complet en 22px bold
  - ClientStatusBadge (statut)
  - ClientLevelBadge (niveau + points)
  - Téléphone formaté : "+243 81 234 5678"
  - Site d'inscription
  - Code parrain en Roboto Mono avec bouton copier (Copy lucide-react)
  - Matricule externe (si présent) en Roboto Mono
  - Date d'inscription formatée : "Inscrit le 12 janvier 2025"
  - Bouton "Modifier" → ouvre EditClientModal
    (MASQUÉ pour rôle AGENT et FORMATEUR — visible GERANT, DIR_REGIONAL, SUPER_ADMIN)

Bannière conditionnelle (si statut = EN_COURS) :
  Fond orange #E65100, texte blanc, position sous l'avatar :
  "⚠ Onboarding en cours — Étape manquante : [FORMATION / FICHE / ACTIVATION]"
  Lien "Continuer l'onboarding →" → navigate(`/clients/${id}/[prochaine-étape]`)


ONGLET 1 — Informations (ClientInfoTab)
-----------------------------------------
Affichage en deux colonnes (desktop) / une colonne (mobile) :

  Colonne gauche — Informations personnelles :
    Prénom : BAHATI
    Nom : Jean-Pierre
    Téléphone : +243 81 234 5678
    Email : jean-pierre@email.cd (ou "Non renseigné" en gris)
    Site d'inscription : Goma
    Date d'inscription : 12 janvier 2025

  Colonne droite — Informations commerciales :
    Code parrain : TSG-0001 [copier]
    Matricule externe : NK-GOM-001-0001 (ou "Non renseigné")
    Statut du compte : badge ClientStatusBadge
    Date d'activation : 13 janvier 2025 (ou "Non activé")
    Parrain : MASUDI Serge (TSG-0005) — lien cliquable → /clients/[parrainId]
              (ou "Aucun parrain" en gris)

  Notes (pleine largeur) :
    Textarea en lecture seule (ou éditable si modal ouverte)
    Fond gris clair si vide : "Aucune note pour ce client."


MODAL EditClientModal — EditClientModal.tsx
--------------------------------------------
Modal shadcn (Dialog) d'édition des informations client.

Champs éditables :
  - Prénom * (requis, min 2 chars)
  - Nom * (requis, min 2 chars)
  - Téléphone — GRISÉ si au moins 1 transaction rattachée (non modifiable)
    → Tooltip : "Le téléphone ne peut pas être modifié car des transactions y sont associées."
  - Email (optionnel)
  - Notes (Textarea, max 500 chars)

Champs NON éditables (affichés en lecture seule) :
  - Code parrain (généré automatiquement)
  - Matricule externe (immuable après saisie)
  - Site d'inscription

Actions :
  [ Annuler ]  [ Enregistrer les modifications ]

Comportement :
  - Validation client avant envoi
  - Spinner sur "Enregistrer" pendant le PATCH
  - Toast succès : "Informations mises à jour avec succès."
  - Toast erreur : message de l'API
  - Fermeture auto + invalidation du cache TanStack Query après succès


ONGLET 2 — Onboarding (ClientOnboardingTab)
---------------------------------------------
Utilise le composant OnboardingTimeline.

COMPOSANT OnboardingTimeline :
  interface OnboardingTimelineProps {
    etapes: OnboardingEtapeDetail[];
    clientId: string;
  }

  interface OnboardingEtapeDetail {
    etape: EtapeOnboarding;           // 'RECIT' | 'FORMATION' | 'FICHE' | 'ACTIVATION'
    statut: StatutEtape;              // 'EN_ATTENTE' | 'EN_COURS' | 'COMPLETE'
    completeeAt: string | null;
    agentNom: string | null;
    agentRole: string | null;
    montant: number | null;           // CDF — pour RECIT et FICHE uniquement
    modePaiement: ModePaiement | null;
    referenceTransaction: string | null;
    notes: string | null;             // formateur — pour FORMATION uniquement
  }

Affichage timeline verticale :
  ┌─────────────────────────────────────────────────────────┐
  │  ✅  Récit acheté                    12/01/2025 10:34   │
  │      Agent : KAMBALE Marie            5 000 CDF — Cash  │
  │                                                         │
  │  ✅  Formation validée               13/01/2025 09:15   │
  │      Formateur : BUNDUKI Paul                           │
  │      Note : "Client attentif, a bien compris."          │
  │                                                         │
  │  ✅  Fiche achetée                   13/01/2025 14:22   │
  │      Agent : KAMBALE Marie           10 000 CDF — Airtel│
  │      Réf. transaction : #ATM-78945                      │
  │                                                         │
  │  ✅  Compte activé                   13/01/2025 14:25   │
  │      Code parrain attribué : TSG-0128                   │
  └─────────────────────────────────────────────────────────┘

Icônes timeline :
  COMPLETE    → ✅ CheckCircle2 (lucide, vert #1A6B3A)
  EN_COURS    → ⏳ Clock (lucide, orange #E65100)
  EN_ATTENTE  → ○ Circle (lucide, gris)

Bouton d'action conditionnel sous chaque étape EN_ATTENTE ou EN_COURS :
  - RECIT      EN_ATTENTE → [Démarrer le récit]   → navigate(`/clients/new/recit`)
  - FORMATION  EN_ATTENTE → [Valider la formation] → navigate(`/clients/${id}/formation`)
  - FICHE      EN_ATTENTE → [Acheter la fiche]     → navigate(`/clients/${id}/fiche`)
  - ACTIVATION EN_ATTENTE → [Activer le compte]    → navigate(`/clients/${id}/activate`)
  → Ces boutons sont MASQUÉS si l'étape précédente n'est pas COMPLETE


ONGLET 3 — Parrainage (ClientParrainageTab)
---------------------------------------------
Trois sections :

Section A — Mon parrain :
  Si le client a un parrain :
    [Avatar] MASUDI Serge — TSG-0005 — Goma — lien → /clients/[parrainId]
  Sinon :
    "Ce client n'a pas été parrainé." (gris)

Section B — Mon code parrain :
  Code en Roboto Mono + bouton copier
  Compteur : "12 filleuls actifs · 3 en cours d'activation"

Section C — Mes filleuls :
  Table :
    Prénom / Nom | Code | Statut (badge) | Date activation | Points générés
  Filleuls triés : ACTIF d'abord, EN_COURS ensuite, EN_ATTENTE en bas
  Lien sur chaque ligne → /clients/[filleulId]
  Si aucun filleul : "Aucun filleul pour ce client."
  Total en bas : "Total gains parrainage : 2 500 pts"


ONGLET 4 — Achats (ClientAchatsTab)
--------------------------------------
Filtre de période en haut :
  [ Ce mois ] [ 3 derniers mois ] [ Tout ]

Table des achats :
  Date | N° vente | Produits | Montant | Mode paiement | Remise | Points gagnés

  - N° vente en Roboto Mono, lien → /sales/:venteId
  - "Produits" : premier produit + "et X autres" si plusieurs lignes
  - Montant formaté formatCDF()
  - Remise affichée si applicable : "-22 500 CDF (5% Or)"
  - Points gagnés : "+245 pts" en vert
  - Ligne retournée : fond rouge-50 + badge "Retournée"

Stat card en dessous du tableau :
  Total dépensé sur la période : [montant CDF]
  Nombre d'achats : [X]

Si aucun achat : "Ce client n'a pas encore effectué d'achat."


ONGLET 5 — Points (ClientPointsTab)
--------------------------------------
Section A — Solde actuel :
  ┌──────────────────────────────────────────┐
  │  Solde actuel : 2 450 pts   ■ Or         │
  │  ████████░░░░  Progression vers Platine  │
  │  2 450 / 5 000 pts — encore 2 550 pts    │
  └──────────────────────────────────────────┘
  - Barre Progress shadcn avec couleur niveau actuel
  - Tableau des 4 niveaux en dessous (seuils + avantages)

Section B — Historique mouvements :
  Table :
    Date | Type | Description | Δ Points | Solde après

  Types avec couleurs :
    ACHAT       → vert  "+245 pts"  — "Vente #GOM-202501-0047"
    PARRAINAGE  → bleu  "+500 pts"  — "Filleul KAMBALE Marie activé"
    REMISE      → orange "-200 pts" — "Remise fidélité appliquée"
    EXPIRATION  → rouge  "-100 pts" — "Expiration points janv. 2024"

  Filtre type : [Tous] [Achats] [Parrainage] [Remises] [Expirations]
  Pagination propre à cet onglet (10 mouvements par page)

Si aucun mouvement : "Aucun mouvement de points."


HOOK useClientDetail — useClientDetail.ts
-------------------------------------------
  export function useClientDetail(clientId: string) {
    const query = useQuery({
      queryKey: ['client', clientId],
      queryFn: () => clientsApi.getById(clientId),
      staleTime: 5 * 60 * 1000,
    });

    const updateMutation = useMutation({
      mutationFn: (body: UpdateClientDto) => clientsApi.update(clientId, body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['client', clientId] });
        queryClient.invalidateQueries({ queryKey: ['clients'] });
      },
    });

    return {
      client,
      onboarding,
      parrainage,
      achats,
      pointsHistorique,
      isLoading,
      error,
      updateClient: updateMutation.mutate,
      isUpdating: updateMutation.isPending,
    };
  }


APPELS API
-----------
GET /api/v1/clients/:id
  Succès 200 :
    {
      client: Client,
      onboarding: OnboardingEtapeDetail[],     // 4 éléments max
      parrainage: {
        parrain: { id, nom, prenom, codeParrain, siteNom } | null,
        filleuls: Array<{
          id: string,
          nom: string,
          prenom: string,
          codeParrain: string,
          statut: ClientStatut,
          dateActivation: string | null,
          pointsGeneres: number,
        }>,
        totalGains: number,
      },
      achats: Array<{
        id: string,
        numeroVente: string,
        createdAt: string,
        lignes: Array<{ produitNom: string, quantite: number }>,
        montantNet: number,
        remiseFidelite: number,
        modePaiement: ModePaiement,
        pointsAttribues: number,
        statut: string,
      }>,
      pointsHistorique: Array<{
        id: string,
        createdAt: string,
        type: 'ACHAT' | 'PARRAINAGE' | 'REMISE' | 'EXPIRATION',
        description: string,
        deltaPoints: number,
        soldeApres: number,
      }>,
    }
  Erreur 404 : { error: { code: 'ERR_NOT_FOUND' } } → page 404 dédiée

PATCH /api/v1/clients/:id
  Corps : { prenom?, nom?, telephone?, email?, notes? }
  Erreur 409 : { error: { code: 'ERR_CONFLICT', message: 'Téléphone déjà utilisé' } }
  Erreur 422 : { error: { code: 'ERR_BUSINESS', message: 'Téléphone non modifiable' } }


TESTS — ClientDetailPage.test.tsx
------------------------------------
  describe('ClientDetailPage', () => {
    describe('En-tête', () => {
      test('1  — Avatar avec initiales affiché')
      test('2  — Nom, statut, niveau, points affichés')
      test('3  — Bouton Modifier MASQUÉ pour AGENT')
      test('4  — Bouton Modifier VISIBLE pour GERANT')
      test('5  — Bannière EN_COURS visible si statut=EN_COURS')
      test('6  — Bannière absente si statut=ACTIF')
    })

    describe('Navigation onglets', () => {
      test('7  — Onglet actif synchronisé avec ?tab= dans l\'URL')
      test('8  — Changement d\'onglet met à jour l\'URL')
    })

    describe('Onglet Onboarding', () => {
      test('9  — 4 étapes affichées dans la timeline')
      test('10 — Étape COMPLETE avec icône verte et date')
      test('11 — Étape EN_ATTENTE avec icône grise')
      test('12 — Bouton action visible uniquement sur étape suivante')
    })

    describe('Onglet Parrainage', () => {
      test('13 — Parrain affiché avec lien si présent')
      test('14 — "Aucun parrain" si non parrainé')
      test('15 — Liste filleuls avec badges statut')
    })

    describe('Onglet Achats', () => {
      test('16 — Achats avec montant CDF formaté')
      test('17 — Filtre période fonctionne')
      test('18 — Remise fidelité affichée si applicable')
    })

    describe('Onglet Points', () => {
      test('19 — Solde + barre progression niveau affichés')
      test('20 — Historique mouvements avec couleurs ACHAT/PARRAINAGE')
      test('21 — Filtre type de mouvement fonctionne')
    })

    describe('Modal édition', () => {
      test('22 — Modal s\'ouvre au clic Modifier')
      test('23 — Champ téléphone grisé si transactions présentes')
      test('24 — PATCH appelé à la soumission')
      test('25 — Toast succès + fermeture modal après PATCH réussi')
      test('26 — Erreur 409 "téléphone dupliqué" affichée dans le formulaire')
    })
  })

  Mocks :
    - vi.mock('../hooks/useClientDetail')
    - vi.mock('../stores/auth.store')
    - vi.mock('react-router-dom') → useParams, useSearchParams


DÉFINITION DE "TERMINÉ"
------------------------
[ ] En-tête avec avatar, statut, niveau, points affiché
[ ] Bannière EN_COURS visible avec lien vers prochaine étape
[ ] Bouton Modifier masqué pour AGENT et FORMATEUR
[ ] 5 onglets fonctionnels avec contenu correct
[ ] URL synchronisée avec l'onglet actif (?tab=)
[ ] OnboardingTimeline : 4 étapes avec icônes et dates
[ ] Boutons d'action dans la timeline conditionnels à l'étape précédente
[ ] Onglet Parrainage : parrain + filleuls avec liens
[ ] Onglet Achats : tableau avec montants CDF formatés
[ ] Onglet Points : solde + barre progression + historique coloré
[ ] Modal Modifier : PATCH fonctionnel, téléphone grisé si transactions
[ ] GET /api/v1/clients/:id retourne les 5 blocs de données
[ ] PATCH /api/v1/clients/:id valide les règles métier (téléphone immuable si transactions)
[ ] npm run test — 26 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 7 — SCR-007 : ONBOARDING ÉTAPE 1 — ACHAT DU RÉCIT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/clients/onboarding/OnboardingRecitPage.tsx
Route       : /clients/new/recit
Accès       : Protégé — rôle minimum : AGENT
Dépendances : SCR-005 terminé (clients.api.ts, formatCDF)
              SCR-006 terminé (OnboardingTimeline — pour cohérence visuelle)


OBJECTIF
--------
Créer la page d'onboarding étape 1 (SCR-007) : création du client + enregistrement
de l'achat du récit. Cette page est le POINT D'ENTRÉE de l'inscription d'un
nouveau client. Elle crée le composant OnboardingStepper réutilisé dans les
étapes 2, 3 et 4, ainsi que les composants PhoneInput et CodeParrainInput.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/clients/onboarding/OnboardingRecitPage.tsx      ← CRÉER
2.  apps/client/src/pages/clients/onboarding/OnboardingRecitPage.test.tsx ← CRÉER
3.  apps/client/src/components/clients/OnboardingStepper.tsx               ← CRÉER (réutilisable)
4.  apps/client/src/components/ui/PhoneInput.tsx                           ← CRÉER (réutilisable)
5.  apps/client/src/components/clients/CodeParrainInput.tsx                ← CRÉER
6.  apps/client/src/router/index.tsx                                       ← MODIFIER

BACK-END :
7.  apps/server/src/modules/clients/clients.controller.ts  ← MODIFIER (ajouter POST onboarding/recit)
8.  apps/server/src/modules/clients/clients.service.ts     ← MODIFIER (ajouter createWithRecit)
9.  apps/server/src/modules/clients/dto/onboarding.dto.ts  ← CRÉER


UI — STRUCTURE VISUELLE
------------------------
Page dans AppLayout. Zone contenu :

  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Retour à la liste   Nouveau client                           │
  │                                                                  │
  │  ●────────○────────○────────○                                    │
  │  Récit  Formation  Fiche  Activation                             │
  │                                                                  │
  │  ÉTAPE 1 SUR 4 — Informations personnelles & Achat du récit     │
  │  ──────────────────────────────────────────────────────────────  │
  │                                                                  │
  │  Prénom *       [________________]  Nom *   [________________]   │
  │  Téléphone *    [+243 ___________]  Email   [________________]   │
  │  Site *         [Goma ▼]                                         │
  │                                                                  │
  │  Code parrain   [TSG-____]   ✓ Parrain : MASUDI Serge           │
  │  Matricule ext. [__________] (optionnel)                         │
  │                                                                  │
  │  ── Achat du Récit ───────────────────────────────────────────   │
  │  Montant payé * [5 000]  CDF    Mode de paiement * [Cash ▼]     │
  │  Numéro reçu    [__________]  (requis si Mobile Money)           │
  │                                                                  │
  │              [ Enregistrer & Passer à la Formation → ]           │
  └──────────────────────────────────────────────────────────────────┘


COMPOSANT OnboardingStepper — OnboardingStepper.tsx
------------------------------------------------------
Stepper horizontal réutilisé dans les 4 étapes d'onboarding.

  interface OnboardingStepperProps {
    currentStep: 1 | 2 | 3 | 4;
    clientId?: string;           // fourni à partir de l'étape 2
  }

  const STEPS = [
    { label: 'Récit',      step: 1, route: (id) => '/clients/new/recit' },
    { label: 'Formation',  step: 2, route: (id) => `/clients/${id}/formation` },
    { label: 'Fiche',      step: 3, route: (id) => `/clients/${id}/fiche` },
    { label: 'Activation', step: 4, route: (id) => `/clients/${id}/activate` },
  ];

Affichage :
  ● ──── ○ ──── ○ ──── ○
  cercle plein (#1E3A5F) = étape actuelle
  ✓ (#1A6B3A) = étape complétée (cliquable si clientId disponible)
  ○ gris = étape à venir (non cliquable)

  Label sous chaque cercle, texte 12px, centré


COMPOSANT PhoneInput — PhoneInput.tsx
---------------------------------------
Champ téléphone congolais avec préfixe fixe et détection automatique.

  interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    onValidityChange?: (valid: boolean) => void;
    disabled?: boolean;
    error?: string;
  }

Comportement :
  - Préfixe "+243" affiché en gris dans le champ (non éditable)
  - L'utilisateur saisit uniquement les 9 chiffres suivants
  - Si l'utilisateur colle un numéro commençant par "0" → strip le 0, garder 9 chiffres
  - Si l'utilisateur colle "+243XXXXXXXXX" → strip "+243", garder 9 chiffres
  - Regex validation : /^[0-9]{9}$/ (les 9 chiffres après le +243)
  - Valeur sortante toujours normalisée : "+243XXXXXXXXX"

Feedback visuel :
  - Champ vide : neutre
  - Champ invalide (>3 chars, pas 9 chiffres) : bordure rouge + message "Format : +243 8X XXX XXXX"
  - Champ valide (9 chiffres) : bordure verte

Unicité en temps réel (debounce 500ms) :
  - À 9 chiffres valides → GET /api/v1/clients/check-phone/+243XXXXXXXXX
  - Si exists=true → message rouge : "Ce numéro est déjà enregistré."
    + lien "Voir la fiche →" → navigate(`/clients/${clientId}`)
  - Si exists=false → message vert : "Numéro disponible ✓"


COMPOSANT CodeParrainInput — CodeParrainInput.tsx
---------------------------------------------------
Champ de saisie du code parrain avec vérification temps réel.

  interface CodeParrainInputProps {
    value: string;
    onChange: (value: string) => void;
    currentClientPhone?: string;   // pour bloquer l'auto-parrainage
    disabled?: boolean;
  }

Comportement :
  - Format attendu : TSG-XXXX (lettres majuscules auto)
  - Debounce 500ms → GET /api/v1/parrainage/check-code/:code
  - Si valid=true ET code ≠ téléphone du client → message vert "✓ Parrain : [Nom Prénom]"
  - Si valid=false → message rouge "Code parrain introuvable"
  - Si code = téléphone du client → message rouge "Auto-parrainage interdit"
  - Si champ vide → aucun message (champ optionnel)


LOGIQUE FORMULAIRE
-------------------
React Hook Form + Zod pour la validation.

  Schema Zod :
    prenom: z.string().min(2, 'Minimum 2 caractères').max(50)
    nom: z.string().min(2, 'Minimum 2 caractères').max(50)
    telephone: z.string().regex(/^\+243[0-9]{9}$/, 'Format invalide')
    email: z.string().email('Email invalide').optional().or(z.literal(''))
    siteId: z.string().min(1, 'Site requis')
    codeParrain: z.string().regex(/^TSG-[0-9]{4}$/).optional().or(z.literal(''))
    matriculeExterne: z.string().max(50).optional().or(z.literal(''))
    montantRecit: z.number().min(1, 'Montant requis').positive()
    modePaiement: z.enum(['CASH', 'MPESA', 'AIRTEL_MONEY', 'VIREMENT'])
    numeroRecu: z.string().optional()
      .refine((val, ctx) => {
        // requis si modePaiement !== CASH
        if (ctx.parent.modePaiement !== 'CASH' && !val) return false;
        return true;
      }, { message: 'Numéro de transaction requis pour ce mode de paiement' })

Comportements :
  - Le champ "Site" est pré-rempli avec user.siteId + DISABLED pour AGENT
  - Le champ "Site" est éditable pour GERANT et SUPER_ADMIN
  - Le montant du récit est pré-rempli depuis la configuration (GET /api/v1/config)
  - Le champ "Numéro reçu" n'apparaît que si modePaiement ≠ CASH
  - Le bouton "Enregistrer" est disabled si :
      • n'importe quel champ requis est vide
      • le téléphone est invalide ou déjà utilisé
      • le code parrain est renseigné mais invalide
      • une mutation est en cours


ÉTATS DE LA PAGE
-----------------
État CHARGEMENT (pendant la soumission) :
  - Spinner sur le bouton + texte "Enregistrement en cours..."
  - Tous les champs disabled
  - Pas de navigation possible

État SUCCÈS :
  - Toast vert : "Client créé avec succès ! Passage à la formation..."
  - navigate(`/clients/${newClientId}/formation`) automatiquement après 1 seconde

État ERREUR 409 (téléphone déjà utilisé) :
  - Focus repositionné sur le champ téléphone
  - Message rouge sous le champ : "Ce numéro est déjà enregistré."
  - Les données du formulaire sont CONSERVÉES (pas de reset)

État ERREUR 409 (auto-parrainage) :
  - Alert rouge : "Un client ne peut pas se parrainer lui-même."

État ERREUR 500 / réseau :
  - Toast rouge : "Une erreur est survenue. Vos données sont conservées, réessayez."
  - Les données du formulaire sont CONSERVÉES


APPELS API
-----------
GET /api/v1/config
  Succès 200 : { montantRecit: number, montantFiche: number, ... }
  → Utilisé pour pré-remplir le montant du récit

GET /api/v1/clients/check-phone/:phone
  Succès 200 : { exists: boolean, clientId?: string }

GET /api/v1/parrainage/check-code/:code
  Succès 200 : { valid: boolean, parrainNom?: string }

POST /api/v1/clients/onboarding/recit
  Corps :
    {
      prenom: string,
      nom: string,
      telephone: string,        // format +243XXXXXXXXX
      email?: string,
      siteId: string,
      codeParrain?: string,     // format TSG-XXXX
      matriculeExterne?: string,
      montantRecit: number,     // en CDF (entier)
      modePaiement: ModePaiement,
      numeroRecu?: string,
    }
  Succès 201 :
    {
      client: { id: string, codeParrain: string, statut: 'EN_COURS' },
      etape: {
        etape: 'RECIT',
        statut: 'COMPLETE',
        completeeAt: string,
      }
    }
  Erreur 409 ERR_CONFLICT   : téléphone ou matricule déjà utilisé
  Erreur 409 ERR_SELF_PARRAINAGE : auto-parrainage détecté
  Erreur 400 ERR_VALIDATION : données invalides


BACK-END — clients.service.ts : createWithRecit()
---------------------------------------------------
  1. Détecter si l'utilisateur est AGENT → forcer siteId = user.siteId
  2. Vérifier unicité téléphone : Prisma findFirst WHERE telephone = body.telephone
     → Si trouvé : throw ConflictException({ code: 'ERR_CONFLICT' })
  3. Si matriculeExterne fourni : vérifier unicité
  4. Si codeParrain fourni :
     a. Vérifier existence : Prisma findFirst Client WHERE codeParrain = body.codeParrain
     b. Vérifier anti auto-parrainage : parrain.telephone ≠ body.telephone
  5. Créer le client : Prisma Client.create avec statut='EN_COURS'
  6. Créer l'étape RECIT : Prisma OnboardingEtape.create avec statut='COMPLETE'
  7. Créer le mouvement de paiement (log interne)
  8. Si codeParrain valide : créer Parrainage avec statut='EN_ATTENTE'
  9. Retourner { client, etape }


TESTS — OnboardingRecitPage.test.tsx
--------------------------------------
  describe('OnboardingRecitPage', () => {
    describe('Composant PhoneInput', () => {
      test('1  — Préfixe +243 non éditable affiché')
      test('2  — Numéro avec "0" en tête automatiquement strippé')
      test('3  — 9 chiffres valides : bordure verte')
      test('4  — Moins de 9 chiffres : bordure rouge + message')
      test('5  — Numéro existant : message rouge + lien vers fiche')
      test('6  — Numéro disponible : message vert ✓')
    })

    describe('Composant CodeParrainInput', () => {
      test('7  — Code valide : message vert + nom du parrain')
      test('8  — Code invalide : message rouge')
      test('9  — Champ vide : aucun message')
    })

    describe('OnboardingStepper', () => {
      test('10 — Étape 1 en bleu plein, étapes 2/3/4 en gris')
    })

    describe('Formulaire', () => {
      test('11 — Bouton disabled si champs requis vides')
      test('12 — Champ Site disabled et pré-rempli pour AGENT')
      test('13 — Champ "Numéro reçu" masqué si mode Cash')
      test('14 — Champ "Numéro reçu" visible si mode M-Pesa')
      test('15 — Montant pré-rempli depuis la configuration')
      test('16 — Soumission : POST onboarding/recit appelé avec les bonnes données')
      test('17 — Succès : navigate vers /clients/:id/formation')
      test('18 — Erreur 409 téléphone : message rouge + données conservées')
      test('19 — Erreur 409 auto-parrainage : alert rouge')
      test('20 — Erreur réseau : toast rouge + données conservées')
    })
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] OnboardingStepper : étape 1 active, 2/3/4 grisées
[ ] PhoneInput : préfixe +243, validation, vérification unicité, normalisation
[ ] CodeParrainInput : validation, vérification existence, anti auto-parrainage
[ ] Champ Site pré-rempli et disabled pour AGENT
[ ] Champ "Numéro reçu" conditionnel au mode de paiement
[ ] Montant pré-rempli depuis la config API
[ ] Bouton disabled correctement selon l'état du formulaire
[ ] Navigation vers /clients/:id/formation après succès
[ ] Données conservées en cas d'erreur réseau ou 409
[ ] POST /api/v1/clients/onboarding/recit : création client + étape RECIT + Parrainage EN_ATTENTE
[ ] npm run test — 20 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 7 — SCR-008 : ONBOARDING ÉTAPE 2 — VALIDATION FORMATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/clients/onboarding/OnboardingFormationPage.tsx
Route       : /clients/:id/formation
Accès       : Protégé — rôle minimum : FORMATEUR
Dépendances : SCR-007 terminé (OnboardingStepper, clients.api.ts)


OBJECTIF
--------
Créer la page d'onboarding étape 2 (SCR-008) : validation de la formation suivie
par le client. Accessible aux FORMATEUR, GERANT et SUPER_ADMIN uniquement.
Redirige vers l'étape 3 (/clients/:id/fiche) après validation.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/clients/onboarding/OnboardingFormationPage.tsx      ← CRÉER
2.  apps/client/src/pages/clients/onboarding/OnboardingFormationPage.test.tsx ← CRÉER

BACK-END :
3.  apps/server/src/modules/clients/clients.controller.ts  ← MODIFIER
4.  apps/server/src/modules/clients/clients.service.ts     ← MODIFIER (validateFormation)


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Retour à la fiche client                                      │
  │                                                                  │
  │  ✓────────●────────○────────○                                    │
  │  Récit  Formation  Fiche  Activation                             │
  │                                                                  │
  │  ÉTAPE 2 SUR 4 — Validation de la formation                      │
  │                                                                  │
  │  ┌──────────────────────────────────────────────────────────┐    │
  │  │  [JB] BAHATI Jean-Pierre  ● EN_COURS  |  Goma           │    │
  │  │       +243 81 234 5678                                   │    │
  │  │       Récit acheté le 12/01/2025 ✓                       │    │
  │  └──────────────────────────────────────────────────────────┘    │
  │                                                                  │
  │  Formateur *     [BUNDUKI Paul — pré-rempli, non éditable]      │
  │  Date formation *  [ 13/01/2025 ▼ ]  (aujourd'hui par défaut)  │
  │  Durée (min)       [ 45         ]    (optionnel)               │
  │  Notes             [_________________________________]           │
  │                    (optionnel, max 300 chars)                   │
  │                                                                  │
  │  ☐ Je certifie que ce client a bien suivi la formation *        │
  │                                                                  │
  │              [ ✓ VALIDER LA FORMATION → ]                        │
  └──────────────────────────────────────────────────────────────────┘


CARTE D'INFORMATION CLIENT (lecture seule)
-------------------------------------------
Afficher en haut du formulaire une carte de synthèse non éditable :
  - Avatar + Nom complet
  - ClientStatusBadge (EN_COURS attendu)
  - Téléphone + Site
  - Confirmation visuelle : "✓ Récit acheté le [date]"

Si le client n'est pas en statut EN_COURS ou si l'étape RECIT n'est pas COMPLETE :
  → Bannière orange : "L'étape Récit doit être complétée avant de valider la formation."
  → Bouton "Valider" disabled
  → Lien "← Reprendre depuis le Récit"


RÈGLES DE VALIDATION DU FORMULAIRE
-------------------------------------
React Hook Form + Zod :
  formateurId: z.string()          // pré-rempli avec user.id, non modifiable
  dateFormation: z.date()
    .max(new Date(), 'Date future interdite')
    .min(new Date(Date.now() - 30 * 86400000), 'Date trop ancienne (max 30 jours)')
  dureeMinutes: z.number().min(1).max(480).optional()
  notes: z.string().max(300).optional()
  confirmed: z.literal(true, { errorMap: () => ({ message: 'Certification requise' }) })


COMPORTEMENTS SPÉCIFIQUES
--------------------------
  - Le nom du formateur est pré-rempli avec `${user.prenom} ${user.nom}` (non éditable)
  - La date est un DatePicker shadcn (Popover + Calendar) limité : min = inscriptionClient, max = aujourd'hui
  - Le bouton "Valider" est DISABLED tant que la checkbox de certification n'est pas cochée
  - La durée est un champ number optionnel (minutes entières, entre 1 et 480)


APPELS API
-----------
GET /api/v1/clients/:id
  → Récupérer les infos client + étapes onboarding pour afficher la carte client
  → Vérifier que RECIT est COMPLETE avant d'autoriser le formulaire

POST /api/v1/clients/:id/onboarding/formation
  Corps :
    {
      formateurId: string,
      dateFormation: string,      // ISO date "2025-01-13"
      dureeMinutes?: number,
      notes?: string,
    }
  Succès 200 :
    { etape: OnboardingEtapeDetail, nextStep: 'fiche' }
  Erreur 409 ERR_STEP_ORDER : étape RECIT non complétée
  Erreur 403 : rôle insuffisant (AGENT ne peut pas accéder)

Après succès : navigate(`/clients/${id}/fiche`)


BACK-END — clients.service.ts : validateFormation()
------------------------------------------------------
  1. Récupérer le client et ses étapes
  2. Vérifier que l'étape RECIT est COMPLETE → sinon ConflictException ERR_STEP_ORDER
  3. Vérifier que l'utilisateur est FORMATEUR du même site OU GERANT/SUPER_ADMIN
  4. Vérifier que la date de formation ≤ aujourd'hui
  5. Créer/mettre à jour OnboardingEtape FORMATION → statut='COMPLETE'
  6. Retourner { etape, nextStep: 'fiche' }


TESTS — OnboardingFormationPage.test.tsx
-----------------------------------------
  describe('OnboardingFormationPage', () => {
    test('1  — Accès refusé pour AGENT → AccessDenied')
    test('2  — Accès accordé pour FORMATEUR')
    test('3  — Carte client avec infos + "✓ Récit acheté" affichée')
    test('4  — Bannière orange si RECIT non complété')
    test('5  — Nom du formateur pré-rempli et non éditable')
    test('6  — Date d\'aujourd\'hui pré-remplie')
    test('7  — Date future interdite dans le DatePicker')
    test('8  — Bouton disabled si checkbox non cochée')
    test('9  — Bouton actif quand checkbox cochée')
    test('10 — POST formation appelé avec les bonnes données')
    test('11 — navigate vers /clients/:id/fiche après succès')
    test('12 — Erreur 409 ERR_STEP_ORDER : bannière orange affichée')
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] OnboardingStepper : étape 1 cochée verte, étape 2 active, 3/4 grisées
[ ] Carte client affichée en lecture seule (statut EN_COURS, récit confirmé)
[ ] Bannière protection si étape RECIT non COMPLETE
[ ] FORMATEUR : accès accordé | AGENT : AccessDenied
[ ] Formateur pré-rempli et non éditable
[ ] DatePicker limité (pas de date future, max 30 jours)
[ ] Checkbox certification bloque le bouton si non cochée
[ ] navigate → /clients/:id/fiche après succès
[ ] POST /api/v1/clients/:id/onboarding/formation valide les règles métier
[ ] npm run test — 12 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 5 / 7 — SCR-009 : ONBOARDING ÉTAPE 3 — ACHAT DE LA FICHE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/clients/onboarding/OnboardingFichePage.tsx
Route       : /clients/:id/fiche
Accès       : Protégé — rôle minimum : AGENT
Dépendances : SCR-007 terminé (OnboardingStepper, PhoneInput, clients.api.ts, formatCDF)


OBJECTIF
--------
Créer la page d'onboarding étape 3 (SCR-009) : enregistrement de l'achat de
la fiche client. Très similaire à la section paiement de l'étape 1.
Redirige vers l'étape 4 (/clients/:id/activate) après validation.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/clients/onboarding/OnboardingFichePage.tsx      ← CRÉER
2.  apps/client/src/pages/clients/onboarding/OnboardingFichePage.test.tsx ← CRÉER

BACK-END :
3.  apps/server/src/modules/clients/clients.controller.ts  ← MODIFIER
4.  apps/server/src/modules/clients/clients.service.ts     ← MODIFIER (validateFiche)


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Retour à la fiche client                                      │
  │                                                                  │
  │  ✓────────✓────────●────────○                                    │
  │  Récit  Formation  Fiche  Activation                             │
  │                                                                  │
  │  ÉTAPE 3 SUR 4 — Achat de la fiche                              │
  │                                                                  │
  │  ┌──────────────────────────────────────────────────────────┐    │
  │  │  [JB] BAHATI Jean-Pierre  ● EN_COURS  |  Goma           │    │
  │  │  ✓ Récit acheté  ✓ Formation validée                    │    │
  │  └──────────────────────────────────────────────────────────┘    │
  │                                                                  │
  │  Montant payé *  [ 10 000 ]  CDF    Mode paiement *  [Cash ▼]   │
  │  Numéro transaction  [ _________ ]  (si Mobile Money)            │
  │                                                                  │
  │              [ ✓ VALIDER L'ACHAT DE LA FICHE → ]                 │
  └──────────────────────────────────────────────────────────────────┘


LOGIQUE ET COMPORTEMENTS
--------------------------
Identique à la section paiement de SCR-007, avec les différences suivantes :
  - Pas de champs client (déjà créé) — uniquement le paiement de la fiche
  - La carte client affiche : "✓ Récit acheté  ✓ Formation validée"
  - Le montant est pré-rempli depuis GET /api/v1/config (montantFiche)
  - Même logique de validation (montant > 0, numéro requis si Mobile Money)
  - Bannière protection : si FORMATION n'est pas COMPLETE → bloquer le formulaire

Schéma Zod :
  montantFiche: z.number().min(1, 'Montant requis').positive()
  modePaiement: z.enum(['CASH', 'MPESA', 'AIRTEL_MONEY', 'VIREMENT'])
  numeroTransaction: z.string().optional()
    → requis si modePaiement ≠ 'CASH'


APPELS API
-----------
GET /api/v1/clients/:id
  → Vérifier étapes RECIT et FORMATION à COMPLETE

POST /api/v1/clients/:id/onboarding/fiche
  Corps :
    { montantFiche: number, modePaiement: ModePaiement, numeroTransaction?: string }
  Succès 200 :
    { etape: OnboardingEtapeDetail, nextStep: 'activation' }
  Erreur 409 ERR_STEP_ORDER : étape FORMATION non complétée

Après succès : navigate(`/clients/${id}/activate`)


BACK-END — clients.service.ts : validateFiche()
-------------------------------------------------
  1. Vérifier que RECIT et FORMATION sont COMPLETE
  2. Créer/mettre à jour OnboardingEtape FICHE → statut='COMPLETE'
  3. Retourner { etape, nextStep: 'activation' }


TESTS — OnboardingFichePage.test.tsx
--------------------------------------
  describe('OnboardingFichePage', () => {
    test('1  — Stepper : étapes 1 et 2 cochées, étape 3 active')
    test('2  — Carte client : "✓ Récit acheté  ✓ Formation validée"')
    test('3  — Bannière si FORMATION non complétée')
    test('4  — Montant pré-rempli depuis la config API')
    test('5  — Numéro transaction masqué si Cash')
    test('6  — Numéro transaction visible et requis si Airtel Money')
    test('7  — POST fiche appelé avec les bonnes données')
    test('8  — navigate vers /clients/:id/activate après succès')
    test('9  — Erreur 409 : bannière protection affichée')
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Stepper : étapes 1+2 cochées vertes, étape 3 active
[ ] Carte client avec confirmation des 2 étapes précédentes
[ ] Bannière protection si étapes précédentes non complètes
[ ] Montant pré-rempli depuis la config, modifiable
[ ] Champ transaction conditionnel au mode de paiement
[ ] POST /api/v1/clients/:id/onboarding/fiche avec vérification ordre
[ ] navigate → /clients/:id/activate après succès
[ ] npm run test — 9 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 6 / 7 — SCR-010 : ONBOARDING ÉTAPE 4 — ACTIVATION DU COMPTE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/clients/onboarding/OnboardingActivationPage.tsx
Route       : /clients/:id/activate
Accès       : Protégé — rôle minimum : AGENT
Dépendances : SCR-007 à SCR-009 terminés (OnboardingStepper, clients.api.ts, formatCDF)


OBJECTIF
--------
Créer la page d'onboarding étape 4 finale (SCR-010) : activation du compte client.
C'est l'étape la plus critique : elle génère le code parrain unique, passe le
client en statut ACTIF, déclenche la récompense du parrain et envoie le SMS
de bienvenue. Elle affiche d'abord un récapitulatif complet avant l'activation.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/clients/onboarding/OnboardingActivationPage.tsx      ← CRÉER
2.  apps/client/src/pages/clients/onboarding/OnboardingActivationPage.test.tsx ← CRÉER

BACK-END :
3.  apps/server/src/modules/clients/clients.controller.ts  ← MODIFIER
4.  apps/server/src/modules/clients/clients.service.ts     ← MODIFIER (activateClient)


UI — STRUCTURE VISUELLE
------------------------
  ┌──────────────────────────────────────────────────────────────────┐
  │  ← Retour à la fiche client                                      │
  │                                                                  │
  │  ✓────────✓────────✓────────●                                    │
  │  Récit  Formation  Fiche  Activation                             │
  │                                                                  │
  │  ÉTAPE 4 SUR 4 — Activation du compte                           │
  │                                                                  │
  │  ┌──── RÉCAPITULATIF AVANT ACTIVATION ───────────────────────┐   │
  │  │                                                           │   │
  │  │  Client    : BAHATI Jean-Pierre                           │   │
  │  │  Téléphone : +243 81 234 5678                             │   │
  │  │  Site      : Goma                                         │   │
  │  │  Parrain   : MASUDI Serge (TSG-0005) ✓ Lié               │   │
  │  │                              OU                           │   │
  │  │  Parrain   : Aucun parrain                                │   │
  │  │                                                           │   │
  │  │  ── Paiements effectués ──────────────────────────────    │   │
  │  │  Récit   : 5 000 CDF — Cash                12/01/2025    │   │
  │  │  Fiche   : 10 000 CDF — Airtel #ATM-789    13/01/2025    │   │
  │  │  ─────────────────────────────────────────────────────    │   │
  │  │  Total payé : 15 000 CDF                                  │   │
  │  │                                                           │   │
  │  │  Code parrain qui sera généré : TSG-0128 (prévisualisation│   │
  │  │                                            non définitif) │   │
  │  └───────────────────────────────────────────────────────────┘   │
  │                                                                  │
  │  ⚠ Cette action est irréversible. Le compte sera activé.         │
  │                                                                  │
  │      [ ✓ ACTIVER LE COMPTE ET GÉNÉRER LE CODE PARRAIN ]          │
  └──────────────────────────────────────────────────────────────────┘


RÉCAPITULATIF
--------------
Construire le récapitulatif depuis les données déjà chargées (GET /api/v1/clients/:id).
Aucun formulaire sur cette page — uniquement un bouton de confirmation.

Affichage conditionnel du parrain :
  - Si parrain lié : afficher "[Nom] ([Code])" + badge vert "✓ Lié"
    + mention : "La récompense sera versée au parrain après activation."
  - Si aucun parrain : "Aucun parrain" en gris

Code parrain prévisualisé :
  - GET /api/v1/clients/next-code?siteId=... → retourne le prochain code qui sera attribué
  - Affiché avec la mention "(prévisualisation — non définitif)"
  - Fond bleu clair, Roboto Mono


GUARD DE SÉCURITÉ
------------------
Avant d'afficher la page, vérifier que les 3 étapes précédentes sont COMPLETE.
Si ce n'est pas le cas :
  - Afficher une bannière rouge : "L'onboarding n'est pas encore complet."
  - Lister les étapes manquantes
  - Bouton "Compléter l'onboarding" → navigate vers la première étape manquante
  - Le bouton d'activation est MASQUÉ (pas seulement disabled)

Modale de confirmation (Dialog shadcn) à l'appui du bouton :
  Titre : "Confirmer l'activation ?"
  Corps : "Cette action est irréversible. Le compte de BAHATI Jean-Pierre
           sera définitivement activé et son code parrain TSG-0128 sera généré."
  Boutons : [ Annuler ] [ ✓ Activer le compte ] (bleu)


ÉTAT POST-ACTIVATION — ÉCRAN DE SUCCÈS
----------------------------------------
Après activation réussie, remplacer le contenu de la page par :

  ┌──────────────────────────────────────────────────────────────────┐
  │                                                                  │
  │              ✅  (CheckCircle2 vert, 80px)                       │
  │                                                                  │
  │         Compte activé avec succès !                              │
  │                                                                  │
  │   BAHATI Jean-Pierre est maintenant un client actif.             │
  │                                                                  │
  │   Code parrain attribué : TSG-0128                               │
  │   [Copier le code]                                               │
  │                                                                  │
  │   Un SMS de bienvenue a été envoyé au +243 81 234 5678           │
  │   (si le service SMS est configuré)                              │
  │                                                                  │
  │   [ Voir la fiche client ]      [ + Nouveau client ]             │
  │                                                                  │
  │   Redirection automatique vers la fiche dans 5 secondes...       │
  └──────────────────────────────────────────────────────────────────┘


APPELS API
-----------
GET /api/v1/clients/next-code?siteId=:siteId
  Succès 200 : { nextCode: string }   // ex: "TSG-0128"
  → Utilisé uniquement pour la prévisualisation

POST /api/v1/clients/:id/onboarding/activate
  Corps : {} (vide — le serveur déduit tout depuis l'ID)
  Succès 200 :
    {
      client: {
        id: string,
        statut: 'ACTIF',
        codeParrain: string,         // code définitif généré
        dateActivation: string,
      },
      parrainRecompense?: {
        parrainNom: string,
        recompenseType: string,
        recompenseValeur: number,
      },
      smsSent: boolean,
    }
  Erreur 409 ERR_STEP_ORDER   : étapes incomplètes
  Erreur 409 ERR_ALREADY_ACTIVE : client déjà activé


BACK-END — clients.service.ts : activateClient()
-------------------------------------------------
  1. Vérifier que RECIT, FORMATION et FICHE sont COMPLETE
  2. Vérifier que le client n'est pas déjà ACTIF
  3. Générer le code parrain :
     - Compter les clients ACTIFS du site → prochain numéro (ex: 128)
     - Format : TSG-[numéro padded 4 chiffres] (ex: TSG-0128)
     - Vérifier unicité dans toute la base (rare mais possible)
  4. Prisma transaction (atomique) :
     a. UPDATE Client : statut='ACTIF', codeParrain=..., dateActivation=now()
     b. CREATE OnboardingEtape ACTIVATION : statut='COMPLETE'
     c. Si parrain exist → UPDATE Parrainage : statut='VALIDE'
     d. Calculer et créer la récompense du parrain selon la config
  5. Appeler smsService.sendWelcome(client.telephone, client.codeParrain)
     (non bloquant — ne pas throw si SMS échoue)
  6. Retourner la réponse


TESTS — OnboardingActivationPage.test.tsx
------------------------------------------
  describe('OnboardingActivationPage', () => {
    test('1  — Stepper : 3 étapes cochées, étape 4 active')
    test('2  — Récapitulatif : nom, téléphone, site, parrain affiché')
    test('3  — Parrain lié : badge vert + message récompense')
    test('4  — Aucun parrain : "Aucun parrain" en gris')
    test('5  — Paiements récit + fiche affichés avec montants CDF')
    test('6  — Total payé calculé correctement')
    test('7  — Code parrain prévisualisé affiché')
    test('8  — Guard : bannière rouge si étapes incomplètes')
    test('9  — Bouton activation MASQUÉ si étapes incomplètes')
    test('10 — Modale de confirmation s\'ouvre au clic du bouton')
    test('11 — POST activate appelé après confirmation')
    test('12 — Écran de succès avec code parrain et bouton copier')
    test('13 — Redirection automatique vers /clients/:id après 5 secondes')
    test('14 — Erreur 409 ERR_ALREADY_ACTIVE : alert rouge')
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Stepper : étapes 1+2+3 cochées, étape 4 active
[ ] Récapitulatif complet avec toutes les données
[ ] Prévisualisation du code parrain (mention "non définitif")
[ ] Guard : bouton MASQUÉ si étapes incomplètes + liste des manquantes
[ ] Modale de confirmation avant activation
[ ] POST /api/v1/clients/:id/onboarding/activate : transaction atomique Prisma
[ ] Code parrain généré : incrémental par site, unique, format TSG-XXXX
[ ] SMS de bienvenue envoyé de façon non-bloquante
[ ] Récompense parrain créée si parrain lié
[ ] Écran de succès avec code parrain copiable
[ ] Redirection auto vers /clients/:id après 5 secondes
[ ] npm run test — 14 tests passent, couverture ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 7 / 7 — SCR-011 : IMPORT DE MATRICULES EXTERNES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/clients/ClientImportPage.tsx
Route       : /clients/import
Accès       : Protégé — rôle minimum : GERANT
Dépendances : SCR-005 terminé (clients.api.ts, AppLayout)


OBJECTIF
--------
Créer la page d'import de matricules externes depuis un fichier CSV (SCR-011).
Le flux est en 3 phases : upload → prévisualisation → import définitif.
Accessible uniquement aux GERANT et SUPER_ADMIN.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/clients/ClientImportPage.tsx      ← CRÉER
2.  apps/client/src/pages/clients/ClientImportPage.test.tsx ← CRÉER
3.  apps/client/src/components/ui/CsvDropzone.tsx            ← CRÉER (réutilisable)

BACK-END :
4.  apps/server/src/modules/clients/clients.controller.ts  ← MODIFIER (ajouter import routes)
5.  apps/server/src/modules/clients/clients.service.ts     ← MODIFIER (importPreview, importExecute)
6.  apps/server/src/modules/clients/csv-parser.service.ts  ← CRÉER


UI — STRUCTURE VISUELLE (3 phases)
------------------------------------
PHASE 1 — Upload :

  ┌─────────────────────────────────────────────────────────────────┐
  │  Import de matricules externes          [ ← Retour aux clients ]│
  │                                                                 │
  │  ┌───────────────────────────────────────────────────────────┐  │
  │  │                                                           │  │
  │  │        ⬆  Glissez votre fichier CSV ici                   │  │
  │  │           ou  [ Parcourir... ]                            │  │
  │  │                                                           │  │
  │  │  Format attendu : matricule, telephone                    │  │
  │  │  Taille max : 5 MB — Encodage : UTF-8                     │  │
  │  │  [ Télécharger le modèle CSV ]                            │  │
  │  └───────────────────────────────────────────────────────────┘  │
  │                                                                 │
  │              [ PRÉVISUALISER → ]  (disabled si pas de fichier)  │
  └─────────────────────────────────────────────────────────────────┘

PHASE 2 — Prévisualisation :

  ┌─────────────────────────────────────────────────────────────────┐
  │  Prévisualisation — 10 premières lignes sur 145 total           │
  │                                                                 │
  │  Matricule       │ Téléphone       │ Client trouvé  │ Statut   │
  │  NK-GOM-001-0001 │ +243 81 234 567 │ BAHATI J-P.    │ ● Trouvé │
  │  NK-GOM-001-0002 │ +243 99 876 543 │ —              │ ○ Introuvable │
  │  NK-GOM-001-0003 │ 243invalid      │ —              │ ✕ Erreur │
  │  ...                                                            │
  │                                                                 │
  │  Résumé : 98 trouvés · 42 introuvables · 5 erreurs format      │
  │                                                                 │
  │  [ ← Changer de fichier ]    [ LANCER L'IMPORT COMPLET → ]      │
  └─────────────────────────────────────────────────────────────────┘

PHASE 3 — Résultat :

  ┌─────────────────────────────────────────────────────────────────┐
  │                         ✅ Import terminé                        │
  │                                                                 │
  │         ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
  │         │  98 importés│  │ 42 introuvab│  │  5 erreurs  │      │
  │         │   ● vert    │  │  ○ orange   │  │  ✕ rouge    │      │
  │         └─────────────┘  └─────────────┘  └─────────────┘      │
  │                                                                 │
  │  [ Télécharger le rapport d'erreurs (.csv) ]                    │
  │  [ ← Retour à la liste des clients ]                            │
  └─────────────────────────────────────────────────────────────────┘


COMPOSANT CsvDropzone — CsvDropzone.tsx
-----------------------------------------
Zone de dépôt de fichier réutilisable.

  interface CsvDropzoneProps {
    onFileSelected: (file: File) => void;
    accept?: string;          // défaut : ".csv"
    maxSizeMB?: number;       // défaut : 5
    disabled?: boolean;
  }

Comportement :
  - Supporte le drag & drop ET le clic (input file caché)
  - Validation immédiate : extension .csv ET taille ≤ 5 MB
  - Si extension incorrecte → message rouge : "Seuls les fichiers .csv sont acceptés."
  - Si taille dépassée → message rouge : "Fichier trop volumineux (max 5 MB)."
  - Si fichier valide : afficher le nom du fichier + taille + bouton ✕ pour supprimer
  - Survol de la zone pendant le drag : bordure bleue + fond bleu clair


MODÈLE CSV À TÉLÉCHARGER
--------------------------
Bouton "Télécharger le modèle CSV" → génère et télécharge :
  matricule,telephone
  NK-GOM-001-0001,+243812345678
  NK-GOM-001-0002,+243991234567

Implémentation : window.URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' }))
Nom du fichier : "modele_import_progress_business.csv"


TABLEAU DE PRÉVISUALISATION
------------------------------
Affiche les 10 premières lignes du fichier CSV parsé côté client (PapaParse).
Chaque ligne est envoyée au serveur pour vérification via POST preview.

Colonnes :
  Matricule     | Téléphone      | Client trouvé (nom si trouvé, "—" sinon) | Statut

Badges statut par ligne :
  Trouvé        → badge vert   — ClientStatusBadge du client trouvé
  Introuvable   → badge orange — "Aucun client pour ce numéro"
  Erreur format → badge rouge  — "Format téléphone invalide" ou "Matricule vide"

Résumé en bas du tableau :
  "X trouvés · Y introuvables · Z erreurs format"

Si 0 trouvés : Alert orange "Aucun client trouvé dans ce fichier. Vérifiez le format."
Si > 0 erreurs format : Alert jaune "X lignes ignorées en raison d'erreurs de format."


GESTION DE L'IMPORT COMPLET
------------------------------
Le bouton "LANCER L'IMPORT COMPLET" envoie le fichier entier (pas seulement les 10 premières lignes).

Pendant l'import :
  - Progress bar shadcn (indéterminée, animate-pulse)
  - Texte : "Import en cours... (145 lignes à traiter)"
  - Tous les boutons disabled
  - Ne PAS fermer la page (warning si navigation tentée)


RAPPORT D'ERREURS
------------------
Si des erreurs existent après l'import → bouton "Télécharger le rapport d'erreurs (.csv)" :
  Générer un CSV avec les lignes en erreur :
    matricule,telephone,raison
    NK-GOM-001-0003,243invalid,Format téléphone invalide
    NK-GOM-001-0004,,Matricule vide


APPELS API
-----------
POST /api/v1/clients/import/preview
  Corps : FormData { file: File }
  Succès 200 :
    {
      preview: Array<{
        ligne: number,
        matricule: string,
        telephone: string,
        clientId: string | null,
        clientNom: string | null,
        statut: 'TROUVE' | 'INTROUVABLE' | 'ERREUR_FORMAT',
        raisonErreur: string | null,
      }>,
      total: number,
      resume: { trouves: number, introuvables: number, erreurs: number }
    }

POST /api/v1/clients/import/execute
  Corps : FormData { file: File }
  Succès 200 :
    {
      imported: number,
      notFound: number,
      errors: number,
      details: Array<{
        matricule: string,
        telephone: string,
        statut: 'IMPORTE' | 'INTROUVABLE' | 'ERREUR',
        raisonErreur: string | null,
      }>
    }


BACK-END — csv-parser.service.ts + clients.service.ts
-------------------------------------------------------
csv-parser.service.ts :
  parseCsv(buffer: Buffer): ParsedRow[]
  → Utiliser la bibliothèque 'csv-parse' (Node.js)
  → Ignorer la ligne d'en-tête
  → Valider chaque ligne : matricule non vide, téléphone format +243XXXXXXXXX
  → Retourner tableau de { matricule, telephone, isValid, erreur? }

clients.service.ts : importPreview(file)
  1. Parser le CSV avec csv-parser.service
  2. Prendre les 10 premières lignes valides
  3. Pour chaque ligne valide : Prisma findFirst WHERE telephone = ligne.telephone
  4. Assembler la réponse avec statut TROUVE/INTROUVABLE/ERREUR_FORMAT
  5. Calculer le résumé total (parser tout le CSV pour le résumé, pas seulement 10)

clients.service.ts : importExecute(file)
  1. Parser tout le CSV
  2. Pour chaque ligne valide (téléphone) : findFirst client
  3. Si trouvé ET matriculeExterne est null → UPDATE matriculeExterne
  4. Si trouvé ET matriculeExterne non null → ERREUR (matricule immuable)
  5. Si non trouvé → statut INTROUVABLE
  6. Opérations en batch (Prisma updateMany ou transaction par lot de 50)
  7. Retourner le rapport complet


TESTS — ClientImportPage.test.tsx
------------------------------------
  describe('ClientImportPage', () => {
    describe('Accès', () => {
      test('1  — Accès refusé pour AGENT → AccessDenied')
      test('2  — Accès accordé pour GERANT')
    })

    describe('Phase 1 — Upload', () => {
      test('3  — Zone dropzone visible')
      test('4  — Fichier non-CSV refusé : message erreur')
      test('5  — Fichier >5MB refusé : message erreur')
      test('6  — Fichier CSV valide : nom affiché + bouton Prévisualiser actif')
      test('7  — Bouton modèle CSV déclenche le téléchargement')
    })

    describe('Phase 2 — Prévisualisation', () => {
      test('8  — 10 lignes affichées dans le tableau')
      test('9  — Badge vert pour ligne TROUVE')
      test('10 — Badge orange pour ligne INTROUVABLE')
      test('11 — Badge rouge pour ligne ERREUR_FORMAT')
      test('12 — Résumé "X trouvés · Y introuvables · Z erreurs" affiché')
      test('13 — Alert orange si 0 trouvés')
    })

    describe('Phase 3 — Import et résultat', () => {
      test('14 — Progress bar visible pendant l\'import')
      test('15 — 3 stat cards affichées après import')
      test('16 — Bouton rapport erreurs visible si erreurs > 0')
      test('17 — Téléchargement rapport erreurs CSV fonctionne')
    })
  })


DÉFINITION DE "TERMINÉ"
------------------------
[ ] Accès refusé pour AGENT (AccessDenied), accordé pour GERANT+
[ ] CsvDropzone : drag & drop + clic, validation extension et taille
[ ] Bouton modèle CSV télécharge un fichier exemple valide
[ ] Phase prévisualisation : 10 lignes avec badges statuts colorés
[ ] Résumé total (trouves / introuvables / erreurs) affiché
[ ] Progress bar pendant l'import complet
[ ] Écran résultat : 3 stat cards + bouton rapport erreurs
[ ] Rapport erreurs téléchargeable en CSV
[ ] POST preview : parse + vérification 10 premières lignes + résumé complet
[ ] POST execute : batch Prisma update, matricule immuable respecté
[ ] npm run test — 17 tests passent, couverture ≥ 75%
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. SÉQUENTIALITÉ DE L'ONBOARDING — Règle absolue :
   → Chaque étape vérifie côté SERVEUR que l'étape précédente est COMPLETE.
   → Le client ne peut jamais sauter une étape, même en manipulant l'URL.
   → Le code erreur 409 ERR_STEP_ORDER doit être géré dans CHAQUE étape.
   → L'OnboardingStepper côté client reflète l'état réel venant de l'API,
     pas un état local — ne jamais construire le stepper depuis un state React seul.

2. UNICITÉ DU TÉLÉPHONE — Contrainte critique :
   → Le téléphone est l'identifiant primaire du client dans TOUT le système.
   → La vérification d'unicité se fait en temps réel (debounce 500ms)
     ET côté serveur lors de la soumission.
   → Une fois rattaché à au moins une transaction, le téléphone devient
     IMMUABLE (erreur 422 ERR_BUSINESS si tentative de modification).

3. CODE PARRAIN — Format et génération :
   → Format strict : TSG-XXXX où XXXX est un entier sur 4 chiffres (0001 → 9999).
   → Généré UNIQUEMENT à l'étape 4 (Activation) — jamais avant.
   → Incrémental PAR SITE : TSG-0001 à Goma, TSG-0001 aussi à Bukavu (compteurs indépendants).
   → Vérification d'unicité GLOBALE dans la base après génération.

4. SMS DE BIENVENUE — Non-bloquant :
   → L'échec du SMS de bienvenue NE DOIT PAS annuler l'activation.
   → Envoyer le SMS dans un try/catch indépendant, logger l'erreur.
   → Informer l'UI via smsSent: false dans la réponse API.

5. IMPORT CSV — Atomicité et performance :
   → L'import execute doit traiter les lignes par BATCH de 50 (éviter timeout).
   → Utiliser des transactions Prisma pour garantir la cohérence.
   → Ne JAMAIS modifier un matricule déjà renseigné (immuable).
   → Logguer chaque opération d'import pour audit.

6. OFFLINE — Règle du module Clients :
   → La liste des clients (SCR-005) peut afficher des données Dexie en cache.
   → Les formulaires d'onboarding (SCR-007 à 010) NÉCESSITENT internet.
   → Si offline pendant un formulaire onboarding → désactiver le bouton
     de soumission + message "Connexion requise pour enregistrer."
   → La fiche client (SCR-006) peut afficher en lecture seule depuis Dexie.

7. PERMISSIONS UI — Masquage strict :
   → Jamais désactiver un élément inaccessible — le MASQUER complètement.
   → Le bouton "Modifier" sur la fiche client est masqué pour AGENT et FORMATEUR.
   → Le bouton "+ Nouveau Client" est masqué pour FORMATEUR.
   → L'import CSV (SCR-011) est masqué dans la sidebar pour AGENT et FORMATEUR.
```

---

*Progress Business — Prompts Développement Module Clients SCR-005 à SCR-011 — Goma, RDC — v1.0 — 2025*
