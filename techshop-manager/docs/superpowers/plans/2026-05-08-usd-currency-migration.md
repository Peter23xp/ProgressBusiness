# USD Currency Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stocker et afficher toutes les opérations commerciales (produits, ventes, activation) en USD ; les étapes onboarding Récit et Fiche restent en CDF.

**Architecture:** Migration SQL one-time convertit les données existantes (÷ 2800). Backend supprime toute logique de conversion. Frontend affiche directement en USD sans division intermédiaire.

**Tech Stack:** NestJS + Prisma (PostgreSQL), React + Vite + TailwindCSS, @react-pdf/renderer

---

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `backend/prisma/migrations/YYYYMMDD_usd_migration/migration.sql` | Créer — SQL one-time |
| `backend/src/modules/stocks/dto/stock.dto.ts` | Modifier — supprimer `monnaie` |
| `backend/src/modules/stocks/stocks.service.ts` | Modifier — supprimer conversion TAUX_USD_CDF |
| `frontend/src/lib/utils.ts` | Modifier — supprimer `TAUX_USD_CDF` |
| `frontend/src/lib/stocks.api.ts` | Modifier — supprimer `monnaie` du DTO |
| `frontend/src/pages/ventes/POSPage.tsx` | Modifier — supprimer divisions / TAUX_USD_CDF |
| `frontend/src/pages/stocks/NouveauProduitPage.tsx` | Modifier — supprimer toggle devise |
| `frontend/src/pages/ventes/RecuPage.tsx` | Modifier — formatCDF → formatUSD |
| `frontend/src/pages/ventes/AvoirDocumentPage.tsx` | Modifier — formatCDF → formatUSD |
| `frontend/src/pages/rapports/RapportStocksPage.tsx` | Modifier — formatCDF → formatUSD pour prixAchat |
| `frontend/src/pages/clients/OnboardingActivationPage.tsx` | Modifier — montant ACTIVATION en USD, RECIT/FICHE restent CDF |
| `frontend/src/components/clients/FicheAdhesionPDF.tsx` | Modifier — produitPrix en USD |

---

## Task 1 : Migration base de données (SQL one-time)

**Fichiers :**
- Créer : `backend/prisma/migrations/20260508000000_usd_migration/migration.sql`

> Cette migration convertit les données existantes de CDF vers USD en divisant par 2800. Elle est irréversible — sauvegarder la DB avant.

- [ ] **Step 1 : Créer le dossier de migration**

```bash
mkdir -p "backend/prisma/migrations/20260508000000_usd_migration"
```

- [ ] **Step 2 : Créer le fichier migration.sql**

Créer `backend/prisma/migrations/20260508000000_usd_migration/migration.sql` avec ce contenu exact :

```sql
-- Migration: CDF → USD (÷ 2800)
-- Tables: Produit, Vente, LigneVente, OnboardingEtape (ACTIVATION uniquement)

UPDATE "Produit"
SET "prixVente" = ROUND("prixVente" / 2800, 2),
    "prixAchat" = ROUND("prixAchat" / 2800, 2);

UPDATE "Vente"
SET "montantBrut"       = ROUND("montantBrut" / 2800, 2),
    "remiseFidelite"    = ROUND("remiseFidelite" / 2800, 2),
    "remiseParrainage"  = ROUND("remiseParrainage" / 2800, 2),
    "montantNet"        = ROUND("montantNet" / 2800, 2),
    "montantRecu"       = CASE WHEN "montantRecu" IS NOT NULL
                               THEN ROUND("montantRecu" / 2800, 2) ELSE NULL END,
    "monnaieRendue"     = CASE WHEN "monnaieRendue" IS NOT NULL
                               THEN ROUND("monnaieRendue" / 2800, 2) ELSE NULL END;

UPDATE "LigneVente"
SET "prixUnitaire" = ROUND("prixUnitaire" / 2800, 2),
    "sousTotal"    = ROUND("sousTotal" / 2800, 2);

UPDATE "OnboardingEtape"
SET "montant" = ROUND("montant" / 2800, 2)
WHERE "etape" = 'ACTIVATION'
  AND "montant" IS NOT NULL;
```

