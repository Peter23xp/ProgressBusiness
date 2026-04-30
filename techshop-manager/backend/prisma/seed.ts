import { PrismaClient, Role, TypeRecompense, NiveauFidelite } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // ============================================
  // 1. SITES
  // ============================================
  console.log('📍 Création des sites...');

  const siteGoma = await prisma.site.upsert({
    where: { id: 'site-goma-001' },
    update: {},
    create: {
      id: 'site-goma-001',
      nom: 'TechShop Goma',
      ville: 'Goma',
      adresse: 'Avenue du Commerce, Goma, Nord-Kivu',
      actif: true,
    },
  });

  const siteBukavu = await prisma.site.upsert({
    where: { id: 'site-bukavu-001' },
    update: {},
    create: {
      id: 'site-bukavu-001',
      nom: 'TechShop Bukavu',
      ville: 'Bukavu',
      adresse: 'Boulevard Patrice Lumumba, Bukavu, Sud-Kivu',
      actif: true,
    },
  });

  const siteKinshasa = await prisma.site.upsert({
    where: { id: 'site-kinshasa-001' },
    update: {},
    create: {
      id: 'site-kinshasa-001',
      nom: 'TechShop Kinshasa',
      ville: 'Kinshasa',
      adresse: 'Avenue Kasa-Vubu, Gombe, Kinshasa',
      actif: true,
    },
  });

  console.log(`  ✓ Site: ${siteGoma.nom}`);
  console.log(`  ✓ Site: ${siteBukavu.nom}`);
  console.log(`  ✓ Site: ${siteKinshasa.nom}`);

  // ============================================
  // 2. SUPER ADMIN
  // ============================================
  console.log('👤 Création du Super Admin...');

  const passwordHash = await bcrypt.hash('1234567890', 10);

  const superAdmin = await prisma.utilisateur.upsert({
    where: { telephone: '+243902238740' },
    update: {},
    create: {
      nom: 'Peter AKILIMALI',
      telephone: '+243902238740',
      passwordHash,
      role: Role.SUPER_ADMIN,
      actif: true,
      langue: 'fr',
    },
  });

  console.log(`  ✓ Super Admin: ${superAdmin.nom} (${superAdmin.telephone})`);

  // ============================================
  // 3. CONFIG FIDELITE
  // ============================================
  console.log('⭐ Création de la config fidélité...');

  const existingConfigFidelite = await prisma.configFidelite.findFirst();

  if (!existingConfigFidelite) {
    const configFidelite = await prisma.configFidelite.create({
      data: {
        ratioPtsCDF: 1000,
        dureeValiditeMois: 0,
        cumulRemises: false,
        niveaux: {
          create: [
            { nom: 'Bronze', seuilPts: 0, remisePct: 0, couleur: '#CD7F32' },
            { nom: 'Argent', seuilPts: 500, remisePct: 3, couleur: '#C0C0C0' },
            { nom: 'Or', seuilPts: 2000, remisePct: 5, couleur: '#FFD700' },
            { nom: 'Platine', seuilPts: 5000, remisePct: 8, couleur: '#E5E4E2' },
          ],
        },
      },
      include: { niveaux: true },
    });
    console.log(`  ✓ Config fidélité créée avec ${configFidelite.niveaux.length} niveaux`);
  } else {
    console.log('  ℹ Config fidélité déjà existante, ignorée');
  }

  // ============================================
  // 4. REGLE PARRAINAGE
  // ============================================
  console.log('🤝 Création de la règle parrainage...');

  const existingRegleParrainage = await prisma.regleParrainage.findFirst();

  if (!existingRegleParrainage) {
    const regleParrainage = await prisma.regleParrainage.create({
      data: {
        multiNiveaux: false,
        typeRecompense: TypeRecompense.POINTS,
        valeurNiveau1: 500,
        valeurNiveau2: null,
        conditionDeclenchement: 'ACTIVATION',
        plafondMensuel: null,
      },
    });
    console.log(`  ✓ Règle parrainage créée (type: ${regleParrainage.typeRecompense}, valeur N1: ${regleParrainage.valeurNiveau1})`);
  } else {
    console.log('  ℹ Règle parrainage déjà existante, ignorée');
  }

  // ============================================
  // 5. CONFIG GENERALE
  // ============================================
  console.log('⚙️  Création de la config générale...');

  const existingConfigGenerale = await prisma.configGenerale.findFirst();

  if (!existingConfigGenerale) {
    const configGenerale = await prisma.configGenerale.create({
      data: {
        smsApiKey: null,
        smsUsername: null,
        smsSenderId: 'TechShop',
        matriculeExterneActif: false,
        matriculeRegex: null,
        dureeSectionHeures: 8,
        delaiRetourJours: 7,
        fraisRetourPct: 0,
      },
    });
    console.log(`  ✓ Config générale créée (délai retour: ${configGenerale.delaiRetourJours} jours)`);
  } else {
    console.log('  ℹ Config générale déjà existante, ignorée');
  }

  // ============================================
  // 6. PRODUITS EXEMPLE + STOCK SUR GOMA
  // ============================================
  console.log('📦 Création des produits exemples...');

  const produits = [
    {
      sku: 'TSG-SM-001',
      nom: 'Samsung Galaxy A54',
      description: 'Smartphone Samsung Galaxy A54 5G, 128GB, 6GB RAM',
      categorie: 'Smartphones',
      prixVente: 420000,
      prixAchat: 320000,
      stock: 15,
      seuilAlerte: 3,
    },
    {
      sku: 'TSG-SM-002',
      nom: 'Tecno Spark 20',
      description: 'Smartphone Tecno Spark 20, 128GB, 8GB RAM',
      categorie: 'Smartphones',
      prixVente: 210000,
      prixAchat: 155000,
      stock: 20,
      seuilAlerte: 5,
    },
    {
      sku: 'TSG-SM-003',
      nom: 'iPhone 13',
      description: 'Apple iPhone 13, 128GB, Minuit',
      categorie: 'Smartphones',
      prixVente: 950000,
      prixAchat: 780000,
      stock: 8,
      seuilAlerte: 2,
    },
    {
      sku: 'TSG-ACC-001',
      nom: 'Chargeur Rapide 65W',
      description: 'Chargeur rapide universel 65W USB-C',
      categorie: 'Accessoires',
      prixVente: 35000,
      prixAchat: 18000,
      stock: 50,
      seuilAlerte: 10,
    },
    {
      sku: 'TSG-ACC-002',
      nom: 'Écouteurs Bluetooth TWS',
      description: 'Écouteurs sans fil Bluetooth 5.0, autonomie 24h',
      categorie: 'Accessoires',
      prixVente: 55000,
      prixAchat: 30000,
      stock: 30,
      seuilAlerte: 8,
    },
  ];

  for (const p of produits) {
    const produit = await prisma.produit.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        nom: p.nom,
        description: p.description,
        categorie: p.categorie,
        prixVente: p.prixVente,
        prixAchat: p.prixAchat,
        actif: true,
      },
    });

    // Créer/mettre à jour le stock sur Goma
    await prisma.stockSite.upsert({
      where: {
        produitId_siteId: {
          produitId: produit.id,
          siteId: siteGoma.id,
        },
      },
      update: {},
      create: {
        produitId: produit.id,
        siteId: siteGoma.id,
        quantite: p.stock,
        seuilAlerte: p.seuilAlerte,
      },
    });

    // Créer aussi un stock vide pour Bukavu et Kinshasa
    for (const site of [siteBukavu, siteKinshasa]) {
      await prisma.stockSite.upsert({
        where: {
          produitId_siteId: {
            produitId: produit.id,
            siteId: site.id,
          },
        },
        update: {},
        create: {
          produitId: produit.id,
          siteId: site.id,
          quantite: 0,
          seuilAlerte: p.seuilAlerte,
        },
      });
    }

    console.log(`  ✓ Produit: ${produit.nom} (SKU: ${produit.sku}) - Stock Goma: ${p.stock}`);
  }

  // ============================================
  // RÉSUMÉ
  // ============================================
  console.log('\n✅ Seed terminé avec succès!');
  console.log('\n📊 Résumé:');
  console.log(`  - 3 sites créés: Goma, Bukavu, Kinshasa`);
  console.log(`  - 1 Super Admin: +243900000001 / Admin@2025`);
  console.log(`  - Config fidélité: Bronze, Argent, Or, Platine`);
  console.log(`  - Règle parrainage par défaut (POINTS, 500 pts/filleul)`);
  console.log(`  - Config générale par défaut`);
  console.log(`  - 5 produits avec stocks sur Goma`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
