# Routing Fix + SEO Technique Complet — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger le routing (homepage publique à `/`) et ajouter un SEO technique complet (react-helmet-async, robots.txt, sitemap.xml, JSON-LD) à l'app Progress Business.

**Architecture:** `react-helmet-async` fournit des meta tags dynamiques par route via un `HelmetProvider` ajouté dans `main.tsx`. La homepage `/` est publique et indexable ; toutes les routes app/auth reçoivent `noindex`. Les fichiers statiques (`robots.txt`, `sitemap.xml`, `og-image.png`) sont placés dans `frontend/public/`.

**Tech Stack:** react-helmet-async ^2.0, Vite 5, React Router 6, TypeScript 5

---

## Fichiers touchés

| Action | Fichier |
|--------|---------|
| Modify | `frontend/src/main.tsx` |
| Modify | `frontend/src/App.tsx` |
| Modify | `frontend/index.html` |
| Modify | `frontend/src/pages/home/HomePage.tsx` |
| Modify | `frontend/src/pages/auth/LoginPage.tsx` |
| Modify | `frontend/src/pages/portal/PortalLoginPage.tsx` |
| Create | `frontend/src/components/seo/PageSEO.tsx` |
| Create | `frontend/public/robots.txt` |
| Create | `frontend/public/sitemap.xml` |
| Create | `frontend/public/og-image.svg` |
| Install | `react-helmet-async` |

---

## Task 1 : Pousser App.tsx (routing fix déjà en local)

**Files:**
- Modify: `frontend/src/App.tsx` (déjà correct localement — à commiter)

- [ ] **Step 1 : Vérifier l'état actuel du fichier local**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git diff HEAD frontend/src/App.tsx
```

Vérifie que la route `/` pointe bien sur `<HomePage />` sans `AuthGuard` :
```tsx
<Route path="/" element={<HomePage />} />
```
Et que le fallback `*` redirige vers `/` :
```tsx
<Route path="*" element={<Navigate to="/" replace />} />
```

- [ ] **Step 2 : Commiter et pousser App.tsx**

```bash
git add frontend/src/App.tsx
git commit -m "fix: expose homepage at / without AuthGuard, fallback redirects to /"
git push origin main
```

---

## Task 2 : Installer react-helmet-async

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1 : Installer la dépendance**

```bash
cd "D:\PETER\Progress app\techshop-manager\frontend"
npm install react-helmet-async
```

Résultat attendu : `react-helmet-async` apparaît dans `dependencies` de `package.json`.

- [ ] **Step 2 : Vérifier l'installation**

```bash
node -e "require('./node_modules/react-helmet-async/package.json').version" 2>/dev/null && echo OK
```

---

## Task 3 : Ajouter HelmetProvider dans main.tsx

**Files:**
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1 : Modifier main.tsx**

Remplacer le contenu de `frontend/src/main.tsx` par :

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './lib/chartjs';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            success: { duration: 3000, style: { background: '#1A6B3A', color: '#fff' } },
            error: { duration: 8000, style: { background: '#B71C1C', color: '#fff' } },
          }}
        />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 2 : Lancer le dev server pour vérifier qu'il démarre sans erreur**

```bash
cd "D:\PETER\Progress app\techshop-manager\frontend"
npm run dev
```

Résultat attendu : `Local: http://localhost:5173/` sans erreur TypeScript.

- [ ] **Step 3 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add frontend/src/main.tsx frontend/package.json frontend/package-lock.json
git commit -m "feat: add HelmetProvider for per-page SEO meta tags"
```

---

## Task 4 : Créer le composant PageSEO réutilisable

**Files:**
- Create: `frontend/src/components/seo/PageSEO.tsx`

- [ ] **Step 1 : Créer le répertoire et le composant**

Créer `frontend/src/components/seo/PageSEO.tsx` :

```tsx
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Progress Business';
const SITE_URL  = 'https://progressbusiness.onrender.com';
const OG_IMAGE  = `${SITE_URL}/og-image.svg`;

interface PageSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
}

