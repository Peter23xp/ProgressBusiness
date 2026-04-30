import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { ConfigFideliteDto } from './dto/fidelite.dto';
import { NiveauFidelite } from '@prisma/client';

@Injectable()
export class FideliteService {
  constructor(private prisma: PrismaService) {}

  async getStats(siteId?: string, period?: string) {
    const dateDebut = this.getPeriodStart(period);

    const whereClient: any = {};
    if (siteId) whereClient.siteInscriptionId = siteId;

    const [totalClients, parNiveau, pointsDistribues, mouvementsRecents] =
      await Promise.all([
        this.prisma.client.count({ where: { ...whereClient, statut: 'ACTIF' } }),
        this.prisma.client.groupBy({
          by: ['niveauFidelite'],
          where: { ...whereClient, statut: 'ACTIF' },
          _count: { id: true },
          _sum: { pointsFidelite: true },
        }),
        this.prisma.mouvementPoints.aggregate({
          where: {
            ...(dateDebut ? { createdAt: { gte: dateDebut } } : {}),
            ...(siteId
              ? { client: { siteInscriptionId: siteId } }
              : {}),
            delta: { gt: 0 },
          },
          _sum: { delta: true },
        }),
        this.prisma.mouvementPoints.count({
          where: {
            ...(dateDebut ? { createdAt: { gte: dateDebut } } : {}),
            ...(siteId
              ? { client: { siteInscriptionId: siteId } }
              : {}),
          },
        }),
      ]);

    const niveauxStats: Record<string, { count: number; totalPoints: number }> =
      {
        BRONZE: { count: 0, totalPoints: 0 },
        ARGENT: { count: 0, totalPoints: 0 },
        OR: { count: 0, totalPoints: 0 },
        PLATINE: { count: 0, totalPoints: 0 },
      };

    parNiveau.forEach((n) => {
      niveauxStats[n.niveauFidelite] = {
        count: n._count.id,
        totalPoints: n._sum.pointsFidelite ?? 0,
      };
    });

    return {
      totalClientsActifs: totalClients,
      parNiveau: niveauxStats,
      pointsDistribues: pointsDistribues._sum.delta ?? 0,
      nombreMouvements: mouvementsRecents,
    };
  }

  async getTopClients(siteId?: string, limit = 10) {
    const where: any = { statut: 'ACTIF' };
    if (siteId) where.siteInscriptionId = siteId;

    const clients = await this.prisma.client.findMany({
      where,
      orderBy: { pointsFidelite: 'desc' },
      take: limit,
      select: {
        id: true,
        prenom: true,
        nom: true,
        telephone: true,
        pointsFidelite: true,
        pointsCumules: true,
        niveauFidelite: true,
        siteInscription: { select: { id: true, nom: true } },
        _count: { select: { ventes: true } },
      },
    });

    return clients;
  }

  async getClientHistory(
    clientId: string,
    query: { type?: string; page?: number; limit?: number },
  ) {
    const { type, page = 1, limit = 50 } = query;

    const where: any = { clientId };
    if (type) where.type = type;

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
          id: true,
          prenom: true,
          nom: true,
          pointsFidelite: true,
          pointsCumules: true,
          niveauFidelite: true,
        },
      }),
    ]);

    return {
      client,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateConfig(dto: ConfigFideliteDto) {
    const existing = await this.prisma.configFidelite.findFirst({
      include: { niveaux: true },
    });

    if (existing) {
      // Supprimer les anciens niveaux
      await this.prisma.niveauConfig.deleteMany({
        where: { configId: existing.id },
      });

      return this.prisma.configFidelite.update({
        where: { id: existing.id },
        data: {
          ratioPtsCDF: dto.ratioPtsCDF,
          dureeValiditeMois: dto.dureeValiditeMois ?? 0,
          cumulRemises: dto.cumulRemises,
          niveaux: {
            create: dto.niveaux.map((n) => ({
              nom: n.nom,
              seuilPts: n.seuilPts,
              remisePct: n.remisePct,
            })),
          },
        },
        include: { niveaux: true },
      });
    }

    return this.prisma.configFidelite.create({
      data: {
        ratioPtsCDF: dto.ratioPtsCDF,
        dureeValiditeMois: dto.dureeValiditeMois ?? 0,
        cumulRemises: dto.cumulRemises,
        niveaux: {
          create: dto.niveaux.map((n) => ({
            nom: n.nom,
            seuilPts: n.seuilPts,
            remisePct: n.remisePct,
          })),
        },
      },
      include: { niveaux: true },
    });
  }

  private getPeriodStart(period?: string): Date | null {
    if (!period) return null;
    const now = new Date();
    switch (period) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(now.getFullYear(), now.getMonth(), diff);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return null;
    }
  }
}
