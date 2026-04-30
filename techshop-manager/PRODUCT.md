# Product

## Register

product

## Users

Six rôles distincts, deux postures dominantes :

**Terrain (AGENT, GERANT)** — commerce en magasin à Goma, Bukavu ou Kinshasa. Tablette ou PC de caisse, lumière forte, gestes rapides. L'agent enregistre une vente ou accueille un nouveau client ; il n'a pas le temps de chercher un bouton. Le gérant vérifie ses chiffres en début et en fin de journée, debout à son bureau.

**Pilotage (DIRECTEUR_REGIONAL, SUPER_ADMIN)** — bureau ou déplacement inter-sites. Comparaisons multi-sites, rapports, décisions sur les stocks ou les récompenses parrainages. Moins de fréquence, plus de profondeur.

**Support (FORMATEUR)** — accès limité à l'onboarding client, utilisation ponctuelle.

**Client final** — portail autonome sur mobile pour consulter points et filleuls.

## Product Purpose

TechShop Manager est le système de gestion commerciale de TechShop, chaîne de vente de produits tech en RDC (3 sites : Goma siège, Bukavu, Kinshasa). Il centralise la caisse POS, la gestion clients avec onboarding en 4 étapes, les stocks multi-sites, un programme de fidélité par niveaux (Bronze → Platine) et un système de parrainage avec récompenses configurables. L'accent est mis sur l'usage hors-ligne : toutes les écritures passent par IndexedDB d'abord, la sync vient ensuite.

Succès = un agent traite une vente complète en moins de 90 secondes, même sans réseau.

## Brand Personality

Fiable, structuré, direct. Outil de confiance pour des professionnels qui connaissent leur métier. Pas de fioriture, chaque élément à sa place. En français (RDC), sans anglicismes dans le copy.

Trois mots : **clair, robuste, professionnel**.

## Anti-references

- Dashboards SaaS américains avec dégradés arc-en-ciel et métriques géantes sur fond sombre
- Applications "startup" minimalistes qui cachent la densité sous des animations
- ERP enterprise surchargés avec 40 champs visibles d'un coup
- Interfaces consumer (Material You, iOS) — trop décontractées pour un contexte commercial professionnel

## Design Principles

1. **Densité lisible, pas densité lourde** — les données s'affichent sans encombrement ; chaque chiffre est trouvé au premier coup d'œil, même sous pression.
2. **Hiérarchie par le poids, pas par la décoration** — la taille et la graisse du texte portent l'importance ; les couleurs signalent les états (succès, alerte, danger), pas l'esthétique.
3. **Offline-first visible** — l'état hors-ligne n'est jamais une surprise ; il est annoncé clairement et les données en cache restent utilisables.
4. **Rôles comme filtre, pas comme restriction** — l'interface s'adapte silencieusement au rôle connecté ; l'agent ne voit pas une interface castrée, il voit exactement ce dont il a besoin.
5. **Actions primaires toujours au même endroit** — la cohérence positionnelle réduit la charge cognitive sur le terrain.

## Accessibility & Inclusion

WCAG AA. Taille minimale de touche 44px sur tous les éléments interactifs. Indicateurs de focus visibles. Support `prefers-reduced-motion`. Texte corps minimum 14px. Pas de transmission d'information par la couleur seule (toujours doublé d'un libellé ou icône).
