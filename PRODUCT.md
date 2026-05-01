# Product

## Register

product

## Users

**Agents terrain** (rôle AGENT, niveau 3) : commerciaux en boutique à Goma, Bukavu ou Kinshasa. Utilisent l'interface debout ou assis au comptoir, souvent sur tablette ou PC d'entrée de gamme, réseau 3G instable. Tâche principale : enregistrer clients, ventes, onboarding.

**Gérants de site** (rôle GERANT, niveau 4) : responsables d'un seul site. Supervisent le stock, valident les entrées, traitent les transferts, pilotent le parrainage. Travaillent sur PC, besoin de densité d'information et d'actions rapides.

**Directeurs régionaux** (rôle DIRECTEUR_REGIONAL, niveau 5) : voient tous les sites. Comparent les performances inter-sites, suivent les alertes stock régionales. Utilisateurs avancés, confortables avec des tableaux de bord denses.

## Product Purpose

TechShop Manager est le système de gestion commercial multi-sites de TechShop RDC. Il couvre 42 écrans : onboarding client en 4 étapes, point de vente, gestion des stocks inter-sites, parrainage, fidélité, rapports OHADA. Il existe pour remplacer les fichiers Excel et les cahiers papier utilisés dans les boutiques, garantir la cohérence des données entre sites, et outiller des équipes terrain peu techniques avec un outil fiable même hors ligne.

Succès = un agent enregistre un client, fait une vente et gère une entrée de stock sans formation longue, et le gérant voit l'état de son site en moins de 10 secondes à l'ouverture.

## Brand Personality

Moderne, Fiable, Local.

Voix : directe et professionnelle, jamais condescendante. Les libellés sont en français congolais d'affaires : précis, pas de jargon tech importé. L'interface doit ressembler à un produit fait pour la RDC, pas à une traduction d'un SaaS américain.

Émotion cible : confiance et maîtrise. Un gérant ouvre l'app et sait immédiatement où en est son site. Un agent enregistre sans hésitation.

## Anti-references

- **SaaS occidental générique** (Linear, Notion, Stripe, Vercel dashboard) : trop épuré, trop blanc, trop abstrait. Aucun ancrage terrain. Le côté "startup tech minimaliste" est alien pour un commerce physique en RDC.
- **Application mobile grand public** (Jumia, WhatsApp, style Material Design 3 consommateur) : TechShop Manager est un outil professionnel, pas une app de shopping. Les conventions grand public (bottom nav, cards arrondies géantes, illustrations kawaii) cassent la crédibilité chez les gérants.

## Design Principles

1. **Lisibilité opérationnelle d'abord** : chaque écran a une action ou une donnée principale. La hiérarchie visuelle guide l'œil vers ce qui compte, pas vers ce qui est beau.
2. **Densité justifiée** : les gérants et directeurs régionaux ont besoin de voir beaucoup en peu de clics. La densité est une feature, pas un défaut, à condition que chaque donnée ait sa place et son rôle clair.
3. **Contexte local ancré** : monnaie CDF avec séparateurs de milliers, dates en format jour/mois/année, libellés qui correspondent aux termes du terrain (bon de réception, bordereau, OHADA).
4. **Confiance par la précision** : les statuts de stock, les montants financiers, les alertes doivent être impossibles à mal interpréter. Couleur + icône + libellé. Jamais ambigu.
5. **Résilience silencieuse** : l'interface ne bloque jamais sur le réseau. Les états offline, de chargement et d'erreur sont traités avec la même rigueur que les états nominaux.

## Accessibility & Inclusion

- Cible WCAG 2.1 AA : contrastes suffisants pour une lecture en plein soleil (vitrines de boutique).
- Pas d'informations transmises par la couleur seule (badge couleur + libellé systématiquement).
- Taille de texte minimale 13px pour la densité, 12px pour les métadonnées secondaires.
- Interfaces utilisables au clavier pour les gérants sur PC.
- Réseau dégradé : états de chargement non bloquants, feedback immédiat sur les actions critiques.