- [ ] **Step 3 : Appliquer la migration**

```bash
cd backend && npx prisma migrate resolve --applied 20260508000000_usd_migration
```

Si les données de dev sont peu importantes, tu peux aussi simplement exécuter le SQL directement dans psql ou via un client DB (TablePlus, DBeaver), puis vérifier :

```sql
SELECT id, sku, "prixVente", "prixAchat" FROM "Produit" LIMIT 5;
SELECT id, "montantNet" FROM "Vente" LIMIT 5;
```

Expected : les prix ex-100 CDF deviennent ~0.04 USD ; ex-420000 CDF deviennent 150 USD.

- [ ] **Step 4 : Commit**

```bash
git add backend/prisma/migrations/20260508000000_usd_migration/
git commit -m "chore: migrate Produit/Vente/LigneVente/OnboardingEtape ACTIVATION to USD"
```

---

## Task 2 : Backend — supprimer conversion et champ monnaie

**Fichiers :**
- Modifier : `backend/src/modules/stocks/dto/stock.dto.ts`
- Modifier : `backend/src/modules/stocks/stocks.service.ts`

- [ ] **Step 1 : Supprimer le champ `monnaie` du DTO**

Dans `backend/src/modules/stocks/dto/stock.dto.ts`, supprimer ces 3 lignes :

```typescript
  @IsEnum(['CDF', 'USD'])
  monnaie: 'CDF' | 'USD';
```

Le DTO devient :

```typescript
export class CreateProduitDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  categorie: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixVente: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixAchat: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SeuilSiteDto)
  seuilsParSite: SeuilSiteDto[];
}
```

- [ ] **Step 2 : Supprimer la conversion dans stocks.service.ts**

Dans `backend/src/modules/stocks/stocks.service.ts`, remplacer les lignes 767-785 :

**Avant :**
```typescript
    // Convertir prix en CDF si monnaie USD (taux fixe 2800 — configurable plus tard)
    const TAUX_USD_CDF = 2800;
    const prixVenteCDF = dto.monnaie === 'USD' ? dto.prixVente * TAUX_USD_CDF : dto.prixVente;
    const prixAchatCDF = dto.monnaie === 'USD' ? dto.prixAchat * TAUX_USD_CDF : dto.prixAchat;

    const produit = await this.prisma.$transaction(async (tx) => {
      // SKU atomique : compter dans la transaction
      const count = await tx.produit.count({ where: { categorie: dto.categorie } });
      const seq = String(count + 1).padStart(3, '0');
      const sku = `TSG-${prefix}-${seq}`;

      const newProduit = await tx.produit.create({
        data: {
          sku,
          nom: dto.nom,
          categorie: dto.categorie,
          description: dto.description ?? null,
          prixVente: prixVenteCDF,
          prixAchat: prixAchatCDF,
          actif: true,
        },
      });
```

**Après :**
```typescript
    const produit = await this.prisma.$transaction(async (tx) => {
      // SKU atomique : compter dans la transaction
      const count = await tx.produit.count({ where: { categorie: dto.categorie } });
      const seq = String(count + 1).padStart(3, '0');
      const sku = `TSG-${prefix}-${seq}`;

      const newProduit = await tx.produit.create({
        data: {
          sku,
          nom: dto.nom,
          categorie: dto.categorie,
          description: dto.description ?? null,
          prixVente: dto.prixVente,
          prixAchat: dto.prixAchat,
          actif: true,
        },
      });
```

- [ ] **Step 3 : Supprimer `monnaie` dans la réponse du service**

Dans la même fonction, à la réponse finale (lignes ~805-816) :

