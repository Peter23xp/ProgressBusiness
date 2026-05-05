# Tutorial Onboarding — Design Spec
**Date:** 2026-05-05  
**Projet:** TechShop Manager  
**Module:** Tutoriel interactif — Onboarding premier démarrage  
**Phase:** Phase 1 (système de base + parcours SUPER_ADMIN)

---

## Contexte

Système de tutoriel interactif guidé déclenché automatiquement à la première connexion de chaque utilisateur. Personnalisé par rôle, non bloquant, reprenant et rejouable. La Phase 1 implémente le système complet avec le parcours SUPER_ADMIN ; les parcours des autres rôles viendront en phases suivantes.

---

## Décisions de design

| Question | Décision |
|---|---|
| Chemins | `frontend/src/` et `backend/src/` (structure réelle) |
| Lib offline | `idb` existante — table `cache` avec clé `tutorial:progress:{userId}` |
| Architecture | Context React (`TutorialProvider`) + Store Zustand isolé (`tutorial.store.ts`) |
| Tooltip | Ancré à l'élément (floating), positionnement `auto` selon espace disponible |
| Déploiement | Par phases — Phase 1 d'abord, autres rôles ensuite |
| Rôle Phase 1 | SUPER_ADMIN (18 étapes) |

---

## Architecture générale

```
TutorialProvider (Context React — dans AppLayout)
    │
    ├── tutorial.store.ts (Zustand)
    │       isActive, isCompleted, currentStepIndex, steps[]
    │       highlightedElementId, showWelcomeModal, showCompletionModal
    │       start / resume / next / previous / quit / complete / restart
    │
    ├── useTutorial.ts (hook)
    │       initialisation au montage (lecture idb → décide welcome/resume/rien)
    │       navigation auto si targetRoute ≠ route courante
    │       scrollIntoView sur l'élément ciblé
    │
    └── Composants rendus via createPortal dans AppLayout
            TutorialOverlay      (z-index: 9998 — SVG spotlight)
            TutorialTooltip      (z-index: 9999 — bulle ancrée)
            TutorialWelcomeModal (modal intro personnalisée par rôle)
            TutorialCompletionModal (modal fin + confetti)
            TutorialProgressBar  (barre 3px top de page)
            HelpButton           (bouton ❓ flottant bas-droit)
```

---

## Section 4 : Modals

### TutorialWelcomeModal

Modal Dialog (shadcn/ui) plein cadre avec backdrop-blur. Contenu personnalisé par rôle.

**Structure :**
- Logo TechShop Manager
- "Bienvenue, [Prénom] !" + badge rôle coloré + site
- 3 points clés adaptés au rôle (voir ci-dessous)
- Durée estimée par rôle
- Boutons : `[ Passer le tutoriel ]` · `[ Démarrer le tutoriel → ]`

**Contenu SUPER_ADMIN :**
- ✅ Administrer tous les sites et utilisateurs
- ✅ Configurer le programme de fidélité et parrainage
- ✅ Accéder à toutes les données de l'application
- Durée : ~ 8 minutes

### TutorialCompletionModal

- Animation confetti (import dynamique `canvas-confetti` — code splitting)
- Couleurs confetti : `#2E86C1`, `#1A6B3A`, `#E65100`
- Durée animation : 2 secondes
- Mention aide contextuelle (icône ❓ + relancer depuis profil)
- Bouton : `[ 🚀 Commencer à utiliser l'app ]` → appelle `tutorial.complete()`

### Dialog "Quitter le tutoriel"

Déclenché par clic ✕ ou touche Escape.
- Boutons : `[ Continuer le tutoriel ]` · `[ Quitter ]`
- `quit()` → masque overlay, ne marque PAS comme complété

### Dialog "Reprendre le tutoriel"

Affiché si `currentStepIndex > 0` en idb au démarrage.
- Affiche le nom de l'étape sauvegardée
- Boutons : `[ Recommencer depuis le début ]` · `[ Reprendre (N/total) ]` · `[ Ignorer ]`
- "Ignorer" → marque `isCompleted=true` en idb uniquement (pas de PATCH API)

---

## Section 5 : Composants visuels

### TutorialOverlay

SVG `position:fixed, inset:0, z-index:9998` avec SVG mask.

