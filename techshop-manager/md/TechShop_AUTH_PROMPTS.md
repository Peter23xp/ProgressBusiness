# 🛒 PROGRESS BUSINESS — PROMPTS DE DÉVELOPPEMENT
## Module AUTH | Écrans SCR-001 & SCR-002

> **MODE D'EMPLOI :**
> Ce fichier contient **2 prompts indépendants**, un par écran du module Auth.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Le Prompt 1 crée les fondations (store, hooks, API client) utilisées par TOUS les autres modules.

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

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 2 — SCR-001 : PAGE DE CONNEXION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/auth/LoginPage.tsx
Route       : /login
Accès       : Public — redirige vers le dashboard si déjà authentifié
Rôle minimum requis : Aucun


OBJECTIF
--------
Crée le composant React complet de la page de connexion (SCR-001).
Ce composant est le POINT D'ENTRÉE UNIQUE de l'application.
Il doit fonctionner en mode connecté ET en mode hors-ligne (offline-first).
Il crée également toute l'infrastructure Auth réutilisée par les modules suivants :
store Zustand, hook useAuth, client Axios, intercepteurs JWT, Dexie schema.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/auth/LoginPage.tsx             ← CRÉER (composant principal)
2. apps/client/src/pages/auth/LoginPage.test.tsx        ← CRÉER (tests Vitest + Testing Library)
3. apps/client/src/stores/auth.store.ts                 ← CRÉER (store Zustand auth)
4. apps/client/src/hooks/useAuth.ts                     ← CRÉER (hook React pour auth)
5. apps/client/src/hooks/useOnlineStatus.ts             ← CRÉER (détection offline)
6. apps/client/src/lib/api.ts                           ← CRÉER (client Axios + intercepteurs)
7. apps/client/src/lib/db.ts                            ← CRÉER (Dexie.js — base locale)
8. apps/client/src/lib/offline-queue.ts                 ← CRÉER (file d'attente sync)
9. apps/client/src/components/ui/OfflineBanner.tsx      ← CRÉER (bannière offline réutilisable)
10. apps/client/src/router/ProtectedRoute.tsx           ← CRÉER (guard de route par rôle)
11. apps/client/src/router/index.tsx                    ← CRÉER (router principal React Router v6)
12. apps/client/src/types/auth.types.ts                 ← CRÉER (interfaces TypeScript Auth)

BACK-END :
13. apps/server/src/modules/auth/auth.module.ts         ← VÉRIFIER / COMPLÉTER
14. apps/server/src/modules/auth/auth.controller.ts     ← VÉRIFIER / COMPLÉTER
15. apps/server/src/modules/auth/auth.service.ts        ← VÉRIFIER / COMPLÉTER
16. apps/server/src/modules/auth/auth.guard.ts          ← VÉRIFIER / COMPLÉTER
17. apps/server/src/modules/auth/jwt.strategy.ts        ← VÉRIFIER / COMPLÉTER
18. apps/server/src/modules/auth/dto/login.dto.ts       ← CRÉER (DTO NestJS)


UI — STRUCTURE VISUELLE
------------------------
La page est centrée verticalement et horizontalement sur fond gris très clair (#F5F5F5).
Elle affiche une carte (Card shadcn) centrale avec ombre douce.

  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │           [ LOGO PROGRESS BUSINESS — SVG ]                │
  │      Système de Gestion Commercial — Goma, RDC           │
  │                                                          │
  │  ┌────────────────────────────────────────────────────┐  │
  │  │  Téléphone ou Email                                │  │
  │  │  [______________________________________________]  │  │
  │  │                                                    │  │
  │  │  Mot de passe                          [ 👁 ]     │  │
  │  │  [______________________________________________]  │  │
  │  │                                                    │  │
  │  │  ☐ Se souvenir de moi    Mot de passe oublié ?    │  │
  │  │                                                    │  │
  │  │          [ SE CONNECTER        ]                  │  │
  │  └────────────────────────────────────────────────────┘  │
  │                                                          │
  │  Hors-ligne ?  [ Continuer sans connexion ]              │
  │  ● En ligne / ● Hors-ligne   |  v1.0 — Progress Business © 2025  │
  └──────────────────────────────────────────────────────────┘

Dimensions de la carte : max-w-md (28rem), padding p-8.
Le logo est un SVG inline avec le texte "Progress Business" en couleur #1E3A5F.
Sous le logo : sous-titre en text-sm text-muted-foreground.


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Card, CardContent, CardHeader, CardTitle   → conteneur principal
- Input                                       → champs texte/password
- Button (variant="default")                  → bouton connexion (bleu #1E3A5F)
- Button (variant="ghost", size="icon")       → toggle visibilité mot de passe
- Checkbox                                    → "Se souvenir de moi"
- Label                                       → labels des champs
- Alert, AlertDescription                     → bloc d'erreur sous le formulaire
- Badge                                       → indicateur statut connexion serveur
- Separator                                   → séparateur visuel


COMPORTEMENTS ET ÉTATS À IMPLÉMENTER (6 états)
------------------------------------------------
État 1 — DÉFAUT
  - Bouton "SE CONNECTER" DÉSACTIVÉ si l'un des deux champs est vide
  - Badge en haut à droite de la carte : "En ligne" (vert) ou "Hors-ligne" (rouge)
  - Le lien "Mot de passe oublié ?" est visible et redirige vers /reset-password
  - Le lien "Continuer sans connexion" est MASQUÉ

État 2 — CHARGEMENT (pendant appel API)
  - Spinner Loader2 (lucide-react, animate-spin) à gauche du texte du bouton
  - Texte du bouton change en "Connexion en cours..."
  - Les deux champs sont disabled
  - Overlay semi-transparent sur la carte (opacity-50, pointer-events-none)

État 3 — ERREUR CREDENTIALS (401)
  - Bloc Alert rouge sous le formulaire :
    "Téléphone/email ou mot de passe incorrect."
  - Compteur de tentatives visible : "Tentative 2 / 5"
  - Les champs restent éditables
  - Focus automatique repositionné sur le champ identifiant
  - Le champ mot de passe est vidé automatiquement

État 4 — VERROUILLAGE (après 5 échecs)
  - Bloc Alert rouge : "Compte temporairement bloqué."
  - Compte à rebours en gras sous le message : "Réessayez dans 14:47"
    → le compte à rebours est mis à jour chaque seconde avec setInterval
  - Les deux champs ET le bouton sont disabled pendant le verrouillage
  - À expiration (0:00) → l'état revient automatiquement à l'État 1

État 5 — ERREUR RÉSEAU / SERVEUR INACCESSIBLE
  - Toast en haut à droite (Sonner) : "Serveur inaccessible. Vérifiez votre connexion."
    Durée : 6 secondes. Variante : warning (fond orange).
  - Le lien "Continuer sans connexion" devient VISIBLE et cliquable
  - Le Badge statut passe à "Hors-ligne" (rouge)

État 6 — MODE HORS-LIGNE (navigator.onLine === false au chargement)
  - Bannière jaune en HAUT de l'écran (hors de la carte, fixe) :
    "⚠ Mode hors-ligne — Données de la dernière session utilisées"
  - Le lien "Continuer sans connexion" est VISIBLE immédiatement
  - La connexion offline utilise le token stocké dans Dexie.js (si valide < 8h)
  - Si aucun token local valide → message "Aucune session locale disponible."


CHAMP IDENTIFIANT — LOGIQUE DE DÉTECTION AUTOMATIQUE
------------------------------------------------------
Le champ accepte DEUX formats — détection automatique en temps réel :

  Format 1 — Téléphone congolais :
    Regex : /^(\+243|0)[0-9]{9}$/
    Exemples valides : +243812345678 | 0812345678
    → Envoyer { phone: "..." } dans le corps de la requête

  Format 2 — Email standard :
    Regex : /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    Exemples valides : agent@progress_business.cd | admin@goma.com
    → Envoyer { email: "..." } dans le corps de la requête

  Affichage visuel sous le champ :
    - Si le format est reconnu → icône verte ✓ + "Format reconnu : Téléphone" ou "Email"
    - Si le format est invalide (>3 chars sans match) → texte rouge "Format non reconnu"
    - Si le champ est vide → aucun message


APPELS API
-----------
POST /api/v1/auth/login
  En-têtes : { "Content-Type": "application/json" }
  Corps :
    {
      identifier: string,        // phone OU email (détecté auto)
      password: string,
      rememberMe: boolean,
      siteId?: string            // optionnel — pré-rempli si cookie site présent
    }
  Succès 200 :
    {
      accessToken: string,
      refreshToken: string,
      expiresIn: number,         // en secondes (ex: 28800 pour 8h)
      user: {
        id: string,
        role: "SUPER_ADMIN" | "DIR_REGIONAL" | "GERANT" | "AGENT" | "FORMATEUR" | "CLIENT",
        nom: string,
        prenom: string,
        siteId: string,
        siteName: string,
        siteVille: string
      }
    }
  Erreur 401 :
    { error: { code: "INVALID_CREDENTIALS", message: string, attemptsLeft: number } }
  Erreur 423 :
    { error: { code: "ACCOUNT_LOCKED", message: string, unlocksAt: string } }
  Erreur 503 :
    Timeout ou réseau inaccessible → déclencher État 5

POST /api/v1/auth/refresh
  Corps : { refreshToken: string }
  Succès 200 : { accessToken: string, expiresIn: number }
  Erreur 401 : { error: { code: "REFRESH_TOKEN_INVALID" } } → forcer logout

GET /api/v1/auth/me
  En-têtes : { Authorization: "Bearer <accessToken>" }
  Succès 200 : { user: User }
  Erreur 401 : → déclencher refresh automatique


LOGIQUE POST-CONNEXION — REDIRECTION PAR RÔLE
----------------------------------------------
Après connexion réussie, sauvegarder le store puis rediriger IMMÉDIATEMENT :

  SUPER_ADMIN   → /dashboard
  DIR_REGIONAL  → /dashboard/regional
  GERANT        → /dashboard
  AGENT         → /sales/pos          ← écran caisse directement
  FORMATEUR     → /clients            ← liste clients directement
  CLIENT        → /portal/home        ← portail client

Si l'URL contient un paramètre ?redirect=/chemin → rediriger vers ce chemin
après connexion (pour les redirections gardées par ProtectedRoute).

Exemple : /login?redirect=/stocks/transfer → après login → /stocks/transfer


STORE ZUSTAND — auth.store.ts
------------------------------
Interface TypeScript complète du store :

  // packages/shared/src/types/auth.types.ts
  export type UserRole =
    | "SUPER_ADMIN" | "DIR_REGIONAL" | "GERANT"
    | "AGENT" | "FORMATEUR" | "CLIENT";

  export interface User {
    id: string;
    role: UserRole;
    nom: string;
    prenom: string;
    siteId: string;
    siteName: string;
    siteVille: string;
  }

  // apps/client/src/stores/auth.store.ts
  interface AuthState {
    // Données
    user: User | null;
    accessToken: string | null;      // EN MÉMOIRE UNIQUEMENT — jamais localStorage
    isAuthenticated: boolean;
    isLoading: boolean;

    // Tentatives de connexion
    loginAttempts: number;
    lockedUntil: Date | null;

    // Mode offline
    isOfflineMode: boolean;
    lastSyncAt: Date | null;

    // Actions
    login: (identifier: string, password: string, rememberMe: boolean) => Promise<void>;
    loginOffline: () => Promise<void>;
    logout: () => void;
    refreshAccessToken: () => Promise<boolean>;
    setUser: (user: User) => void;
    incrementAttempts: () => void;
    resetAttempts: () => void;
    setOfflineMode: (offline: boolean) => void;
  }

Règles IMPÉRATIVES du store :
  ✗ JAMAIS de token dans localStorage ou sessionStorage
  ✓ Le accessToken est stocké UNIQUEMENT dans la mémoire JS du store Zustand
  ✓ Le refreshToken est stocké dans un httpOnly cookie (géré par le serveur)
  ✓ Si rememberMe=true → le serveur prolonge le refreshToken à 30 jours
  ✓ Si rememberMe=false → le serveur règle le refreshToken à 24h
  ✓ Les données USER (id, role, nom, siteId…) sont persistées dans Dexie.js
    pour le mode hors-ligne uniquement
  ✓ À l'initialisation de l'app → tenter un refresh silencieux (GET /api/v1/auth/me)
    Si succès → pré-remplir le store sans passer par la page login


DEXIE.JS — db.ts (BASE LOCALE INDEXEDDB)
-----------------------------------------
Créer le schéma Dexie initial avec les tables nécessaires au module Auth :

  // apps/client/src/lib/db.ts
  import Dexie, { type EntityTable } from 'dexie';

  interface AuthSession {
    id: number;             // toujours 1 (une seule session)
    userId: string;
    userRole: UserRole;
    userNom: string;
    userSiteId: string;
    cachedAt: Date;         // horodatage du dernier cache
    expiresAt: Date;        // cachedAt + 8 heures
  }

  interface OfflineQueue {
    id?: number;            // auto-increment
    endpoint: string;       // ex: "POST /api/v1/ventes"
    payload: string;        // JSON.stringify(body)
    createdAt: Date;
    attempts: number;       // nb de tentatives de sync
    status: 'PENDING' | 'SYNCING' | 'ERROR';
  }

  class ProgressBusinessDB extends Dexie {
    authSession!: EntityTable<AuthSession, 'id'>;
    offlineQueue!: EntityTable<OfflineQueue, 'id'>;

    constructor() {
      super('progress_business_db');
      this.version(1).stores({
        authSession: 'id, userId, expiresAt',
        offlineQueue: '++id, status, createdAt',
      });
    }
  }

  export const db = new ProgressBusinessDB();

Règles Dexie :
  - Ne sauvegarder en Dexie QUE les données non-sensibles (pas de token)
  - La session Dexie (id=1) est mise à jour à chaque connexion réussie
  - expiresAt = Date.now() + 8 * 60 * 60 * 1000 (8 heures)
  - En mode offline : vérifier que cachedAt < 8h avant d'autoriser la session


CLIENT AXIOS — api.ts
----------------------
Créer le client Axios avec intercepteurs complets :

  // apps/client/src/lib/api.ts
  import axios from 'axios';

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000,           // 10 secondes → déclenche État 5 si dépassé
    withCredentials: true,    // ← OBLIGATOIRE pour les cookies httpOnly (refreshToken)
    headers: { 'Content-Type': 'application/json' }
  });

Intercepteur REQUEST :
  - Récupérer le accessToken depuis le store Zustand (pas localStorage)
  - Si présent → ajouter Authorization: "Bearer <token>"
  - Si navigator.onLine === false → rejeter immédiatement avec AxiosError NETWORK_OFFLINE

Intercepteur RESPONSE :
  - Si 401 ET ce n'est PAS /auth/login ET ce n'est PAS /auth/refresh :
      1. Tenter un refresh silencieux via POST /api/v1/auth/refresh
      2. Si refresh OK → retry la requête originale avec le nouveau token
      3. Si refresh KO (401 aussi) → appeler authStore.logout() + redirect /login
  - Si erreur réseau (ERR_NETWORK, ERR_TIMEOUT, ECONNABORTED) :
      → Déclencher le mode offline dans le store

Exporter aussi des fonctions typées :
  export const authApi = {
    login: (body: LoginDto) => api.post<LoginResponse>('/api/v1/auth/login', body),
    refresh: (body: RefreshDto) => api.post<RefreshResponse>('/api/v1/auth/refresh', body),
    me: () => api.get<MeResponse>('/api/v1/auth/me'),
    logout: () => api.post('/api/v1/auth/logout'),
    forgotPassword: (phone: string) => api.post('/api/v1/auth/forgot-password', { phone }),
    resetPassword: (body: ResetPasswordDto) => api.post('/api/v1/auth/reset-password', body),
  };


HOOK useAuth — useAuth.ts
--------------------------
Interface du hook React :

  // apps/client/src/hooks/useAuth.ts
  export function useAuth() {
    return {
      // Données réactives depuis le store
      user,
      isAuthenticated,
      isLoading,
      isOfflineMode,
      loginAttempts,
      lockedUntil,

      // Actions
      login,              // (identifier, password, rememberMe) => Promise<void>
      loginOffline,       // () => Promise<void>
      logout,             // () => void

      // Helpers dérivés
      isLocked,           // boolean — lockedUntil !== null && lockedUntil > new Date()
      timeUntilUnlock,    // string — "14:47" — calculé chaque seconde si isLocked
      canAccess,          // (roles: UserRole[]) => boolean
      hasRole,            // (role: UserRole) => boolean
      isSuperAdmin,       // boolean
      currentSiteId,      // string | null
    };
  }


COMPOSANT ProtectedRoute — ProtectedRoute.tsx
----------------------------------------------
Créer le guard de route utilisé dans TOUS les modules suivants :

  // apps/client/src/router/ProtectedRoute.tsx
  interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: UserRole[];       // si vide → tout utilisateur authentifié
    redirectTo?: string;             // défaut : "/login"
  }

