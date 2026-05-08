-- Migration: CDF → USD (÷ 2800)
-- Tables: produits, ventes, lignes_vente, onboarding_etapes (ACTIVATION uniquement)

UPDATE produits
SET "prixVente" = ROUND("prixVente" / 2800, 2),
    "prixAchat" = ROUND("prixAchat" / 2800, 2);

UPDATE ventes
SET "montantBrut"       = ROUND("montantBrut" / 2800, 2),
    "remiseFidelite"    = ROUND("remiseFidelite" / 2800, 2),
    "remiseParrainage"  = ROUND("remiseParrainage" / 2800, 2),
    "montantNet"        = ROUND("montantNet" / 2800, 2),
    "montantRecu"       = CASE WHEN "montantRecu" IS NOT NULL
                               THEN ROUND("montantRecu" / 2800, 2) ELSE NULL END,
    "monnaieRendue"     = CASE WHEN "monnaieRendue" IS NOT NULL
                               THEN ROUND("monnaieRendue" / 2800, 2) ELSE NULL END;

UPDATE lignes_vente
SET "prixUnitaire" = ROUND("prixUnitaire" / 2800, 2),
    "sousTotal"    = ROUND("sousTotal" / 2800, 2);

UPDATE onboarding_etapes
SET montant = ROUND(montant / 2800, 2)
WHERE etape = 'ACTIVATION'
  AND montant IS NOT NULL;