```
Mécanisme :
1. querySelector(`[data-tutorial="${targetId}"]`)
   → MutationObserver si élément pas encore dans le DOM
2. getBoundingClientRect() → calcul position + dimensions
3. SVG mask : rect blanc full page + rect noir sur l'élément (découpe fenêtre)
4. Contour bleu #2E86C1, strokeDasharray="6 3", padding 6px, borderRadius 8px
5. scrollIntoView({ behavior: 'smooth', block: 'center' })
   (behavior: 'instant' si prefers-reduced-motion)
6. ResizeObserver → recalcul au resize
7. Retry x5 toutes les 500ms si élément introuvable
8. Si toujours pas trouvé → tooltip centré + console.warn

Animations :
- Entrée overlay : opacity 0→1, 200ms ease
- Déplacement spotlight : transition rect x/y/width/height 300ms ease-in-out
```

### TutorialTooltip

```
Dimensions : 340px desktop / 280px mobile
z-index     : 9999
Border-radius : 12px
Box-shadow  : 0 8px 32px rgba(0,0,0,0.2)
Offset      : 12px entre élément et bulle

Placement auto :
- Élément dans tiers supérieur → 'bottom'
- Élément dans tiers inférieur → 'top'
- Élément dans sidebar gauche  → 'right'
- Sinon                        → calcul espace disponible

Structure interne :
[ProgressBar dots + label "Section · Étape N/total"]
[Titre 16px bold #1E3A5F]
[Description 14px #212121 — Markdown rendu]
[Tip — fond #D6E4F0, bordure gauche 3px #2E86C1]
[Actions : ✕ Quitter | ← Précédent | Suivant → / Terminer ✓]

Accessibilité :
- role="dialog" aria-label="Tutoriel TechShop Manager"
- aria-live="polite" sur la progression
- Focus trap pendant le tutoriel
- Touches : → suivant · ← précédent · Escape dialog quitter
- Boutons ≥ 44px sur mobile (WCAG)
```

### TutorialProgressBar

```
position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 10000
Fond : #E0E0E0
Progression : #2E86C1, width = (currentStepIndex / totalSteps * 100)%
Transition : width 300ms ease
Tooltip au survol : "Tutoriel — Étape N sur total"
```

### HelpButton

```
position: fixed; bottom: 24px; right: 24px; z-index: 1000
Bouton rond 48x48px, fond #2E86C1, icône HelpCircle lucide-react blanc
Masqué si isActive = true
Visible seulement si isCompleted = true

Popover au clic :
  [▶ Revoir le tutoriel de cette page]
  [▶ Relancer le tutoriel complet]
```

---

## Section 6 : Attributs `data-tutorial`

Ajoutés dans les fichiers existants — aucune logique métier modifiée.

### `AppLayout.tsx` (Sidebar + Header)
```
sidebar-nav-dashboard    → NavLink to="/dashboard"
sidebar-nav-clients      → NavLink to="/clients"
sidebar-nav-ventes       → NavLink to="/sales/pos"
sidebar-nav-stocks       → NavLink to="/stocks"
sidebar-nav-parrainage   → NavLink to="/parrainage"
sidebar-nav-fidelite     → NavLink to="/fidelite"
sidebar-nav-rapports     → NavLink to="/reports"
sidebar-nav-parametres   → <button> du groupe collapsible "Paramètres"

header-site-selector     → div affichant le nom du site (Building2 icon + siteName)
header-user-menu         → div affichant le nom + rôle de l'utilisateur connecté
```

Note : `sidebar-nav-portail` n'existe pas dans l'AppLayout actuelle (portail client = routes séparées sans sidebar).

### Pages existantes
```
DashboardPage.tsx :
  dashboard-kpi-clients    dashboard-kpi-ventes       dashboard-kpi-alertes
  dashboard-kpi-filleuls   dashboard-chart-ventes     dashboard-transactions
  dashboard-alertes-stock

ClientsListPage.tsx :
  clients-btn-nouveau      clients-search-bar
  clients-filter-statut    clients-table

StocksInventoryPage.tsx :
  stocks-btn-entree        stocks-btn-transfert
  stocks-filter-statut     stocks-table

RapportsDashboardPage.tsx :
  reports-period-selector  reports-chart-ca           reports-sites-table

ProfilPage.tsx :
  profile-btn-restart-tutorial
```

---

## Section 7 : Parcours SUPER_ADMIN — 18 étapes