**Avant :**
```typescript
    return {
      produit: {
        id: produit.id,
        sku: produit.sku,
        nom: produit.nom,
        categorie: produit.categorie,
        prixVente: Number(produit.prixVente),
        prixAchat: Number(produit.prixAchat),
        monnaie: dto.monnaie,
        sitesEnregistres: siteIds.length,
      },
    };
```

**Après :**
```typescript
    return {
      produit: {
        id: produit.id,
        sku: produit.sku,
        nom: produit.nom,
        categorie: produit.categorie,
        prixVente: Number(produit.prixVente),
        prixAchat: Number(produit.prixAchat),
        sitesEnregistres: siteIds.length,
      },
    };
```

- [ ] **Step 4 : Vérifier que le backend compile**

```bash
cd backend && npm run build 2>&1 | tail -20
```

Expected : aucune erreur TypeScript.

- [ ] **Step 5 : Commit**

```bash
git add backend/src/modules/stocks/dto/stock.dto.ts backend/src/modules/stocks/stocks.service.ts
git commit -m "feat: remove CDF/USD conversion in stocks service, store prices in USD directly"
```

---

## Task 3 : Frontend — utils.ts et stocks.api.ts

**Fichiers :**
- Modifier : `frontend/src/lib/utils.ts`
- Modifier : `frontend/src/lib/stocks.api.ts`

- [ ] **Step 1 : Supprimer TAUX_USD_CDF de utils.ts**

Dans `frontend/src/lib/utils.ts`, supprimer la ligne :

```typescript
export const TAUX_USD_CDF = 2800;
```

La ligne vide laissée entre `cn()` et `formatCDF()` peut rester ou être retirée.

- [ ] **Step 2 : Supprimer monnaie du DTO frontend dans stocks.api.ts**

Dans `frontend/src/lib/stocks.api.ts`, trouver l'interface `CreateProduitDto` et supprimer :

```typescript
  monnaie: 'CDF' | 'USD';
```

Et dans `CreateProduitResponse`, supprimer :

```typescript
    monnaie: 'CDF' | 'USD';
```

- [ ] **Step 3 : Vérifier qu'il n'y a plus d'imports de TAUX_USD_CDF**

```bash
grep -r "TAUX_USD_CDF" frontend/src/
```

Expected : aucune occurrence restante (sauf éventuellement POSPage.tsx qui sera corrigé au Task 4).

- [ ] **Step 4 : Commit**

```bash
git add frontend/src/lib/utils.ts frontend/src/lib/stocks.api.ts
git commit -m "feat: remove TAUX_USD_CDF from utils, remove monnaie from CreateProduitDto"
```

---

## Task 4 : Frontend — POSPage.tsx

**Fichiers :**
- Modifier : `frontend/src/pages/ventes/POSPage.tsx`

- [ ] **Step 1 : Corriger l'import**

Dans `frontend/src/pages/ventes/POSPage.tsx`, ligne 29 :

**Avant :**
```typescript
import { cn, formatUSD, TAUX_USD_CDF } from '@/lib/utils';
```

**Après :**
```typescript
import { cn, formatUSD } from '@/lib/utils';
```

- [ ] **Step 2 : Corriger ProduitCard — prix produit**

Ligne 93 :

**Avant :**
```typescript
      <p className="text-[13px] font-bold text-primary-accent">{formatUSD(produit.prixVente / TAUX_USD_CDF)}</p>
```

**Après :**
```typescript
      <p className="text-[13px] font-bold text-primary-accent">{formatUSD(produit.prixVente)}</p>
```

- [ ] **Step 3 : Corriger le panier — prix unitaire**

Ligne ~496 :

**Avant :**
```typescript
                    <p className="text-[11px] text-text-muted">{formatUSD(item.prixUnitaire / TAUX_USD_CDF)}</p>
```

**Après :**
```typescript
                    <p className="text-[11px] text-text-muted">{formatUSD(item.prixUnitaire)}</p>
```

