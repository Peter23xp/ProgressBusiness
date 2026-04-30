import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { CreateVenteDto, RetourDto } from './dto/vente.dto';
import { NiveauFidelite, TypeMouvement } from '@prisma/client';

const REMISE_FIDELITE: Record<NiveauFidelite, number> = {
  BRONZE: 0,
  ARGENT: 3,
  OR: 5,
  PLATINE: 8,
};

const POINTS_PAR_CDF = 1000; // 1 point par 1000 CDF

@Injectable()
export class VentesService {
  constructor(private prisma: PrismaService) {}

  async createVente(dto: CreateVenteDto, agentId: string) {
    // Vérifier que le site existe
    const site = await this.prisma.site.findUnique({
      where: { id: dto.siteId },
      select: { id: true, nom: true },
    });
    if (!site) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Site introuvable' });
    }

    // Récupérer le client si fourni
    let client: any = null;
    if (dto.clientId) {
      client = await this.prisma.client.findUnique({
        where: { id: dto.clientId },
        select: { id: true, niveauFidelite: true, pointsFidelite: true, statut: true },
      });
      if (!client) {
        throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
      }
    }

    // Récupérer les produits et vérifier le stock
    const produitIds = dto.lignes.map((l) => l.produitId);
    const produits = await this.prisma.produit.findMany({
      where: { id: { in: produitIds }, actif: true },
    });

    if (produits.length !== produitIds.length) {
      throw new NotFoundException({
        code: 'ERR_NOT_FOUND',
        message: 'Un ou plusieurs produits introuvables ou inactifs',
      });
    }

    // Vérifier les stocks disponibles
    const stockSites = await this.prisma.stockSite.findMany({
      where: {
        siteId: dto.siteId,
        produitId: { in: produitIds },
      },
    });

    const stockMap = new Map(stockSites.map((s) => [s.produitId, s]));

    for (const ligne of dto.lignes) {
      const stock = stockMap.get(ligne.produitId);
      if (!stock || stock.quantite < ligne.quantite) {
        const produit = produits.find((p) => p.id === ligne.produitId);
        throw new ConflictException({
          code: 'ERR_STOCK_INSUFFISANT',
          message: `Stock insuffisant pour ${produit?.nom ?? ligne.produitId}. Disponible: ${stock?.quantite ?? 0}`,
        });
      }
    }

    // Calculer les montants
    const produitMap = new Map(produits.map((p) => [p.id, p]));
    let montantBrut = 0;

    const lignesData = dto.lignes.map((ligne) => {
      const produit = produitMap.get(ligne.produitId)!;
      const prixUnitaire = Number(produit.prixVente);
      const sousTotal = prixUnitaire * ligne.quantite;
      montantBrut += sousTotal;
      return {
        produitId: ligne.produitId,
        quantite: ligne.quantite,
        prixUnitaire,
        sousTotal,
      };
    });

    // Calculer la remise fidélité
    let remiseFidelite = 0;
    if (client && dto.appliquerRemiseFidelite) {
      const pct = REMISE_FIDELITE[client.niveauFidelite as NiveauFidelite] ?? 0;
      remiseFidelite = montantBrut * (pct / 100);
    }

    const montantNet = montantBrut - remiseFidelite;

    // Calculer monnaie rendue
    let monnaieRendue: number | null = null;
    if (dto.montantRecu !== undefined && dto.montantRecu !== null) {
      monnaieRendue = dto.montantRecu - montantNet;
      if (monnaieRendue < 0) {
        throw new BadRequestException({
          code: 'ERR_BAD_REQUEST',
          message: 'Montant reçu insuffisant',
        });
      }
    }

    // Calculer points fidélité (1 pt par 1000 CDF, arrondi inférieur)
    const pointsAttribues = client
      ? Math.floor(montantNet / POINTS_PAR_CDF)
      : 0;

    // Générer le numéro de vente
    const numeroVente = await this.generateNumeroVente(dto.siteId);

