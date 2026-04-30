import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  EntreeStockDto,
  TransfertDto,
  ReceptionTransfertDto,
  UpdateSeuilDto,
  InventaireDto,
} from './dto/stock.dto';
import { TypeMouvement, StatutTransfert } from '@prisma/client';

@Injectable()
export class StocksService {
  constructor(private prisma: PrismaService) {}

  async getInventaire(query: {
    siteId?: string;
    produitId?: string;
    categorie?: string;
    alerteOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { siteId, produitId, categorie, alerteOnly, page = 1, limit = 50 } = query;

    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (produitId) where.produitId = produitId;
    if (categorie) where.produit = { categorie };

    const allStocks = await this.prisma.stockSite.findMany({
      where,
      include: {
        produit: {
          select: {
            id: true,
            nom: true,
            sku: true,
            categorie: true,
            prixVente: true,
            prixAchat: true,
            actif: true,
          },
        },
        site: { select: { id: true, nom: true, ville: true } },
      },
      orderBy: [{ siteId: 'asc' }, { produit: { nom: 'asc' } }],
    });

    let filtered = allStocks;
    if (alerteOnly) {
      filtered = allStocks.filter((s) => s.quantite <= s.seuilAlerte);
    }

    const total = filtered.length;
    const { skip, take } = paginate(page, limit);
    const data = filtered.slice(skip, skip + take);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProduitStocks(produitId: string) {
    const produit = await this.prisma.produit.findUnique({
      where: { id: produitId },
    });
    if (!produit) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Produit introuvable' });
    }

    const stocks = await this.prisma.stockSite.findMany({
      where: { produitId },
      include: {
        site: { select: { id: true, nom: true, ville: true } },
      },
      orderBy: { site: { nom: 'asc' } },
    });

    const totalQuantite = stocks.reduce((a, s) => a + s.quantite, 0);

    return {
      produit,
      stocks,
      totalQuantite,
    };
  }

  async entreeStock(dto: EntreeStockDto, agentId: string) {
    // Vérifier site et produit
    const [site, produit] = await Promise.all([
      this.prisma.site.findUnique({ where: { id: dto.siteId } }),
      this.prisma.produit.findUnique({ where: { id: dto.produitId } }),
    ]);

    if (!site) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Site introuvable' });
    }
    if (!produit) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Produit introuvable' });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Upsert du stock
      const existingStock = await tx.stockSite.findUnique({
        where: { produitId_siteId: { produitId: dto.produitId, siteId: dto.siteId } },
      });

      const quantiteAvant = existingStock?.quantite ?? 0;
      const quantiteApres = quantiteAvant + dto.quantite;

      const stock = await tx.stockSite.upsert({
        where: { produitId_siteId: { produitId: dto.produitId, siteId: dto.siteId } },
        create: {
          produitId: dto.produitId,
          siteId: dto.siteId,
          quantite: dto.quantite,
          seuilAlerte: 5,
        },
        update: {
          quantite: { increment: dto.quantite },
        },
      });

      // Créer le mouvement
      await tx.mouvementStock.create({
        data: {
          type: TypeMouvement.ENTREE,
          quantite: dto.quantite,
          quantiteAvant,
          quantiteApres,
          reference: dto.referenceFournisseur,
          produitId: dto.produitId,
          siteId: dto.siteId,
          agentId,
        },
      });

      return stock;
    });

    return {
      message: 'Entrée de stock enregistrée avec succès',
      stock: result,
    };
  }

  async transfert(dto: TransfertDto, agentId: string) {
    if (dto.siteSourceId === dto.siteDestinationId) {
      throw new BadRequestException({
        code: 'ERR_BAD_REQUEST',
        message: 'Le site source et destination doivent être différents',
      });
    }

    const [siteSource, siteDest, produit] = await Promise.all([
      this.prisma.site.findUnique({ where: { id: dto.siteSourceId } }),
      this.prisma.site.findUnique({ where: { id: dto.siteDestinationId } }),
      this.prisma.produit.findUnique({ where: { id: dto.produitId } }),
    ]);

    if (!siteSource) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Site source introuvable' });
    }
    if (!siteDest) {
      throw new NotFoundException({
        code: 'ERR_NOT_FOUND',
        message: 'Site destination introuvable',
      });
    }
    if (!produit) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Produit introuvable' });
    }

    // Vérifier stock source
    const stockSource = await this.prisma.stockSite.findUnique({
      where: {
        produitId_siteId: { produitId: dto.produitId, siteId: dto.siteSourceId },
      },
    });

    if (!stockSource || stockSource.quantite < dto.quantite) {
      throw new ConflictException({
        code: 'ERR_STOCK_INSUFFISANT',
        message: `Stock insuffisant sur le site source. Disponible: ${stockSource?.quantite ?? 0}`,
      });
    }

    const transfertRecord = await this.prisma.$transaction(async (tx) => {
      // Déduire du stock source
      const quantiteAvantSource = stockSource.quantite;
      const quantiteApresSource = quantiteAvantSource - dto.quantite;

      await tx.stockSite.update({
        where: {
          produitId_siteId: { produitId: dto.produitId, siteId: dto.siteSourceId },
        },
        data: { quantite: quantiteApresSource },
      });

      // Créer le transfert
      const transfert = await tx.transfertStock.create({
        data: {
          produitId: dto.produitId,
          siteSourceId: dto.siteSourceId,
          siteDestinationId: dto.siteDestinationId,
          quantiteEnvoyee: dto.quantite,
          motif: dto.motif,
          initiateurId: agentId,
          statut: StatutTransfert.EN_TRANSIT,
        },
        include: {
          produit: { select: { id: true, nom: true, sku: true } },
          siteSource: { select: { id: true, nom: true } },
          siteDestination: { select: { id: true, nom: true } },
        },
      });

      // Mouvement TRANSFERT_DEPART
      await tx.mouvementStock.create({
        data: {
          type: TypeMouvement.TRANSFERT_DEPART,
          quantite: dto.quantite,
          quantiteAvant: quantiteAvantSource,
          quantiteApres: quantiteApresSource,
          reference: transfert.id,
          produitId: dto.produitId,
          siteId: dto.siteSourceId,
          agentId,
        },
      });

      return transfert;
    });

    return transfertRecord;
  }

  async recevoirTransfert(
    transfertId: string,
    dto: ReceptionTransfertDto,
    agentId: string,
  ) {
    const transfert = await this.prisma.transfertStock.findUnique({
      where: { id: transfertId },
    });

    if (!transfert) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Transfert introuvable' });
    }

    if (transfert.statut !== StatutTransfert.EN_TRANSIT) {
      throw new ConflictException({
        code: 'ERR_CONFLICT',
        message: `Ce transfert est déjà ${transfert.statut}`,
      });
    }

    if (dto.quantiteRecue > transfert.quantiteEnvoyee) {
      throw new BadRequestException({
        code: 'ERR_BAD_REQUEST',
        message: `La quantité reçue (${dto.quantiteRecue}) ne peut pas dépasser la quantité envoyée (${transfert.quantiteEnvoyee})`,
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Ajouter au stock destination
      const existingStock = await tx.stockSite.findUnique({
        where: {
          produitId_siteId: {
            produitId: transfert.produitId,
            siteId: transfert.siteDestinationId,
          },
        },
      });

      const quantiteAvant = existingStock?.quantite ?? 0;
      const quantiteApres = quantiteAvant + dto.quantiteRecue;

      await tx.stockSite.upsert({
        where: {
          produitId_siteId: {
            produitId: transfert.produitId,
            siteId: transfert.siteDestinationId,
          },
        },
        create: {
          produitId: transfert.produitId,
          siteId: transfert.siteDestinationId,
          quantite: dto.quantiteRecue,
          seuilAlerte: 5,
        },
        update: { quantite: { increment: dto.quantiteRecue } },
      });

      // Mouvement TRANSFERT_ARRIVEE
      await tx.mouvementStock.create({
        data: {
          type: TypeMouvement.TRANSFERT_ARRIVEE,
          quantite: dto.quantiteRecue,
          quantiteAvant,
          quantiteApres,
          reference: transfertId,
          produitId: transfert.produitId,
          siteId: transfert.siteDestinationId,
          agentId,
        },
      });

      // Mettre à jour le transfert
      return tx.transfertStock.update({
        where: { id: transfertId },
        data: {
          statut: StatutTransfert.RECU,
          quantiteRecue: dto.quantiteRecue,
          observations: dto.observations,
          dateReception: new Date(),
        },
        include: {
          produit: { select: { id: true, nom: true, sku: true } },
          siteSource: { select: { id: true, nom: true } },
          siteDestination: { select: { id: true, nom: true } },
        },
      });
    });

    return updated;
  }

  async getAlertes(query: { siteId?: string; page?: number; limit?: number }) {
    const { siteId, page = 1, limit = 50 } = query;

    const stocks = await this.prisma.stockSite.findMany({
      where: siteId ? { siteId } : {},
      include: {
        produit: {
          select: { id: true, nom: true, sku: true, categorie: true, actif: true },
        },
        site: { select: { id: true, nom: true, ville: true } },
      },
    });

    const alertes = stocks
      .filter((s) => s.quantite <= s.seuilAlerte)
      .map((s) => ({
        ...s,
        statut: s.quantite <= 0 ? 'RUPTURE' : 'ALERTE',
      }))
      .sort((a, b) => a.quantite - b.quantite);

    const total = alertes.length;
    const { skip, take } = paginate(page, limit);
    const data = alertes.slice(skip, skip + take);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateSeuil(siteId: string, produitId: string, dto: UpdateSeuilDto) {
    const stock = await this.prisma.stockSite.findUnique({
      where: { produitId_siteId: { produitId, siteId } },
    });

    if (!stock) {
      // Créer l'entrée si elle n'existe pas
      const [site, produit] = await Promise.all([
        this.prisma.site.findUnique({ where: { id: siteId } }),
        this.prisma.produit.findUnique({ where: { id: produitId } }),
      ]);

      if (!site) {
        throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Site introuvable' });
      }
      if (!produit) {
        throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Produit introuvable' });
      }

      return this.prisma.stockSite.create({
        data: { produitId, siteId, quantite: 0, seuilAlerte: dto.seuilAlerte },
      });
    }

    return this.prisma.stockSite.update({
      where: { produitId_siteId: { produitId, siteId } },
      data: { seuilAlerte: dto.seuilAlerte },
    });
  }

  async inventairePhysique(dto: InventaireDto, agentId: string) {
    // Vérifier que le site existe
    const site = await this.prisma.site.findUnique({ where: { id: dto.siteId } });
    if (!site) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Site introuvable' });
    }

    const produitIds = dto.lignes.map((l) => l.produitId);
    const produits = await this.prisma.produit.findMany({
      where: { id: { in: produitIds } },
    });

    if (produits.length !== produitIds.length) {
      const foundIds = new Set(produits.map((p) => p.id));
      const missing = produitIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException({
        code: 'ERR_NOT_FOUND',
        message: `Produits introuvables: ${missing.join(', ')}`,
      });
    }

    const results = await this.prisma.$transaction(async (tx) => {
      const ajustements = [];

      for (const ligne of dto.lignes) {
        const existingStock = await tx.stockSite.findUnique({
          where: { produitId_siteId: { produitId: ligne.produitId, siteId: dto.siteId } },
        });

        const quantiteAvant = existingStock?.quantite ?? 0;
        const quantiteApres = ligne.quantiteComptee;
        const delta = quantiteApres - quantiteAvant;

        if (delta === 0) {
          ajustements.push({ produitId: ligne.produitId, delta: 0, ajuste: false });
          continue;
        }

        await tx.stockSite.upsert({
          where: { produitId_siteId: { produitId: ligne.produitId, siteId: dto.siteId } },
          create: {
            produitId: ligne.produitId,
            siteId: dto.siteId,
            quantite: ligne.quantiteComptee,
            seuilAlerte: 5,
          },
          update: { quantite: ligne.quantiteComptee },
        });

        await tx.mouvementStock.create({
          data: {
            type: TypeMouvement.AJUSTEMENT_INVENTAIRE,
            quantite: Math.abs(delta),
            quantiteAvant,
            quantiteApres,
            reference: `INVENTAIRE-${dto.dateInventaire}`,
            produitId: ligne.produitId,
            siteId: dto.siteId,
            agentId,
          },
        });

        ajustements.push({
          produitId: ligne.produitId,
          quantiteAvant,
          quantiteApres,
          delta,
          ajuste: true,
        });
      }

      return ajustements;
    });

    return {
      message: 'Inventaire physique enregistré',
      siteId: dto.siteId,
      dateInventaire: dto.dateInventaire,
      ajustements: results,
      totalAjustes: results.filter((r) => r.ajuste).length,
    };
  }
}