- [ ] **Step 4 : Corriger le panier — sous-total ligne**

Ligne ~511 :

**Avant :**
```typescript
                    {formatUSD(item.prixUnitaire * item.quantite / TAUX_USD_CDF)}
```

**Après :**
```typescript
                    {formatUSD(item.prixUnitaire * item.quantite)}
```

- [ ] **Step 5 : Corriger récapitulatif paiement — sous-total, remise, total**

Lignes ~566, ~572, ~576 :

**Avant :**
```typescript
                <span className="font-mono">{formatUSD(brutVal / TAUX_USD_CDF)}</span>
                  <span className="font-mono">−{formatUSD(remiseVal / TAUX_USD_CDF)}</span>
                <span className="font-mono">{formatUSD(netVal / TAUX_USD_CDF)}</span>
```

**Après :**
```typescript
                <span className="font-mono">{formatUSD(brutVal)}</span>
                  <span className="font-mono">−{formatUSD(remiseVal)}</span>
                <span className="font-mono">{formatUSD(netVal)}</span>
```

- [ ] **Step 6 : Corriger champ montant reçu (CASH)**

Lignes ~597-608 :

**Avant :**
```typescript
              <label className="form-label">Montant reçu (USD)</label>
              <input
                type="number" min={0} step={1}
                placeholder={String(Math.ceil(netVal / TAUX_USD_CDF))}
                value={montantRecu ? montantRecu / TAUX_USD_CDF : ''}
                onChange={(e) => setMontantRecu(Number(e.target.value) * TAUX_USD_CDF)}
                className="text-sm font-mono"
              />
              {monnaieVal > 0 && (
                <p className="text-[12px] font-semibold text-success">Monnaie à rendre : {formatUSD(monnaieVal / TAUX_USD_CDF)}</p>
              )}
```

**Après :**
```typescript
              <label className="form-label">Montant reçu (USD)</label>
              <input
                type="number" min={0} step={0.01}
                placeholder={String(netVal)}
                value={montantRecu || ''}
                onChange={(e) => setMontantRecu(Number(e.target.value))}
                className="text-sm font-mono"
              />
              {monnaieVal > 0 && (
                <p className="text-[12px] font-semibold text-success">Monnaie à rendre : {formatUSD(monnaieVal)}</p>
              )}
```

- [ ] **Step 7 : Corriger bouton valider et modal succès**

Ligne ~619 :

**Avant :**
```typescript
            <><CheckCircle2 size={15} />Valider — {formatUSD(netVal / TAUX_USD_CDF)}</>
```

**Après :**
```typescript
            <><CheckCircle2 size={15} />Valider — {formatUSD(netVal)}</>
```

Ligne ~205 (SuccessModal) :

**Avant :**
```typescript
          <p className="text-[22px] font-bold text-primary mt-0.5">{formatUSD(result.montantNet / TAUX_USD_CDF)}</p>
```

**Après :**
```typescript
          <p className="text-[22px] font-bold text-primary mt-0.5">{formatUSD(result.montantNet)}</p>
```

- [ ] **Step 8 : Vérifier qu'il n'y a plus de TAUX_USD_CDF dans le fichier**

```bash
grep "TAUX_USD_CDF" frontend/src/pages/ventes/POSPage.tsx
```

Expected : aucune occurrence.

- [ ] **Step 9 : Commit**

```bash
git add frontend/src/pages/ventes/POSPage.tsx
git commit -m "feat: POS displays prices in USD directly (no CDF conversion)"
```

---

## Task 5 : Frontend — NouveauProduitPage.tsx

**Fichiers :**
- Modifier : `frontend/src/pages/stocks/NouveauProduitPage.tsx`

- [ ] **Step 1 : Supprimer monnaie des FormValues et defaultValues**

Dans l'interface `FormValues` (ligne ~16), supprimer :
```typescript
  monnaie: 'CDF' | 'USD';
```

