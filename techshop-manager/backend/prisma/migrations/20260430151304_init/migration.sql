-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'DIRECTEUR_REGIONAL', 'GERANT', 'AGENT', 'FORMATEUR', 'CLIENT');

-- CreateEnum
CREATE TYPE "StatutClient" AS ENUM ('EN_COURS', 'ACTIF', 'SUSPENDU', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "NiveauFidelite" AS ENUM ('BRONZE', 'ARGENT', 'OR', 'PLATINE');

-- CreateEnum
CREATE TYPE "EtapeOnboarding" AS ENUM ('RECIT', 'FORMATION', 'FICHE', 'ACTIVATION');

-- CreateEnum
CREATE TYPE "StatutEtape" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('CASH', 'MPESA', 'AIRTEL_MONEY', 'VIREMENT');

-- CreateEnum
CREATE TYPE "StatutVente" AS ENUM ('VALIDE', 'RETOURNEE_PARTIELLE', 'RETOURNEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeMouvement" AS ENUM ('ENTREE', 'SORTIE_VENTE', 'TRANSFERT_DEPART', 'TRANSFERT_ARRIVEE', 'AJUSTEMENT_INVENTAIRE');

-- CreateEnum
CREATE TYPE "StatutTransfert" AS ENUM ('EN_TRANSIT', 'RECU', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutParrainage" AS ENUM ('EN_ATTENTE', 'VALIDE', 'RECOMPENSE_VERSEE');

-- CreateEnum
CREATE TYPE "TypeRecompense" AS ENUM ('POINTS', 'REMISE_PROCHAINE_VENTE', 'COMMISSION_CDF');

-- CreateEnum
CREATE TYPE "StatutExport" AS ENUM ('PENDING', 'READY', 'ERROR');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SYNCED', 'PENDING', 'CONFLICT');

-- CreateEnum
CREATE TYPE "StatutAlerte" AS ENUM ('ALERTE', 'RUPTURE');

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "adresse" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gerantId" TEXT,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "derniereConnexion" TIMESTAMP(3),
    "tentativesConnexion" INTEGER NOT NULL DEFAULT 0,
    "bloqueJusquA" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "matriculeExterne" TEXT,
    "codeParrain" TEXT,
    "statut" "StatutClient" NOT NULL DEFAULT 'EN_COURS',
    "pointsFidelite" INTEGER NOT NULL DEFAULT 0,
    "pointsCumules" INTEGER NOT NULL DEFAULT 0,
    "niveauFidelite" "NiveauFidelite" NOT NULL DEFAULT 'BRONZE',
    "notes" TEXT,
    "dateActivation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteInscriptionId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "parrainId" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_etapes" (
    "id" TEXT NOT NULL,
    "etape" "EtapeOnboarding" NOT NULL,
    "statut" "StatutEtape" NOT NULL DEFAULT 'EN_ATTENTE',
    "completeeAt" TIMESTAMP(3),
    "montant" DECIMAL(12,2),
    "modePaiement" "ModePaiement",
    "referenceTransaction" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "onboarding_etapes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "categorie" TEXT NOT NULL,
    "prixVente" DECIMAL(12,2) NOT NULL,
    "prixAchat" DECIMAL(12,2) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_sites" (
    "id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "produitId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "stock_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL,
    "type" "TypeMouvement" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "quantiteAvant" INTEGER NOT NULL,
    "quantiteApres" INTEGER NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produitId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferts_stock" (
    "id" TEXT NOT NULL,
    "quantiteEnvoyee" INTEGER NOT NULL,
    "quantiteRecue" INTEGER,
    "motif" TEXT,
    "observations" TEXT,
    "statut" "StatutTransfert" NOT NULL DEFAULT 'EN_TRANSIT',
    "dateExpedition" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateReception" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produitId" TEXT NOT NULL,
    "siteSourceId" TEXT NOT NULL,
    "siteDestinationId" TEXT NOT NULL,
    "initiateurId" TEXT NOT NULL,

    CONSTRAINT "transferts_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventes" (
    "id" TEXT NOT NULL,
    "numeroVente" TEXT NOT NULL,
    "statut" "StatutVente" NOT NULL DEFAULT 'VALIDE',
    "montantBrut" DECIMAL(12,2) NOT NULL,
    "remiseFidelite" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remiseParrainage" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "montantNet" DECIMAL(12,2) NOT NULL,
    "modePaiement" "ModePaiement" NOT NULL,
    "referenceTransaction" TEXT,
    "montantRecu" DECIMAL(12,2),
    "monnaieRendue" DECIMAL(12,2),
    "pointsAttribues" INTEGER NOT NULL DEFAULT 0,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT,
    "siteId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "ventes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_vente" (
    "id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DECIMAL(12,2) NOT NULL,
    "sousTotal" DECIMAL(12,2) NOT NULL,
    "venteId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,

    CONSTRAINT "lignes_vente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retours" (
    "id" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "modeRemboursement" "ModePaiement" NOT NULL,
    "montantRembourse" DECIMAL(12,2) NOT NULL,
    "stockRemis" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "venteId" TEXT NOT NULL,

    CONSTRAINT "retours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_retour" (
    "id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "retourId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,

    CONSTRAINT "lignes_retour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parrainages" (
    "id" TEXT NOT NULL,
    "niveau" INTEGER NOT NULL DEFAULT 1,
    "statut" "StatutParrainage" NOT NULL DEFAULT 'EN_ATTENTE',
    "recompenseType" "TypeRecompense",
    "recompenseValeur" DECIMAL(12,2),
    "recompenseVerseAt" TIMESTAMP(3),
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parrainId" TEXT NOT NULL,
    "filleulId" TEXT NOT NULL,

    CONSTRAINT "parrainages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regle_parrainage" (
    "id" TEXT NOT NULL,
    "multiNiveaux" BOOLEAN NOT NULL DEFAULT false,
    "typeRecompense" "TypeRecompense" NOT NULL DEFAULT 'POINTS',
    "valeurNiveau1" DECIMAL(12,2) NOT NULL,
    "valeurNiveau2" DECIMAL(12,2),
    "conditionDeclenchement" TEXT NOT NULL DEFAULT 'ACTIVATION',
    "plafondMensuel" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regle_parrainage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_points" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "soldeApres" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "venteId" TEXT,

    CONSTRAINT "mouvements_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_fidelite" (
    "id" TEXT NOT NULL,
    "ratioPtsCDF" INTEGER NOT NULL DEFAULT 1000,
    "dureeValiditeMois" INTEGER NOT NULL DEFAULT 0,
    "cumulRemises" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_fidelite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niveaux_config" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "seuilPts" INTEGER NOT NULL,
    "remisePct" DECIMAL(5,2) NOT NULL,
    "couleur" TEXT,
    "configId" TEXT NOT NULL,

    CONSTRAINT "niveaux_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_generale" (
    "id" TEXT NOT NULL,
    "smsApiKey" TEXT,
    "smsUsername" TEXT,
    "smsSenderId" TEXT,
    "matriculeExterneActif" BOOLEAN NOT NULL DEFAULT false,
    "matriculeRegex" TEXT,
    "dureeSectionHeures" INTEGER NOT NULL DEFAULT 8,
    "delaiRetourJours" INTEGER NOT NULL DEFAULT 7,
    "fraisRetourPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_generale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filtres" JSONB,
    "statut" "StatutExport" NOT NULL DEFAULT 'PENDING',
    "downloadUrl" TEXT,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portail_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "portail_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_telephone_key" ON "utilisateurs"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_telephone_key" ON "clients"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_matriculeExterne_key" ON "clients"("matriculeExterne");

-- CreateIndex
CREATE UNIQUE INDEX "clients_codeParrain_key" ON "clients"("codeParrain");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_etapes_clientId_etape_key" ON "onboarding_etapes"("clientId", "etape");

-- CreateIndex
CREATE UNIQUE INDEX "produits_sku_key" ON "produits"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "stock_sites_produitId_siteId_key" ON "stock_sites"("produitId", "siteId");

-- CreateIndex
CREATE UNIQUE INDEX "ventes_numeroVente_key" ON "ventes"("numeroVente");

-- CreateIndex
CREATE UNIQUE INDEX "parrainages_filleulId_key" ON "parrainages"("filleulId");

-- CreateIndex
CREATE UNIQUE INDEX "portail_tokens_token_key" ON "portail_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "portail_tokens_clientId_key" ON "portail_tokens"("clientId");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_siteInscriptionId_fkey" FOREIGN KEY ("siteInscriptionId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_parrainId_fkey" FOREIGN KEY ("parrainId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_etapes" ADD CONSTRAINT "onboarding_etapes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_etapes" ADD CONSTRAINT "onboarding_etapes_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_etapes" ADD CONSTRAINT "onboarding_etapes_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_sites" ADD CONSTRAINT "stock_sites_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_sites" ADD CONSTRAINT "stock_sites_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts_stock" ADD CONSTRAINT "transferts_stock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts_stock" ADD CONSTRAINT "transferts_stock_siteSourceId_fkey" FOREIGN KEY ("siteSourceId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts_stock" ADD CONSTRAINT "transferts_stock_siteDestinationId_fkey" FOREIGN KEY ("siteDestinationId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts_stock" ADD CONSTRAINT "transferts_stock_initiateurId_fkey" FOREIGN KEY ("initiateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_vente" ADD CONSTRAINT "lignes_vente_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_vente" ADD CONSTRAINT "lignes_vente_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retours" ADD CONSTRAINT "retours_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_retour" ADD CONSTRAINT "lignes_retour_retourId_fkey" FOREIGN KEY ("retourId") REFERENCES "retours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_retour" ADD CONSTRAINT "lignes_retour_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_parrainId_fkey" FOREIGN KEY ("parrainId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_filleulId_fkey" FOREIGN KEY ("filleulId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_points" ADD CONSTRAINT "mouvements_points_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "niveaux_config" ADD CONSTRAINT "niveaux_config_configId_fkey" FOREIGN KEY ("configId") REFERENCES "config_fidelite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portail_tokens" ADD CONSTRAINT "portail_tokens_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
