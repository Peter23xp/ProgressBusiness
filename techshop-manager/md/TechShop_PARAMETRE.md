# ⚙️ PROGRESS BUSINESS — PROMPTS DE DÉVELOPPEMENT
## Module PARAMÈTRES | Écrans SCR-039 à SCR-042 | 4 écrans

> **MODE D'EMPLOI :**
> Ce fichier contient **4 prompts indépendants**, un par écran du module Paramètres.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Ce module est le DERNIER à développer — tous les modules précédents doivent être TERMINÉS.
>
> ⚠️ **Note importante** : SCR-039 (Gestion Utilisateurs) et SCR-040 (Gestion Sites)
> nécessitent le rôle SUPER_ADMIN. SCR-041 (Profil) est accessible à tous les rôles.
> SCR-042 (Configuration Générale) est SUPER_ADMIN uniquement.
> Ces écrans touchent aux fondations de l'application — tester avec extra-soin.

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
              Vert #1A6B3A (succès) | Orange #E65100 (alerte) | Rouge #B71C1C (danger)
Monorepo    : apps/client + apps/server + packages/shared
Devise      : Franc Congolais (CDF) — format : 1 200 000 CDF

RÔLES DISPONIBLES :
  SUPER_ADMIN   → accès total à tous les modules et paramètres
  DIR_REGIONAL  → supervision multi-sites, rapports consolidés
  GERANT        → gestion complète d'un site
  AGENT         → ventes, clients, stock (lecture)
  FORMATEUR     → validation étape formation uniquement
  CLIENT        → portail client uniquement

SITES ACTIFS :
  Goma (siège), Bukavu, Kinshasa (+ nouveaux sites créables via SCR-040)
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 4 — SCR-039 : GESTION DES UTILISATEURS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet        : Progress Business
Fichier cible : apps/client/src/pages/settings/UsersPage.tsx
Route         : /settings/users
Accès         : Authentifié — rôle SUPER_ADMIN uniquement
Rôle minimum  : SUPER_ADMIN
Dépendances   : Module Auth terminé (types UserRole, ProtectedRoute)
                Module Clients terminé (formatCDF, composants UI)


OBJECTIF
--------
Créer la page de gestion des comptes utilisateurs internes (SCR-039).
Le Super Admin peut voir tous les agents, gérants, formateurs et directeurs,
créer de nouveaux comptes, désactiver des comptes, réinitialiser des mots de passe.
Cette page gère UNIQUEMENT les utilisateurs internes (pas les clients portail).


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/settings/UsersPage.tsx                     ← CRÉER (principal)
2.  apps/client/src/pages/settings/UsersPage.test.tsx                ← CRÉER (tests Vitest)
3.  apps/client/src/components/settings/UsersTable.tsx               ← CRÉER (tableau)
4.  apps/client/src/components/settings/UserRoleBadge.tsx            ← CRÉER (badge rôle)
5.  apps/client/src/components/settings/CreateUserDialog.tsx         ← CRÉER (modal création)
6.  apps/client/src/components/settings/UserActionsMenu.tsx          ← CRÉER (menu actions)
7.  apps/client/src/components/settings/UserFiltersBar.tsx           ← CRÉER (barre filtres)
8.  apps/client/src/hooks/useUsers.ts                                ← CRÉER (hook TQ)
9.  packages/shared/src/types/users.types.ts                         ← CRÉER (interfaces TS)

BACK-END :
10. apps/server/src/modules/users/users.module.ts                    ← VÉRIFIER / COMPLÉTER
11. apps/server/src/modules/users/users.controller.ts                ← VÉRIFIER / COMPLÉTER
12. apps/server/src/modules/users/users.service.ts                   ← VÉRIFIER / COMPLÉTER
13. apps/server/src/modules/users/dto/create-user.dto.ts             ← CRÉER
14. apps/server/src/modules/users/dto/update-user.dto.ts             ← CRÉER


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Gestion des utilisateurs                  [ + Créer un utilisateur ]│
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
  │  │  Total actifs    │ │  Super Admins    │ │  Agents          │    │
  │  │      24          │ │       2          │ │      15          │    │
  │  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
  │                                                                      │
  │  [ Rechercher par nom ou tél... ]  [Rôle ▼]  [Site ▼]  [Statut ▼] │
  │                                                                      │
  │  Nom                  │ Rôle        │ Site       │ Statut │ Dernière │
  │  BAHATI Jean-Pierre   │ ■ Agent     │ Goma       │ ● Actif│ Il y a 2h│
  │  KAMBALE Marie        │ ■ Formateur │ Goma       │ ● Actif│ Il y a 1j│
  │  MASUDI Serge         │ ■ Gérant    │ Bukavu     │ ● Actif│ Il y a 3h│
  │  NGABO Patrick        │ ■ Dir. Rég. │ Tous sites │ ● Actif│ Il y a 1j│
  │  PALUKU David         │ ■ Agent     │ Kinshasa   │ ✗ Inact│ Il y a 8j│
  │  ...                                                                 │
  │  < Préc.  Page 1/3  Suiv. >                    25 utilisateurs/page │
  └──────────────────────────────────────────────────────────────────────┘


TYPES TYPESCRIPT — users.types.ts
------------------------------------
  // packages/shared/src/types/users.types.ts

  export interface UserInternal {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
    role: UserRole;
    siteId?: string;             // null pour SUPER_ADMIN et DIR_REGIONAL multi-sites
    siteName?: string;
    actif: boolean;
    createdAt: string;
    lastLoginAt?: string;
    lastLoginIp?: string;
  }

  export interface CreateUserDto {
    prenom: string;
    nom: string;
    telephone: string;
    email?: string;
    role: UserRole;
    siteId?: string;             // requis sauf SUPER_ADMIN
    passwordTemp: string;        // mot de passe temporaire (expirera à la 1ère connexion)
    sendSms: boolean;            // envoyer le MDP temp par SMS
  }

  export interface UsersStats {
    totalActifs: number;
    parRole: Record<UserRole, number>;
  }


COMPOSANT UserRoleBadge — UserRoleBadge.tsx
---------------------------------------------
Composant réutilisable pour afficher le rôle d'un utilisateur.

  interface UserRoleBadgeProps {
    role: UserRole;
    size?: 'sm' | 'md';
  }

Rendu selon rôle :
  SUPER_ADMIN   → Badge rouge foncé  "Super Admin"
  DIR_REGIONAL  → Badge violet       "Dir. Régional"
  GERANT        → Badge bleu foncé   "Gérant"
  AGENT         → Badge bleu clair   "Agent"
  FORMATEUR     → Badge vert         "Formateur"
  CLIENT        → Badge gris         "Client"

Export helper : export function getRoleLabel(role: UserRole): string


COMPOSANT UsersTable — UsersTable.tsx
---------------------------------------
Tableau principal des utilisateurs :

Colonnes :
  1. Utilisateur  : Avatar initiales + Nom Prénom + téléphone (text-xs muted)
  2. Rôle         : UserRoleBadge
  3. Site         : Nom du site ou "Multi-sites" pour DIR_REGIONAL/SUPER_ADMIN
  4. Statut       : Badge vert "● Actif" ou gris "✗ Inactif" + opacity-50 sur la ligne si inactif
  5. Dernière conn: Formaté en relatif "Il y a 2h" ou "Jamais" (date-fns/fr)
  6. Actions      : UserActionsMenu (3 points ⋮)

Comportements :
  - Lignes inactives : opacity-60
  - Tri par : Nom (défaut asc), Rôle, Dernière connexion
  - Clic ligne → ouvre UserActionsMenu ou détail

Skeleton : 8 lignes pendant le chargement.
Empty state : "Aucun utilisateur trouvé pour les filtres sélectionnés."


COMPOSANT UserActionsMenu — UserActionsMenu.tsx
-------------------------------------------------
Menu d'actions contextuel (DropdownMenu shadcn) sur chaque utilisateur :

  interface UserActionsMenuProps {
    user: UserInternal;
    onToggleActif: (userId: string, actif: boolean) => void;
    onResetPassword: (userId: string) => void;
    onEdit: (userId: string) => void;
  }

Options du menu :
  ✏️ Modifier le profil
     → Ouvre un Dialog de modification (nom, rôle, site)
  🔑 Réinitialiser le mot de passe
     → Génère un nouveau MDP temporaire + envoi SMS
     → Confirmation requise : "Un SMS sera envoyé à +243 XX XXX XXXX"
  ● Désactiver le compte  (si actif)
     → Confirmation : "Cet utilisateur ne pourra plus se connecter."
     → Bouton confirmation en destructive rouge
  ● Réactiver le compte   (si inactif)
     → Pas de confirmation requise (action non destructive)
  ─────────────────────────────────────────
  🗑️ Supprimer définitivement
     → Visible seulement si user.actif === false
     → Double confirmation : saisir "SUPPRIMER" en toutes lettres
     → Action irréversible — mention explicite dans la confirmation


COMPOSANT CreateUserDialog — CreateUserDialog.tsx
---------------------------------------------------
Modal de création d'un nouvel utilisateur interne.
Utiliser Dialog shadcn avec react-hook-form + zodResolver.

  interface CreateUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: UserInternal) => void;
  }