Dans `defaultValues` (ligne ~164), supprimer :
```typescript
      monnaie: 'CDF',
```

- [ ] **Step 2 : Supprimer les useWatch et variables liés à monnaie**

Supprimer ligne 175 :
```typescript
  const monnaie = useWatch({ control, name: 'monnaie' });
```

Supprimer ligne 258 :
```typescript
  const prixLabel = monnaie === 'USD' ? 'USD' : 'CDF';
```

Remplacer par :
```typescript
  const prixLabel = 'USD';
```

- [ ] **Step 3 : Supprimer monnaie du payload onSubmit**

Dans la fonction `onSubmit` (ligne ~231), dans le body `CreateProduitDto`, supprimer :
```typescript
      monnaie: values.monnaie,
```

- [ ] **Step 4 : Corriger l'aperçu marge — afficher toujours en USD**

Lignes 466-493 :

**Avant :**
```typescript
              {marge !== null && (
                <div className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-[12px] border',
                  marge >= 0
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100',
                )}>
                  <span className="text-text-muted font-medium">Marge brute</span>
                  <div className="flex items-center gap-2">
                    {marge < 0 && <AlertCircle size={13} className="text-danger" />}
                    <span className={cn('font-bold font-mono', marge >= 0 ? 'text-success' : 'text-danger')}>
                      {monnaie === 'USD'
                        ? `${marge >= 0 ? '+' : ''}${marge.toFixed(2)} USD`
                        : `${marge >= 0 ? '+' : ''}${new Intl.NumberFormat('fr-CD').format(marge)} CDF`}
                    </span>
                    {margePct !== null && (
                      <span className="text-text-muted">({margePct}%)</span>
                    )}
                  </div>
                </div>
              )}

              {monnaie === 'USD' && (
                <p className="text-[10px] text-text-muted">
                  Les prix seront convertis en CDF au taux de 2 800 CDF/USD lors de l'enregistrement.
                </p>
              )}
```

**Après :**
```typescript
              {marge !== null && (
                <div className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-[12px] border',
                  marge >= 0
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100',
                )}>
                  <span className="text-text-muted font-medium">Marge brute</span>
                  <div className="flex items-center gap-2">
                    {marge < 0 && <AlertCircle size={13} className="text-danger" />}
                    <span className={cn('font-bold font-mono', marge >= 0 ? 'text-success' : 'text-danger')}>
                      {`${marge >= 0 ? '+' : ''}${marge.toFixed(2)} USD`}
                    </span>
                    {margePct !== null && (
                      <span className="text-text-muted">({margePct}%)</span>
                    )}
                  </div>
                </div>
              )}
```

- [ ] **Step 5 : Supprimer le toggle CDF/USD dans le JSX**

Lignes 395-411 :

**Avant :**
```tsx
                {/* Toggle CDF / USD */}
                <div className="period-toggle">
                  <button
                    type="button"
                    className={cn('period-btn', monnaie === 'CDF' && 'active')}
                    onClick={() => setValue('monnaie', 'CDF')}
                  >
                    CDF
                  </button>
                  <button
                    type="button"
                    className={cn('period-btn', monnaie === 'USD' && 'active')}
                    onClick={() => setValue('monnaie', 'USD')}
                  >
                    USD
                  </button>
                </div>
```

**Après :** supprimer entièrement ce bloc (le `<div className="period-toggle">` et ses boutons).

- [ ] **Step 6 : Corriger les steps des inputs prix**

Lignes 424 et 449 :

**Avant :**
```typescript
                      step={monnaie === 'USD' ? '0.01' : '100'}
```

(les deux occurrences)

**Après :**
```typescript
                      step="0.01"
```

- [ ] **Step 7 : Vérifier qu'il n'y a plus de référence à monnaie**

```bash
grep "monnaie" frontend/src/pages/stocks/NouveauProduitPage.tsx
```