export function PageSEO({
  title,
  description = 'Caisse POS, gestion des stocks, fidélité et parrainage pour commerçants à Goma, Bukavu et Kinshasa — RDC.',
  canonical,
  noindex = false,
  ogType = 'website',
}: PageSEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Gestion Commerciale Multi-Sites | RDC`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type"        content={ogType} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name"   content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image"       content={OG_IMAGE} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale"      content="fr_CD" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={OG_IMAGE} />
    </Helmet>
  );
}
```

> **Note :** Remplacer `SITE_URL` par l'URL de production réelle une fois le domaine personnalisé configuré.

- [ ] **Step 2 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add frontend/src/components/seo/PageSEO.tsx
git commit -m "feat: add reusable PageSEO component with OG + Twitter Card support"
```

---

## Task 5 : Améliorer index.html (base SEO)

**Files:**
- Modify: `frontend/index.html`

- [ ] **Step 1 : Remplacer index.html**

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0A1628" />

    <!-- SEO base — overridden per-page by react-helmet-async -->
    <title>Progress Business — Gestion Commerciale Multi-Sites | RDC</title>
    <meta name="description" content="Caisse POS, gestion des stocks, fidélité et parrainage pour commerçants à Goma, Bukavu et Kinshasa — RDC." />
    <meta name="keywords"    content="gestion commerciale RDC, logiciel caisse Goma, gestion stock Bukavu, fidélité client Congo, POS RDC, Progress Business" />
    <meta name="author"      content="Progress Business" />
    <link rel="canonical"    href="https://progressbusiness.onrender.com/" />

    <!-- Open Graph fallback -->
    <meta property="og:type"        content="website" />
    <meta property="og:title"       content="Progress Business — Gestion Commerciale Multi-Sites | RDC" />
    <meta property="og:description" content="Caisse POS, gestion des stocks, fidélité et parrainage pour commerçants à Goma, Bukavu et Kinshasa." />
    <meta property="og:url"         content="https://progressbusiness.onrender.com/" />
    <meta property="og:image"       content="https://progressbusiness.onrender.com/og-image.svg" />
    <meta property="og:locale"      content="fr_CD" />
    <meta property="og:site_name"   content="Progress Business" />

    <!-- Twitter Card fallback -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="Progress Business — Gestion Commerciale Multi-Sites | RDC" />
    <meta name="twitter:description" content="Caisse POS, gestion des stocks, fidélité et parrainage — Goma, Bukavu, Kinshasa." />
    <meta name="twitter:image"       content="https://progressbusiness.onrender.com/og-image.svg" />

    <!-- Favicon -->
    <link rel="icon"             type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="icon"             type="image/png" sizes="32x32" href="/assets/favicon.svg" />
    <link rel="apple-touch-icon" href="/assets/favicon.svg" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add frontend/index.html
git commit -m "feat: enrich index.html with full OG, Twitter Card, keywords and canonical"
```

---

## Task 6 : Ajouter JSON-LD + PageSEO à la HomePage

**Files:**
- Modify: `frontend/src/pages/home/HomePage.tsx`

- [ ] **Step 1 : Ajouter l'import PageSEO et le JSON-LD en haut de HomePage.tsx**

Au début du fichier, après les imports existants, ajouter :

```tsx
import { Helmet } from 'react-helmet-async';
import { PageSEO } from '@/components/seo/PageSEO';
```

- [ ] **Step 2 : Ajouter PageSEO + JSON-LD dans le return de HomePage**

Dans la fonction `HomePage`, juste après `<>` (première ligne du return), ajouter avant le `<style>` :

```tsx
<PageSEO
  canonical="/"
  ogType="website"
/>
<Helmet>
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Progress Business",
    "url": "https://progressbusiness.onrender.com",
    "logo": "https://progressbusiness.onrender.com/assets/Progress business logo.png",
    "description": "Système de gestion commerciale multi-sites pour Progress Business — Goma, Bukavu, Kinshasa (RDC).",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CD",
      "addressLocality": "Goma"
    },
    "areaServed": ["Goma", "Bukavu", "Kinshasa"],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["French"]
    }
  })}</script>
</Helmet>
```

- [ ] **Step 3 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add frontend/src/pages/home/HomePage.tsx
git commit -m "feat: add PageSEO and JSON-LD Organization schema to homepage"
```

---

## Task 7 : Ajouter noindex sur LoginPage et PortalLoginPage

**Files:**
- Modify: `frontend/src/pages/auth/LoginPage.tsx`
- Modify: `frontend/src/pages/portal/PortalLoginPage.tsx`

- [ ] **Step 1 : Ajouter PageSEO dans LoginPage.tsx**

Trouver l'import section et ajouter :
```tsx
import { PageSEO } from '@/components/seo/PageSEO';
```

Dans le `return` de `LoginPage`, comme **premier enfant** de l'élément racine :
```tsx
<PageSEO title="Connexion" noindex />
```

- [ ] **Step 2 : Ajouter PageSEO dans PortalLoginPage.tsx**

Même principe — ajouter :
```tsx
import { PageSEO } from '@/components/seo/PageSEO';
```

Et dans le return :
```tsx
<PageSEO title="Portail Client — Connexion" noindex />
```

- [ ] **Step 3 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add frontend/src/pages/auth/LoginPage.tsx frontend/src/pages/portal/PortalLoginPage.tsx
git commit -m "feat: add noindex meta to login pages"
```

---

## Task 8 : Créer robots.txt et sitemap.xml

**Files:**
- Create: `frontend/public/robots.txt`
- Create: `frontend/public/sitemap.xml`

- [ ] **Step 1 : Créer frontend/public/robots.txt**

```
User-agent: *
Allow: /
Disallow: /login
Disallow: /portal/login
Disallow: /portal/home
Disallow: /portal/purchases
Disallow: /portal/points
Disallow: /portal/referrals
Disallow: /dashboard
Disallow: /clients
Disallow: /sales
Disallow: /stocks
Disallow: /parrainage
Disallow: /fidelite
Disallow: /reports
Disallow: /settings
Disallow: /support

Sitemap: https://progressbusiness.onrender.com/sitemap.xml
```

- [ ] **Step 2 : Créer frontend/public/sitemap.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://progressbusiness.onrender.com/</loc>
    <lastmod>2026-05-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

- [ ] **Step 3 : Vérifier que Vite sert bien le fichier en dev**

```bash
cd "D:\PETER\Progress app\techshop-manager\frontend"
npm run dev &
sleep 3
curl http://localhost:5173/robots.txt
```

Résultat attendu : le contenu du robots.txt s'affiche.

- [ ] **Step 4 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add frontend/public/robots.txt frontend/public/sitemap.xml
git commit -m "feat: add robots.txt and sitemap.xml"
```

---

## Task 9 : Créer l'image OG (og-image.svg)

**Files:**
- Create: `frontend/public/og-image.svg`

- [ ] **Step 1 : Créer frontend/public/og-image.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0A1628"/>
      <stop offset="60%"  stop-color="#1a3260"/>
      <stop offset="100%" stop-color="#0f3320"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle grid -->
  <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="315" x2="1200" y2="315"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
    <line x1="0" y1="525" x2="1200" y2="525"/>
    <line x1="240" y1="0" x2="240" y2="630"/>
    <line x1="480" y1="0" x2="480" y2="630"/>
    <line x1="720" y1="0" x2="720" y2="630"/>
    <line x1="960" y1="0" x2="960" y2="630"/>
  </g>

  <!-- Green accent dot -->
  <circle cx="96" cy="196" r="6" fill="#22c55e" opacity="0.9"/>

  <!-- Eyebrow -->
  <text x="116" y="203" font-family="system-ui, sans-serif" font-size="22"
        font-weight="600" letter-spacing="4" fill="rgba(255,255,255,0.45)"
        text-transform="uppercase">PROGRESS BUSINESS · RDC</text>

  <!-- Main title -->
  <text x="96" y="330" font-family="Georgia, serif" font-size="92"
        font-weight="900" fill="#ffffff" letter-spacing="-2">La gestion</text>
  <text x="96" y="428" font-family="Georgia, serif" font-size="92"
        font-weight="900" fill="#ffffff" letter-spacing="-2">commerciale</text>
  <text x="96" y="526" font-family="Georgia, serif" font-size="92"
        font-weight="900" font-style="italic" fill="#3b82f6" letter-spacing="-2">en ordre.</text>

  <!-- Right side badges -->
  <rect x="820" y="200" width="280" height="52" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="960" y="233" font-family="system-ui, sans-serif" font-size="18" font-weight="600"
        fill="rgba(255,255,255,0.7)" text-anchor="middle">Goma · Bukavu · Kinshasa</text>

  <rect x="820" y="268" width="280" height="52" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="960" y="301" font-family="system-ui, sans-serif" font-size="18" font-weight="600"
        fill="rgba(255,255,255,0.7)" text-anchor="middle">POS · Stocks · Fidélité</text>

  <rect x="820" y="336" width="280" height="52" rx="8" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.25)" stroke-width="1"/>
  <circle cx="850" cy="362" r="5" fill="#22c55e"/>
  <text x="870" y="367" font-family="system-ui, sans-serif" font-size="18" font-weight="600"
        fill="#4ade80">Hors-ligne natif</text>
</svg>
```

- [ ] **Step 2 : Commiter**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git add frontend/public/og-image.svg
git commit -m "feat: add og-image.svg for social sharing (1200x630)"
```

---

## Task 10 : Push final et vérification

- [ ] **Step 1 : Vérifier que tout est commité**

```bash
cd "D:\PETER\Progress app\techshop-manager"
git status
```

Résultat attendu : `nothing to commit, working tree clean`

- [ ] **Step 2 : Push vers main**

```bash
git push origin main
```

- [ ] **Step 3 : Vérifier le routing en prod**

Après le redéploiement Render (~2 min), ouvrir l'URL de prod. Résultat attendu :
- `/` → page d'accueil Progress Business (sans redirection vers `/login`)
- `/login` → page de connexion
- `/robots.txt` → contenu du fichier robots

- [ ] **Step 4 : Tester les meta OG**

Utiliser https://www.opengraph.xyz ou https://cards-dev.twitter.com/validator avec l'URL de prod.
Résultat attendu : titre, description et og-image s'affichent correctement.

- [ ] **Step 5 : Valider le JSON-LD**

Utiliser https://search.google.com/test/rich-results avec l'URL de prod.
Résultat attendu : `Organization` détectée sans erreur.
