# Landing Page — Design Spec
*Date : 2026-05-11*

## Contexte

Remplacement de la page d'accueil (`/`) de Progress Business Manager par une landing page professionnelle à sections. Public : futurs gérants/partenaires + utilisateurs existants. Ton : institutionnel / sérieux.

## Structure des sections

| # | Section | Description |
|---|---------|-------------|
| 1 | Navbar fixe | Logo + wordmark + bouton "Se connecter" |
| 2 | Hero 100vh | Image Higgsfield (magasin tech RDC) + headline Playfair + 2 CTA |
| 3 | Bande stats | 42 écrans · 10 modules · 6 rôles · 3 villes, fond bleu marine |
| 4 | Modules | Grille 3×2, numérotée 01–06, fond ivoire |
| 5 | Sites RDC | Goma (siège) · Bukavu · Kinshasa, 3 colonnes |
| 6 | CTA final | "Prêt à démarrer ?", fond bleu marine, 2 boutons |
| 7 | Footer | Logo + badge offline + copyright |

## Palette

- Bleu marine : `#1E3A5F`
- Bleu profond footer : `#0D1E33`
- Ivoire fond : `#F4EFE4`
- Texte : `#1A1208`
- Vert offline : `#22c55e`

## Typographie

- Display / titres : **Playfair Display** (Google Fonts, 700/900)
- Corps / UI : **IBM Plex Sans** (Google Fonts, 300/400/500/600)

## Image hero

Générée via MCP Higgsfield (Seedream 16:9 1080p).
Prompt : commerce tech RDC, agents en tenue professionnelle, lumière chaude, qualité éditoriale.

**Statut :** La clé API configurée (`hf_...`) est un token HuggingFace invalide pour Higgsfield. Un UUID Higgsfield est requis. Une fois corrigé, remplacer le placeholder `.lp-hero-placeholder` dans HomePage.tsx par `<img src="/assets/hero-store.jpg" className="lp-hero-img" alt="" aria-hidden />`.

## Animations

- Hero : staggered CSS `lp-fadein` (0 / 120 / 230 / 340 ms)
- Sections : `IntersectionObserver` → reveal `translateY(28px)` → `0` à 0.65s ease-out-quart

## Accessibilité

- WCAG AA : contrastes vérifiés sur les deux fonds (ivoire + marine)
- `aria-label` sur hero, stats, modules, cta
- `min-height: 44px` sur tous les boutons
- Focus visible sur tous les éléments interactifs