Expected : aucune occurrence.

- [ ] **Step 8 : Commit**

```bash
git add frontend/src/pages/stocks/NouveauProduitPage.tsx
git commit -m "feat: NouveauProduitPage accepts USD only, removes CDF/USD toggle"
```

---

## Task 6 : Frontend — RecuPage.tsx et AvoirDocumentPage.tsx

**Fichiers :**
- Modifier : `frontend/src/pages/ventes/RecuPage.tsx`
- Modifier : `frontend/src/pages/ventes/AvoirDocumentPage.tsx`

- [ ] **Step 1 : RecuPage — remplacer l'import**

Ligne 7 :

**Avant :**
```typescript
import { cn, formatCDF, formatDateTime } from '@/lib/utils';
```

**Après :**
```typescript
import { cn, formatUSD, formatDateTime } from '@/lib/utils';
```

- [ ] **Step 2 : RecuPage — remplacer tous les formatCDF par formatUSD**

Lignes 337, 340, 352, 359, 368, 377, 385 — remplacer chaque `formatCDF(` par `formatUSD(` :

```typescript
// ligne 337
{ligne.quantite}×{formatUSD(ligne.prixUnitaire)}
// ligne 340
{formatUSD(ligne.sousTotal)}
// ligne 352
{formatUSD(vente.montantBrut)}
// ligne 359
-{formatUSD(vente.remiseFidelite)}
// ligne 368
{formatUSD(vente.montantNet)}
// ligne 377
{formatUSD(vente.montantRecu)}
// ligne 385
{formatUSD(vente.monnaieRendue)}
```

- [ ] **Step 3 : AvoirDocumentPage — remplacer l'import**

Ligne 5 :

**Avant :**
```typescript
import { formatCDF, formatDateTime } from '@/lib/utils';
```

**Après :**
```typescript
import { formatUSD, formatDateTime } from '@/lib/utils';
```

- [ ] **Step 4 : AvoirDocumentPage — remplacer tous les formatCDF par formatUSD**

Lignes 173, 174, 186, 190, 194 :

```typescript
// ligne 173
{formatUSD(Math.round(puHT))}
// ligne 174
{formatUSD(Math.round(stHT))}
// ligne 186
{formatUSD(avoir.montantHT)}
// ligne 190
{formatUSD(avoir.montantTVA)}
// ligne 194
{formatUSD(avoir.montantRembourse)}
```

- [ ] **Step 5 : Commit**

```bash
git add frontend/src/pages/ventes/RecuPage.tsx frontend/src/pages/ventes/AvoirDocumentPage.tsx
git commit -m "feat: RecuPage and AvoirDocumentPage display amounts in USD"
```

---

## Task 7 : Frontend — RapportStocksPage.tsx et OnboardingActivationPage.tsx

**Fichiers :**
- Modifier : `frontend/src/pages/rapports/RapportStocksPage.tsx`
- Modifier : `frontend/src/pages/clients/OnboardingActivationPage.tsx`

- [ ] **Step 1 : RapportStocksPage — remplacer l'import**

Ligne 6 :

**Avant :**
```typescript
import { formatCDF, cn } from '@/lib/utils';
```

**Après :**
```typescript
import { formatUSD, cn } from '@/lib/utils';
```

- [ ] **Step 2 : RapportStocksPage — remplacer formatCDF par formatUSD**

Ligne 186 :

**Avant :**
```typescript
{formatCDF(Number(p.prixAchat ?? 0))}
```

**Après :**
```typescript
{formatUSD(Number(p.prixAchat ?? 0))}
```

- [ ] **Step 3 : OnboardingActivationPage — ajouter formatUSD à l'import**

Ligne 11 :

**Avant :**
```typescript
import { cn, formatCDF, formatDate, initials } from '@/lib/utils';
```

**Après :**
```typescript
import { cn, formatCDF, formatUSD, formatDate, initials } from '@/lib/utils';
```