Champs du formulaire :
  Prénom *              : Input text (min 2 chars)
  Nom de famille *      : Input text (min 2 chars)
  Téléphone *           : Input tel (format +243XXXXXXXXX, vérif unicité en temps réel)
  Email                 : Input email (optionnel)
  Rôle *                : Select (tous les rôles sauf CLIENT)
  Site assigné *        : Select (requis sauf si rôle SUPER_ADMIN ou DIR_REGIONAL)
    → Le champ Site est masqué si rôle = SUPER_ADMIN
    → Si rôle = DIR_REGIONAL : Select multi (assigner plusieurs sites)
  Mot de passe temp. *  : Input password (min 8 chars, généré auto possible)
    → Bouton [🔀 Générer] → génère un MDP fort aléatoire (ex: "Goma#2025!X")
  ☐ Envoyer le MDP par SMS au +243 XX XXX XXXX

Validation Zod :
  const createUserSchema = z.object({
    prenom: z.string().min(2).max(50),
    nom: z.string().min(2).max(50),
    telephone: z.string().regex(/^\+243[0-9]{9}$/, 'Format : +243XXXXXXXXX'),
    email: z.string().email().optional().or(z.literal('')),
    role: z.enum(['SUPER_ADMIN','DIR_REGIONAL','GERANT','AGENT','FORMATEUR']),
    siteId: z.string().optional(),
    passwordTemp: z.string().min(8, 'Minimum 8 caractères'),
    sendSms: z.boolean().default(true),
  }).refine(
    (d) => d.role === 'SUPER_ADMIN' || !!d.siteId,
    { message: "Le site est requis pour ce rôle.", path: ["siteId"] }
  );

Pied du Dialog :
  [Annuler] | [Créer l'utilisateur]

Après succès :
  - Toast vert : "Compte créé pour PRÉNOM NOM."
  - Si sendSms=true : "SMS envoyé au +243 XX *** XXXX"
  - Dialog fermé
  - Liste rechargée (TanStack Query invalidate)


COMPOSANT UserFiltersBar — UserFiltersBar.tsx
----------------------------------------------
Barre de filtres pour le tableau :

  Filtre 1 — Recherche :
    Input placeholder "Nom, prénom ou téléphone..."
    Debounce 400ms

  Filtre 2 — Rôle :
    Select : Tous | Super Admin | Dir. Régional | Gérant | Agent | Formateur

  Filtre 3 — Site :
    Select : Tous les sites | Goma | Bukavu | Kinshasa (+ sites ajoutés)
    Chargé depuis GET /api/v1/sites

  Filtre 4 — Statut :
    Select : Tous | Actifs seulement | Inactifs seulement
    Défaut : "Actifs seulement"

  Bouton [Réinitialiser] visible si au moins un filtre non-default.


HOOK useUsers — useUsers.ts
------------------------------
  export function useUsers(filters: UsersFilters) {
    const listQuery = useQuery({
      queryKey: ['users', filters],
      queryFn: () => usersApi.list(filters),
      staleTime: 2 * 60_000,
      placeholderData: keepPreviousData,
    });

    const statsQuery = useQuery({
      queryKey: ['users', 'stats'],
      queryFn: () => usersApi.getStats(),
      staleTime: 5 * 60_000,
    });

    const toggleActifMutation = useMutation({
      mutationFn: ({ userId, actif }: { userId: string; actif: boolean }) =>
        usersApi.toggleActif(userId, actif),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success("Statut du compte mis à jour.");
      },
    });

    const resetPasswordMutation = useMutation({
      mutationFn: (userId: string) => usersApi.resetPassword(userId),
      onSuccess: (data) => {
        toast.success(`Nouveau mot de passe envoyé par SMS à ${data.maskedPhone}`);
      },
    });

    return { users, stats, isLoading, pagination,
             toggleActif: toggleActifMutation.mutate,
             resetPassword: resetPasswordMutation.mutate };
  }


APPELS API
-----------
GET /api/v1/users
  Query :
    search?   : string
    role?     : UserRole
    siteId?   : string
    actif?    : boolean (défaut true)
    page      : number (défaut 1)
    limit     : number (défaut 25)
    sortBy    : 'nom' | 'lastLoginAt' (défaut 'nom')
    sortOrder : 'asc' | 'desc'
  Succès 200 :
    { users: [UserInternal], meta: { total, page, limit, totalPages }, stats: UsersStats }

POST /api/v1/users
  Corps : CreateUserDto
  Succès 201 :
    { user: UserInternal, smsSent: boolean, maskedPhone: string }
  Erreur 409 :
    { error: { code: 'PHONE_ALREADY_EXISTS', message: string } }

PATCH /api/v1/users/:id
  Corps : Partial<CreateUserDto> (sauf passwordTemp)
  Succès 200 : { user: UserInternal }

PATCH /api/v1/users/:id/desactiver
  Succès 200 : { user: { id, actif: false } }

PATCH /api/v1/users/:id/reactiver
  Succès 200 : { user: { id, actif: true } }

PATCH /api/v1/users/:id/reset-password
  Succès 200 :
    { newPasswordTemp: string, smsSent: boolean, maskedPhone: string }
  (newPasswordTemp visible une seule fois dans la réponse — à afficher dans une Alert)

DELETE /api/v1/users/:id
  Requis : user.actif === false (erreur 400 sinon)
  Succès 204 : (no content)
  Erreur 409 : { error: { code: 'USER_HAS_DATA', message: 'Cet utilisateur a des données associées.' } }
  Note : Soft-delete recommandé — marquer deletedAt plutôt que supprimer physiquement.

Back-end — users.service.ts — méthode create() :
  1. Vérifier rôle SUPER_ADMIN de l'appelant
  2. Vérifier unicité du téléphone (parmi les users internes ET les clients)
  3. Hasher le passwordTemp avec bcrypt (rounds=12)
  4. Créer l'User en base avec forcePasswordChange=true
  5. Si sendSms=true → envoyer via SmsService :
     "Votre compte Progress Business a été créé.
     Téléphone: [tel] | Mot de passe: [passwordTemp]
     Changez votre MDP à votre première connexion."
  6. Retourner user + smsSent + maskedPhone


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - 3 cartes KPI skeleton
  - 8 lignes skeleton dans le tableau

État 2 — LISTE CHARGÉE
  - Utilisateurs avec badge de rôle coloré
  - Filtre par défaut : "Actifs seulement"

État 3 — CRÉATION EN COURS
  - Dialog ouvert, formulaire en cours de remplissage
  - Vérification unicité téléphone en temps réel (debounce 500ms)
  - Spinner sur bouton "Créer" pendant la soumission

État 4 — RÉINITIALISATION MDP
  - Dialog de confirmation avec numéro masqué
  - Après succès : Alert spéciale dans le Dialog affichant le nouveau MDP temporaire
    "⚠ Communiquez ce mot de passe à l'utilisateur : [MDP]"
    "Il sera invité à le changer à sa prochaine connexion."
    Bouton [Copier le mot de passe] dans l'Alert
  - L'Alert disparaît quand le Dialog est fermé (le MDP n'est jamais re-affiché)

État 5 — DÉSACTIVATION
  - Dialog de confirmation → bouton destructive
  - Après succès : la ligne devient opacity-60, badge passe à "✗ Inactif"

État 6 — SUPPRESSION
  - Double confirmation : saisir "SUPPRIMER" en toutes lettres
  - Bouton activé seulement quand le texte correspond exactement
  - Après succès : ligne disparaît de la liste, toast vert


STYLE ET DESIGN
-----------------
- Fond page           : bg-neutral-50
- Card stats          : bg-white border border-neutral-100 shadow-sm rounded-xl
- Tableau             : bg-white border border-neutral-100 rounded-xl shadow-sm
- UserRoleBadge SUPER : bg-red-100 text-red-800 border border-red-200
- UserRoleBadge DIR   : bg-purple-100 text-purple-800
- UserRoleBadge GERANT: bg-blue-100 text-blue-800
- UserRoleBadge AGENT : bg-sky-100 text-sky-700
- UserRoleBadge FORM. : bg-green-100 text-green-800
- Statut actif        : dot vert + "Actif"
- Statut inactif      : dot gris + "Inactif" (ligne opacity-60)


