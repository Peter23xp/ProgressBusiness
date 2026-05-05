# 📱 PROGRESS BUSINESS — PROMPTS DE DÉVELOPPEMENT
## Module PORTAIL CLIENT | Écrans SCR-035 à SCR-038 | 4 écrans

> **MODE D'EMPLOI :**
> Ce fichier contient **4 prompts indépendants**, un par écran du module Portail Client.
> Exécute-les **dans l'ordre**, un à la fois dans ton IDE IA (Cursor, Copilot, Claude Code…).
> Chaque prompt est **autonome** : il inclut tout le contexte nécessaire.
> **Attends la confirmation de l'IDE et valide les tests avant de passer au suivant.**
> Les modules Auth, Clients, Ventes, Parrainage et Fidélité doivent être TERMINÉS.
>
> ⚠️ **Note importante** : Le portail client utilise une authentification SÉPARÉE
> (token JWT avec rôle CLIENT). L'interface est différente des écrans internes :
> elle est conçue pour être simple, mobile-first, et accessible à des clients
> peu familiers avec les outils numériques.

---

## CONTEXTE GLOBAL (rappel rapide pour chaque prompt)

```
Projet      : Progress Business — Système de Gestion Commercial Multi-Sites
Stack       : React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
State       : Zustand (auth client) + TanStack Query v5 (serveur)
Backend     : Node.js + NestJS + Prisma ORM + PostgreSQL 15 + Redis 7
Tests       : Vitest + Testing Library (front) | Jest + Supertest (back)
Palette     : Bleu foncé #1E3A5F (primary) | Bleu accent #2E86C1 | Blanc #FFFFFF
              Vert #1A6B3A (succès/actif) | Orange #E65100 (alerte)
Monorepo    : apps/client + apps/server + packages/shared
Devise      : Franc Congolais (CDF) — format : 1 200 000 CDF
Sites       : Goma, Bukavu, Kinshasa

PORTAIL SPÉCIFICITÉS :
  - Layout séparé des écrans internes (pas de sidebar admin)
  - Route de base : /portal/*
  - Auth séparée : POST /api/v1/portal/auth/login (téléphone + code PIN)
  - Token JWT avec role='CLIENT' — accès limité aux données du client connecté
  - Mobile-first : optimisé pour smartphones Android 8+ (résolution 375px)
  - Textes simples, pas de jargon technique

NIVEAUX FIDÉLITÉ (rappel) :
  BRONZE  → #92400E | 0–499 pts    | remise 0%
  ARGENT  → #6B7280 | 500–1999 pts | remise 3%
  OR      → #B45309 | 2000–4999 pts| remise 5%
  PLATINE → #6D28D9 | 5000+ pts    | remise 8%
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 / 4 — SCR-035 : PORTAIL CLIENT — ACCUEIL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet        : Progress Business — Module Portail Client
Fichier cible : apps/client/src/pages/portal/PortalHomePage.tsx
Route         : /portal/home
Accès         : Authentifié portail — rôle CLIENT uniquement
Rôle minimum  : CLIENT
Dépendances   : Module Auth terminé (infrastructure JWT, httpOnly cookie)
                Module Fidélité terminé (NiveauBadge, types NiveauFidelite)
                Module Ventes terminé (formatCDF)


OBJECTIF
--------
Créer la page d'accueil du portail client (SCR-035).
C'est la PREMIÈRE page que voit le client après sa connexion.
Elle doit être simple, chaleureuse, et donner en un seul coup d'œil
les informations les plus importantes : solde de points, niveau fidélité,
code parrain, et accès rapide aux autres sections du portail.
L'interface est conçue pour des utilisateurs non-experts sur mobile.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1.  apps/client/src/pages/portal/PortalHomePage.tsx                   ← CRÉER (principal)
2.  apps/client/src/pages/portal/PortalHomePage.test.tsx              ← CRÉER (tests Vitest)
3.  apps/client/src/pages/portal/PortalLoginPage.tsx                  ← CRÉER (connexion portail)
4.  apps/client/src/pages/portal/PortalLoginPage.test.tsx             ← CRÉER (tests login portail)
5.  apps/client/src/layouts/PortalLayout.tsx                          ← CRÉER (layout portail)
6.  apps/client/src/components/portal/PortalHeader.tsx                ← CRÉER (header mobile)
7.  apps/client/src/components/portal/PortalNav.tsx                   ← CRÉER (navigation bas)
8.  apps/client/src/components/portal/PointsCard.tsx                  ← CRÉER (carte points)
9.  apps/client/src/components/portal/ParrainCard.tsx                 ← CRÉER (carte parrainage)
10. apps/client/src/components/portal/QuickActionsGrid.tsx            ← CRÉER (grille accès)
11. apps/client/src/components/portal/RecentPurchasesMini.tsx         ← CRÉER (derniers achats)
12. apps/client/src/stores/portal-auth.store.ts                       ← CRÉER (store auth client)
13. apps/client/src/hooks/usePortalAuth.ts                            ← CRÉER (hook auth portail)
14. apps/client/src/hooks/usePortalHome.ts                            ← CRÉER (hook données accueil)
15. apps/client/src/router/PortalRoute.tsx                            ← CRÉER (guard portail)

BACK-END :
16. apps/server/src/modules/portal/portal.module.ts                   ← CRÉER
17. apps/server/src/modules/portal/portal.controller.ts               ← CRÉER
18. apps/server/src/modules/portal/portal.service.ts                  ← CRÉER
19. apps/server/src/modules/portal/portal-auth.controller.ts          ← CRÉER (auth séparée)
20. apps/server/src/modules/portal/portal-auth.service.ts             ← CRÉER


UI — STRUCTURE VISUELLE COMPLÈTE (mobile-first 375px)
------------------------------------------------------
La page utilise le PortalLayout : header fixe 56px + contenu scrollable + nav bas 60px.

  ┌──────────────────────────────────────────┐  ← 375px
  │  ≡  Progress Business          [Déconn.] │  ← PortalHeader (56px fixe)
  ├──────────────────────────────────────────┤
  │                                          │  ← scroll
  │  Bonjour, Serge 👋                       │
  │  Bienvenue sur votre espace fidélité     │
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │         VOS POINTS               │  │
  │  │   ■ PLATINE                       │  │
  │  │        6 200 pts                 │  │
  │  │  ████████████████████  (∞)        │  │
  │  │  Niveau maximum atteint ! ✨      │  │
  │  │  Remise applicable : 8%          │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │  📤 VOTRE CODE PARRAIN             │  │
  │  │      TSG-0005                     │  │
  │  │  [  Copier le code  ]             │  │
  │  │  32 filleuls actifs               │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  ACCÈS RAPIDE                            │
  │  ┌──────────┐ ┌──────────┐              │
  │  │ 🛍 Mes   │ │ ⭐ Mes   │              │
  │  │  achats  │ │  points  │              │
  │  └──────────┘ └──────────┘              │
  │  ┌──────────────────────────────────┐   │
  │  │ 👥 Mes filleuls (32 actifs)      │   │
  │  └──────────────────────────────────┘   │
  │                                          │
  │  DERNIERS ACHATS                         │
  │  17 jan. · Samsung A54 · 450 000 CDF    │
  │  12 jan. · Chargeur 65W · 56 000 CDF   │
  │  [ Voir tous mes achats → ]             │
  │                                          │
  ├──────────────────────────────────────────┤
  │  [🏠 Accueil] [🛍 Achats] [⭐ Pts] [👥]  │  ← PortalNav (60px fixe bas)
  └──────────────────────────────────────────┘

VUE DESKTOP (≥768px) :
  Sur desktop, le portail est centré dans une Card max-w-sm (390px),
  fond de page bg-neutral-100, Card bg-white shadow-xl rounded-2xl.
  Le header et la nav bas restent à l'intérieur de la Card.


PORTAIL LOGIN — PortalLoginPage.tsx
-------------------------------------
Route : /portal/login
Page de connexion SÉPARÉE du login admin (SCR-001).

  ┌──────────────────────────────────────┐
  │                                      │
  │      [ LOGO PROGRESS BUSINESS ]       │
  │   Espace Client — Connectez-vous     │
  │                                      │
  │   Numéro de téléphone *              │
  │   [+243 ______________________]      │
  │                                      │
  │   Code PIN * (4 chiffres)            │
  │   [ _ ] [ _ ] [ _ ] [ _ ]           │
  │   (4 cases OTP style, clavier numérique)
  │                                      │
  │   [ SE CONNECTER ]                   │
  │                                      │
  │   Vous avez oublié votre PIN ?       │
  │   Contactez votre agent Progress Business.    │
  │                                      │
  └──────────────────────────────────────┘

Règles login portail :
  - Le PIN est à 4 chiffres (pas un mot de passe classique)
  - Le PIN est défini par l'agent lors de l'activation du compte (SCR-010)
  - Pas de "Mot de passe oublié" auto-service → contacter un agent
  - Max 5 tentatives → blocage 10 minutes
  - Après connexion → redirect vers /portal/home


COMPOSANT PortalLayout — PortalLayout.tsx
-------------------------------------------
Layout wrapper utilisé par TOUS les écrans du portail :

  interface PortalLayoutProps {
    children: ReactNode;
    title?: string;              // titre affiché dans le header
    showBackButton?: boolean;    // bouton retour dans le header
    onBack?: () => void;
  }

Structure :
  - Header fixe 56px : logo + titre + bouton déconnexion (ou retour)
  - Zone de contenu : flex-1, overflow-y-auto, pb-16 (pour ne pas être caché par la nav)
  - Navigation bas fixe 60px : 4 onglets

Responsive :
  - Mobile (<768px) : pleine largeur, fond blanc
  - Desktop (≥768px) : Card 390px centrée, fond bg-neutral-100


COMPOSANT PortalHeader — PortalHeader.tsx
-------------------------------------------
Header mobile fixe :

  interface PortalHeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
  }

Contenu :
  - Icône menu hamburger (Sheet shadcn) OU bouton ChevronLeft si showBack=true
  - Titre centré (texte "Progress Business" par défaut ou titre personnalisé)
  - Bouton "Déconnexion" à droite (icône LogOut lucide 20px)
    → Confirmation : "Voulez-vous vous déconnecter ?"
    → Oui → portalAuthStore.logout() → navigate('/portal/login')


COMPOSANT PortalNav — PortalNav.tsx
--------------------------------------
Navigation par onglets fixe en bas de l'écran :

4 onglets :
  1. 🏠 Accueil   → /portal/home      (icône Home lucide)
  2. 🛍 Achats    → /portal/purchases  (icône ShoppingBag lucide)
  3. ⭐ Points    → /portal/points     (icône Star lucide)
  4. 👥 Filleuls  → /portal/referrals  (icône Users lucide)

Style :
  - Onglet actif : icône + texte en couleur #1E3A5F, fond bg-blue-50 arrondi
  - Onglet inactif : icône + texte en text-muted-foreground
  - Hauteur : 60px, padding bottom ajusté pour safe-area-inset (mobile notch)
  - Séparateur en haut : border-t border-neutral-200


COMPOSANT PointsCard — PointsCard.tsx
---------------------------------------
Carte principale affichant le solde et la progression :

  interface PointsCardProps {
    niveauFidelite: NiveauFidelite;
    pointsActuels: number;
    remisePct: number;
    niveauxConfig: NiveauConfig[];    // pour calculer la progression
  }

Contenu :
  - Titre "VOS POINTS" en text-xs uppercase tracking-widest muted
  - NiveauBadge (size="lg") + points en text-4xl font-bold
  - Barre de progression :
      Si niveau < PLATINE : barre colorée + "[X pts avant [Niveau suivant]]"
      Si PLATINE : barre pleine + "🏆 Niveau maximum atteint !" + confetti emoji
  - Ligne remise : "Remise applicable sur vos achats : [X]%"
    → Si 0% (Bronze) : ne pas afficher la ligne remise (pas de remise)
    → Si > 0% : afficher en text-green-600 font-semibold

Design de la carte :
  - Fond dégradé selon le niveau :
      BRONZE  → from-amber-50  to-amber-100
      ARGENT  → from-gray-50   to-gray-100
      OR      → from-yellow-50 to-yellow-100
      PLATINE → from-purple-50 to-purple-100
  - Bordure gauche épaisse (4px) de la couleur du niveau
  - Border-radius 12px, padding 20px
  - Ombre : shadow-md


COMPOSANT ParrainCard — ParrainCard.tsx
-----------------------------------------
Carte du code parrain personnel :

  interface ParrainCardProps {
    codeParrain: string;
    nbFilleulsActifs: number;
    nbFilleulsTotal: number;
  }

Contenu :
  - Icône Share2 (lucide 20px) + titre "VOTRE CODE PARRAIN" en text-xs uppercase
  - Code affiché en text-2xl font-mono font-bold couleur #1E3A5F
  - Bouton "📋 Copier le code" :
      → navigator.clipboard.writeText(codeParrain)
      → Après copie : icône Change (Check) + "Copié !" (durée 2s) puis revient
  - Ligne info : "[X] filleuls actifs / [Y] total"
  - Lien "Voir mes filleuls →" → navigate('/portal/referrals')

Design :
  - Fond bg-blue-50, bordure border-blue-100
  - Border-radius 12px


COMPOSANT QuickActionsGrid — QuickActionsGrid.tsx
---------------------------------------------------
Grille d'accès rapide aux sections principales :

  interface QuickActionsGridProps {
    onNavigate: (route: string) => void;
    nbFilleulsActifs: number;
  }

3 boutons disposés en 2 colonnes (la 3e sur toute la largeur) :

  Bouton 1 (col 1) : 🛍 Mes achats
    → navigate('/portal/purchases')
    → Fond bg-blue-500, texte blanc

  Bouton 2 (col 2) : ⭐ Mes points
    → navigate('/portal/points')
    → Fond bg-yellow-500, texte blanc

  Bouton 3 (pleine largeur) : 👥 Mes filleuls
    → navigate('/portal/referrals')
    → Sous-titre : "[nbFilleulsActifs] filleuls actifs"
    → Fond bg-green-600, texte blanc

Chaque bouton :
  - Height 72px, rounded-xl, shadow-sm
  - Icône (lucide 24px) + texte en text-sm font-semibold
  - Hover : slight scale(1.02) + ombre plus marquée
  - Active : scale(0.98) (feedback tactile)


COMPOSANT RecentPurchasesMini — RecentPurchasesMini.tsx
---------------------------------------------------------
Aperçu des 2-3 derniers achats :

  interface RecentPurchasesMiniProps {
    achats: {
      id: string;
      date: string;
      produitPrincipal: string;    // nom du premier article (ou "X articles")
      montantTotal: number;
      nbArticles: number;
    }[];
    onViewAll: () => void;
  }

Chaque ligne :
  - Date courte : "17 jan." en text-xs muted
  - Séparateur "·"
  - Produit : text-sm font-medium (tronqué à 25 chars)
  - Montant : text-sm font-semibold text-right formatCDF
  - Si nbArticles > 1 : ajouter "+ [X-1] article(s)"

Bouton bas : "Voir tous mes achats →" → onViewAll()

Si aucun achat : "Aucun achat enregistré pour l'instant."


STORE ZUSTAND — portal-auth.store.ts
--------------------------------------
Store d'authentification SÉPARÉ pour le portail client :

  // apps/client/src/stores/portal-auth.store.ts
  interface PortalAuthState {
    clientId: string | null;
    nom: string | null;
    prenom: string | null;
    telephone: string | null;
    accessToken: string | null;     // EN MÉMOIRE UNIQUEMENT (jamais localStorage)
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (telephone: string, pin: string) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
    setClient: (client: PortalClient) => void;
  }

Règles impératives :
  ✓ Le accessToken portal est en mémoire JS uniquement
  ✓ Complètement séparé du store auth admin (auth.store.ts)
  ✓ Pas de partage de token entre portail et admin
  ✓ Si la page est rafraîchie → tenter un refresh silencieux via le cookie httpOnly
  ✓ Si pas de cookie valide → redirect vers /portal/login


COMPOSANT PortalRoute — PortalRoute.tsx
-----------------------------------------
Guard de route pour toutes les pages du portail :

  interface PortalRouteProps {
    children: ReactNode;
  }

Comportement :
  1. Si portalAuthStore.isLoading → spinner centré
  2. Si !portalAuthStore.isAuthenticated → navigate('/portal/login')
  3. Sinon → rendre children dans PortalLayout


HOOK usePortalAuth — usePortalAuth.ts
----------------------------------------
  export function usePortalAuth() {
    return {
      clientId,
      nom,
      prenom,
      telephone,
      isAuthenticated,
      isLoading,
      login,          // (telephone, pin) => Promise<void>
      logout,         // () => void
      displayName,    // string — "Serge M."
    };
  }


HOOK usePortalHome — usePortalHome.ts
----------------------------------------
  export function usePortalHome() {
    const { clientId } = usePortalAuth();

    const { data, isLoading } = useQuery({
      queryKey: ['portal', 'home', clientId],
      queryFn: () => portalApi.getHomeData(clientId!),
      staleTime: 2 * 60_000,
      enabled: !!clientId,
    });

    return {
      niveauFidelite,
      pointsActuels,
      remisePct,
      codeParrain,
      nbFilleulsActifs,
      nbFilleulsTotal,
      dernierAchats,      // 3 derniers achats max
      niveauxConfig,      // pour NiveauProgressBar
      isLoading,
    };
  }


APPELS API — Auth Portail
---------------------------
POST /api/v1/portal/auth/login
  Corps : { telephone: string, pin: string }   // pin = 4 chiffres
  Succès 200 :
    {
      accessToken: string,          // JWT 8h
      client: {
        id: string,
        nom: string,
        prenom: string,
        telephone: string
      }
    }
    + Set-Cookie: portalRefreshToken=<token>; HttpOnly; Secure; SameSite=Strict
  Erreur 401 :
    { error: { code: 'INVALID_CREDENTIALS', attemptsLeft: number } }
  Erreur 423 :
    { error: { code: 'ACCOUNT_LOCKED', unlocksAt: string } }
  Erreur 403 :
    { error: { code: 'CLIENT_NOT_ACTIVE',
               message: 'Votre compte n\'est pas encore activé. Contactez votre agent Progress Business.' } }

POST /api/v1/portal/auth/refresh
  Corps : (vide — refreshToken dans httpOnly cookie)
  Succès 200 : { accessToken: string }
  Erreur 401 : { error: { code: 'REFRESH_INVALID' } } → redirect login portail

POST /api/v1/portal/auth/logout
  → Invalide le refreshToken côté serveur + clear cookie


APPELS API — Données Accueil
------------------------------
GET /api/v1/portal/me
  En-têtes : Authorization: Bearer <portalAccessToken>
  Succès 200 :
    {
      client: {
        id, nom, prenom, telephone,
        niveauFidelite, pointsFidelite, remisePct,
        codeParrain,
        nbFilleulsActifs, nbFilleulsTotal,
        dernierAchats: [
          { id, date, produitPrincipal, montantTotal, nbArticles }
        ],
        niveauxConfig: NiveauConfig[]      // pour la barre de progression
      }
    }
  Erreur 401 : → refresh automatique → si fail → /portal/login

Back-end — portal.service.ts — méthode getMe() :
  1. Vérifier que le token JWT a role='CLIENT'
  2. Récupérer le Client avec son niveauFidelite, pointsFidelite
  3. COUNT Parrainage WHERE parrainId AND filleul.statut='ACTIF'
  4. Récupérer les 3 dernières Vente (triées createdAt desc) avec leurs lignes
  5. Construire produitPrincipal = première ligne.produit.nom
  6. Récupérer la FideliteConfig (niveaux) depuis le cache Redis
  7. Retourner tout consolidé

Back-end — portal-auth.service.ts — méthode login() :
  1. Trouver le Client par telephone
  2. Vérifier Client.statut === 'ACTIF' → sinon 403 CLIENT_NOT_ACTIVE
  3. Vérifier les tentatives en Redis : GET "portal_attempts:{clientId}"
     Si >= 5 → throw 423 avec unlocksAt
  4. Vérifier le PIN : await bcrypt.compare(pin, client.pinHash)
     Le PIN est stocké hashé dans Client.pinHash (champ ajouté lors de SCR-010)
  5. Si incorrect → INCR "portal_attempts:{clientId}", EXPIRE 10min, throw 401
  6. Si correct → DEL "portal_attempts:{clientId}"
  7. Générer accessToken JWT { sub: clientId, role: 'CLIENT', siteId: siteInscriptionId }
     Durée : 8h
  8. Générer refreshToken JWT, stocker hashé, Set-Cookie httpOnly
  9. Retourner accessToken + client (sans pinHash)


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — PAGE LOGIN PORTAIL
  - PIN saisie : 4 cases OTP (composant OtpInput du module Auth, mode PIN)
  - Erreur credentials : "Numéro ou PIN incorrect. [X] tentative(s) restante(s)."
  - Verrouillage : "Compte bloqué. Réessayez dans [X] minutes."
  - Client non actif : "Votre compte n'est pas encore activé.
    Contactez votre agent Progress Business."

État 2 — ACCUEIL CHARGEMENT
  - Skeleton de la PointsCard (rectangle gris animé)
  - Skeleton de la ParrainCard
  - Skeleton des 3 boutons QuickActions
  - Skeleton des 2 derniers achats

État 3 — ACCUEIL CHARGÉ
  - Salutation : "Bonjour, [Prénom] 👋" en text-xl font-bold
  - Tous les composants avec les vraies données

État 4 — CLIENT PLATINE
  - PointsCard : fond dégradé violet, barre pleine, "🏆 Niveau max !"
  - Confetti emoji + message de félicitations

État 5 — CLIENT BRONZE (0% remise)
  - PointsCard : pas de ligne "Remise applicable"
  - Message motivant : "Atteignez 500 pts pour débloquer votre première remise !"

État 6 — AUCUN ACHAT
  - RecentPurchasesMini : "Aucun achat enregistré pour l'instant."


STYLE ET DESIGN
-----------------
- Fond page (mobile)    : bg-white
- Fond page (desktop)   : bg-neutral-100
- Card desktop          : max-w-sm mx-auto bg-white shadow-xl rounded-2xl overflow-hidden
- PortalHeader          : bg-[#1E3A5F] text-white height 56px
- PortalNav             : bg-white border-t border-neutral-200
- Salutation            : text-xl font-bold text-[#1E3A5F]
- Sous-titre            : text-sm text-muted-foreground
- Section titre         : text-xs font-semibold uppercase tracking-wider text-muted mb-2
- Bouton primaire portail: bg-[#1E3A5F] text-white rounded-xl h-12 font-semibold


TESTS — PortalHomePage.test.tsx
---------------------------------
  describe('PortalLoginPage', () => {
    test('1  — Rendu : champ téléphone + 4 cases PIN')
    test('2  — PIN à 4 chiffres : auto-submit au 4ème chiffre')
    test('3  — Erreur 401 : message avec nb tentatives restantes')
    test('4  — Erreur 423 : compte bloqué, compte à rebours visible')
    test('5  — Erreur 403 CLIENT_NOT_ACTIVE : message agent affiché')
    test('6  — Connexion réussie → redirect vers /portal/home')
  })

  describe('PortalHomePage', () => {
    describe('Layout', () => {
      test('7  — PortalHeader affiché avec titre Progress Business')
      test('8  — PortalNav : 4 onglets Home, Achats, Points, Filleuls')
      test('9  — Onglet "Accueil" actif par défaut')
      test('10 — Sur desktop : Card centrée max-w-sm')
    })

    describe('PointsCard', () => {
      test('11 — Niveau, points, barre progression affichés')
      test('12 — Client PLATINE : "Niveau maximum" affiché')
      test('13 — Client BRONZE : ligne remise masquée')
      test('14 — Fond dégradé change selon le niveau')
    })

    describe('ParrainCard', () => {
      test('15 — Code parrain affiché en monospace')
      test('16 — Bouton Copier : clipboard.writeText appelé')
      test('17 — Après copie : texte change en "Copié !" pendant 2s')
      test('18 — Nb filleuls actifs affiché')
    })

    describe('QuickActions', () => {
      test('19 — 3 boutons d\'accès rapide affichés')
      test('20 — Clic "Mes achats" → navigate /portal/purchases')
      test('21 — Clic "Mes points" → navigate /portal/points')
      test('22 — Clic "Mes filleuls" → navigate /portal/referrals')
    })

    describe('Derniers achats', () => {
      test('23 — 2-3 derniers achats affichés avec date et montant')
      test('24 — Empty state si aucun achat')
      test('25 — Lien "Voir tous mes achats" navigue vers /portal/purchases')
    })

    describe('Auth et sécurité', () => {
      test('26 — PortalRoute redirige vers /portal/login si non connecté')
      test('27 — Token portail séparé du token admin (stores différents)')
      test('28 — Déconnexion → redirect /portal/login')
      test('29 — Skeleton visible pendant le chargement des données')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-035
---------------------------------------------
[ ] Le PortalLoginPage fonctionne avec téléphone + PIN 4 chiffres
[ ] Les erreurs login (401, 423, 403) affichent les bons messages adaptés
[ ] La connexion réussie redirige vers /portal/home
[ ] Le PortalLayout s'affiche correctement en mobile ET desktop
[ ] La PointsCard affiche le bon niveau, points et barre de progression
[ ] Le dégradé de fond de la PointsCard change selon le niveau
[ ] Le client PLATINE voit "Niveau maximum atteint !"
[ ] Le client BRONZE ne voit pas la ligne remise
[ ] La ParrainCard affiche le code parrain et le bouton Copier fonctionne
[ ] Les 3 QuickActions naviguent vers les bonnes routes
[ ] Les 2-3 derniers achats s'affichent avec date et montant
[ ] Le PortalRoute redirige si non authentifié
[ ] Le token portail est séparé du token admin (stores distincts)
[ ] npm run test : 29 tests PortalHomePage/LoginPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 / 4 — SCR-036 : PORTAIL CLIENT — MES ACHATS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet        : Progress Business — Module Portail Client
Fichier cible : apps/client/src/pages/portal/PortalPurchasesPage.tsx
Route         : /portal/purchases
Accès         : Authentifié portail — rôle CLIENT uniquement
Rôle minimum  : CLIENT
Dépendances   : SCR-035 terminé (PortalLayout, PortalRoute, usePortalAuth, portalApi)


OBJECTIF
--------
Créer la page "Mes Achats" du portail client (SCR-036).
Le client peut consulter l'historique complet de ses achats, filtrer par période,
voir le détail de chaque transaction, et connaître le total dépensé.
L'interface reste simple et mobile-first — pas de tableau complexe,
mais une liste de cartes d'achat claires et lisibles.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/portal/PortalPurchasesPage.tsx              ← CRÉER (principal)
2. apps/client/src/pages/portal/PortalPurchasesPage.test.tsx         ← CRÉER (tests Vitest)
3. apps/client/src/components/portal/PurchaseCard.tsx                ← CRÉER (carte achat)
4. apps/client/src/components/portal/PurchaseDetailSheet.tsx         ← CRÉER (détail bottom sheet)
5. apps/client/src/components/portal/PurchasePeriodFilter.tsx        ← CRÉER (filtre période)
6. apps/client/src/components/portal/PurchasesStats.tsx              ← CRÉER (stats période)
7. apps/client/src/hooks/usePortalPurchases.ts                       ← CRÉER (hook TQ)

BACK-END :
8. apps/server/src/modules/portal/portal.controller.ts               ← AJOUTER GET /purchases


UI — STRUCTURE VISUELLE COMPLÈTE (mobile-first)
-------------------------------------------------
  ┌──────────────────────────────────────────┐
  │  ← Accueil    Mes achats                 │  ← PortalHeader avec showBack=true
  ├──────────────────────────────────────────┤
  │                                          │
  │  [ Ce mois ▼ ]  [ 3 mois ] [ Tout ]      │  ← PurchasePeriodFilter (pills)
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │ Total dépensé ce mois              │  │
  │  │ 1 285 000 CDF  · 5 achats          │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  ── Janvier 2025 ──────────────────────  │
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │ 17 jan. 14:32          Progress Business Goma│  │
  │  │ Samsung Galaxy A54 + 1 article     │  │
  │  │ 513 950 CDF         +450 pts  ›    │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │ 12 jan. 11:05          Progress Business Goma│  │
  │  │ Chargeur rapide 65W · ×2           │  │
  │  │  56 000 CDF          +56 pts  ›    │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  ── Décembre 2024 ───────────────────── │
  │  ┌────────────────────────────────────┐  │
  │  │ 28 déc. 09:20          Progress Business Goma│  │
  │  │ iPhone 14                          │  │
  │  │ 1 200 000 CDF       +1200 pts  ›   │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  [ Charger plus... ]                     │
  │                                          │
  ├──────────────────────────────────────────┤
  │  [🏠] [🛍 ●] [⭐] [👥]                  │  ← PortalNav (onglet Achats actif)
  └──────────────────────────────────────────┘


COMPOSANT PurchaseCard — PurchaseCard.tsx
-------------------------------------------
Carte d'un achat dans la liste :

  interface PurchaseCardProps {
    achat: {
      id: string;
      date: string;
      siteNom: string;
      produitPrincipal: string;     // nom du 1er article
      nbArticlesSupp: number;       // articles supplémentaires (nbArticles - 1)
      montantTotal: number;
      pointsAttribues: number;
      modePaiement: 'CASH' | 'MPESA' | 'AIRTEL_MONEY' | 'VIREMENT';
      remiseAppliquee: number;      // 0 si aucune remise
    };
    onTap: (id: string) => void;
  }

Contenu de la carte :
  Ligne 1 (haut) :
    - Date/heure : "17 jan. 14:32" (gauche) | Site : "Progress Business Goma" (droite, text-xs muted)
  Ligne 2 (milieu) :
    - Produit principal en text-sm font-medium
    - Si nbArticlesSupp > 0 : "+ [X] article(s)" en text-xs muted
  Ligne 3 (bas) :
    - Montant total en text-base font-bold #1E3A5F (gauche)
    - Si pointsAttribues > 0 : badge vert "+[X] pts" (milieu)
    - Chevron › (droite, text-muted)

Design :
  - bg-white border border-neutral-100 rounded-xl p-4 mb-3
  - Shadow-sm sur hover (cursor pointer)
  - Active state : scale(0.98) opacity-90 (feedback tactile)
  - Si remiseAppliquee > 0 : fine bordure gauche verte (4px border-l-4 border-green-500)
    avec tooltip/sous-texte : "Remise [niveau] appliquée : -[X] CDF"

Groupement par mois :
  La liste est groupée par mois avec un séparateur titre entre chaque groupe :
    "── Janvier 2025 ──────────────────────"
  Utiliser date-fns/fr pour formater "MMMM yyyy" en français.


COMPOSANT PurchaseDetailSheet — PurchaseDetailSheet.tsx
---------------------------------------------------------
Bottom Sheet (panneau qui monte du bas) affichant le détail d'un achat.
Utiliser le composant Drawer de shadcn/ui (qui s'ouvre depuis le bas sur mobile).

  interface PurchaseDetailSheetProps {
    venteId: string | null;
    isOpen: boolean;
    onClose: () => void;
  }

Contenu du Drawer :
  En-tête : N° vente (monospace) + date + statut badge
  Section client/site : site de la vente + mode de paiement (icône + libellé)

  Tableau des articles :
    - Nom produit | Quantité × Prix unitaire | Sous-total
    - Police normale, taille text-sm
    - Pas de thead (trop complexe mobile) → liste simple avec séparateurs

  Récapitulatif financier :
    Sous-total           : [X] CDF
    Remise [niveau] (Y%) : -[Z] CDF     ← si applicable, en vert
    ══════════════════════════════════
    TOTAL PAYÉ           : [X] CDF      ← font-bold

  Section points :
    Si pointsAttribues > 0 :
      "+[X] points attribués"
      "Votre solde après cet achat : [Y] pts"

  Bouton bas :
    Si reçu disponible (toujours) :
      [📄 Voir le reçu] → navigate(`/sales/${venteId}/receipt`, { target: '_blank' })
      ← Ce lien s'ouvre dans un nouvel onglet

Chargement du détail :
  Quand l'id de vente change et que le Drawer s'ouvre → fetcher GET /api/v1/portal/purchases/:id
  Skeleton pendant le chargement (3 lignes d'articles skeleton)


COMPOSANT PurchasePeriodFilter — PurchasePeriodFilter.tsx
-----------------------------------------------------------
Filtre de période simple en "pills" (boutons arrondis) :

  Options : [Ce mois] [3 derniers mois] [Tout]

  Style pills :
    Actif   : bg-[#1E3A5F] text-white rounded-full px-4 py-2 text-sm
    Inactif : bg-neutral-100 text-neutral-600 rounded-full px-4 py-2 text-sm
  
  Horizontalement scrollable si nécessaire (overflow-x-auto no-scrollbar).


COMPOSANT PurchasesStats — PurchasesStats.tsx
-----------------------------------------------
Carte de statistiques de la période sélectionnée :

  interface PurchasesStatsProps {
    totalDepense: number;
    nbAchats: number;
    totalPointsGagnes: number;
    period: string;
  }

Contenu :
  - "Total dépensé [period]" en text-xs uppercase muted
  - Montant en text-2xl font-bold couleur #1E3A5F
  - Ligne : "[nbAchats] achats · +[totalPointsGagnes] pts gagnés" en text-sm muted

Design :
  - bg-blue-50 border border-blue-100 rounded-xl p-4


HOOK usePortalPurchases — usePortalPurchases.ts
-------------------------------------------------
  export function usePortalPurchases() {
    const { clientId } = usePortalAuth();
    const [period, setPeriod] = useState<'month' | '3months' | 'all'>('month');
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
      queryKey: ['portal', 'purchases', clientId, period],
      queryFn: ({ pageParam = 1 }) =>
        portalApi.getPurchases({ clientId: clientId!, period, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
      staleTime: 2 * 60_000,
    });

    // Grouper les achats par mois (pour les séparateurs)
    const achatsByMonth = useMemo(() => {
      const allAchats = data?.pages.flatMap(p => p.achats) ?? [];
      return groupBy(allAchats, (a) => format(new Date(a.date), 'MMMM yyyy', { locale: fr }));
    }, [data]);

    return { achatsByMonth, stats: data?.pages[0]?.stats, isLoading,
             isFetchingNextPage, fetchNextPage, hasNextPage, period, setPeriod };
  }

Note : utiliser useInfiniteQuery (TanStack Query) pour le "Charger plus" infini.
Pas de pagination classique — le client fait défiler vers le bas.


APPELS API
-----------
GET /api/v1/portal/purchases
  En-têtes : Authorization: Bearer <portalAccessToken>
  Query :
    period    : 'month' | '3months' | 'all'
    page      : number (défaut 1)
    limit     : number (défaut 20)
  Succès 200 :
    {
      achats: [
        {
          id: string,
          date: string,
          siteNom: string,
          produitPrincipal: string,
          nbArticles: number,
          montantTotal: number,
          remiseAppliquee: number,
          pointsAttribues: number,
          modePaiement: string
        }
      ],
      stats: {
        totalDepense: number,
        nbAchats: number,
        totalPointsGagnes: number
      },
      meta: { total, page, limit, totalPages }
    }

GET /api/v1/portal/purchases/:venteId
  En-têtes : Authorization: Bearer <portalAccessToken>
  Succès 200 :
    {
      vente: {
        id, numeroVente, date, siteNom, modePaiement,
        lignes: [{ nom, quantite, prixUnitaire, sousTotal }],
        montantBrut, remiseFidelite, montantNet,
        pointsAttribues, soldePointsApres
      }
    }
  Erreur 403 :
    { error: { code: 'ACCESS_DENIED' } }   ← si cette vente n'appartient pas au client

Back-end — portal.service.ts — méthode getPurchases() :
  1. Filtrer strictement par clientId issu du JWT (sécurité absolue)
  2. Calculer dateDebut selon period (moment.js ou date-fns)
  3. Requête Prisma : Vente WHERE clientId AND createdAt > dateDebut
  4. Calculer stats (SUM + COUNT) dans la même requête (pas de requête séparée)
  5. Construire produitPrincipal depuis la première LigneVente
  6. Paginer et retourner


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT INITIAL
  - 4 cartes PurchaseCard skeleton (rectangles gris animés)
  - PurchasesStats skeleton (card grise)

État 2 — LISTE CHARGÉE
  - Achats groupés par mois avec séparateurs
  - Stats de la période affichées

État 3 — AUCUN ACHAT SUR LA PÉRIODE
  - Si filtre "Ce mois" → "Aucun achat ce mois. Vos achats s'afficheront ici."
  - Bouton "Voir tous mes achats" → changer filtre à "Tout"
  - Si filtre "Tout" et toujours vide → "Aucun achat enregistré pour l'instant."

État 4 — CHARGEMENT DU DÉTAIL (Bottom Sheet)
  - Drawer s'ouvre avec skeleton de 3 lignes articles

État 5 — CHARGER PLUS
  - Bouton "Charger plus" en bas de la liste (si hasNextPage)
  - Pendant fetchNextPage : spinner sous la liste
  - Si !hasNextPage : "Vous avez vu tous vos achats." en text-center muted

État 6 — CHANGEMENT DE PÉRIODE
  - La liste se réinitialise à la page 1
  - keepPreviousData : liste précédente en opacity-60 pendant rechargement


TESTS — PortalPurchasesPage.test.tsx
--------------------------------------
  describe('PortalPurchasesPage', () => {
    test('1  — Liste d\'achats affichée avec cartes groupées par mois')
    test('2  — PurchasesStats : total dépensé, nb achats, pts gagnés')
    test('3  — Filtre "Ce mois" par défaut')
    test('4  — Clic pill "3 derniers mois" → liste refiltrée')
    test('5  — Carte avec remise : bordure gauche verte visible')
    test('6  — Clic sur une carte → Drawer de détail s\'ouvre')
    test('7  — Drawer : tableau articles avec montants corrects')
    test('8  — Drawer : récapitulatif financier avec remise fidélité')
    test('9  — Drawer : section points si pointsAttribues > 0')
    test('10 — Drawer : bouton "Voir le reçu" navigue vers /sales/:id/receipt')
    test('11 — Empty state "Ce mois" avec bouton "Voir tout"')
    test('12 — Empty state "Tout" si aucun achat')
    test('13 — "Charger plus" charge la page suivante (useInfiniteQuery)')
    test('14 — "Vous avez vu tous vos achats" si !hasNextPage')
    test('15 — Skeleton visible pendant le chargement initial')
    test('16 — API filtre strictement par clientId du JWT (sécurité)')
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-036
---------------------------------------------
[ ] La liste d'achats est groupée par mois avec des séparateurs de dates
[ ] Les stats (total, nb achats, pts) changent selon le filtre de période
[ ] Les 3 pills de filtre de période fonctionnent correctement
[ ] La PurchaseCard avec remise affiche la bordure gauche verte
[ ] Le Drawer de détail s'ouvre au clic et charge les données de la vente
[ ] Le Drawer affiche les articles, la remise et les points attribués
[ ] Le bouton "Voir le reçu" ouvre le reçu dans un nouvel onglet
[ ] L'infinite scroll "Charger plus" fonctionne (useInfiniteQuery)
[ ] L'empty state adapté s'affiche selon le filtre et la situation
[ ] L'API filtre strictement par clientId (pas d'accès aux ventes d'autres clients)
[ ] npm run test : 16 tests PortalPurchasesPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 3 / 4 — SCR-037 : PORTAIL CLIENT — MES POINTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet        : Progress Business — Module Portail Client
Fichier cible : apps/client/src/pages/portal/PortalPointsPage.tsx
Route         : /portal/points
Accès         : Authentifié portail — rôle CLIENT uniquement
Rôle minimum  : CLIENT
Dépendances   : SCR-035 terminé (PortalLayout, usePortalAuth, portalApi)
                SCR-027 terminé (NiveauBadge, NiveauConfig types)


OBJECTIF
--------
Créer la page "Mes Points" du portail client (SCR-037).
Le client voit son solde actuel, sa progression vers le niveau suivant,
le tableau des 4 niveaux avec leurs avantages, et l'historique complet
de tous ses mouvements de points (gains + déductions).
Interface pédagogique : expliquer clairement comment gagner des points.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/portal/PortalPointsPage.tsx                 ← CRÉER (principal)
2. apps/client/src/pages/portal/PortalPointsPage.test.tsx            ← CRÉER (tests Vitest)
3. apps/client/src/components/portal/PortalNiveauxGuide.tsx          ← CRÉER (guide niveaux)
4. apps/client/src/components/portal/PortalPointsMouvement.tsx       ← CRÉER (ligne mouvement)
5. apps/client/src/components/portal/HowToEarnPoints.tsx             ← CRÉER (section éducative)
6. apps/client/src/hooks/usePortalPoints.ts                          ← CRÉER (hook TQ)

BACK-END :
7. apps/server/src/modules/portal/portal.controller.ts               ← AJOUTER GET /points


UI — STRUCTURE VISUELLE COMPLÈTE (mobile-first)
-------------------------------------------------
  ┌──────────────────────────────────────────┐
  │  ← Accueil    Mes points                 │
  ├──────────────────────────────────────────┤
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │  ■ OR           2 963 pts          │  │
  │  │  Votre solde actuel                │  │
  │  │                                    │  │
  │  │  Progression vers PLATINE          │  │
  │  │  ██████████████░░░░░░  59%         │  │
  │  │  Il vous manque 2 037 pts          │  │
  │  │  Débloquez la remise de 8% !       │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  LES NIVEAUX                             │
  │  ┌──────────┐┌──────────┐              │
  │  │■ Bronze   ││■ Argent  │              │
  │  │0-499 pts  ││500-1999  │              │
  │  │Remise: 0% ││Remise:3% │              │
  │  └──────────┘└──────────┘              │
  │  ┌──────────┐┌──────────┐              │
  │  │■ Or       ││■ Platine │              │
  │  │2000-4999  ││5000+ pts │              │
  │  │Remise: 5% ││Remise:8% │              │
  │  └──────────┘└──────────┘              │
  │                                          │
  │  COMMENT GAGNER DES POINTS ?             │
  │  🛍 Achetez → 1 pt par 1 000 CDF        │
  │  👥 Parrainez → 500 pts par filleul      │
  │                                          │
  │  HISTORIQUE DE VOS POINTS                │
  │  [ Tous ] [ Gains ] [ Déductions ]       │
  │                                          │
  │  17 jan.  Achat · +450 pts · 2 963 pts  │
  │  15 jan.  Parrainage NGABO · +500 pts   │
  │  12 jan.  Achat · +1200 pts · 2 013 pts │
  │  08 jan.  Retour · -150 pts · 813 pts   │
  │                                          │
  │  [ Charger plus... ]                     │
  ├──────────────────────────────────────────┤
  │  [🏠] [🛍] [⭐ ●] [👥]                  │
  └──────────────────────────────────────────┘


COMPOSANT PortalNiveauxGuide — PortalNiveauxGuide.tsx
-------------------------------------------------------
Guide visuel des 4 niveaux en grille 2×2 :

  interface PortalNiveauxGuideProps {
    niveauxConfig: NiveauConfig[];
    niveauActuel: NiveauFidelite;
  }

Chaque carte de niveau :
  - Fond coloré selon le niveau (même dégradés que PointsCard)
  - NiveauBadge (size="sm") en haut
  - Seuil : "[seuilMin]–[seuilMax] pts" (ou "[seuilMin]+ pts" pour PLATINE)
  - Remise : "Remise : [X]%"
  - Avantages (si configurés) : liste courte sous la remise

Niveau ACTUEL du client :
  - Bordure 2px de la couleur du niveau + icône ✓ en haut à droite
  - Légère ombre shadow-md (distingué des autres)

Niveaux FUTURS (au-dessus du niveau actuel) :
  - Légère opacité 70% + cadenas 🔒 (icône Lock lucide 16px) en haut à droite
  - Tooltip : "Atteignez [X] pts pour débloquer"

Niveaux PASSÉS (en dessous du niveau actuel) :
  - Coche ✓ en haut à droite (déjà atteints/dépassés)


COMPOSANT HowToEarnPoints — HowToEarnPoints.tsx
-------------------------------------------------
Section éducative expliquant simplement comment gagner des points.

  interface HowToEarnPointsProps {
    ratioPtsCDF: number;            // ex: 1000 → "1 pt par 1 000 CDF"
    recompenseParrainage: number;   // valeur depuis RegleParrainage
    typeRecompense: TypeRecompense;
  }

Contenu :
  Titre "COMMENT GAGNER DES POINTS ?" en text-xs uppercase tracking-wider

  Deux lignes d'explication :
    Ligne 1 : icône ShoppingBag (vert) + "Achetez des produits"
      Sous-titre : "1 point pour chaque [X] CDF dépensés"
    Ligne 2 : icône Users (bleu) + "Parrainez un ami"
      Sous-titre : "[valeurRecompense] pts quand votre filleul est activé"
      (Adapter selon typeRecompense : pts / remise / commission)

  Note bas de section (text-xs muted italic) :
    "Les points sont attribués automatiquement lors de chaque achat en magasin."

Design :
  bg-neutral-50 border border-neutral-100 rounded-xl p-4


COMPOSANT PortalPointsMouvement — PortalPointsMouvement.tsx
-------------------------------------------------------------
Ligne d'un mouvement de points dans l'historique :

  interface PortalPointsMouvementProps {
    mouvement: MouvementPoints;
    onClick?: () => void;
  }

Contenu (layout flex row) :
  Gauche :
    - Icône selon type (ShoppingBag / Users / RotateCcw / Clock / Settings2)
      dans un cercle coloré 36×36px
      ACHAT       → cercle bg-green-100 icône text-green-600
      PARRAINAGE  → cercle bg-blue-100 icône text-blue-600
      RETOUR      → cercle bg-red-100 icône text-red-600
      EXPIRATION  → cercle bg-orange-100 icône text-orange-600
      AJUSTEMENT  → cercle bg-gray-100 icône text-gray-600
  Centre :
    - Description (text-sm font-medium, tronquée 30 chars)
    - Date : "17 jan. · 14:32" (text-xs muted)
  Droite :
    - Delta en text-base font-bold :
        Positif → text-green-600 "+[X] pts"
        Négatif → text-red-600 "-[X] pts"
    - Solde après : "[Y] pts" en text-xs muted

Séparateur fin entre chaque ligne (Separator shadcn).


HOOK usePortalPoints — usePortalPoints.ts
------------------------------------------
  export function usePortalPoints() {
    const { clientId } = usePortalAuth();
    const [typeFilter, setTypeFilter] = useState<'all' | 'gains' | 'deductions'>('all');

    // Données du solde et config niveaux (depuis le cache /portal/me si disponible)
    const { data: homeData } = useQuery({
      queryKey: ['portal', 'home', clientId],
      staleTime: 2 * 60_000,
    });

    // Historique mouvements en infinite scroll
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
      queryKey: ['portal', 'points', clientId, typeFilter],
      queryFn: ({ pageParam = 1 }) =>
        portalApi.getPointsMouvements({ clientId: clientId!, typeFilter, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (last) => last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
      staleTime: 2 * 60_000,
    });

    const allMouvements = data?.pages.flatMap(p => p.mouvements) ?? [];

    return {
      niveauFidelite: homeData?.client.niveauFidelite,
      pointsActuels: homeData?.client.pointsFidelite,
      remisePct: homeData?.client.remisePct,
      niveauxConfig: homeData?.client.niveauxConfig,
      mouvements: allMouvements,
      typeFilter, setTypeFilter,
      isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
    };
  }


APPELS API
-----------
GET /api/v1/portal/points
  En-têtes : Authorization: Bearer <portalAccessToken>
  Query :
    type      : 'all' | 'gains' | 'deductions'
    page      : number (défaut 1)
    limit     : number (défaut 20)
  Succès 200 :
    {
      mouvements: [MouvementPoints],
      meta: { total, page, limit, totalPages }
    }
  Note : le solde actuel vient déjà du cache GET /api/v1/portal/me (SCR-035).
  Pas besoin de re-fetcher le solde ici.

Back-end — portal.service.ts — méthode getPointsMouvements() :
  1. Filtrer strictement par clientId du JWT
  2. Si type='gains' → WHERE deltaPoints > 0
  3. Si type='deductions' → WHERE deltaPoints < 0
  4. Trier par createdAt DESC
  5. Paginer et retourner


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - Skeleton de la carte solde/progression (rectangle gris 120px)
  - Skeleton grille niveaux (4 cartes grises)
  - Skeleton 4 lignes mouvements

État 2 — DONNÉES CHARGÉES
  - Carte solde avec barre de progression correctement colorée
  - Grille niveaux avec niveau actuel en surbrillance
  - Historique des mouvements

État 3 — FILTRE "GAINS" UNIQUEMENT
  - Seules les lignes deltaPoints > 0 affichées
  - Stats récalculées : "Total gagné : +X pts"

État 4 — FILTRE "DÉDUCTIONS" UNIQUEMENT
  - Seules les lignes deltaPoints < 0 affichées
  - Stats récalculées : "Total déduit : -X pts"

État 5 — AUCUN MOUVEMENT
  - Si filtre "Tout" et aucun mouvement :
    "Vous n'avez pas encore de points. Faites votre premier achat !"
  - Si filtre "Déductions" et aucune déduction :
    "Aucune déduction de points pour l'instant."

État 6 — CLIENT PLATINE
  - Barre de progression pleine (100%)
  - "🏆 Vous avez atteint le niveau maximum !"
  - Section HowToEarnPoints toujours visible (encourage à continuer d'acheter)


TESTS — PortalPointsPage.test.tsx
------------------------------------
  describe('PortalPointsPage', () => {
    describe('Solde et progression', () => {
      test('1  — Solde actuel et niveau affichés')
      test('2  — Barre de progression colorée selon le niveau')
      test('3  — Nb de points manquants pour le niveau suivant')
      test('4  — Message motivant selon le niveau (Bronze/Argent/Or → Platine)')
      test('5  — Client PLATINE : "Niveau maximum" + barre pleine')
    })

    describe('Guide des niveaux', () => {
      test('6  — 4 niveaux affichés en grille 2x2')
      test('7  — Niveau actuel : bordure colorée + coche ✓')
      test('8  — Niveaux futurs : opacité 70% + cadenas')
      test('9  — Niveaux passés : coche ✓')
    })

    describe('Comment gagner des points', () => {
      test('10 — Ratio pts/CDF affiché correctement')
      test('11 — Récompense parrainage affichée')
    })

    describe('Historique mouvements', () => {
      test('12 — Liste des mouvements avec icône, description, delta, solde')
      test('13 — Mouvement positif affiché en vert')
      test('14 — Mouvement négatif affiché en rouge')
      test('15 — Filtre "Gains" : ne montre que les deltaPoints > 0')
      test('16 — Filtre "Déductions" : ne montre que les deltaPoints < 0')
      test('17 — "Charger plus" (infinite scroll) fonctionne')
      test('18 — Empty state "Tout" si aucun mouvement')
      test('19 — Empty state "Déductions" si aucune déduction')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-037
---------------------------------------------
[ ] Le solde et la barre de progression sont correctement affichés et colorés
[ ] Le message de progression change selon le niveau actuel du client
[ ] Le client PLATINE voit "Niveau maximum" avec la barre pleine
[ ] La grille niveaux distingue correctement niveau actuel / passés / futurs
[ ] La section éducative affiche le bon ratio et la bonne récompense parrainage
[ ] Les 3 filtres de mouvements (Tous/Gains/Déductions) fonctionnent
[ ] Chaque mouvement affiche la bonne icône colorée selon son type
[ ] L'infinite scroll "Charger plus" fonctionne
[ ] Les empty states adaptés s'affichent selon le filtre
[ ] npm run test : 19 tests PortalPointsPage.test.tsx ✓
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 4 / 4 — SCR-038 : PORTAIL CLIENT — MES FILLEULS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
CONTEXTE
--------
Projet        : Progress Business — Module Portail Client
Fichier cible : apps/client/src/pages/portal/PortalReferralsPage.tsx
Route         : /portal/referrals
Accès         : Authentifié portail — rôle CLIENT uniquement
Rôle minimum  : CLIENT
Dépendances   : SCR-035 terminé (PortalLayout, usePortalAuth, portalApi)
                Module Parrainage terminé (types Parrainage, ParrainageStatut)


OBJECTIF
--------
Créer la page "Mes Filleuls" du portail client (SCR-038).
Le client voit son code parrain personnel, ses statistiques de parrainage
(filleuls actifs, gains totaux), la liste de ses filleuls avec leur statut,
et l'historique des récompenses reçues.
L'interface encourage le client à partager son code parrain.


FICHIERS À CRÉER OU MODIFIER
------------------------------
FRONT-END :
1. apps/client/src/pages/portal/PortalReferralsPage.tsx              ← CRÉER (principal)
2. apps/client/src/pages/portal/PortalReferralsPage.test.tsx         ← CRÉER (tests Vitest)
3. apps/client/src/components/portal/ShareCodeCard.tsx               ← CRÉER (partage code)
4. apps/client/src/components/portal/ReferralStatsCards.tsx          ← CRÉER (stats parrainage)
5. apps/client/src/components/portal/FilleulCard.tsx                 ← CRÉER (carte filleul)
6. apps/client/src/components/portal/RecompenseCard.tsx              ← CRÉER (récompense reçue)
7. apps/client/src/components/portal/HowReferralWorks.tsx            ← CRÉER (explications)
8. apps/client/src/hooks/usePortalReferrals.ts                       ← CRÉER (hook TQ)

BACK-END :
9. apps/server/src/modules/portal/portal.controller.ts               ← AJOUTER GET /referrals


UI — STRUCTURE VISUELLE COMPLÈTE (mobile-first)
-------------------------------------------------
  ┌──────────────────────────────────────────┐
  │  ← Accueil    Mes filleuls               │
  ├──────────────────────────────────────────┤
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │  VOTRE CODE PARRAIN               │  │
  │  │         TSG-0005                  │  │
  │  │                                   │  │
  │  │  [📋 Copier]  [📤 Partager]       │  │
  │  │                                   │  │
  │  │  Donnez ce code à vos amis !      │  │
  │  │  Ils le saisiront lors de leur    │  │
  │  │  inscription chez Progress Business.       │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  ┌────────────┐  ┌────────────┐         │
  │  │ Filleuls   │  │ Gains      │         │
  │  │ actifs : 32│  │ totaux :   │         │
  │  │ / 38 total │  │ 16 000 pts │         │
  │  └────────────┘  └────────────┘         │
  │                                          │
  │  COMMENT ÇA MARCHE ?                     │
  │  1. Donnez votre code à un ami           │
  │  2. Il s'inscrit et suit la formation    │
  │  3. Vous recevez 500 pts !               │
  │                                          │
  │  MES FILLEULS (32 actifs)                │
  │  [ Actifs ] [ En attente ] [ Tous ]      │
  │                                          │
  │  ┌────────────────────────────────────┐  │
  │  │  B  BAHATI Jean-Pierre  · Actif ●  │  │
  │  │     Inscrit le 12 jan. 2025        │  │
  │  │     Vous a rapporté : +500 pts     │  │
  │  └────────────────────────────────────┘  │
  │  ┌────────────────────────────────────┐  │
  │  │  N  NGABO Yvette  · Actif ●        │  │
  │  │     Inscrit le 10 jan. 2025        │  │
  │  │     Vous a rapporté : +500 pts     │  │
  │  └────────────────────────────────────┘  │
  │  ┌────────────────────────────────────┐  │
  │  │  M  MUNYANGA Patrick · En attente ○│  │
  │  │     Inscrit le 08 jan. 2025        │  │
  │  │     Formation en cours...          │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  [ Charger plus... ]                     │
  │                                          │
  ├──────────────────────────────────────────┤
  │  [🏠] [🛍] [⭐] [👥 ●]                  │
  └──────────────────────────────────────────┘


COMPOSANT ShareCodeCard — ShareCodeCard.tsx
---------------------------------------------
Carte de partage du code parrain — composant principal de la page.

  interface ShareCodeCardProps {
    codeParrain: string;
    onCopy: () => void;
    onShare: () => void;
    isCopied: boolean;
  }

Contenu :
  - Titre "VOTRE CODE PARRAIN" en text-xs uppercase tracking-wider
  - Code en text-4xl font-mono font-bold text-[#1E3A5F] centré
  - 2 boutons côte à côte :
      [📋 Copier le code]  → Copier dans le presse-papier
      [📤 Partager]        → Web Share API (navigator.share) sur mobile
  - Texte explicatif en text-sm muted :
    "Donnez ce code à vos amis lors de leur inscription chez Progress Business."

Bouton Copier :
  - Clic → navigator.clipboard.writeText(codeParrain)
  - Feedback : icône Check + "Copié !" pendant 2s
  - Si clipboard non disponible → toast d'erreur discret

Bouton Partager (Web Share API) :
  - Si navigator.share disponible (mobile) :
    navigator.share({
      title: 'Progress Business — Code Parrain',
      text: `Inscris-toi chez Progress Business avec mon code parrain : ${codeParrain}`,
      url: 'https://progress_business.cd'    // URL configurable via env var
    })
  - Si non disponible (desktop) :
    → Ouvrir un Dialog avec le texte à copier/partager manuellement
    → Bouton "Copier le message" dans le Dialog

Design de la carte :
  - Fond dégradé bg-gradient-to-br from-[#1E3A5F] to-[#2E86C1]
  - Texte blanc
  - rounded-2xl padding p-6
  - Shadow-lg


COMPOSANT ReferralStatsCards — ReferralStatsCards.tsx
-------------------------------------------------------
Deux cartes stats côte à côte :

  Carte 1 — Filleuls actifs :
    - Valeur principale : nb filleuls actifs en text-3xl font-bold blanc
    - Sous-titre : "[total] inscrits au total"
    - Icône Users2 (lucide) blanc

  Carte 2 — Gains totaux :
    - Valeur principale : selon typeRecompense
      POINTS → "[X] pts" en text-3xl font-bold
      COMMISSION_CDF → "[X] CDF" formatCDF
      REMISE_PROCHAINE → "[X] remises reçues"
    - Sous-titre : "depuis votre inscription"
    - Icône Gift (lucide)

Design :
  - Même fond que ShareCodeCard (dégradé bleu) mais plus discret (opacity-90)
  - Ou alternativement : bg-white border border-blue-100 shadow-sm


COMPOSANT HowReferralWorks — HowReferralWorks.tsx
---------------------------------------------------
Section éducative expliquant le fonctionnement du parrainage :

  interface HowReferralWorksProps {
    recompenseValeur: number;
    typeRecompense: TypeRecompense;
  }

Contenu : 3 étapes numérotées avec icônes

  Étape 1 : Icône Share (bleu) dans cercle
    "Donnez votre code"
    Sous-texte : "Partagez le code TSG-XXXX avec vos amis."

  Étape 2 : Icône UserPlus (vert) dans cercle
    "Votre ami s'inscrit"
    Sous-texte : "Il utilise votre code lors de son inscription et
    suit la formation Progress Business."

  Étape 3 : Icône Gift (or) dans cercle
    "Vous recevez votre récompense"
    Sous-texte selon typeRecompense :
      POINTS         → "Dès que son compte est activé, vous gagnez [X] pts !"
      COMMISSION_CDF → "Dès que son compte est activé, vous gagnez [X] CDF !"
      REMISE_PROCHAINE → "Vous obtenez un bon de remise sur votre prochain achat !"

Connexion visuelle entre les étapes : ligne verticale pointillée entre les cercles.

Design : bg-neutral-50 border border-neutral-100 rounded-xl p-4


COMPOSANT FilleulCard — FilleulCard.tsx
-----------------------------------------
Carte d'un filleul dans la liste :

  interface FilleulCardProps {
    filleul: {
      id: string;
      prenom: string;
      nom: string;
      statut: 'ACTIF' | 'EN_COURS' | 'SUSPENDU';
      dateInscription: string;
      recompenseGeneree: number;         // pts/CDF/remises selon config
      etapeEnCours?: string;             // si EN_COURS : "Formation en cours..." etc.
    };
    typeRecompense: TypeRecompense;
  }

Contenu :
  - Avatar 40×40px avec initiales (fond couleur selon statut : vert/orange/rouge)
  - Prénom + Nom (text-sm font-medium) + badge statut à droite
  - Date : "Inscrit le [date]" en text-xs muted
  - Si ACTIF : "Vous a rapporté : +[X] pts" en text-xs text-green-600
  - Si EN_COURS : "[etapeEnCours]" en text-xs text-orange-600 (italic)
  - Si SUSPENDU : "Compte suspendu" en text-xs text-red-500

Badge statut :
  ACTIF      → Badge vert   "Actif ●"
  EN_COURS   → Badge orange "En cours ○"
  SUSPENDU   → Badge rouge  "Suspendu ✗"

Design :
  bg-white border border-neutral-100 rounded-xl p-4 mb-3
  Shadow-sm

Note confidentialité :
  Ne pas afficher le numéro de téléphone du filleul dans le portail.
  Uniquement le prénom + initiale du nom (ex: "BAHATI J.") si souci de confidentialité.
  À décider avec l'entreprise — pour l'instant : prénom + nom complet.


FILTRE DE LA LISTE DES FILLEULS
----------------------------------
3 pills de filtre :
  [Actifs] [En attente] [Tous]
  Défaut : "Actifs"

  "En attente" = filleuls avec statut EN_COURS (inscription commencée mais pas activée)
  Afficher un message encourageant sous ce filtre :
    "Ces amis ont commencé leur inscription mais ne l'ont pas encore terminée.
    Encouragez-les à finaliser leur formation !"


HOOK usePortalReferrals — usePortalReferrals.ts
-------------------------------------------------
  export function usePortalReferrals() {
    const { clientId } = usePortalAuth();
    const [filter, setFilter] = useState<'actifs' | 'en_attente' | 'tous'>('actifs');

    const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
      queryKey: ['portal', 'referrals', clientId, filter],
      queryFn: ({ pageParam = 1 }) =>
        portalApi.getReferrals({ clientId: clientId!, filter, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (last) =>
        last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
      staleTime: 3 * 60_000,
    });

    const allFilleuls = data?.pages.flatMap(p => p.filleuls) ?? [];

    return {
      codeParrain: data?.pages[0]?.codeParrain,
      stats: data?.pages[0]?.stats,
      typeRecompense: data?.pages[0]?.typeRecompense,
      recompenseValeur: data?.pages[0]?.recompenseValeur,
      filleuls: allFilleuls,
      filter, setFilter,
      isLoading, fetchNextPage, hasNextPage,
    };
  }


APPELS API
-----------
GET /api/v1/portal/referrals
  En-têtes : Authorization: Bearer <portalAccessToken>
  Query :
    filter    : 'actifs' | 'en_attente' | 'tous'
    page      : number (défaut 1)
    limit     : number (défaut 20)
  Succès 200 :
    {
      codeParrain: string,
      stats: {
        nbFilleulsActifs: number,
        nbFilleulsTotal: number,
        gainsTotaux: number,         // selon typeRecompense
        typeRecompense: TypeRecompense,
        recompenseValeur: number
      },
      filleuls: [
        {
          id: string,
          prenom: string,
          nom: string,
          statut: 'ACTIF' | 'EN_COURS' | 'SUSPENDU',
          dateInscription: string,
          recompenseGeneree: number,
          etapeEnCours?: string      // description de l'étape si EN_COURS
        }
      ],
      meta: { total, page, limit, totalPages }
    }

Back-end — portal.service.ts — méthode getReferrals() :
  1. Filtrer strictement par parrainId = clientId du JWT
  2. Construire etapeEnCours pour les filleuls EN_COURS :
     Récupérer la dernière OnboardingEtape complétée
     Mapper vers un message lisible :
       RECIT complété → "Formation à suivre..."
       FORMATION complétée → "Achat de la fiche en cours..."
       Aucune étape → "Inscription en cours..."
  3. Calculer recompenseGeneree depuis les MouvementPoints (type PARRAINAGE)
     liés à chaque couple (parrainId, filleulId)
  4. Récupérer typeRecompense depuis RegleParrainage (cache Redis)
  5. Filtrer selon le filtre demandé
  6. Paginer et retourner


COMPORTEMENTS ET ÉTATS
------------------------
État 1 — CHARGEMENT
  - ShareCodeCard skeleton (rectangle dégradé animé)
  - 2 stats cards skeleton
  - 4 FilleulCard skeleton

État 2 — DONNÉES CHARGÉES
  - Tous les composants avec données réelles

État 3 — AUCUN FILLEUL (premier accès)
  - La ShareCodeCard reste toujours visible (encourage à partager)
  - HowReferralWorks toujours visible (éducatif)
  - Message : "Vous n'avez pas encore de filleuls."
  - Call-to-action : "Partagez votre code TSG-XXXX pour commencer !"

État 4 — FILTRE "EN ATTENTE" ACTIF
  - Message encourageant affiché au-dessus de la liste
  - Si aucun filleul en attente :
    "Tous vos amis inscrits ont bien finalisé leur inscription ! 🎉"

État 5 — PARTAGE VIA WEB SHARE API
  - navigator.share() appelé
  - Si l'utilisateur annule → rien (no-op)
  - Si succès → toast vert discret "Message partagé !"

État 6 — CHARGER PLUS
  - Bouton "Charger plus" visible si hasNextPage
  - Spinner pendant fetchNextPage
  - "Vous avez vu tous vos filleuls." si !hasNextPage et liste > 0


TESTS — PortalReferralsPage.test.tsx
--------------------------------------
  describe('PortalReferralsPage', () => {
    describe('ShareCodeCard', () => {
      test('1  — Code parrain affiché en monospace')
      test('2  — Bouton Copier : clipboard.writeText appelé')
      test('3  — Feedback "Copié !" pendant 2s après clic')
      test('4  — Bouton Partager : navigator.share appelé si disponible')
      test('5  — Dialog de partage manuel si navigator.share absent (desktop)')
    })

    describe('Stats', () => {
      test('6  — Nb filleuls actifs + total affichés')
      test('7  — Gains affichés selon typeRecompense (pts/CDF/remises)')
    })

    describe('HowReferralWorks', () => {
      test('8  — 3 étapes numérotées affichées')
      test('9  — Sous-texte adapté selon typeRecompense POINTS')
    })

    describe('Liste des filleuls', () => {
      test('10 — Filleuls actifs affichés avec badge vert')
      test('11 — Filleuls EN_COURS affichés avec etapeEnCours')
      test('12 — Filtre "Actifs" par défaut')
      test('13 — Filtre "En attente" affiche message encourageant')
      test('14 — Filtre "Tous" affiche actifs + en attente')
      test('15 — Chaque filleul actif : "Vous a rapporté : +X pts"')
    })

    describe('Empty states', () => {
      test('16 — Aucun filleul : ShareCodeCard toujours visible')
      test('17 — Aucun filleul : call-to-action "Partagez votre code"')
      test('18 — Filtre "En attente" vide : message "Tous finalisés 🎉"')
    })

    describe('Infinite scroll', () => {
      test('19 — "Charger plus" visible si hasNextPage')
      test('20 — fetchNextPage appelé au clic sur "Charger plus"')
      test('21 — "Tous vos filleuls" affiché si !hasNextPage')
    })

    describe('Sécurité', () => {
      test('22 — API filtre strictement par parrainId = clientId JWT')
      test('23 — Skeleton visible pendant le chargement')
    })
  })


DÉFINITION DE "TERMINÉ" — CHECKLIST SCR-038
---------------------------------------------
[ ] La ShareCodeCard affiche le code parrain en grand avec les 2 boutons
[ ] Le bouton Copier fonctionne avec le feedback "Copié !" de 2s
[ ] Le bouton Partager utilise la Web Share API sur mobile
[ ] Sur desktop : Dialog de partage manuel s'ouvre si navigator.share absent
[ ] Les stats (filleuls actifs, gains) s'affichent correctement
[ ] Le texte des gains s'adapte selon le typeRecompense (pts/CDF/remises)
[ ] HowReferralWorks affiche les 3 étapes avec le bon texte de récompense
[ ] Les filleuls ACTIF s'affichent avec badge vert et gains générés
[ ] Les filleuls EN_COURS s'affichent avec l'étape en cours en orange
[ ] Le filtre "En attente" affiche un message encourageant
[ ] L'empty state "aucun filleul" garde la ShareCodeCard visible
[ ] L'infinite scroll fonctionne correctement
[ ] L'API filtre strictement par parrainId = clientId du JWT
[ ] npm run test : 23 tests PortalReferralsPage.test.tsx ✓
```

