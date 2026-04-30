import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  async getPortalData(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        prenom: true,
        nom: true,
        telephone: true,
        email: true,
        statut: true,
        pointsFidelite: true,
        pointsCumules: true,
        niveauFidelite: true,
        codeParrain: true,
        dateActivation: true,
        createdAt: true,
        siteInscription: { select: { id: true, nom: true, ville: true } },
        _count: {
          select: {
            ventes: true,
            filleuls: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
    }

    // Récupérer la config fidélité pour les niveaux
    const configFidelite = await this.prisma.configFidelite.findFirst({
      include: { niveaux: { orderBy: { seuilPts: 'asc' } } },
    });

    // Déterminer le prochain niveau
    let prochainNiveau = null;
    if (configFidelite) {
      const niveauxSorted = configFidelite.niveaux.sort(
        (a, b) => a.seuilPts - b.seuilPts,
      );
      const nextLevel = niveauxSorted.find(
        (n) => n.seuilPts > client.pointsFidelite,
      );
      if (nextLevel) {
        prochainNiveau = {
          nom: nextLevel.nom,
          seuilPts: nextLevel.seuilPts,
          pointsManquants: nextLevel.seuilPts - client.pointsFidelite,
        };
      }
    }

    return {
      client,
      prochainNiveau,
    };
  }

  async getPurchases(clientId: string, query: { period?: string }) {
    const { period } = query;
    const dateDebut = this.getPeriodStart(period);

    const where: any = { clientId };
    if (dateDebut) where.createdAt = { gte: dateDebut };

    const [ventes, totaux] = await Promise.all([
      this.prisma.vente.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          site: { select: { id: true, nom: true } },
          lignes: {
            include: {
              produit: { select: { id: true, sku: true, nom: true, categorie: true } },
            },
          },
        },
      }),
      this.prisma.vente.aggregate({
        where,
        _sum: { montantNet: true, pointsAttribues: true },
        _count: { id: true },
      }),
    ]);

    return {
      data: ventes,
      summary: {
        totalAchats: totaux._count.id,
        montantTotal: totaux._sum.montantNet ?? 0,
        pointsGagnes: totaux._sum.pointsAttribues ?? 0,
      },
    };
  }

  async getPoints(clientId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = query;

    const where = { clientId };

    const [data, total, client] = await Promise.all([
      this.prisma.mouvementPoints.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mouvementPoints.count({ where }),
      this.prisma.client.findUnique({
        where: { id: clientId },
        select: {
          pointsFidelite: true,
          pointsCumules: true,
          niveauFidelite: true,
        },
      }),
    ]);

    return {
      solde: client,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFilleuls(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, codeParrain: true },
    });

    if (!client) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
    }

    const parrainages = await this.prisma.parrainage.findMany({
      where: { parrainId: clientId },
      include: {
        filleul: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            statut: true,
            dateActivation: true,
            niveauFidelite: true,
          },
        },
      },
      orderBy: { dateCreation: 'desc' },
    });

    const niveau1 = parrainages.filter((p) => p.niveau === 1);
    const niveau2 = parrainages.filter((p) => p.niveau === 2);

    return {
      codeParrain: client.codeParrain,
      totalFilleuls: parrainages.length,
      niveau1: {
        count: niveau1.length,
        data: niveau1.map((p) => ({
          id: p.id,
          statut: p.statut,
          recompenseType: p.recompenseType,
          recompenseValeur: p.recompenseValeur,
          dateCreation: p.dateCreation,
          filleul: p.filleul,
        })),
      },
      niveau2: {
        count: niveau2.length,
        data: niveau2.map((p) => ({
          id: p.id,
          statut: p.statut,
          recompenseType: p.recompenseType,
          recompenseValeur: p.recompenseValeur,
          dateCreation: p.dateCreation,
          filleul: p.filleul,
        })),
      },
    };
  }

  private getPeriodStart(period?: string): Date | null {
    if (!period) return null;
    const now = new Date();
    switch (period) {
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return null;
    }
  }
}