Comportement :
  1. Si isLoading → afficher un spinner centré (ne pas rediriger pendant le refresh)
  2. Si !isAuthenticated → rediriger vers /login?redirect=<current_path>
  3. Si allowedRoles défini ET user.role non inclus → afficher page 403 (AccessDenied)
  4. Sinon → rendre children

Créer aussi un composant AccessDenied.tsx minimal :
  - Icône ShieldX (lucide-react)
  - Titre "Accès refusé"
  - Message "Vous n'avez pas les droits pour accéder à cette page."
  - Bouton "Retour au tableau de bord" → navigate('/dashboard')


HOOK useOnlineStatus — useOnlineStatus.ts
------------------------------------------
  // apps/client/src/hooks/useOnlineStatus.ts
  export function useOnlineStatus(): boolean {
    // Écouter navigator.onLine + événements 'online'/'offline' sur window
    // Retourner isOnline (boolean réactif)
    // Synchroniser avec authStore.setOfflineMode(!isOnline) à chaque changement
  }


COMPOSANT OfflineBanner — OfflineBanner.tsx
--------------------------------------------
Bannière réutilisable dans toute l'app (pas seulement sur la page login) :

  Visible si : isOfflineMode === true
  Position : fixe en haut (fixed top-0 left-0 right-0 z-50)
  Hauteur : 32px
  Style : fond amber-400, texte amber-950, texte centré

  Contenu :
    "⚠ Mode hors-ligne — [X opérations en attente]  |  Dernière sync : il y a 2 min"
    → Le compteur d'opérations vient de Dexie offlineQueue (count where status='PENDING')
    → "Dernière sync" vient de authStore.lastSyncAt (formaté en relatif avec date-fns/fr)

  Variante — reconnexion en cours (isOnline vient de redevenir true) :
    Fond blue-500 : "⟳ Synchronisation en cours..."

  Variante — sync réussie :
    Fond green-500, durée 3s puis disparaît : "✓ Synchronisé avec succès"