TESTS — UsersPage.test.tsx
----------------------------
  describe('UsersPage', () => {
    describe('Tableau et filtres', () => {
      test('1  — Liste utilisateurs avec rôles, sites, statuts')
      test('2  — Badge rôle coloré selon le rôle (Super Admin = rouge, etc.)')
      test('3  — Filtre "Actifs seulement" par défaut')
      test('4  — Filtre par rôle "Agent" filtre la liste')
      test('5  — Recherche debounce 400ms')
      test('6  — Lignes inactives en opacity-60')
      test('7  — Skeleton 8 lignes pendant le chargement')
    })

    describe('Création utilisateur', () => {
      test('8  — Dialog s\'ouvre au clic "+ Créer un utilisateur"')
      test('9  — Champ Site masqué si rôle SUPER_ADMIN')
      test('10 — Erreur si téléphone déjà utilisé (409)')
      test('11 — Bouton [Générer] crée un MDP fort')
      test('12 — Succès création : toast vert + liste rechargée')
      test('13 — Validation Zod : téléphone format +243XXXXXXXXX')
    })

    describe('Actions utilisateur', () => {
      test('14 — Menu ⋮ affiche les 4 options')
      test('15 — Désactivation : dialog confirmation + bouton destructive')
      test('16 — Après désactivation : ligne opacity-60 + badge Inactif')
      test('17 — Réactivation : pas de confirmation requise')
      test('18 — Réinitialisation MDP : MDP temp affiché dans Alert une seule fois')
      test('19 — Suppression : visible seulement si compte inactif')
      test('20 — Suppression : saisir "SUPPRIMER" requis')
    })

    describe('Accès', () => {
      test('21 — Rôle non SUPER_ADMIN → redirect /dashboard')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-039
---------------------------------------------
[ ] Tableau des utilisateurs avec toutes les colonnes et badges de rôle colorés
[ ] Filtre par défaut "Actifs seulement" est appliqué
[ ] Les filtres (recherche, rôle, site, statut) fonctionnent
[ ] Dialog création avec validation Zod complète fonctionne
[ ] Le champ Site se masque automatiquement si rôle SUPER_ADMIN
[ ] La vérification unicité téléphone fonctionne en temps réel
[ ] La réinitialisation MDP affiche le MDP temp dans une Alert (une seule fois)
[ ] La désactivation rend la ligne opacity-60 et change le badge
[ ] La suppression demande "SUPPRIMER" en toutes lettres
[ ] La suppression n'est disponible que pour les comptes inactifs
[ ] npm run test : 21 tests UsersPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 4 — SCR-040 : GESTION DES SITES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet        : Progress Business
Fichier cible : apps/client/src/pages/settings/SitesPage.tsx
Route         : /settings/sites
Accès         : Authentifié — rôle SUPER_ADMIN uniquement
Rôle minimum  : SUPER_ADMIN
Dépendances   : SCR-039 terminé (UserRoleBadge, usersApi pour les gérants)


OBJECTIF
--------
Créer la page de gestion des points de vente (SCR-040).
Le Super Admin peut voir tous les sites, créer de nouveaux sites,
modifier les informations d'un site existant (adresse, gérant assigné),
et activer/désactiver un site.
Cette page alimente les selecteurs de site présents dans TOUTE l'application.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/settings/SitesPage.tsx                      ← CRÉER (principal)
2. apps/client/src/pages/settings/SitesPage.test.tsx                 ← CRÉER (tests Vitest)
3. apps/client/src/components/settings/SiteCard.tsx                  ← CRÉER (carte site)
4. apps/client/src/components/settings/CreateSiteDialog.tsx          ← CRÉER (modal création)
5. apps/client/src/components/settings/EditSiteDialog.tsx            ← CRÉER (modal édition)
6. apps/client/src/hooks/useSites.ts                                  ← CRÉER (hook TQ)
7. packages/shared/src/types/sites.types.ts                          ← CRÉER (interfaces TS)

BACK-END :
8. apps/server/src/modules/sites/sites.module.ts                     ← VÉRIFIER / COMPLÉTER
9. apps/server/src/modules/sites/sites.controller.ts                 ← VÉRIFIER / COMPLÉTER
10. apps/server/src/modules/sites/sites.service.ts                   ← VÉRIFIER / COMPLÉTER
11. apps/server/src/modules/sites/dto/create-site.dto.ts             ← CRÉER


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Gestion des sites                             [ + Créer un site ]   │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ┌──────────────────────────────┐  ┌──────────────────────────────┐ │
  │  │  📍 GOMA (siège)    ● Actif  │  │  📍 BUKAVU          ● Actif  │ │
  │  │  Q. Himbi, Av. Volcans       │  │  Av. Patrice Lumumba         │ │
  │  │  Gérant: MASUDI Serge        │  │  Gérant: KAMBALE Marie       │ │
  │  │  Tél: +243 81 234 5678       │  │  Tél: +243 99 876 5432       │ │
  │  │  ──────────────────────────  │  │  ──────────────────────────  │ │
  │  │  Clients : 849   Agents : 8  │  │  Clients : 312   Agents : 4  │ │
  │  │  Ventes mois: 14 250 000 CDF │  │  Ventes mois: 5 400 000 CDF  │ │
  │  │  Stock alertes : 3           │  │  Stock alertes : 1           │ │
  │  │  [ ✏️ Modifier ]             │  │  [ ✏️ Modifier ]             │ │
  │  └──────────────────────────────┘  └──────────────────────────────┘ │
  │                                                                      │
  │  ┌──────────────────────────────┐  ┌──────────────────────────────┐ │
  │  │  📍 KINSHASA        ● Actif  │  │  📍 LUBUMBASHI    ✗ Inactif  │ │
  │  │  Commune de Gombe            │  │  Commune Annexe              │ │
  │  │  Gérant: NGABO Yvette        │  │  Gérant: Non assigné         │ │
  │  │  ──────────────────────────  │  │  ──────────────────────────  │ │
  │  │  Clients : 87    Agents : 3  │  │  Clients : 0     Agents : 0  │ │
  │  │  [ ✏️ Modifier ]             │  │  [ ✏️ Modifier ][ Activer ]  │ │
  │  └──────────────────────────────┘  └──────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────┘


TYPES TYPESCRIPT — sites.types.ts
------------------------------------
  export interface Site {
    id: string;
    nom: string;
    ville: string;
    adresse: string;
    telephone?: string;
    actif: boolean;
    estSiege: boolean;           // true pour Goma
    gerantId?: string;
    gerantNom?: string;
    gerantPrenom?: string;
    createdAt: string;
    stats?: {
      nbClients: number;
      nbAgents: number;
      ventesMois: number;        // CA du mois courant en CDF
      alertesStock: number;      // nb produits en alerte
    };
  }

  export interface CreateSiteDto {
    nom: string;
    ville: string;
    adresse: string;
    telephone?: string;
    gerantId?: string;
  }


COMPOSANT SiteCard — SiteCard.tsx
------------------------------------
Carte d'un site dans la grille :

  interface SiteCardProps {
    site: Site;
    onEdit: (siteId: string) => void;
    onToggleActif: (siteId: string, actif: boolean) => void;
  }

Contenu de la carte :
  En-tête :
    - Icône MapPin (lucide 16px) + Nom du site en text-base font-bold
    - Badge "Siège" si estSiege=true (badge bleu)
    - Badge vert "● Actif" ou gris "✗ Inactif" à droite

  Corps :
    - Adresse (text-sm text-muted)
    - Gérant : "Gérant : [Nom Prénom]" ou "Gérant : Non assigné" en italic muted
    - Téléphone (si disponible)
    - Separator
    - Stats en 2 colonnes (text-sm) :
        "Clients : [X]"    | "Agents : [Y]"
        "Ventes mois : [Z] CDF" (formatCDF) sur toute la largeur
        Si alertesStock > 0 : "⚠ [X] alerte(s) stock" en orange

  Pied :
    - Bouton [✏️ Modifier] → onEdit(site.id)
    - Si !actif : Bouton [Activer] → onToggleActif(site.id, true)
    - Si actif ET !estSiege : Bouton [Désactiver] (destructive) → confirmation

  Design :
    - bg-white border border-neutral-100 rounded-xl shadow-sm p-5
    - Hover : shadow-md
    - Si inactif : opacity-75 + fond bg-neutral-50
    - Badge siège : bg-blue-100 text-blue-800 text-xs


COMPOSANT CreateSiteDialog — CreateSiteDialog.tsx
---------------------------------------------------
  Champs :
    Nom du site *       : Input text (min 3 chars, ex: "Progress Business Lubumbashi")
    Ville *             : Input text (ex: "Lubumbashi")
    Adresse *           : Textarea (ex: "Av. Kasaï, Commune Annexe")
    Téléphone           : Input tel (optionnel, format +243XXXXXXXXX)
    Gérant assigné      : Select des agents avec rôle GERANT disponibles
      (chargé depuis GET /api/v1/users?role=GERANT&actif=true)
      Optionnel au moment de la création — peut être assigné plus tard

  Schéma Zod :
    const createSiteSchema = z.object({
      nom: z.string().min(3, 'Minimum 3 caractères').max(100),
      ville: z.string().min(2).max(100),
      adresse: z.string().min(5, 'Adresse trop courte').max(300),
      telephone: z.string().regex(/^\+243[0-9]{9}$/).optional().or(z.literal('')),
      gerantId: z.string().uuid().optional(),
    });

  Succès → toast vert "Site [nom] créé avec succès." + grille rechargée.


COMPOSANT EditSiteDialog — EditSiteDialog.tsx
-----------------------------------------------
  Même champs que CreateSiteDialog pré-remplis avec les données du site.
  Champ supplémentaire : Toggle "Site actif / inactif"
    → Si le site est le siège (estSiege=true) → Toggle DISABLED avec tooltip
      "Le siège ne peut pas être désactivé."

  Note sur le gérant :
    Si un gérant est déjà assigné à un autre site → afficher un avertissement :
    "MASUDI Serge est actuellement gérant de Bukavu.
    L'assigner ici le retirera de Bukavu."


HOOK useSites — useSites.ts
------------------------------
  export function useSites() {
    const { data, isLoading } = useQuery({
      queryKey: ['sites'],
      queryFn: () => sitesApi.list(),
      staleTime: 5 * 60_000,
    });

    const createMutation = useMutation({
      mutationFn: (dto: CreateSiteDto) => sitesApi.create(dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sites'] });
        // Invalider aussi le cache des sélecteurs de site dans toute l'app
        queryClient.invalidateQueries({ queryKey: ['sites', 'select'] });
        toast.success("Site créé avec succès.");
      },
    });

    const updateMutation = useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateSiteDto> }) =>
        sitesApi.update(id, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sites'] });
        queryClient.invalidateQueries({ queryKey: ['sites', 'select'] });
        toast.success("Site mis à jour.");
      },
    });

    const toggleActifMutation = useMutation({
      mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
        sitesApi.toggleActif(id, actif),
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries({ queryKey: ['sites'] });
        toast.success(vars.actif ? "Site activé." : "Site désactivé.");
      },
    });

    return { sites, isLoading,
             createSite: createMutation.mutate,
             updateSite: updateMutation.mutate,
             toggleActif: toggleActifMutation.mutate };
  }