---

## RÉCAPITULATIF DES 4 PROMPTS — MODULE PORTAIL CLIENT

| N° | Écran   | Route                 | Fichier principal                                    | Priorité | Durée est. |
|----|---------|-----------------------|------------------------------------------------------|----------|------------|
| 1  | SCR-035 | /portal/home          | pages/portal/PortalHomePage.tsx + PortalLoginPage    | **P0**   | ~4-5h      |
| 2  | SCR-036 | /portal/purchases     | pages/portal/PortalPurchasesPage.tsx                 | **P0**   | ~3-4h      |
| 3  | SCR-037 | /portal/points        | pages/portal/PortalPointsPage.tsx                    | **P0**   | ~2-3h      |
| 4  | SCR-038 | /portal/referrals     | pages/portal/PortalReferralsPage.tsx                 | **P1**   | ~3-4h      |

---

## ORDRE D'EXÉCUTION ET DÉPENDANCES

```
Prompt 1 (SCR-035 Accueil + Login Portail)
  ↓ Crée : PortalLayout, PortalHeader, PortalNav, PortalRoute,
            portal-auth.store.ts, usePortalAuth,
            PortalLoginPage (PIN 4 chiffres),
            portal.module.ts (NestJS), portal-auth.service.ts
            PointsCard, ParrainCard, QuickActionsGrid
  ↓
Prompt 2 (SCR-036 Mes Achats)
  ↓ Utilise : PortalLayout, PortalRoute, usePortalAuth, portalApi
  ↓ Crée    : PurchaseCard, PurchaseDetailSheet, PurchasePeriodFilter,
               usePortalPurchases (useInfiniteQuery)
  ↓
Prompt 3 (SCR-037 Mes Points)
  ↓ Utilise : PortalLayout, PortalRoute, usePortalAuth, NiveauBadge (Module Fidélité)
  ↓ Crée    : PortalNiveauxGuide, HowToEarnPoints, PortalPointsMouvement,
               usePortalPoints (useInfiniteQuery)
  ↓
Prompt 4 (SCR-038 Mes Filleuls)
  ↓ Utilise : PortalLayout, PortalRoute, usePortalAuth, types Parrainage
  ↓ Crée    : ShareCodeCard (Web Share API), FilleulCard, HowReferralWorks,
               usePortalReferrals (useInfiniteQuery)

  → MODULE PORTAIL CLIENT COMPLET
```

