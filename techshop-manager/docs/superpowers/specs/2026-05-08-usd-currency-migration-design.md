# USD Currency Migration — Design Spec

## Objectif

Migrer toutes les opérations commerciales (stock, ventes, activation) vers USD comme devise de stockage et d'affichage. Les étapes onboarding Récit et Fiche restent en CDF.

## Règle métier fondamentale

| Opération | Devise stockée en DB | Devise affichée |
|---|---|---|
| Produit (prixVente, prixAchat) | USD | USD |
| Vente (tous montants) | USD | USD |
| LigneVente (prixUnitaire, sousTotal) | USD | USD |
| OnboardingEtape — ACTIVATION (montant) | USD | USD |
| OnboardingEtape — RECIT (montant) | CDF | CDF |
| OnboardingEtape — FICHE (montant) | CDF | CDF |

---

## Section 1 : Base de données & Migration

### Tables et champs convertis (CDF → USD, ÷ 2800)

**Produit**
- `prixVente` : diviser par 2800
- `prixAchat` : diviser par 2800

**Vente**
- `montantBrut`, `remiseFidelite`, `remiseParrainage`, `montantNet`, `montantRecu`, `monnaieRendue` : diviser par 2800

**LigneVente**
- `prixUnitaire`, `sousTotal` : diviser par 2800

**OnboardingEtape — condition `etape = 'ACTIVATION'` uniquement**
- `montant` : diviser par 2800

### Tables et champs inchangés

- `OnboardingEtape` où `etape IN ('RECIT', 'FICHE')` — `montant` reste en CDF
- `Parrainage.recompenseValeur` — logique points/fidélité, hors scope
- `MouvementStock`, `StockSite` — pas de champ montant

### Migration Prisma

Un fichier de migration SQL one-time avec :
```sql
-- Produit
UPDATE "Produit" SET "prixVente" = "prixVente" / 2800, "prixAchat" = "prixAchat" / 2800;

-- Vente
UPDATE "Vente" SET
  "montantBrut" = "montantBrut" / 2800,
  "remiseFidelite" = "remiseFidelite" / 2800,
  "remiseParrainage" = "remiseParrainage" / 2800,
  "montantNet" = "montantNet" / 2800,
  "montantRecu" = CASE WHEN "montantRecu" IS NOT NULL THEN "montantRecu" / 2800 ELSE NULL END,
  "monnaieRendue" = CASE WHEN "monnaieRendue" IS NOT NULL THEN "monnaieRendue" / 2800 ELSE NULL END;

-- LigneVente
UPDATE "LigneVente" SET "prixUnitaire" = "prixUnitaire" / 2800, "sousTotal" = "sousTotal" / 2800;

-- OnboardingEtape — ACTIVATION uniquement
UPDATE "OnboardingEtape" SET "montant" = "montant" / 2800 WHERE "etape" = 'ACTIVATION' AND "montant" IS NOT NULL;
```

Les types Prisma (`Decimal(12,2)`) restent inchangés — seule la sémantique change.

---

## Section 2 : Backend

### `stocks/dto/stock.dto.ts`
- Supprimer le champ `monnaie: 'CDF' | 'USD'` du `CreateProduitDto`
- Frontend envoie toujours des USD

### `stocks/stocks.service.ts` — `creerProduit`
- Supprimer les lignes de conversion :
  ```ts
  const TAUX_USD_CDF = 2800;
  const prixVenteCDF = dto.monnaie === 'USD' ? dto.prixVente * TAUX_USD_CDF : dto.prixVente;
  const prixAchatCDF = dto.monnaie === 'USD' ? dto.prixAchat * TAUX_USD_CDF : dto.prixAchat;
  ```
- Utiliser directement `dto.prixVente` et `dto.prixAchat`
- Supprimer `monnaie: dto.monnaie` dans la réponse

### `clients/clients.service.ts` — `onboardingRecit` & `onboardingFiche`
- Inchangés — reçoivent et stockent le montant en CDF

### `clients/clients.service.ts` — `onboardingActivate`
- Inchangé dans la logique — le prix produit vient déjà de la DB en USD après migration

### `ventes/ventes.service.ts`
- Supprimer toute conversion `TAUX_USD_CDF` si présente
- Les prix arrivent en USD depuis la DB, sont stockés en USD

---

## Section 3 : Frontend

### `frontend/src/lib/utils.ts`
- Supprimer `export const TAUX_USD_CDF = 2800`
- `formatUSD` et `formatCDF` restent inchangées

### Pages : suppression de `/ TAUX_USD_CDF`

**`POSPage.tsx`**
- Supprimer toutes les divisions `/ TAUX_USD_CDF`
- Supprimer les multiplications `* TAUX_USD_CDF` sur le montant reçu
- Supprimer l'import `TAUX_USD_CDF`
- Input "Montant reçu" : `step={1}`, placeholder = `netVal` directement

### Pages : `formatCDF` → `formatUSD`

**`RecuPage.tsx`** — tous les montants

**`AvoirDocumentPage.tsx`** — tous les montants

**`RapportStocksPage.tsx`** — `prixAchat`

**`PaiementsOnboardingPage.tsx`** — montants des paiements d'activation uniquement (pas récit/fiche si distincts)

**`OnboardingActivationPage.tsx`**
- Montant étape ACTIVATION : `formatUSD()`
- Montants étapes RECIT et FICHE : `formatCDF()` — inchangé
- `totalPaye` (récit + fiche) : `formatCDF()`

### `NouveauProduitPage.tsx`
- Retirer le sélecteur de devise `monnaie: 'CDF' | 'USD'`
- Labels : "Prix de vente (USD)" et "Prix d'achat (USD)"
- Supprimer le bloc d'aperçu de conversion CDF/USD
- Envoyer `monnaie: 'USD'` hardcodé ou retirer le champ du payload (DTO supprimé)

### `FicheAdhesionPDF.tsx`
- `produitPrix` : `formatUSD()` au lieu de la fonction locale CDF
- Montants récit/fiche dans le PDF : rester en CDF

---

## Ce qui ne change pas

- `OnboardingRecitPage.tsx` — label "CDF", input en CDF, inchangé
- `OnboardingFichePage.tsx` — label "CDF", input en CDF, inchangé
- `Parrainage` / `Fidélité` — hors scope
- Types Prisma (`Decimal(12,2)`) — inchangés
- `formatUSD()` et `formatCDF()` dans `utils.ts` — inchangées (sauf suppression de `TAUX_USD_CDF`)

---

## Ordre d'exécution recommandé

1. Migration DB (SQL one-time)
2. Backend : supprimer conversion + DTO `monnaie`
3. Frontend `utils.ts` : supprimer `TAUX_USD_CDF`
4. Frontend pages : POSPage → NouveauProduitPage → Activation → autres pages
5. `FicheAdhesionPDF.tsx` : prix produit en USD