BACK-END NESTJS — Module Auth
------------------------------
Vérifier et compléter les fichiers suivants :

apps/server/src/modules/auth/dto/login.dto.ts
  import { IsString, IsBoolean, IsOptional } from 'class-validator';
  export class LoginDto {
    @IsString() identifier: string;         // phone OU email
    @IsString() password: string;
    @IsBoolean() @IsOptional() rememberMe?: boolean;
    @IsString() @IsOptional() siteId?: string;
  }

apps/server/src/modules/auth/auth.service.ts — méthode login() :
  1. Détecter si identifier est un phone (+243...) ou un email
  2. Chercher l'utilisateur par phone OU email dans Prisma
  3. Si non trouvé → throw UnauthorizedException({ code: 'INVALID_CREDENTIALS' })
  4. Vérifier le mot de passe avec bcrypt.compare()
  5. Vérifier que user.actif === true → sinon UnauthorizedException
  6. Vérifier les tentatives en Redis : GET "login_attempts:{userId}"
     Si >= 5 → throw 423 avec unlocksAt calculé
  7. Si mot de passe incorrect → INCR "login_attempts:{userId}", EXPIRE 15min
  8. Si correct → DEL "login_attempts:{userId}"
  9. Générer accessToken (JWT, 8h) et refreshToken (JWT, 24h ou 30j si rememberMe)
  10. Stocker refreshToken hashé en base (table UserRefreshToken)
  11. Répondre avec Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict
  12. Ne PAS inclure refreshToken dans le body JSON (httpOnly cookie uniquement)