| # | Type | targetId / targetRoute | Titre |
|---|---|---|---|
| 1 | welcome | — | WelcomeModal SUPER_ADMIN |
| 2 | spotlight | `sidebar-nav-parametres` | Paramètres — Panneau d'administration |
| 3 | spotlight | `header-site-selector` | Accès à tous les sites |
| 4 | tooltip | `/settings/users` | Gérer les utilisateurs |
| 5 | tooltip | `/settings/sites` | Gérer les sites |
| 6 | tooltip | `/parrainage/config` | Configuration du parrainage |
| 7 | tooltip | — | Parrainage multi-niveaux |
| 8 | tooltip | `/fidelite/config` | Niveaux de fidélité |
| 9 | tooltip | — | Ratio points / CDF |
| 10 | spotlight | `sidebar-nav-rapports` | Rapports globaux |
| 11 | tooltip | `/reports/export` | Exports automatisés |
| 12 | tooltip | `/settings/general` | Configuration SMS (Africa's Talking) |
| 13 | tooltip | — | Politiques de retour |
| 14 | tooltip | `/portal/home` | Le portail client |
| 15 | tooltip | — | Sécurité des tokens |
| 16 | tooltip | `header-user-menu` | Déconnexion sécurisée |
| 17 | tooltip | `profile-btn-restart-tutorial` → `/settings/profile` | Relancer ce tutoriel |
| 18 | completion | — | TutorialCompletionModal |

---

## Section 8 : Backend

### Prisma — `schema.prisma`

```prisma
model User {
  // ... champs existants ...
  tutorialCompleted   Boolean   @default(false)
  tutorialCompletedAt DateTime?
}
```

Migration : `npx prisma migrate dev --name add_tutorial_completed`

### `update-user.dto.ts`

Ajouter :
```ts
@IsBoolean()
@IsOptional()
tutorialCompleted?: boolean;
```

### `users.service.ts`

La méthode `updateMe()` (ou équivalent PATCH `/users/me`) accepte et persiste `tutorialCompleted` + `tutorialCompletedAt = new Date()` si passage à `true`.

### `GET /api/v1/users/me`

Retourner `tutorialCompleted` dans la réponse (inclure dans le select Prisma).

---

## Section 9 : ProfilePage — Bouton relancer

Ajouter une section "Aide et tutoriel" dans `ProfilPage.tsx` :

```
┌────────────────────────────────────────────────┐
│  Aide et tutoriel                              │
│  ──────────────────────────────────────────    │
│  [▶ Relancer le tutoriel guidé]                │
│  Revoyez les fonctionnalités de votre espace   │
│  Durée : ~ 8 minutes      data-tutorial="profile-btn-restart-tutorial"
└────────────────────────────────────────────────┘
```

`restart()` → reset idb + PATCH `tutorialCompleted: false` + navigate('/dashboard') + showWelcomeModal

---

## Section 10 : Persistance idb — Détail

```ts
// Structure sauvegardée dans cache avec clé tutorial:progress:{userId}
interface TutorialProgress {
  userId: string
  role: string
  currentStepIndex: number
  completedStepIds: string[]
  isCompleted: boolean
  startedAt: string       // ISO date
  lastSeenAt: string      // ISO date
}

// Fonctions utilisées (idb existant)
cacheData(`tutorial:progress:${userId}`, progress)
getCachedData(`tutorial:progress:${userId}`)
```

---

## Section 11 : Tests (Phase 1)

### `TutorialOverlay.test.tsx`
1. Non rendu si `isActive=false`
2. Rendu si `isActive=true`
3. SVG mask calculé depuis `getBoundingClientRect()`
4. Élément non trouvé → retry 5 fois × 500ms
5. `scrollIntoView` appelé sur l'élément ciblé
6. Recalcul au resize (ResizeObserver)
7. Contour bleu `#2E86C1` appliqué

### `TutorialTooltip.test.tsx`
8. Non rendu si `isActive=false`
9. Titre et description affichés
10. Tip affiché si défini, absent sinon
11. Bouton Précédent absent à l'étape 0
12. Bouton "Terminer ✓" à la dernière étape
13. Clic Suivant → `store.next()` appelé
14. Clic Précédent → `store.previous()` appelé
15. Clic ✕ → dialog confirmation
16. Touche → → étape suivante
17. Touche ← → étape précédente
18. Touche Escape → dialog confirmation
19. `placement=auto` calculé depuis position élément

### `useTutorial.test.ts`
20. WelcomeModal si `tutorialCompleted=false` et aucune progression idb
21. Dialog Reprendre si progression partielle en idb
22. Rien si `tutorialCompleted=true`
23. `navigate()` appelé si étape cible route différente
24. `scrollIntoView` appelé au changement d'étape
25. `complete()` → PATCH `/api/v1/users/me` `tutorialCompleted=true`
26. `restart()` → reset idb + PATCH false + navigate `/dashboard`
27. `getTutorialStepsForRole('SUPER_ADMIN')` retourne 18 étapes
28. Progression sauvegardée en idb à chaque changement d'étape
29. Mode offline : étapes `requiresOnline` affichent avertissement
30. HelpButton masqué pendant tutoriel (`isActive=true`)
31. HelpButton visible après completion (`isCompleted=true`)

---

## Section 12 : Règles d'intégration

1. **Non invasif** — seules modifications dans fichiers existants :
   - Attributs `data-tutorial` sur éléments HTML
   - `TutorialProvider` + composants tutoriel ajoutés dans le JSX de `AppLayout` (après `<Outlet />`)
   - Bouton "Relancer" dans `ProfilPage.tsx`
   - Champ `tutorialCompleted` dans schéma Prisma + migration
2. **Portails React** — `TutorialOverlay`, `TutorialTooltip`, `TutorialProgressBar`, `HelpButton` utilisent `createPortal(…, document.body)` pour sortir du flux normal sans modifier l'arbre DOM existant.
3. **AppLayout actuelle** — utilise `<Outlet />` (pas `{children}`). `TutorialProvider` wrappe le fragment JSX retourné par `AppLayout()`.
4. **Mobile sidebar** — `mobileSidebarOpen` est géré dans `AppLayout`. Si une étape cible un élément de la sidebar sur mobile, le tutoriel appelle une fonction `openMobileSidebar()` exposée via Context ou ref depuis `AppLayout`.
5. **Z-index** — overlay 9998, tooltip 9999, progressbar 10000. Le mobile sidebar overlay existant est z-40/z-50 (Tailwind) — pas de conflit.
6. **Offline** — PATCH `tutorialCompleted` ignoré silencieusement si hors-ligne (idb est la source de vérité locale).
7. **canvas-confetti** — import dynamique dans `TutorialCompletionModal` uniquement (code splitting).
8. **Attributs `data-tutorial`** — immuables une fois définis ; migrer si composant refactorisé.

---

## Phases suivantes (hors scope Phase 1)

- **Phase 2** : Parcours AGENT (12 étapes) + GERANT (16 étapes)
- **Phase 3** : Parcours FORMATEUR (7) + DIR_REGIONAL (11) + CLIENT (6)
- **Phase 4** : Tests unitaires complets (33 tests) + couverture ≥ 85%

---

## Checklist Phase 1

### Système de base
- [ ] `tutorial.store.ts` — 8 actions + état complet
- [ ] `useTutorial.ts` — init, navigation auto, scrollIntoView
- [ ] `TutorialProvider.tsx` — wrapper AppLayout, initialisation au montage
- [ ] Persistance idb via `cacheData` / `getCachedData` clé `tutorial:progress:{userId}`

### Visuels
- [ ] `TutorialOverlay.tsx` — SVG mask + MutationObserver + ResizeObserver
- [ ] `TutorialTooltip.tsx` — bulle ancrée + placement auto + flèche
- [ ] `TutorialWelcomeModal.tsx` — personnalisée SUPER_ADMIN
- [ ] `TutorialCompletionModal.tsx` — confetti import dynamique
- [ ] `TutorialProgressBar.tsx` — barre 3px top
- [ ] `HelpButton.tsx` — flottant bas-droit avec popover

### Parcours
- [ ] `steps/superadmin.steps.ts` — 18 étapes complètes

### Intégration
- [ ] `AppLayout.tsx` — TutorialProvider + composants portail
- [ ] `ProfilPage.tsx` — section aide + bouton restart
- [ ] Attributs `data-tutorial` dans sidebar, header, dashboard, clients, stocks, rapports

### Backend
- [ ] `schema.prisma` + migration `add_tutorial_completed`
- [ ] `update-user.dto.ts` — champ `tutorialCompleted`
- [ ] `users.service.ts` — PATCH + `tutorialCompletedAt`
- [ ] `GET /users/me` — retourne `tutorialCompleted`

### Tests Phase 1
- [ ] `TutorialOverlay.test.tsx` — 7 tests
- [ ] `TutorialTooltip.test.tsx` — 12 tests
- [ ] `useTutorial.test.ts` — 12 tests (sous-ensemble Phase 1)