---

## NOTES IMPORTANTES POUR LES DÉVELOPPEURS

```
1. SÉCURITÉ PORTAIL — ISOLATION ABSOLUE :
   → Le portail client utilise un TOKEN JWT SÉPARÉ du token admin.
   → Ne JAMAIS réutiliser le même token pour accéder aux routes /api/v1/portal/*.
   → Les routes /portal/* côté backend doivent vérifier role='CLIENT'.
   → Un client NE PEUT PAS accéder aux données d'un autre client.
   → Filtrer TOUJOURS par clientId extrait du JWT — jamais faire confiance au body.

2. PIN CLIENT — STOCKAGE SÉCURISÉ :
   → Le PIN est un code à 4 chiffres défini par l'agent lors de SCR-010.
   → Stocker dans Client.pinHash avec bcrypt (rounds=10).
   → Ajouter le champ pinHash au schema Prisma dans le module Clients.
   → Vérification dans portal-auth.service.ts via bcrypt.compare().

3. MOBILE-FIRST — RÈGLES DE DESIGN :
   → Tout le portail est conçu pour des SMARTPHONES (Android 8+, 375px minimum).
   → Tailles de boutons minimum 44×44px (règle d'accessibilité tactile).
   → Textes minimum 14px — jamais descendre sous 12px.
   → Les bottom sheets (Drawer shadcn) sont l'alternative mobile aux modals desktop.
   → Tester systématiquement sur Chrome DevTools en mode mobile (375px).

4. WEB SHARE API — COMPATIBILITÉ :
   → navigator.share() est disponible sur Chrome Android, Safari iOS.
   → Non disponible sur Chrome Desktop → prévoir le Dialog de fallback.
   → Toujours vérifier : if (navigator.share) { ... } else { showDialog() }

5. INFINITE SCROLL vs PAGINATION :
   → Le portail utilise useInfiniteQuery + bouton "Charger plus" (pas de scroll auto).
   → Le scroll automatique (IntersectionObserver) peut être problématique sur mobile
     avec les bottom sheets ouverts — préférer le bouton "Charger plus" explicite.

6. INDÉPENDANCE DES STORES :
   → portal-auth.store.ts est COMPLÈTEMENT séparé de auth.store.ts.
   → Jamais d'import croisé entre les deux stores.
   → Un utilisateur peut théoriquement être connecté comme agent ET comme client
     dans deux onglets différents — les stores ne se mélangent pas.

7. TEXTES SIMPLES :
   → Adapter le vocabulaire pour des clients non-experts.
   → Éviter : "parrainage multi-niveaux", "onboarding", "token JWT"...
   → Utiliser : "votre code", "vos amis inscrits", "votre remise"...
   → Les messages d'erreur doivent être clairs et proposer une action concrète.
```

---

*Progress Business — Prompts Développement Module Portail Client SCR-035 à SCR-038 — Goma, RDC — v1.0 — 2025*