apps/server/src/modules/auth/jwt.strategy.ts :
  - Valider le JWT depuis le header Authorization: Bearer
  - Payload attendu : { sub: userId, role, siteId, iat, exp }
  - Si invalide → UnauthorizedException

apps/server/src/modules/auth/auth.guard.ts :
  - Décorateur @Roles(...roles) pour protéger les routes par rôle
  - Utiliser avec @UseGuards(JwtAuthGuard, RolesGuard)


GESTION MODE HORS-LIGNE — offline-queue.ts
--------------------------------------------
  // apps/client/src/lib/offline-queue.ts

  export async function enqueueOfflineRequest(
    endpoint: string,
    payload: unknown
  ): Promise<void>
  // → Ajouter à Dexie.offlineQueue avec status='PENDING'

  export async function processOfflineQueue(): Promise<SyncResult>
  // → Appelé automatiquement quand navigator.onLine redevient true
  // → Pour chaque item PENDING dans offlineQueue :
  //     1. Tenter l'appel API
  //     2. Si succès → supprimer l'item de la queue
  //     3. Si erreur → incrémenter attempts, si >= 3 → status='ERROR'
  // → Retourner { synced: number, errors: number }

  export async function getPendingCount(): Promise<number>
  // → COUNT Dexie.offlineQueue WHERE status='PENDING'

Utilisation dans le client Axios (api.ts) :
  Si navigator.onLine === false ET la requête est une mutation (POST/PATCH/DELETE) :
    → Appeler enqueueOfflineRequest() au lieu de lancer la requête
    → Retourner une réponse mock { offlineQueued: true } au composant appelant


TESTS — LoginPage.test.tsx
----------------------------
Créer les tests suivants avec Vitest + @testing-library/react :

  describe('LoginPage', () => {
    test('1 — Rendu initial : bouton désactivé si champs vides')
    test('2 — Bouton activé quand les deux champs sont remplis')
    test('3 — Toggle visibilité du mot de passe fonctionne')
    test('4 — Détection automatique format téléphone (+243XXXXXXXXX)')
    test('5 — Détection automatique format email (user@domain.com)')
    test('6 — État chargement : spinner visible, champs disabled')
    test('7 — Erreur 401 : affiche message + compteur tentatives')
    test('8 — Erreur 423 : champs bloqués + compte à rebours visible')
    test('9 — Erreur réseau : toast orange + lien offline visible')
    test('10 — Mode offline au chargement : bannière jaune visible')
    test('11 — Redirection AGENT vers /sales/pos après connexion')
    test('12 — Redirection GERANT vers /dashboard après connexion')
    test('13 — Paramètre ?redirect= respecté après connexion réussie')
    test('14 — Le token n\'est PAS dans localStorage après connexion')
  })

  Mocks à créer :
    - vi.mock('../lib/api') → mock authApi.login()
    - vi.mock('../stores/auth.store') → mock du store Zustand
    - vi.mock('../hooks/useOnlineStatus') → simuler online/offline


VARIABLES D'ENVIRONNEMENT REQUISES
------------------------------------
Créer ou vérifier apps/client/.env.example :
  VITE_API_URL=http://localhost:3000
  VITE_APP_NAME=Progress Business
  VITE_APP_VERSION=1.0.0
  VITE_OFFLINE_TOKEN_VALIDITY_HOURS=8
  VITE_MAX_LOGIN_ATTEMPTS=5
  VITE_LOCKOUT_DURATION_MINUTES=15

Créer ou vérifier apps/server/.env.example :
  DATABASE_URL=postgresql://user:password@localhost:5432/progress_business
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=<openssl rand -hex 64>
  JWT_REFRESH_SECRET=<openssl rand -hex 64>
  JWT_EXPIRES_IN=8h
  JWT_REFRESH_EXPIRES_IN=24h
  JWT_REFRESH_REMEMBER_ME_EXPIRES_IN=30d
  COOKIE_SECRET=<openssl rand -hex 32>
  COOKIE_DOMAIN=localhost
  MAX_LOGIN_ATTEMPTS=5
  LOCKOUT_DURATION_MINUTES=15
  FRONTEND_URL=http://localhost:5173


DÉFINITION DE "TERMINÉ" — CHECKLIST
--------------------------------------
Avant de passer au Prompt 2, vérifier TOUS ces points :

INTERFACE
[ ] La page s'affiche correctement à 375px (mobile) ET 1280px (desktop)
[ ] Le logo Progress Business est visible en haut de la carte
[ ] Le badge "En ligne / Hors-ligne" reflète navigator.onLine en temps réel
[ ] La détection du format téléphone/email fonctionne avec feedback visuel
[ ] L'œil de visibilité du mot de passe fonctionne correctement
[ ] Le bouton est désactivé si un champ est vide
[ ] La case "Se souvenir de moi" est fonctionnelle
[ ] Le lien "Mot de passe oublié ?" redirige vers /reset-password

ÉTATS
[ ] État chargement : spinner visible, champs bloqués
[ ] État erreur 401 : message rouge + compteur tentatives "2/5" visible
[ ] État verrouillage : champs bloqués + compte à rebours mis à jour chaque seconde
[ ] État erreur réseau : toast orange + lien offline visible
[ ] État hors-ligne : bannière jaune fixe en haut de l'écran

AUTH & SÉCURITÉ
[ ] Le token accessToken N'EST PAS dans localStorage ni sessionStorage
[ ] Le refreshToken est dans un httpOnly cookie (vérifié via DevTools Application)
[ ] Après refresh de la page, si cookie valide → pas de retour à /login (reconnexion auto)
[ ] La redirection post-connexion est correcte pour chaque rôle
[ ] Le paramètre ?redirect= est respecté