- [ ] **Step 4 : OnboardingActivationPage — récapitulatif paiements**

Les étapes RECIT et FICHE restent `formatCDF` (ligne 534), inchangées.

`totalPaye` (récit + fiche) reste `formatCDF` (ligne 547), inchangé.

Aucun changement nécessaire dans ce bloc — il affiche déjà correctement en CDF.

- [ ] **Step 5 : Commit**

```bash
git add frontend/src/pages/rapports/RapportStocksPage.tsx frontend/src/pages/clients/OnboardingActivationPage.tsx
git commit -m "feat: RapportStocksPage prixAchat in USD; OnboardingActivation RECIT/FICHE stay CDF"
```

---

## Task 8 : Frontend — FicheAdhesionPDF.tsx

**Fichiers :**
- Modifier : `frontend/src/components/clients/FicheAdhesionPDF.tsx`

- [ ] **Step 1 : Supprimer la fonction formatCDF locale et importer formatUSD**

Dans `FicheAdhesionPDF.tsx`, autour de la ligne 264 :

**Avant :**
```typescript
function formatCDF(amount: number): string {
  return new Intl.NumberFormat('fr-CD').format(amount) + 'CDF';
}
```

**Après :** supprimer cette fonction et ajouter `formatUSD` aux imports depuis utils :

```typescript
import { formatUSD } from '@/lib/utils';
```

(Ajouter à la ligne d'import existante de `@/lib/utils` si elle existe déjà, sinon créer une nouvelle ligne d'import.)

- [ ] **Step 2 : Remplacer formatCDF par formatUSD pour produitPrix**

Lignes 391 et 420 :

**Avant :**
```typescript
{formatCDF(data.produitPrix)}
```

(deux occurrences)

**Après :**
```typescript
{formatUSD(data.produitPrix)}
```

- [ ] **Step 3 : Vérifier qu'il n'y a plus de formatCDF dans le fichier**

```bash
grep "formatCDF" frontend/src/components/clients/FicheAdhesionPDF.tsx
```

Expected : aucune occurrence.

- [ ] **Step 4 : Commit**

```bash
git add frontend/src/components/clients/FicheAdhesionPDF.tsx
git commit -m "feat: FicheAdhesionPDF displays produitPrix in USD"
```

---

## Task 9 : Vérification finale

- [ ] **Step 1 : Build TypeScript frontend**

```bash
cd frontend && npm run build 2>&1 | tail -30
```

Expected : aucune erreur TypeScript ni d'import manquant.

- [ ] **Step 2 : Build TypeScript backend**

```bash
cd backend && npm run build 2>&1 | tail -20
```

Expected : aucune erreur TypeScript.

- [ ] **Step 3 : Vérifier qu'il n'y a plus de TAUX_USD_CDF dans tout le frontend**

```bash
grep -r "TAUX_USD_CDF" frontend/src/
```

Expected : aucune occurrence.

- [ ] **Step 4 : Test manuel — Créer un produit**

1. Démarrer backend : `cd backend && npm run start:dev`
2. Démarrer frontend : `cd frontend && npm run dev`
3. Se connecter (`+243902238740` / `Admin@2025`)
4. Aller sur `/stocks/new`
5. Vérifier : seul le label "USD" apparaît, pas de toggle CDF/USD
6. Créer un produit PV = 150 USD, PA = 100 USD
7. Vérifier : marge affiche `+50.00 USD`

- [ ] **Step 5 : Test manuel — POS**

1. Aller sur `/sales/pos`
2. Rechercher le produit créé
3. Vérifier : le prix affiché est `$150`
4. Ajouter au panier — vérifier que le sous-total est `$150`
5. Le total "Valider" affiche `$150`

- [ ] **Step 6 : Commit final si build propre**

```bash
git add -A
git commit -m "chore: final cleanup USD migration"
```