APPELS API
-----------
GET /api/v1/sites
  Succès 200 :
    { sites: [Site avec stats] }
  Note : les stats sont calculées en temps réel (ou depuis le cache Redis)

POST /api/v1/sites
  Corps : CreateSiteDto
  Succès 201 : { site: Site }
  Erreur 409 : { error: { code: 'SITE_NAME_EXISTS' } }

PATCH /api/v1/sites/:id
  Corps : Partial<CreateSiteDto> + { actif?: boolean }
  Succès 200 : { site: Site }
  Erreur 400 :
    { error: { code: 'CANNOT_DEACTIVATE_SIEGE', message: '...' } }

Back-end — sites.service.ts :
  Méthode list() :
    1. Récupérer tous les sites
    2. Pour chaque site : calculer stats en parallèle (Promise.all) :
       - COUNT Client WHERE siteInscriptionId = siteId AND statut='ACTIF'
       - COUNT User WHERE siteId = siteId AND role='AGENT' AND actif=true
       - SUM Vente.montantNet WHERE siteId AND mois courant
       - COUNT StockSite WHERE quantite ≤ seuilAlerte AND siteId
    3. Si les stats prennent > 500ms → retourner d'abord les sites sans stats
       puis un second endpoint GET /api/v1/sites/:id/stats pour charger les stats
       individuellement (optimisation optionnelle)

  Méthode toggleActif() :
    1. Vérifier que le site n'est pas le siège avant de désactiver
    2. UPDATE site.actif
    3. Si désactivation → UPDATE tous les User.siteId = null WHERE siteId (NE PAS faire)
       → Ne pas modifier les utilisateurs — juste désactiver le site


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - 4 cartes SiteCard skeleton (rectangles gris animés)

État 2 — SITES CHARGÉS
  - Grille de cartes (2 colonnes desktop, 1 colonne mobile)

État 3 — AUCUN SITE INACTIF
  - Grille affiche uniquement les sites actifs
  - Option pour afficher les inactifs : toggle "Afficher les sites inactifs"

État 4 — DÉSACTIVATION TENTÉE SUR LE SIÈGE
  - Bouton "Désactiver" absent sur le site siège
  - Tooltip si tentative par URL directe : "Le siège ne peut pas être désactivé"

État 5 — GÉRANT DOUBLE-ASSIGNÉ
  - Alert jaune dans EditSiteDialog si le gérant sélectionné est déjà assigné ailleurs