OFFLINE
[ ] La bannière OfflineBanner s'affiche quand offline
[ ] Une mutation (POST vente) en mode offline est ajoutée à Dexie offlineQueue
[ ] La re-synchronisation se lance automatiquement au retour en ligne
[ ] La session Dexie expire correctement après 8 heures

BACK-END
[ ] POST /api/v1/auth/login retourne 200 avec accessToken pour credentials valides
[ ] POST /api/v1/auth/login retourne 401 + attemptsLeft pour credentials invalides
[ ] POST /api/v1/auth/login retourne 423 après 5 échecs avec unlocksAt
[ ] POST /api/v1/auth/refresh fonctionne avec un refreshToken valide
[ ] Le verrouillage est stocké en Redis et expire automatiquement après 15 minutes

TESTS
[ ] npm run test passe sans erreur (14 tests LoginPage.test.tsx)
[ ] Couverture du composant LoginPage.tsx ≥ 80%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 2 — SCR-002 : RÉINITIALISATION DU MOT DE PASSE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet      : Progress Business
Fichier cible principal : apps/client/src/pages/auth/ResetPasswordPage.tsx
Route       : /reset-password
Accès       : Public — redirige vers /dashboard si déjà authentifié
Rôle minimum requis : Aucun
Dépendances : SCR-001 doit être TERMINÉ (useAuth, api.ts, Dexie, Zustand store)


OBJECTIF
--------
Créer la page complète de réinitialisation du mot de passe via OTP SMS (SCR-002).
Le flux est en 3 étapes séquentielles sur la même page (stepper) :
  Étape 1 → Saisie du téléphone
  Étape 2 → Saisie du code OTP reçu par SMS
  Étape 3 → Saisie du nouveau mot de passe + confirmation

L'infrastructure SMS utilise Africa's Talking (même provider que pour les notifications).


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/auth/ResetPasswordPage.tsx        ← CRÉER (composant principal)
2. apps/client/src/pages/auth/ResetPasswordPage.test.tsx   ← CRÉER (tests Vitest)
3. apps/client/src/components/auth/OtpInput.tsx            ← CRÉER (composant OTP réutilisable)
4. apps/client/src/components/auth/PasswordStrength.tsx    ← CRÉER (indicateur force MDP)
5. apps/client/src/hooks/useCountdown.ts                   ← CRÉER (hook compte à rebours)