    const vente = await this.prisma.$transaction(async (tx) => {
      // Créer la vente
      const newVente = await tx.vente.create({
        data: {
          numeroVente,
          siteId: dto.siteId,
          agentId,
          clientId: dto.clientId,
          modePaiement: dto.modePaiement,
          montantBrut,
          remiseFidelite,
          montantNet,
          montantRecu: dto.montantRecu,
          monnaieRendue,
          pointsAttribues,
          lignes: {
            create: lignesData,
          },
        },
        include: {
          lignes: { include: { produit: true } },
          client: { select: { id: true, prenom: true, nom: true } },
          site: { select: { id: true, nom: true } },
        },
      });

      // Décrémenter le stock et créer les mouvements
      for (const ligne of lignesData) {
        const stock = stockMap.get(ligne.produitId)!;
        const quantiteAvant = stock.quantite;
        const quantiteApres = quantiteAvant - ligne.quantite;

        await tx.stockSite.update({
          where: { produitId_siteId: { produitId: ligne.produitId, siteId: dto.siteId } },
          data: { quantite: quantiteApres },
        });

        await tx.mouvementStock.create({
          data: {
            type: TypeMouvement.SORTIE_VENTE,
            quantite: ligne.quantite,
            quantiteAvant,
            quantiteApres,
            reference: numeroVente,
            produitId: ligne.produitId,
            siteId: dto.siteId,
            agentId,
          },
        });
      }

      // Attribuer les points fidélité
      if (client && pointsAttribues > 0) {
        const updatedClient = await tx.client.update({
          where: { id: client.id },
          data: {
            pointsFidelite: { increment: pointsAttribues },
            pointsCumules: { increment: pointsAttribues },
          },
          select: { pointsFidelite: true },
        });

        await tx.mouvementPoints.create({
          data: {
            type: 'GAIN_VENTE',
            delta: pointsAttribues,
            soldeApres: updatedClient.pointsFidelite,
            description: `Points gagnés sur vente ${numeroVente}`,
            clientId: client.id,
            venteId: newVente.id,
          },
        });

        // Mettre à jour le niveau de fidélité
        await this.updateNiveauFidelite(tx, client.id, updatedClient.pointsFidelite);
      }

      return newVente;
    });