TESTS — SitesPage.test.tsx
----------------------------
  describe('SitesPage', () => {
    test('1  — Grille de sites affichée avec nom, adresse, gérant')
    test('2  — Badge "Siège" sur le site principal (estSiege=true)')
    test('3  — Sites inactifs : opacity-75 + badge "Inactif"')
    test('4  — Stats : clients, agents, ventes mois, alertes')
    test('5  — Alerte stock orange si alertesStock > 0')
    test('6  — Dialog création : champs nom, ville, adresse requis')
    test('7  — Dialog création : champ gérant optionnel (Select)')
    test('8  — Succès création : toast vert + nouvelle carte dans la grille')
    test('9  — Dialog édition : pré-rempli avec les données du site')
    test('10 — Toggle actif désactivé sur le site siège')
    test('11 — Avertissement gérant double-assigné')
    test('12 — Désactivation : confirmation + site devient opacity-75')
    test('13 — Bouton "Activer" visible sur les sites inactifs')
    test('14 — Rôle non SUPER_ADMIN → redirect /dashboard')
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-040
---------------------------------------------
[ ] La grille de sites s'affiche avec les cartes correctement remplies
[ ] Le badge "Siège" est visible sur le bon site
[ ] Les stats (clients, agents, CA, alertes) s'affichent dans chaque carte
[ ] Le Dialog de création valide les champs et crée le site
[ ] Le Dialog d'édition est pré-rempli et fonctionne
[ ] Le toggle "actif" est bloqué sur le site siège
[ ] L'avertissement de gérant double-assigné s'affiche
[ ] La désactivation d'un site met la carte en opacity-75
[ ] Le bouton "Activer" apparaît sur les cartes de sites inactifs
[ ] npm run test : 14 tests SitesPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 4 — SCR-041 : PROFIL UTILISATEUR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet        : Progress Business
Fichier cible : apps/client/src/pages/settings/ProfilePage.tsx
Route         : /settings/profile
Accès         : Authentifié — TOUS les rôles (Agent, Gérant, Admin, etc.)
Rôle minimum  : AGENT
Dépendances   : Module Auth terminé (useAuth, authStore, authApi)
                SCR-039 terminé (UserRoleBadge)


OBJECTIF
--------
Créer la page de profil personnel de l'utilisateur connecté (SCR-041).
Chaque utilisateur interne (tous rôles sauf CLIENT) peut consulter et modifier
ses informations personnelles, changer son mot de passe, et voir son activité
récente. C'est l'écran le moins restreint du module Paramètres.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/settings/ProfilePage.tsx                    ← CRÉER (principal)
2. apps/client/src/pages/settings/ProfilePage.test.tsx               ← CRÉER (tests Vitest)
3. apps/client/src/components/settings/ProfileInfoForm.tsx           ← CRÉER (formulaire infos)
4. apps/client/src/components/settings/ChangePasswordForm.tsx        ← CRÉER (formulaire MDP)
5. apps/client/src/components/settings/ProfileActivityLog.tsx        ← CRÉER (activité récente)
6. apps/client/src/components/settings/AvatarUpload.tsx              ← CRÉER (avatar optionnel)
7. apps/client/src/hooks/useProfile.ts                               ← CRÉER (hook TQ)

BACK-END :
8. apps/server/src/modules/users/users.controller.ts                 ← AJOUTER routes /me


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Mon profil                                                          │
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ┌──────────────────────────────────────────────────────────────┐   │
  │  │  INFORMATIONS PERSONNELLES                                   │   │
  │  │                                                               │   │
  │  │  [Avatar JP]  BAHATI Jean-Pierre                             │   │
  │  │               ■ Agent | Progress Business Goma                        │   │
  │  │               Membre depuis le 15 janvier 2025               │   │
  │  │                                                               │   │
  │  │  Prénom *      [Jean-Pierre           ]                      │   │
  │  │  Nom *         [BAHATI                ]                      │   │
  │  │  Email         [jean.bahati@progress_business.cd] (optionnel)         │   │
  │  │  Langue        [Français ▼            ]                      │   │
  │  │                                                               │   │
  │  │  Téléphone     +243 81 234 5678  (non modifiable ici)        │   │
  │  │  Rôle          ■ Agent           (non modifiable ici)        │   │
  │  │  Site          Progress Business Goma     (non modifiable ici)        │   │
  │  │                                                               │   │
  │  │                        [ Enregistrer les modifications ]     │   │
  │  └──────────────────────────────────────────────────────────────┘   │
  │                                                                      │
  │  ┌──────────────────────────────────────────────────────────────┐   │
  │  │  CHANGER MON MOT DE PASSE                                    │   │
  │  │                                                               │   │
  │  │  Mot de passe actuel *     [________________]  [ 👁 ]        │   │
  │  │  Nouveau mot de passe *    [________________]  [ 👁 ]        │   │
  │  │  Confirmer le nouveau *    [________________]  [ 👁 ]        │   │
  │  │                                                               │   │
  │  │  ████████░░  Force : Fort                                    │   │
  │  │                                                               │   │
  │  │                   [ Changer le mot de passe ]                │   │
  │  └──────────────────────────────────────────────────────────────┘   │
  │                                                                      │
  │  ┌──────────────────────────────────────────────────────────────┐   │
  │  │  ACTIVITÉ RÉCENTE                                            │   │
  │  │                                                               │   │
  │  │  17/01 14:32  Connexion depuis +243 81 XXX XXXX (Android)   │   │
  │  │  17/01 11:15  Vente GOM-202501-047 créée (513 950 CDF)       │   │
  │  │  16/01 09:20  Connexion depuis +243 81 XXX XXXX (Android)   │   │
  │  │               [ Voir tout l'historique ]                     │   │
  │  └──────────────────────────────────────────────────────────────┘   │
  └──────────────────────────────────────────────────────────────────────┘


COMPOSANT ProfileInfoForm — ProfileInfoForm.tsx
-------------------------------------------------
Formulaire d'édition des informations personnelles :

  Champs ÉDITABLES :
    Prénom *       : Input text (min 2 chars)
    Nom *          : Input text (min 2 chars)
    Email          : Input email (optionnel)
    Langue         : Select → Français (fr) | Swahili (sw) [si disponible]

  Champs NON ÉDITABLES (affichage only) :
    Téléphone : texte grisé + icône Lock + tooltip "Contactez un Super Admin
                pour modifier votre numéro."
    Rôle      : UserRoleBadge (read-only)
    Site      : texte du site (read-only)

  Validation Zod :
    const profileInfoSchema = z.object({
      prenom: z.string().min(2).max(50),
      nom: z.string().min(2).max(50),
      email: z.string().email('Format email invalide').optional().or(z.literal('')),
      langue: z.enum(['fr', 'sw']).default('fr'),
    });

  Comportement isDirty :
    Le bouton "Enregistrer" est DISABLED si aucune modification (isDirty=false).
    Le bouton est ACTIF dès qu'au moins un champ change.

  Succès :
    Toast vert "Profil mis à jour."
    Le header de l'application se met à jour avec le nouveau nom (authStore.setUser)


COMPOSANT ChangePasswordForm — ChangePasswordForm.tsx
-------------------------------------------------------
  Validation Zod :
    const changePasswordSchema = z.object({
      currentPassword: z.string().min(6, 'Requis'),
      newPassword: z.string().min(8, 'Minimum 8 caractères'),
      confirmPassword: z.string().min(8),
    })
    .refine(
      (d) => d.newPassword === d.confirmPassword,
      { message: "Les mots de passe ne correspondent pas.", path: ["confirmPassword"] }
    )
    .refine(
      (d) => d.newPassword !== d.currentPassword,
      { message: "Le nouveau mot de passe doit être différent de l'actuel.", path: ["newPassword"] }
    );

  Composant PasswordStrength importé depuis le Module Auth (apps/client/src/components/auth/).

  Toggle visibilité (icône œil) sur les 3 champs.

  États :
    Chargement : spinner sur le bouton, champs disabled
    Erreur 401 (MDP actuel incorrect) :
      Alert rouge sous "Mot de passe actuel" :
      "Mot de passe actuel incorrect."
    Succès :
      Toast vert "Mot de passe changé avec succès."
      Les 3 champs vidés automatiquement
      Alert info bleue : "Pour votre sécurité, vous serez redirigé vers la
      page de connexion dans 5 secondes."
      Countdown visible 5…4…3…2…1 puis logout() + navigate('/login')

  Note : après un changement de MDP → invalider TOUS les tokens de la session
  (appel POST /api/v1/auth/logout-all depuis le back-end).


COMPOSANT ProfileActivityLog — ProfileActivityLog.tsx
-------------------------------------------------------
Historique des 10 dernières actions de l'utilisateur :

  interface ActivityEntry {
    id: string;
    type: 'CONNEXION' | 'VENTE' | 'CLIENT_CREE' | 'STOCK_ENTREE' | 'CONFIG_MODIF';
    description: string;
    createdAt: string;
    ipAddress?: string;         // masqué partiellement : "XX.XX.XXX.XXX"
    userAgent?: string;         // simplifié : "Android Chrome" ou "iOS Safari"
  }

Chaque entrée :
  - Icône selon type (LogIn, ShoppingCart, UserPlus, Package, Settings2)
  - Description en text-sm
  - Date/heure relative : "Il y a 2h" + date complète en tooltip
  - Si CONNEXION : IP masquée + user agent simplifié

Bouton "Voir tout l'historique" → (optionnel pour v1 : désactiver avec tooltip
"Disponible dans une prochaine version")


COMPOSANT AvatarUpload — AvatarUpload.tsx
-------------------------------------------
Upload optionnel d'une photo de profil :

  interface AvatarUploadProps {
    currentInitials: string;         // "JB" si pas de photo
    currentAvatarUrl?: string;
    onChange: (file: File) => void;
    onRemove: () => void;
  }

Contenu :
  - Cercle 80×80px avec initiales ou photo si disponible
  - Bouton "📷 Changer la photo" au hover (overlay semi-transparent)
  - Clic → Input file (accept="image/jpeg,image/png,image/webp" max 2MB)
  - Preview immédiate avant upload
  - Bouton "Supprimer la photo" (si photo présente)

Note v1 : L'upload de photo est optionnel et peut être dépriorisé.
Si pas de photo → afficher les initiales sur fond coloré (#1E3A5F).


HOOK useProfile — useProfile.ts
---------------------------------
  export function useProfile() {
    const { user } = useAuth();

    const { data: profile, isLoading } = useQuery({
      queryKey: ['profile', user?.id],
      queryFn: () => usersApi.getMe(),
      staleTime: 5 * 60_000,
      enabled: !!user?.id,
    });

    const { data: activity } = useQuery({
      queryKey: ['profile', 'activity', user?.id],
      queryFn: () => usersApi.getMyActivity(),
      staleTime: 2 * 60_000,
    });

    const updateMutation = useMutation({
      mutationFn: (dto: UpdateProfileDto) => usersApi.updateMe(dto),
      onSuccess: (data) => {
        authStore.setUser(data.user);   // mettre à jour le store auth global
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success("Profil mis à jour.");
      },
    });

    const changePasswordMutation = useMutation({
      mutationFn: (dto: ChangePasswordDto) => usersApi.changeMyPassword(dto),
      onSuccess: () => {
        toast.success("Mot de passe changé. Déconnexion dans 5 secondes...");
        setTimeout(() => { authStore.logout(); navigate('/login'); }, 5000);
      },
    });

    return { profile, activity, isLoading,
             updateProfile: updateMutation.mutate,
             changePassword: changePasswordMutation.mutate,
             isUpdating: updateMutation.isPending,
             isChangingPassword: changePasswordMutation.isPending };
  }


APPELS API
-----------
GET /api/v1/users/me
  Succès 200 :
    {
      user: UserInternal + { createdAt, lastLoginAt, forcePasswordChange }
    }

PATCH /api/v1/users/me
  Corps :
    { prenom?: string, nom?: string, email?: string, langue?: 'fr' | 'sw' }
  Succès 200 :
    { user: UserInternal }
  Note : le téléphone, rôle et siteId ne sont pas modifiables via cette route

PATCH /api/v1/users/me/password
  Corps :
    { currentPassword: string, newPassword: string }
  Succès 200 :
    { success: true }
  Erreur 401 :
    { error: { code: 'WRONG_CURRENT_PASSWORD' } }
  Erreur 400 :
    { error: { code: 'PASSWORD_TOO_WEAK' } }
  Erreur 422 :
    { error: { code: 'SAME_AS_CURRENT' } }

  Back-end — users.service.ts — méthode changeMyPassword() :
    1. Vérifier l'ancien mot de passe avec bcrypt.compare
    2. Vérifier que le nouveau est différent de l'actuel
    3. Vérifier la force du mot de passe (min 8 chars, au moins 1 chiffre)
    4. Hasher avec bcrypt (rounds=12)
    5. UPDATE user.password + forcePasswordChange=false
    6. Invalider TOUS les refreshTokens de cet utilisateur (sécurité)

GET /api/v1/users/me/activity
  Succès 200 :
    { activities: [ActivityEntry], total: number }


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - Skeleton du header profil (avatar + nom + rôle)
  - Skeleton du formulaire (4 inputs)
  - Skeleton de l'activité (3 lignes)

État 2 — PROFIL CHARGÉ — AUCUNE MODIFICATION
  - Bouton "Enregistrer" disabled
  - Formulaire avec les vraies données de l'utilisateur

État 3 — MODIFICATION EN COURS
  - Bouton "Enregistrer" actif (isDirty = true)
  - Pas de badge "non sauvegardé" (moins critique que les configs globales)

État 4 — FORÇAGE CHANGEMENT MDP (forcePasswordChange=true)
  - Alert bleue persistante en haut de la page :
    "⚠ Vous devez changer votre mot de passe temporaire avant de continuer."
  - La section ChangePasswordForm est mise en surbrillance (ring-2 ring-blue-500)
  - L'utilisateur NE PEUT PAS naviguer vers d'autres pages tant que non changé
    (ProtectedRoute vérifie forcePasswordChange depuis le store auth)

État 5 — MDP CHANGÉ AVEC SUCCÈS
  - Toast vert + countdown visible 5…4…3…2…1
  - Déconnexion automatique + redirect vers /login


TESTS — ProfilePage.test.tsx
------------------------------
  describe('ProfilePage', () => {
    describe('Formulaire profil', () => {
      test('1  — Formulaire pré-rempli avec les données de l\'utilisateur')
      test('2  — Bouton "Enregistrer" disabled si aucune modification')
      test('3  — Bouton actif après modification d\'un champ')
      test('4  — Champs téléphone, rôle, site en lecture seule')
      test('5  — Toast vert après sauvegarde réussie')
      test('6  — authStore.setUser appelé après succès pour mettre à jour le header')
    })

    describe('Changement de mot de passe', () => {
      test('7  — Toggle visibilité sur les 3 champs')
      test('8  — Erreur si MDP de confirmation différent')
      test('9  — Erreur si nouveau MDP identique à l\'actuel')
      test('10 — Erreur 401 MDP actuel incorrect : message sous le champ')
      test('11 — Succès : toast + countdown 5s + déconnexion automatique')
      test('12 — PasswordStrength mis à jour en temps réel')
    })

    describe('Forçage changement MDP', () => {
      test('13 — Alert bleue visible si forcePasswordChange=true')
      test('14 — Navigation bloquée si forcePasswordChange=true')
    })

    describe('Activité récente', () => {
      test('15 — 10 dernières activités affichées avec icônes')
      test('16 — IP et user agent affichés pour les connexions')
    })

    describe('Accès', () => {
      test('17 — Accessible à tous les rôles internes (AGENT, GERANT, etc.)')
      test('18 — Skeleton visible pendant le chargement')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-041
---------------------------------------------
[ ] Formulaire pré-rempli avec les données réelles de l'utilisateur
[ ] Téléphone, rôle et site sont en lecture seule avec tooltip explicatif
[ ] Bouton "Enregistrer" disabled si aucune modification (isDirty)
[ ] La sauvegarde met à jour le store auth (authStore.setUser)
[ ] Les 3 champs MDP ont le toggle de visibilité
[ ] L'indicateur de force du MDP se met à jour en temps réel
[ ] L'erreur "MDP actuel incorrect" s'affiche sous le bon champ
[ ] Après changement MDP : countdown visible + déconnexion automatique à 0
[ ] L'Alert de forçage MDP bloque la navigation si active
[ ] L'historique des activités s'affiche avec icônes et dates relatives
[ ] npm run test : 18 tests ProfilePage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 4 — SCR-042 : CONFIGURATION GÉNÉRALE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet        : Progress Business
Fichier cible : apps/client/src/pages/settings/GeneralConfigPage.tsx
Route         : /settings/general
Accès         : Authentifié — rôle SUPER_ADMIN uniquement
Rôle minimum  : SUPER_ADMIN
Dépendances   : SCR-039 terminé (usersApi, UserRoleBadge)
                SCR-040 terminé (sitesApi)
                Module Parrainage terminé (RegleParrainage reference)
                Module Fidélité terminé (FideliteConfig reference)


OBJECTIF
--------
Créer la page de configuration générale de l'application (SCR-042).
C'est l'écran central pour le Super Admin qui regroupe tous les paramètres
systèmes : intégration SMS, intégration matricule externe, durée de session,
politique de retours, sauvegarde, et informations de l'application.
C'est le DERNIER écran à développer — il consolide tous les autres modules.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/settings/GeneralConfigPage.tsx               ← CRÉER (principal)
2. apps/client/src/pages/settings/GeneralConfigPage.test.tsx          ← CRÉER (tests Vitest)
3. apps/client/src/components/settings/SmsConfigSection.tsx           ← CRÉER (config SMS)
4. apps/client/src/components/settings/MatriculeConfigSection.tsx     ← CRÉER (config matricule)
5. apps/client/src/components/settings/SessionConfigSection.tsx       ← CRÉER (config session)
6. apps/client/src/components/settings/RetourConfigSection.tsx        ← CRÉER (config retours)
7. apps/client/src/components/settings/BackupSection.tsx              ← CRÉER (sauvegarde)
8. apps/client/src/components/settings/AppInfoSection.tsx             ← CRÉER (infos app)
9. apps/client/src/hooks/useGeneralConfig.ts                          ← CRÉER (hook TQ)
10. packages/shared/src/types/config.types.ts                         ← CRÉER (interfaces TS)

BACK-END :
11. apps/server/src/modules/config/config.module.ts                   ← CRÉER
12. apps/server/src/modules/config/config.controller.ts               ← CRÉER
13. apps/server/src/modules/config/config.service.ts                  ← CRÉER
14. apps/server/src/modules/config/dto/update-config.dto.ts           ← CRÉER


UI — STRUCTURE VISUELLE COMPLÈTE
----------------------------------
  ┌──────────────────────────────────────────────────────────────────────┐
  │  Configuration générale                                              │
  │                            [ ⚠ Non sauvegardé ] [ Enregistrer tout ]│
  ├──────────────────────────────────────────────────────────────────────┤
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  📱 INTÉGRATION SMS (Africa's Talking)              ● Actif │    │
  │  │                                                              │    │
  │  │  API Key *      [••••••••••••••••••••] [ Afficher ] [ Test ] │    │
  │  │  Username *     [progress_business_goma                     ]        │    │
  │  │  Sender ID      [ProgressBiz                       ]        │    │
  │  │  Env.           ○ Sandbox  ●Production                      │    │
  │  │                                                              │    │
  │  │  ✓ SMS OTP reset MDP         ✓ SMS reçu client              │    │
  │  │  ✓ SMS bienvenue activation  ☐ SMS alerte stock             │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  🎫 INTÉGRATION MATRICULE EXTERNE           ● Activée       │    │
  │  │                                                              │    │
  │  │  Activer l'intégration    ◉ Oui  ○ Non                      │    │
  │  │  Format attendu (regex)   [NK-[A-Z]{3}-[0-9]{3}-[0-9]{4}]  │    │
  │  │  Exemple valide           [NK-GOM-001-0001                  ]│    │
  │  │                           ✓ Format valide                    │    │
  │  │  Rendre obligatoire       ○ Oui  ● Non (optionnel)          │    │
  │  │  Description du matricule [Numéro dossier partenaire        ]│    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  🔐 SÉCURITÉ & SESSIONS                                     │    │
  │  │                                                              │    │
  │  │  Durée de session        [8h ▼]  (1h | 4h | 8h | 24h)      │    │
  │  │  Durée token refresh     [7j ▼]  (1j | 7j | 30j)           │    │
  │  │  Max. tentatives login   [ 5  ]  avant blocage              │    │
  │  │  Durée blocage login     [15  ] minutes                     │    │
  │  │  Token offline valide    [ 8  ] heures max                  │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  ↩ POLITIQUE DE RETOURS                                     │    │
  │  │                                                              │    │
  │  │  Délai max. retour       [ 7  ] jours après la vente        │    │
  │  │  Frais de retour         [ 0  ] % du montant retourné       │    │
  │  │  Autoriser retours partiels  ◉ Oui  ○ Non                  │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  💾 SAUVEGARDE                                              │    │
  │  │                                                              │    │
  │  │  Dernière sauvegarde : 17/01/2025 à 03:00 (automatique)     │    │
  │  │  Prochaine sauvegarde : 18/01/2025 à 03:00                  │    │
  │  │                                                              │    │
  │  │  [ ↓ Télécharger le backup maintenant ]                    │    │
  │  │  [ ▶ Déclencher une sauvegarde manuelle ]                   │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │                                                                      │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │  ℹ INFORMATIONS DE L'APPLICATION                           │    │
  │  │  Version : 1.0.0 | Déployé le : 15/01/2025                 │    │
  │  │  Serveur : api.progress_business.cd | Base : PostgreSQL 15           │    │
  │  │  Environnement : Production                                 │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  └──────────────────────────────────────────────────────────────────────┘


TYPES TYPESCRIPT — config.types.ts
-------------------------------------
  export interface AppConfig {
    // SMS
    sms: {
      actif: boolean;
      apiKey: string;              // stocké chiffré en base, retourné masqué à l'API
      username: string;
      senderId: string;
      environnement: 'sandbox' | 'production';
      types: {
        otpResetMdp: boolean;
        recuClient: boolean;
        bienvenueActivation: boolean;
        alerteStock: boolean;
      };
    };

    // Matricule externe
    matricule: {
      actif: boolean;
      regexFormat: string;
      description: string;
      obligatoire: boolean;
    };

    // Sécurité
    securite: {
      sessionDureeHeures: 1 | 4 | 8 | 24;
      refreshTokenDureeJours: 1 | 7 | 30;
      maxTentativesLogin: number;          // 3-10
      dureeBlocageMinutes: number;         // 5-60
      offlineTokenDureeHeures: number;     // 1-24
    };

    // Retours
    retours: {
      delaiMaxJours: number;               // 1-30
      fraisPct: number;                    // 0-25
      autoriserPartiels: boolean;
    };

    // Meta
    updatedAt: string;
    updatedBy: { id: string; nom: string; prenom: string };
  }

  export interface BackupInfo {
    lastBackupAt: string;
    nextBackupAt: string;
    sizeBytes: number;
    status: 'SUCCESS' | 'RUNNING' | 'FAILED';
  }

  export interface AppInfo {
    version: string;
    deployedAt: string;
    serverUrl: string;
    dbVersion: string;
    environment: 'development' | 'staging' | 'production';
    nodeVersion: string;
  }


COMPOSANT SmsConfigSection — SmsConfigSection.tsx
---------------------------------------------------
  Champs :
    Toggle "Activer l'intégration SMS" (Switch shadcn)
    API Key : Input type="password" avec bouton [Afficher] (toggle)
      → Valeur retournée masquée par l'API "sk_•••••••••••••••••••" (sauf si Afficher)
      → Input en rouge si la valeur commence par "sk_live_" ET environnement=sandbox
      → Bouton [Tester la connexion] → POST /api/v1/config/sms/test → toast résultat
    Username : Input text
    Sender ID : Input text (max 11 chars — limite Africa's Talking)
    Environnement : RadioGroup Sandbox / Production
    Checkboxes des 4 types de SMS

  Bouton [Tester la connexion SMS] :
    → Appel API test → envoie un SMS de test au numéro du Super Admin connecté
    → Succès : toast vert "SMS de test envoyé à +243 XX *** XXXX"
    → Erreur : toast rouge avec le message d'erreur Africa's Talking
    → Durée timeout : 10s


COMPOSANT MatriculeConfigSection — MatriculeConfigSection.tsx
-------------------------------------------------------------
  Champs :
    Toggle "Activer l'intégration" (Switch)
    Champ regex : Input text (ex: "NK-[A-Z]{3}-[0-9]{3}-[0-9]{4}")
    Champ exemple : Input text pour tester le regex en temps réel
    Indicateur validation regex :
      ✓ "Format valide" en vert si l'exemple match le regex
      ✗ "Format invalide" en rouge si ça ne match pas
      → Computed en temps réel avec useMemo(() => new RegExp(regex).test(exemple))
      → Si le regex lui-même est invalide → "Expression régulière invalide" en rouge
    Toggle "Rendre le matricule obligatoire" (Switch)
    Description : Input text (libellé affiché aux agents dans SCR-007)


COMPOSANT SessionConfigSection — SessionConfigSection.tsx
-----------------------------------------------------------
  Champs :
    Durée de session : Select [1h | 4h | 8h | 24h]
    Durée refresh token : Select [1 jour | 7 jours | 30 jours]
    Max tentatives login : Input number (min 3, max 10)
    Durée blocage : Input number (min 5, max 60) + "minutes"
    Token offline valide : Input number (min 1, max 24) + "heures"

  Note informative :
    Alert info bleue : "Modifier la durée de session déconnectera tous les
    utilisateurs actuellement connectés à l'expiration de leur token actuel."


COMPOSANT RetourConfigSection — RetourConfigSection.tsx
---------------------------------------------------------
  Champs :
    Délai max retour : Input number (min 1, max 30) + "jours"
    Frais de retour : Input number (min 0, max 25, step 0.5) + "%"
      → Si > 0 : Alert info "Ces frais seront déduits du montant remboursé."
    Autoriser retours partiels : RadioGroup Oui / Non

  Validation croisée :
    Si autoriserPartiels=false ET fraisPct > 0 :
      Alert orange : "Les frais de retour ne s'appliquent que si les retours
      partiels sont autorisés."


COMPOSANT BackupSection — BackupSection.tsx
--------------------------------------------
  interface BackupSectionProps {
    backupInfo: BackupInfo;
    onDownload: () => void;
    onTriggerBackup: () => void;
  }

  Contenu :
    - Dernière sauvegarde : date + taille formatée (ex: "45.2 MB")
    - Prochaine sauvegarde automatique (03:00 chaque nuit)
    - Badge statut : SUCCESS=vert, RUNNING=bleu spinner, FAILED=rouge

  Bouton [↓ Télécharger le backup] :
    → GET /api/v1/config/backup/download
    → Téléchargement direct du fichier .zip
    → Toast : "Préparation du backup… cela peut prendre 30 secondes."
    → Timeout : 60s (les backups peuvent être volumineux)

  Bouton [▶ Sauvegarde manuelle maintenant] :
    → POST /api/v1/config/backup/trigger
    → Déclenche un job async côté serveur
    → Toast : "Sauvegarde lancée. Vous serez notifié par e-mail à la fin."
    → Polling du statut toutes les 5s pendant max 2 minutes
    → Si statut=SUCCESS : toast vert "Sauvegarde terminée. [X MB]"
    → Si statut=FAILED : toast rouge "Échec de la sauvegarde. Contactez l'administrateur."


COMPOSANT AppInfoSection — AppInfoSection.tsx
-----------------------------------------------
  Informations en lecture seule (pas d'édition possible) :
    - Version de l'app (depuis import.meta.env.VITE_APP_VERSION)
    - Date de déploiement (depuis AppInfo)
    - URL du serveur API (depuis AppInfo)
    - Version PostgreSQL (depuis AppInfo)
    - Environnement avec badge coloré :
        development → Badge orange "Dev"
        staging     → Badge jaune  "Staging"
        production  → Badge vert   "Production"
    - Version Node.js (depuis AppInfo)


HOOK useGeneralConfig — useGeneralConfig.ts
---------------------------------------------
  export function useGeneralConfig() {
    const configQuery = useQuery({
      queryKey: ['config', 'general'],
      queryFn: () => configApi.get(),
      staleTime: 10 * 60_000,
    });

    const backupQuery = useQuery({
      queryKey: ['config', 'backup'],
      queryFn: () => configApi.getBackupInfo(),
      staleTime: 2 * 60_000,
      refetchInterval: (data) => data?.status === 'RUNNING' ? 5000 : false,
    });

    const appInfoQuery = useQuery({
      queryKey: ['config', 'app-info'],
      queryFn: () => configApi.getAppInfo(),
      staleTime: 60 * 60_000,       // 1 heure
    });

    const updateMutation = useMutation({
      mutationFn: (dto: Partial<AppConfig>) => configApi.update(dto),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['config'] });
        // Si durée de session changée → informer le store auth
        if (data.securite?.sessionDureeHeures) {
          authStore.updateSessionDuration(data.securite.sessionDureeHeures);
        }
        toast.success("Configuration enregistrée avec succès.");
      },
    });

    return {
      config, backupInfo, appInfo,
      isLoading: configQuery.isLoading,
      saveConfig: updateMutation.mutate,
      isSaving: updateMutation.isPending,
    };
  }

Gestion du formulaire global :
  Utiliser react-hook-form avec un seul grand formulaire englobant toutes les sections.
  Chaque section est un fieldset logique dans le même formulaire.
  Un seul bouton "Enregistrer tout" en haut de la page (sticky dans le header).
  Le badge "Non sauvegardé" apparaît dès qu'une valeur change (isDirty).


APPELS API
-----------
GET /api/v1/config
  Succès 200 :
    { config: AppConfig }   (apiKey masquée : "sk_•••••••••••••••")

PUT /api/v1/config
  Corps : Partial<AppConfig>   (si apiKey n'a pas changé → ne pas l'envoyer)
  Succès 200 :
    { config: AppConfig, modifiedFields: string[] }
  Erreur 400 :
    { error: { code: 'INVALID_REGEX', field: 'matricule.regexFormat' } }

POST /api/v1/config/sms/test
  Succès 200 :
    { success: true, smsSentTo: string }    // numéro masqué
  Erreur 503 :
    { error: { code: 'SMS_TEST_FAILED', atError: string } }

GET /api/v1/config/backup
  Succès 200 : { backup: BackupInfo }

POST /api/v1/config/backup/trigger
  Succès 202 :
    { jobId: string, message: "Sauvegarde démarrée" }
  → Polling : GET /api/v1/config/backup/status/:jobId

GET /api/v1/config/backup/download
  Succès : Fichier binaire (application/zip)
  Headers : Content-Disposition: attachment; filename="backup-progress-business-20250117.zip"

GET /api/v1/config/app-info
  Succès 200 :
    { appInfo: AppInfo }

Back-end — config.service.ts — méthode update() :
  1. Vérifier rôle SUPER_ADMIN
  2. Valider les champs (regex matricule, valeurs numériques)
  3. Si apiKey présente (non masquée) → chiffrer avant de stocker (AES-256)
  4. UPDATE AppConfig en base
  5. Créer un log de modification (table ConfigHistory)
  6. Invalider le cache Redis des configs
  7. Retourner config mise à jour (apiKey re-masquée)


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - Skeleton de chaque section (Card skeleton h-40)

État 2 — CONFIG CHARGÉE — AUCUNE MODIFICATION
  - Badge "Non sauvegardé" MASQUÉ
  - Bouton "Enregistrer tout" DISABLED

État 3 — FORMULAIRE MODIFIÉ
  - Badge "⚠ Non sauvegardé" VISIBLE dans le header (sticky)
  - Bouton "Enregistrer tout" ACTIF
  - Bouton "Annuler" VISIBLE → reset() du formulaire

État 4 — TEST SMS EN COURS
  - Spinner sur le bouton [Tester la connexion]
  - Bouton désactivé pendant le test

État 5 — VALIDATION REGEX MATRICULE
  - Résultat mis à jour en temps réel via useMemo (pas d'appel API)
  - Vert si l'exemple match le regex
  - Rouge si l'exemple ne match pas
  - Rouge avec message "Expression invalide" si le regex lui-même est malformé

État 6 — SAUVEGARDE BACKUP EN COURS
  - Badge "RUNNING" + spinner sur le bouton
  - Polling automatique toutes les 5s
  - Toast vert ou rouge selon le résultat final

État 7 — ENREGISTREMENT CONFIG EN COURS
  - Spinner sur "Enregistrer tout"
  - Toute la page disabled (pointer-events-none, opacity-80)

État 8 — SUCCÈS ENREGISTREMENT
  - Toast vert "Configuration enregistrée avec succès."
  - Badge "Non sauvegardé" MASQUÉ
  - isDirty revient à false


STYLE ET DESIGN
-----------------
- Fond page              : bg-neutral-50
- Sections Card          : bg-white border border-neutral-100 rounded-xl shadow-sm p-6 mb-4
- Header sticky          : bg-white border-b border-neutral-200 px-6 py-3 -mx-6 mb-6
- Badge "non sauvegardé" : bg-yellow-100 text-yellow-800 border border-yellow-300
- Toggle actif           : Utiliser Switch shadcn (vert quand ON)
- Input API Key masqué   : font-family monospace, letter-spacing 0.1em
- Indicateur regex ✓     : text-green-600 text-sm
- Indicateur regex ✗     : text-red-600 text-sm
- Badge env Production   : bg-green-100 text-green-800
- Badge env Dev/Staging  : bg-orange-100 text-orange-800


TESTS — GeneralConfigPage.test.tsx
-------------------------------------
  describe('GeneralConfigPage', () => {
    describe('Chargement', () => {
      test('1  — Skeleton de chaque section visible pendant le chargement')
      test('2  — Formulaire pré-rempli avec la config actuelle')
      test('3  — Bouton "Enregistrer" disabled si aucun changement')
    })

    describe('Section SMS', () => {
      test('4  — Toggle SMS : activer/désactiver change le badge statut')
      test('5  — API Key masquée par défaut, bouton Afficher fonctionne')
      test('6  — Sender ID limité à 11 caractères')
      test('7  — Bouton Test SMS : spinner + toast vert si succès')
      test('8  — Bouton Test SMS : toast rouge si erreur AT')
    })

    describe('Section Matricule', () => {
      test('9  — Toggle activer/désactiver masque/affiche les autres champs')
      test('10 — Indicateur regex vert si exemple match le format')
      test('11 — Indicateur rouge si exemple ne match pas')
      test('12 — Indicateur "Expression invalide" si regex malformé')
    })

    describe('Section Sécurité', () => {
      test('13 — Alert bleue si durée de session modifiée')
      test('14 — Max tentatives : min 3, max 10')
    })

    describe('Section Retours', () => {
      test('15 — Alert orange si fraisPct > 0 ET partiels=false')
    })

    describe('Section Backup', () => {
      test('16 — Dernière sauvegarde et taille affichées')
      test('17 — Bouton "Sauvegarde manuelle" lance le polling')
      test('18 — Toast vert après sauvegarde réussie')
    })

    describe('Sauvegarde formulaire', () => {
      test('19 — Badge "Non sauvegardé" visible après modification')
      test('20 — Bouton "Annuler" remet toutes les valeurs initiales')
      test('21 — Enregistrement réussi : toast vert + badge disparaît')
      test('22 — Erreur regex invalide : message sur le champ concerné')
    })

    describe('App Info', () => {
      test('23 — Version, env., serveur affichés en lecture seule')
      test('24 — Badge "Production" vert si environment=production')
    })

    describe('Accès', () => {
      test('25 — Rôle non SUPER_ADMIN → redirect /dashboard')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-042
---------------------------------------------
[ ] Toutes les sections s'affichent avec les données réelles au chargement
[ ] Le badge "Non sauvegardé" apparaît dès qu'une valeur est modifiée
[ ] Le bouton "Annuler" restaure toutes les valeurs sans rechargement
[ ] La section SMS : toggle, API Key masquée, bouton Test fonctionnent
[ ] Le test SMS envoie un vrai SMS au numéro du Super Admin (en staging)
[ ] Le validateur regex matricule fonctionne en temps réel (useMemo)
[ ] La durée de session entraîne l'Alert bleue si modifiée
[ ] La section backup affiche les dates et déclenche le polling
[ ] Le téléchargement du backup fonctionne (fichier .zip)
[ ] L'enregistrement global sauvegarde toutes les sections en une seule requête
[ ] La section App Info est en lecture seule avec badge env coloré
[ ] npm run test : 25 tests GeneralConfigPage.test.tsx ✓
```

---

## RÉCAPITULATIF DES 4 PROMPTS — MODULE PARAMÈTRES

| N° | Écran   | Route                | Fichier principal                                    | Priorité | Durée est. |
|----|---------|----------------------|------------------------------------------------------|----------|------------|
| 1  | SCR-039 | /settings/users      | pages/settings/UsersPage.tsx                         | **P0**   | ~4-5h      |
| 2  | SCR-040 | /settings/sites      | pages/settings/SitesPage.tsx                         | **P0**   | ~3-4h      |
| 3  | SCR-041 | /settings/profile    | pages/settings/ProfilePage.tsx                       | **P0**   | ~2-3h      |
| 4  | SCR-042 | /settings/general    | pages/settings/GeneralConfigPage.tsx                 | **P1**   | ~5-6h      |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Prompt 1 (SCR-039 Gestion Utilisateurs)
  ↓ Crée : UserRoleBadge (réutilisable partout), usersApi,
            CreateUserDialog, UserActionsMenu, users.types.ts
  ↓
Prompt 2 (SCR-040 Gestion Sites)
  ↓ Utilise : usersApi (pour les gérants), UserRoleBadge
  ↓ Crée    : SiteCard, CreateSiteDialog, EditSiteDialog, sitesApi, sites.types.ts
  ↓
Prompt 3 (SCR-041 Profil Utilisateur)
  ↓ Utilise : useAuth (Module Auth), UserRoleBadge, PasswordStrength (Module Auth)
  ↓ Crée    : ProfileInfoForm, ChangePasswordForm, ProfileActivityLog
  ↓
Prompt 4 (SCR-042 Configuration Générale)
  ↓ Utilise : sitesApi, usersApi, types de tous les modules (config globale)
  ↓ Crée    : SmsConfigSection, MatriculeConfigSection, SessionConfigSection,
               RetourConfigSection, BackupSection, AppInfoSection, config.types.ts

  → MODULE PARAMÈTRES COMPLET
  → APPLICATION PROGRESS BUSINESS COMPLÈTE (42 écrans / 10 modules)
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. UserRoleBadge — COMPOSANT GLOBAL CRITIQUE :
   → UserRoleBadge est utilisé dans TOUS les modules qui affichent des utilisateurs
     (Dashboard, Fiche Client, Header, Rapports...).
   → À créer en premier dans SCR-039 et partager immédiatement.
   → Exporter aussi getRoleLabel() et getRoleColor() depuis users.types.ts.

2. SÉCURITÉ CHIFFREMENT API KEY SMS :
   → La clé API Africa's Talking est une donnée SENSIBLE.
   → Ne JAMAIS la retourner en clair via l'API.
   → Stocker chiffrée en base (AES-256-GCM avec une clé dérivée de JWT_SECRET).
   → Retourner TOUJOURS masquée : "sk_•••••••••••••••••••" (10 caractères visibles max).
   → Pour modifier la clé : envoyer la nouvelle valeur démasquée dans le body.
   → Si le body contient "sk_•••" → considérer que la clé n'a pas changé.

3. FORÇAGE CHANGEMENT MDP — INTÉGRATION GLOBALE :
   → SCR-041 gère forcePasswordChange=true (MDP temporaire reçu par SMS).
   → La vérification doit se faire dans ProtectedRoute (Module Auth) :
     Si authStore.user.forcePasswordChange → redirect vers /settings/profile
     QUELLE QUE SOIT la route demandée (sauf /settings/profile lui-même).
   → Mettre à jour ProtectedRoute.tsx créé dans SCR-001 pour ajouter cette logique.

4. INVALIDATION CACHE APRÈS CONFIG GÉNÉRALE :
   → Après PUT /api/v1/config → invalider les queryKeys suivants :
     ['sites'] (si config sites changée)
     ['parrainage', 'config'] (si retours changés)
     ['fidelite', 'config'] (si session changée)
     Toutes les queries de l'app utilisent ces configs — purger soigneusement.

5. BACKUP — GESTION DE LA TAILLE :
   → Les backups de base de données peuvent atteindre plusieurs centaines de MB.
   → Le téléchargement via l'API (GET /backup/download) peut timeout.
   → Alternative recommandée : générer le backup, stocker sur S3/Minio,
     retourner une URL signée de téléchargement (expiration 1h).
   → Plus robuste que le streaming direct depuis l'API.

6. REGEX MATRICULE — SÉCURITÉ :
   → Un regex malformé peut causer des ReDOS (Regular Expression Denial of Service).
   → Côté back-end : valider le regex avec un timeout ou utiliser safe-regex npm.
   → Côté front-end : try/catch autour de new RegExp(regex) pour gérer les erreurs.

7. COHÉRENCE GLOBALE — DERNIER MODULE :
   → SCR-042 est le DERNIER écran développé.
   → Après sa completion : faire un test de bout-en-bout complet :
     Créer un site → Créer un agent → Créer un client → Vente → Retour → Rapport.
   → Vérifier que tous les sélecteurs de site dans l'app reflètent les sites de SCR-040.
   → Vérifier que la durée de session de SCR-042 s'applique réellement aux tokens.
```

---

## RÉSUMÉ FINAL — PROGRESS BUSINESS COMPLET

```
Modules terminés après ce fichier :
  ✓ Module Auth          (SCR-001 à SCR-002)   — 2 écrans
  ✓ Module Dashboard     (SCR-003 à SCR-004)   — 2 écrans
  ✓ Module Clients       (SCR-005 à SCR-011)   — 7 écrans
  ✓ Module Ventes        (SCR-012 à SCR-016)   — 5 écrans
  ✓ Module Stocks        (SCR-017 à SCR-023)   — 7 écrans
  ✓ Module Parrainage    (SCR-024 à SCR-026)   — 3 écrans
  ✓ Module Fidélité      (SCR-027 à SCR-029)   — 3 écrans
  ✓ Module Rapports      (SCR-030 à SCR-034)   — 5 écrans
  ✓ Module Portail       (SCR-035 à SCR-038)   — 4 écrans
  ✓ Module Paramètres    (SCR-039 à SCR-042)   — 4 écrans
  ─────────────────────────────────────────────────────────
  TOTAL : 10 modules | 42 écrans | Goma, Nord-Kivu, RDC
```

---

*Progress Business — Prompts Développement Module Paramètres SCR-039 à SCR-042 — Goma, RDC — v1.0 — 2025*