BACK-END :
6. apps/server/src/modules/auth/auth.controller.ts         ← AJOUTER endpoints OTP
7. apps/server/src/modules/auth/auth.service.ts            ← AJOUTER logique OTP + SMS
8. apps/server/src/modules/auth/dto/reset-password.dto.ts  ← CRÉER (DTOs NestJS)
9. apps/server/src/modules/sms/sms.service.ts              ← CRÉER (service Africa's Talking)
10. apps/server/src/modules/sms/sms.module.ts              ← CRÉER (module NestJS SMS)


UI — STRUCTURE VISUELLE (3 étapes avec stepper)
-------------------------------------------------
La page utilise la même Card centrée que SCR-001 (max-w-md, fond #F5F5F5).
Un stepper horizontal en haut de la carte indique l'étape active.

STEPPER :
  ● Téléphone ──── ○ Code OTP ──── ○ Nouveau MDP
  (cercle plein = actif, cercle vide = à venir, coche verte = complété)

─────────────────────────────────────
ÉTAPE 1 — Saisie du numéro de téléphone
─────────────────────────────────────
  ┌────────────────────────────────────────────────────┐
  │   Réinitialiser le mot de passe                    │
  │   Entrez votre numéro de téléphone enregistré.     │
  │                                                    │
  │   Téléphone *                                      │
  │   [+243 _________________________________]         │
  │                                                    │
  │   [ ENVOYER LE CODE SMS ]                          │
  │                                                    │
  │   ← Retour à la connexion                          │
  └────────────────────────────────────────────────────┘

─────────────────────────────────────
ÉTAPE 2 — Saisie du code OTP (6 chiffres)
─────────────────────────────────────
  ┌────────────────────────────────────────────────────┐
  │   Code de vérification                             │
  │   Un code à 6 chiffres a été envoyé au             │
  │   +243 81 *** **** — Valable 10 minutes.           │
  │                                                    │
  │   [ 4 ] [ 2 ] [ _ ] [ _ ] [ _ ] [ _ ]             │
  │   (6 cases individuelles, focus auto entre cases)  │
  │                                                    │
  │   [ VÉRIFIER LE CODE ]                             │
  │                                                    │
  │   Pas reçu ?  [ Renvoyer dans 01:47 ] (countdown) │
  │   ← Modifier le numéro                            │
  └────────────────────────────────────────────────────┘

─────────────────────────────────────
ÉTAPE 3 — Nouveau mot de passe
─────────────────────────────────────
  ┌────────────────────────────────────────────────────┐
  │   Nouveau mot de passe                             │
  │                                                    │
  │   Nouveau mot de passe *              [ 👁 ]       │
  │   [______________________________________________] │
  │   ████████░░  Moyen                               │
  │   (indicateur de force : Faible/Moyen/Fort/Solide) │
  │                                                    │
  │   Confirmer le mot de passe *         [ 👁 ]       │
  │   [______________________________________________] │
  │                                                    │
  │   [ ENREGISTRER LE NOUVEAU MOT DE PASSE ]          │
  └────────────────────────────────────────────────────┘

─────────────────────────────────────
ÉTAPE FINALE — Succès
─────────────────────────────────────
  ┌────────────────────────────────────────────────────┐
  │                  ✅ (icône verte)                   │
  │        Mot de passe réinitialisé !                 │
  │   Vous pouvez maintenant vous connecter avec       │
  │   votre nouveau mot de passe.                      │
  │                                                    │
  │   [ SE CONNECTER → ]                               │
  └────────────────────────────────────────────────────┘
  Redirection automatique vers /login après 3 secondes.


COMPOSANTS UI À UTILISER (shadcn/ui)
--------------------------------------
- Card, CardContent, CardHeader, CardTitle    → conteneur principal
- Input                                        → champ téléphone + MDP
- Button (variant="default")                   → actions principales
- Button (variant="outline")                   → actions secondaires
- Button (variant="ghost")                     → "Modifier le numéro", "Retour"
- Label                                        → labels des champs
- Alert, AlertDescription                      → messages d'erreur
- Progress                                     → indicateur force mot de passe
- Badge                                        → masquage partiel du numéro


COMPOSANT OtpInput — OtpInput.tsx
----------------------------------
Créer un composant de saisie OTP réutilisable :

  interface OtpInputProps {
    length: number;          // 6 pour Progress Business
    value: string;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;  // appelé quand les 6 chiffres sont saisis
    disabled?: boolean;
    hasError?: boolean;
  }

Comportements obligatoires :
  ✓ 6 inputs individuels de type="text" inputMode="numeric" maxLength={1}
  ✓ Focus automatique sur la case suivante quand un chiffre est tapé
  ✓ Backspace sur une case vide → focus sur la case précédente + effacement
  ✓ Coller (Ctrl+V) un code à 6 chiffres → distribuer automatiquement dans les cases
  ✓ Si hasError=true → bordure rouge sur toutes les cases + légère animation shake
  ✓ Auto-submit quand la 6ème case est remplie (appeler onComplete)
  ✓ Les inputs n'acceptent QUE des chiffres (filtrer les lettres)
  ✓ Sur mobile : clavier numérique s'ouvre automatiquement (inputMode="numeric")


COMPOSANT PasswordStrength — PasswordStrength.tsx
--------------------------------------------------
Indicateur visuel de force de mot de passe :

  interface PasswordStrengthProps {
    password: string;
  }

Règles de calcul de la force :
  Score 0 (Aucun)   → password.length === 0
  Score 1 (Faible)  → length < 6
  Score 2 (Moyen)   → length >= 6 + au moins 1 critère ci-dessous
  Score 3 (Fort)    → length >= 8 + au moins 2 critères
  Score 4 (Solide)  → length >= 10 + tous les critères

  Critères :
    - Contient des minuscules [a-z]
    - Contient des majuscules [A-Z]
    - Contient des chiffres [0-9]
    - Contient des caractères spéciaux (!@#$%...)

Affichage :
  - Barre de progression (shadcn Progress) avec couleur selon le score :
      Score 1 → rouge   (25%)  → "Faible"
      Score 2 → orange  (50%)  → "Moyen"
      Score 3 → jaune   (75%)  → "Fort"
      Score 4 → vert    (100%) → "Solide"
  - Texte du niveau à droite de la barre
  - Liste des critères non satisfaits en rouge ci-dessous (si score < 4)


HOOK useCountdown — useCountdown.ts
-------------------------------------
  // apps/client/src/hooks/useCountdown.ts
  export function useCountdown(initialSeconds: number) {
    // Retourne :
    return {
      seconds,          // number — secondes restantes
      formatted,        // string — "01:47" (MM:SS)
      isFinished,       // boolean — true quand seconds === 0
      start,            // () => void — (re)démarrer le compte à rebours
      reset,            // () => void — remettre à initialSeconds sans démarrer
    };
  }

  // Utilisation dans ResetPasswordPage :
  const countdown = useCountdown(120); // 2 minutes = 120 secondes
  // Démarrer à l'envoi du SMS
  // Afficher : "Renvoyer dans 01:47" si !isFinished
  // Afficher : "Renvoyer le code" (bouton actif) si isFinished


COMPORTEMENTS ET ÉTATS — ÉTAPE 1 (Téléphone)
---------------------------------------------
Validation du champ téléphone :
  - Regex : /^(\+243|0)[0-9]{9}$/
  - Normalisation : si commence par 0 → remplacer par +243 avant l'envoi
  - Message sous le champ si invalide : "Format attendu : +243 XX XXX XXXX"

État chargement (pendant envoi SMS) :
  - Spinner sur le bouton "ENVOYER LE CODE SMS"
  - Texte : "Envoi en cours..."
  - Champ téléphone disabled

État erreur — téléphone introuvable (404) :
  - Alert rouge : "Aucun compte trouvé pour ce numéro de téléphone."
  - Champ reste éditable, focus repositionné

État erreur — trop de demandes (429) :
  - Alert orange : "Trop de demandes. Attendez [X] minutes avant de réessayer."
  - Bouton disabled avec compte à rebours

État succès :
  - Toast vert : "Code envoyé au +243 81 *** ****"
  - Passer automatiquement à l'Étape 2
  - Démarrer le compte à rebours de 2 minutes (renvoi SMS)


COMPORTEMENTS ET ÉTATS — ÉTAPE 2 (OTP)
----------------------------------------
Démarrer automatiquement le focus sur la première case à l'arrivée sur l'étape 2.
Démarrer le compte à rebours useCountdown(120).

État chargement (pendant vérification OTP) :
  - Toutes les cases OTP disabled
  - Bouton "VÉRIFIER LE CODE" avec spinner

État erreur — code incorrect (400) :
  - Animation shake sur les 6 cases (CSS animation)
  - Bordures rouges sur les cases
  - Alert rouge : "Code incorrect. [X] tentative(s) restante(s)."
  - Vider automatiquement les 6 cases + repositionner focus sur la case 1

État erreur — code expiré (410) :
  - Alert orange : "Ce code a expiré. Renvoyez un nouveau code."
  - Afficher le bouton "Renvoyer le code" immédiatement (ignorer le countdown)

État erreur — trop de tentatives OTP (429) :
  - Alert rouge : "Trop de tentatives. Compte bloqué pour [X] minutes."
  - Toutes les cases et bouton disabled

Renvoi du code SMS :
  - Bouton "Renvoyer dans 01:47" → désactivé et affiche countdown
  - Quand countdown expire → bouton redevient "Renvoyer le code" (actif)
  - Clic renvoi → réappeler POST /api/v1/auth/forgot-password + reset countdown

Bouton "← Modifier le numéro" :
  - Revenir à l'Étape 1 avec le numéro pré-rempli
  - Réinitialiser le state OTP


COMPORTEMENTS ET ÉTATS — ÉTAPE 3 (Nouveau MDP)
------------------------------------------------
Règles de validation du nouveau mot de passe :
  ✗ Le nouveau MDP ne peut pas être identique aux 3 derniers mots de passe
    (vérification côté serveur — le front ne peut pas le savoir)
  ✗ Longueur minimum : 6 caractères
  ✗ Confirmation doit correspondre exactement au nouveau MDP
  ✓ L'indicateur PasswordStrength est mis à jour en temps réel (onChange)

Validation en temps réel :
  - Si les deux champs sont remplis ET différents → message rouge sous "Confirmer"
    "Les mots de passe ne correspondent pas"
  - Si les deux champs sont identiques → icône verte ✓ sous "Confirmer"

État chargement (pendant enregistrement) :
  - Bouton "ENREGISTRER" avec spinner, texte "Enregistrement..."
  - Les deux champs disabled

État erreur — MDP identique à l'ancien (422) :
  - Alert rouge : "Ce mot de passe a déjà été utilisé. Choisissez-en un nouveau."

État erreur — token OTP expiré entre-temps (410) :
  - Alert rouge : "Votre session de réinitialisation a expiré. Recommencez."
  - Bouton "Recommencer" → reset complet à l'Étape 1

État succès → afficher l'écran de confirmation (Étape Finale).


APPELS API
-----------
POST /api/v1/auth/forgot-password
  Corps : { phone: string }              // format +243XXXXXXXXX (normalisé)
  Succès 200 :
    {
      success: boolean,
      maskedPhone: string,               // "+243 81 *** ****"
      expiresIn: 600,                    // secondes (10 minutes)
      retryAfter: 120                    // secondes avant renvoi possible
    }
  Erreur 404 : { error: { code: "PHONE_NOT_FOUND" } }
  Erreur 429 : { error: { code: "TOO_MANY_REQUESTS", retryAfter: number } }

POST /api/v1/auth/verify-otp
  Corps :
    {
      phone: string,
      otp: string                        // 6 chiffres sous forme de string "423017"
    }
  Succès 200 :
    {
      success: true,
      resetToken: string                 // token temporaire (UUID v4) valide 10 min
    }
    → Stocker resetToken dans le state local du composant (pas dans Zustand)
  Erreur 400 : { error: { code: "INVALID_OTP", attemptsLeft: number } }
  Erreur 410 : { error: { code: "OTP_EXPIRED" } }
  Erreur 429 : { error: { code: "TOO_MANY_OTP_ATTEMPTS", blockedUntil: string } }

POST /api/v1/auth/reset-password
  Corps :
    {
      resetToken: string,                // reçu à l'étape 2
      newPassword: string
    }
  Succès 200 :
    { success: true, message: "Mot de passe mis à jour avec succès." }
  Erreur 400 : { error: { code: "PASSWORD_ALREADY_USED" } }
  Erreur 410 : { error: { code: "RESET_TOKEN_EXPIRED" } }
  Erreur 422 : { error: { code: "PASSWORD_TOO_WEAK" } }


BACK-END NESTJS — Logique OTP
-------------------------------
apps/server/src/modules/sms/sms.service.ts :
  Utiliser le SDK Africa's Talking (@africastalking/africastalking) :

  class SmsService {
    async sendOtp(phone: string): Promise<{ otp: string; expiresAt: Date }> {
      // 1. Générer un OTP à 6 chiffres : Math.floor(100000 + Math.random() * 900000)
      // 2. Hasher l'OTP : await bcrypt.hash(otp, 10)
      // 3. Stocker en Redis : SET "otp:{phone}" hashedOtp EX 600 (10 min)
      // 4. Stocker le compteur de tentatives : SET "otp_attempts:{phone}" 0 EX 600
      // 5. Envoyer le SMS via Africa's Talking :
      //    Message : "Votre code Progress Business : XXXXXX\nValable 10 minutes.\nNe partagez pas ce code."
      // 6. Retourner { otp (pour les logs dev uniquement), expiresAt }
    }

    async verifyOtp(phone: string, otp: string): Promise<string> {
      // 1. Vérifier le compteur Redis "otp_attempts:{phone}"
      //    Si >= 3 → throw 429
      // 2. GET "otp:{phone}" depuis Redis
      //    Si null → throw 410 (expiré)
      // 3. await bcrypt.compare(otp, hashedOtp)
      //    Si false → INCR "otp_attempts:{phone}", throw 400 avec attemptsLeft
      // 4. Si correct → DEL "otp:{phone}", DEL "otp_attempts:{phone}"
      // 5. Générer resetToken : crypto.randomUUID()
      // 6. Stocker en Redis : SET "reset_token:{resetToken}" phone EX 600
      // 7. Retourner resetToken
    }
  }

apps/server/src/modules/auth/auth.service.ts — méthode resetPassword() :
  // 1. GET "reset_token:{resetToken}" depuis Redis → obtenir le phone
  // 2. Si null → throw 410 (token expiré)
  // 3. Trouver l'utilisateur par phone
  // 4. Vérifier que le nouveau MDP ≠ les 3 derniers (table PasswordHistory)
  // 5. await bcrypt.hash(newPassword, 12)
  // 6. UPDATE user.password en base
  // 7. Ajouter l'ancien hash dans PasswordHistory (garder max 3 entrées)
  // 8. DEL "reset_token:{resetToken}" depuis Redis
  // 9. Invalider TOUS les refreshTokens de cet utilisateur (déconnexion partout)
  // 10. Retourner { success: true }


GESTION DES ERREURS RÉSEAU — Mode Offline
------------------------------------------
La réinitialisation de mot de passe NÉCESSITE une connexion internet.
Si navigator.onLine === false au chargement :
  - Désactiver le bouton "ENVOYER LE CODE SMS"
  - Afficher l'Alert shadcn : "La réinitialisation du mot de passe nécessite
    une connexion internet. Vérifiez votre connexion et réessayez."
  - Afficher l'icône WifiOff (lucide-react) dans l'Alert
  - Le lien "← Retour à la connexion" reste accessible

Si la connexion est perdue pendant l'Étape 2 (OTP) :
  - Toast warning : "Connexion perdue. Votre code reste valide 10 minutes."
  - Désactiver le bouton "VÉRIFIER LE CODE"
  - Quand la connexion revient → réactiver automatiquement le bouton


TESTS — ResetPasswordPage.test.tsx
------------------------------------
Créer les tests suivants avec Vitest + @testing-library/react :

  describe('ResetPasswordPage', () => {
    describe('Étape 1 — Téléphone', () => {
      test('1  — Rendu initial : bouton désactivé si champ vide')
      test('2  — Validation format téléphone : +243XXXXXXXXX valide')
      test('3  — Validation format téléphone : format invalide → message erreur')
      test('4  — Normalisation : 0812345678 → +243812345678 avant envoi')
      test('5  — Chargement : spinner visible pendant l\'envoi')
      test('6  — Succès : passage automatique à l\'Étape 2')
      test('7  — Erreur 404 : message "Aucun compte trouvé"')
      test('8  — Erreur 429 : bouton bloqué avec countdown visible')
    })

    describe('Étape 2 — OTP', () => {
      test('9  — Focus automatique sur la case 1 à l\'arrivée')
      test('10 — Navigation entre cases avec tabulation et backspace')
      test('11 — Collage d\'un code à 6 chiffres distribue les valeurs')
      test('12 — Appel API automatique quand 6 chiffres sont saisis')
      test('13 — Animation shake si OTP incorrect + cases vidées')
      test('14 — Erreur 410 : bouton renvoi actif immédiatement')
      test('15 — Countdown "Renvoyer dans 01:47" décroît correctement')
      test('16 — Bouton renvoi devient actif à la fin du countdown')
      test('17 — "← Modifier le numéro" revient à l\'Étape 1 avec numéro pré-rempli')
    })

    describe('Étape 3 — Nouveau Mot de Passe', () => {
      test('18 — Indicateur PasswordStrength se met à jour en temps réel')
      test('19 — Message d\'erreur si MDP et confirmation ne correspondent pas')
      test('20 — Icône verte si MDP et confirmation correspondent')
      test('21 — Toggle visibilité fonctionne sur les deux champs')
      test('22 — Bouton désactivé si MDP < 6 caractères')
      test('23 — Erreur 400 "déjà utilisé" : message explicatif affiché')
      test('24 — Succès : affichage de l\'écran de confirmation')
    })

    describe('Offline', () => {
      test('25 — Si offline : bouton désactivé + message explicatif à l\'Étape 1')
      test('26 — Si offline pendant Étape 2 : toast warning affiché')
    })
  })

  Mocks à créer :
    - vi.mock('../lib/api') → mock authApi.forgotPassword, verifyOtp, resetPassword
    - vi.mock('../hooks/useOnlineStatus') → simuler online/offline
    - vi.mock('../hooks/useCountdown') → contrôler le countdown dans les tests


DÉFINITION DE "TERMINÉ" — CHECKLIST
--------------------------------------
Avant de considérer ce module AUTH comme terminé, vérifier TOUS ces points :

INTERFACE
[ ] La page s'affiche correctement à 375px (mobile) ET 1280px (desktop)
[ ] Le stepper indique visuellement l'étape active et les étapes complétées
[ ] Le bouton "Retour à la connexion" fonctionne sur les 3 étapes

ÉTAPE 1 — TÉLÉPHONE
[ ] La validation du format téléphone fonctionne (+243 ou 0...)
[ ] La normalisation 0→+243 se fait avant l'envoi API
[ ] L'état de chargement est visible (spinner + champ disabled)
[ ] L'erreur 404 affiche le bon message
[ ] L'erreur 429 désactive le bouton avec countdown

ÉTAPE 2 — OTP
[ ] Le composant OtpInput fonctionne (focus auto, backspace, coller, chiffres seulement)
[ ] L'appel API se déclenche automatiquement au 6ème chiffre
[ ] L'animation shake + vidage fonctionne en cas d'OTP incorrect
[ ] Le countdown "Renvoyer dans XX:XX" fonctionne correctement
[ ] Le bouton renvoi devient actif à la fin du countdown

ÉTAPE 3 — MOT DE PASSE
[ ] L'indicateur PasswordStrength fonctionne en temps réel (4 niveaux)
[ ] La validation en temps réel (correspondance MDP/confirmation) fonctionne
[ ] Les toggles de visibilité des 2 champs fonctionnent
[ ] L'erreur "MDP déjà utilisé" (422) affiche le bon message

ÉTAPE FINALE
[ ] L'écran de confirmation s'affiche avec l'icône de succès
[ ] La redirection automatique vers /login se fait après 3 secondes

BACK-END
[ ] POST /api/v1/auth/forgot-password envoie un vrai SMS via Africa's Talking (en staging)
[ ] L'OTP est hashé en Redis (pas stocké en clair)
[ ] POST /api/v1/auth/verify-otp retourne un resetToken valide
[ ] POST /api/v1/auth/reset-password invalide tous les refreshTokens existants
[ ] Les 3 derniers MDP sont bien vérifiés (table PasswordHistory)

TESTS
[ ] npm run test passe sans erreur (26 tests ResetPasswordPage.test.tsx)
[ ] Couverture du composant ResetPasswordPage.tsx ≥ 75%
[ ] Couverture du composant OtpInput.tsx ≥ 90%
[ ] Couverture du hook useCountdown.ts = 100%
```

---

## RÉCAPITULATIF DES 2 PROMPTS — MODULE AUTH

| N° | Écran   | Route            | Fichier principal                              | Priorité | Durée est. |
|----|---------|------------------|------------------------------------------------|----------|------------|
| 1  | SCR-001 | /login           | pages/auth/LoginPage.tsx                       | **P0**   | ~3-4h      |
| 2  | SCR-002 | /reset-password  | pages/auth/ResetPasswordPage.tsx               | **P0**   | ~2-3h      |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Prompt 1 (SCR-001 Login)
  ↓ Crée : auth.store.ts, useAuth.ts, api.ts, db.ts (Dexie),
            ProtectedRoute.tsx, OfflineBanner.tsx, offline-queue.ts
  ↓
Prompt 2 (SCR-002 Reset Password)
  ↓ Utilise : api.ts (authApi), useOnlineStatus.ts
  ↓ Crée    : OtpInput.tsx, PasswordStrength.tsx, useCountdown.ts
  ↓
  → MODULE AUTH COMPLET
  → Prêt pour les modules suivants :
        SCR-003 Dashboard   (utilise ProtectedRoute + useAuth)
        SCR-005 Clients     (utilise api.ts + ProtectedRoute)
        SCR-012 Caisse POS  (utilise offline-queue.ts + db.ts)
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. SÉCURITÉ — Règle absolue :
   → Le accessToken NE DOIT JAMAIS se trouver dans localStorage, sessionStorage,
     ou tout autre storage persistant côté client.
   → Seule la mémoire JS du store Zustand est autorisée pour le accessToken.
   → Le refreshToken est géré UNIQUEMENT via httpOnly cookie (Set-Cookie serveur).

2. OFFLINE-FIRST — Principe :
   → Toutes les mutations (POST/PATCH/DELETE) doivent passer par offline-queue.ts
     si navigator.onLine === false.
   → La page de connexion et la réinitialisation MDP sont les SEULES exceptions
     (elles nécessitent obligatoirement internet).

3. FORMAT CONGOLAIS :
   → Les numéros de téléphone sont TOUJOURS normalisés en +243XXXXXXXXX avant envoi.
   → L'affichage masqué est : "+243 81 *** ****" (4 derniers chiffres masqués).

4. TESTS :
   → Ne pas skip les tests. Le Prompt 1 crée les fondations testées dans tous les
     modules suivants.
   → Viser 80%+ de couverture sur tous les composants du module Auth.

5. INTÉGRATION SMS (Africa's Talking) :
   → En développement local : utiliser le mode sandbox Africa's Talking.
   → Le compte AT doit être configuré pour les numéros +243 (Congo RDC).
   → Variables requises dans apps/server/.env :
       AT_API_KEY=<votre_clé>
       AT_USERNAME=<votre_username>
       SMS_SENDER_ID=ProgressBiz
```

---

*Progress Business — Prompts Développement Auth SCR-001 & SCR-002 — Goma, RDC — v1.0 — 2025*