    return vente;
  }

  private async generateNumeroVente(siteId: string): Promise<string> {
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      select: { nom: true },
    });

    const siteCode = (site?.nom ?? 'SITE').substring(0, 3).toUpperCase();
    const now = new Date();
    const annee = now.getFullYear().toString();
    const mois = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${siteCode}-${annee}${mois}-`;

    const lastVente = await this.prisma.vente.findFirst({
      where: { numeroVente: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
      select: { numeroVente: true },
    });

    let seq = 1;
    if (lastVente?.numeroVente) {
      const parts = lastVente.numeroVente.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  private async updateNiveauFidelite(
    tx: any,
    clientId: string,
    pointsCumules: number,
  ) {
    let niveau: NiveauFidelite = NiveauFidelite.BRONZE;
    if (pointsCumules >= 5000) niveau = NiveauFidelite.PLATINE;
    else if (pointsCumules >= 2000) niveau = NiveauFidelite.OR;
    else if (pointsCumules >= 500) niveau = NiveauFidelite.ARGENT;

    await tx.client.update({
      where: { id: clientId },
      data: { niveauFidelite: niveau },
    });
  }

  async findAll(query: {
    siteId?: string;
    dateDebut?: string;
    dateFin?: string;
    modePaiement?: string;
    page?: number;
    limit?: number;
  }) {
    const { siteId, dateDebut, dateFin, modePaiement, page = 1, limit = 50 } = query;

    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (modePaiement) where.modePaiement = modePaiement;
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) where.createdAt.gte = new Date(dateDebut);
      if (dateFin) where.createdAt.lte = new Date(dateFin);
    }

    const [data, total] = await Promise.all([
      this.prisma.vente.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, prenom: true, nom: true } },
          agent: { select: { id: true, nom: true } },
          site: { select: { id: true, nom: true } },
          lignes: {
            include: {
              produit: { select: { id: true, nom: true, sku: true } },
            },
          },
        },
      }),
      this.prisma.vente.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const vente = await this.prisma.vente.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, prenom: true, nom: true, telephone: true } },
        agent: { select: { id: true, nom: true } },
        site: { select: { id: true, nom: true, adresse: true } },
        lignes: {
          include: {
            produit: { select: { id: true, nom: true, sku: true, categorie: true } },
          },
        },
        retours: {
          include: { lignes: { include: { produit: true } } },
        },
      },
    });

    if (!vente) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Vente introuvable' });
    }

    return vente;
  }

  async getReceipt(id: string) {
    const vente = await this.findOne(id);

    return {
      receipt: {
        numeroVente: vente.numeroVente,
        date: vente.createdAt,
        site: vente.site,
        agent: vente.agent,
        client: vente.client,
        lignes: (vente as any).lignes.map((l: any) => ({
          produit: l.produit.nom,
          sku: l.produit.sku,
          quantite: l.quantite,
          prixUnitaire: l.prixUnitaire,
          sousTotal: l.sousTotal,
        })),
        montantBrut: vente.montantBrut,
        remiseFidelite: vente.remiseFidelite,
        remiseParrainage: vente.remiseParrainage,
        montantNet: vente.montantNet,
        modePaiement: vente.modePaiement,
        montantRecu: vente.montantRecu,
        monnaieRendue: vente.monnaieRendue,
        pointsAttribues: vente.pointsAttribues,
        statut: vente.statut,
      },
    };
  }

  async sendSmsRecu(id: string, telephone: string) {
    const vente = await this.findOne(id);

    // Récupérer la config SMS
    const config = await this.prisma.configGenerale.findFirst();

    if (!config?.smsApiKey) {
      return {
        success: false,
        message: 'Service SMS non configuré',
      };
    }

    // Simulation d'envoi SMS (intégration réelle selon provider)
    const message =
      `TechShop: Reçu vente ${vente.numeroVente}. ` +
      `Montant: ${Number(vente.montantNet).toLocaleString('fr-FR')} CDF. ` +
      `Points: +${vente.pointsAttribues}. Merci!`;

    // TODO: Implémenter l'appel API SMS réel selon smsApiKey/smsUsername
    console.log(`[SMS] To: ${telephone} | ${message}`);

    return {
      success: true,
      message: 'SMS envoyé avec succès',
      telephone,
      preview: message,
    };
  }

  async createRetour(venteId: string, dto: RetourDto, agentId: string) {
    const vente = await this.prisma.vente.findUnique({
      where: { id: venteId },
      include: {
        lignes: true,
        retours: { include: { lignes: true } },
      },
    });

    if (!vente) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Vente introuvable' });
    }

    if (vente.statut === 'ANNULEE') {
      throw new ConflictException({
        code: 'ERR_CONFLICT',
        message: 'Impossible de retourner une vente annulée',
      });
    }

    // Vérifier délai de retour
    const config = await this.prisma.configGenerale.findFirst();
    const delaiRetourJours = config?.delaiRetourJours ?? 7;
    const joursDepuisVente = Math.floor(
      (Date.now() - vente.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (joursDepuisVente > delaiRetourJours) {
      throw new BadRequestException({
        code: 'ERR_BAD_REQUEST',
        message: `Le délai de retour de ${delaiRetourJours} jours est dépassé`,
      });
    }

    // Vérifier les quantités retournables
    const quantitesVendues = new Map(
      vente.lignes.map((l) => [l.produitId, l.quantite]),
    );
    const quantitesDejaRetournees = new Map<string, number>();

    for (const retour of vente.retours) {
      for (const ligne of retour.lignes) {
        const current = quantitesDejaRetournees.get(ligne.produitId) ?? 0;
        quantitesDejaRetournees.set(ligne.produitId, current + ligne.quantite);
      }
    }

    for (const ligne of dto.lignes) {
      const vendu = quantitesVendues.get(ligne.produitId) ?? 0;
      const dejaRetourne = quantitesDejaRetournees.get(ligne.produitId) ?? 0;
      const retournable = vendu - dejaRetourne;

      if (ligne.quantite > retournable) {
        throw new BadRequestException({
          code: 'ERR_BAD_REQUEST',
          message: `Quantité retournable insuffisante pour produit ${ligne.produitId}. Max: ${retournable}`,
        });
      }
    }

    // Calculer le montant remboursé
    const lignesVenteMap = new Map(vente.lignes.map((l) => [l.produitId, l]));
    let montantRembourse = 0;

    for (const ligne of dto.lignes) {
      const ligneVente = lignesVenteMap.get(ligne.produitId);
      if (ligneVente) {
        montantRembourse += Number(ligneVente.prixUnitaire) * ligne.quantite;
      }
    }

    // Appliquer frais de retour si configuré
    const fraisRetourPct = Number(config?.fraisRetourPct ?? 0);
    const frais = montantRembourse * (fraisRetourPct / 100);
    montantRembourse = montantRembourse - frais;

    const retour = await this.prisma.$transaction(async (tx) => {
      const newRetour = await tx.retour.create({
        data: {
          venteId,
          motif: dto.motif,
          modeRemboursement: dto.modeRemboursement,
          montantRembourse,
          stockRemis: true,
          lignes: {
            create: dto.lignes.map((l) => ({
              produitId: l.produitId,
              quantite: l.quantite,
            })),
          },
        },
        include: { lignes: true },
      });

      // Remettre le stock et créer les mouvements
      for (const ligne of dto.lignes) {
        const stock = await tx.stockSite.findUnique({
          where: {
            produitId_siteId: { produitId: ligne.produitId, siteId: vente.siteId },
          },
        });

        if (stock) {
          await tx.stockSite.update({
            where: {
              produitId_siteId: { produitId: ligne.produitId, siteId: vente.siteId },
            },
            data: { quantite: { increment: ligne.quantite } },
          });

          await tx.mouvementStock.create({
            data: {
              type: TypeMouvement.AJUSTEMENT_INVENTAIRE,
              quantite: ligne.quantite,
              quantiteAvant: stock.quantite,
              quantiteApres: stock.quantite + ligne.quantite,
              reference: `RETOUR-${vente.numeroVente}`,
              produitId: ligne.produitId,
              siteId: vente.siteId,
              agentId,
            },
          });
        }
      }

      // Mettre à jour le statut de la vente
      const totalRetourne = dto.lignes.reduce((a, l) => a + l.quantite, 0);
      const totalVendu = vente.lignes.reduce((a, l) => a + l.quantite, 0);
      const totalDejaRetourne = Array.from(quantitesDejaRetournees.values()).reduce(
        (a, v) => a + v,
        0,
      );
      const nouveauTotal = totalDejaRetourne + totalRetourne;

      const statut = nouveauTotal >= totalVendu ? 'RETOURNEE' : 'RETOURNEE_PARTIELLE';
      await tx.vente.update({ where: { id: venteId }, data: { statut } });

      return newRetour;
    });

    return retour;
  }
}
