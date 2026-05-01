import { Injectable, NotFoundException } from '@nestjs/common';
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

    const repartitionNiveaux = Object.entries(niveauxStats).map(([niveau, data]) => ({
      niveau: niveau as NiveauFidelite,
      count: data.count,
      pct: totalClients > 0 ? Math.round((data.count / totalClients) * 100) : 0,
    }));

    return {
      stats: {
        clientsActifsTotal: totalClients,
        clientsActifsDelta: 0,
        pointsDistribues: pointsDistribues._sum.delta ?? 0,
        pointsDistribuesDelta: 0,
        remisesAccordees: 0,
        remisesAccordeesDelta: 0,
        repartitionNiveaux,
      },
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

    return {
      clients: clients.map((c, idx) => ({
        rang: idx + 1,
        client: {
          id: c.id,
          nom: c.nom,
          prenom: c.prenom,
          telephone: c.telephone,
          niveauFidelite: c.niveauFidelite,
        },
        pointsActuels: c.pointsFidelite,
        pointsGagnesCettePeriode: 0,
        nbAchats: c._count.ventes,
        montantTotalAchats: 0,
      })),
    };
  }

  async getRecentMouvements(siteId?: string, limit = 8) {
    const where: any = {};
    if (siteId) where.client = { siteInscriptionId: siteId };

    const data = await this.prisma.mouvementPoints.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        client: { select: { id: true, prenom: true, nom: true } },
      },
    });

    return {
      mouvements: data.map((m) => ({
        id: m.id,
        clientId: m.clientId,
        clientNom: m.client.nom,
        clientPrenom: m.client.prenom,
        type: m.type,
        description: m.description ?? '',
        deltaPoints: m.delta,
        soldeBefore: m.soldeApres - m.delta,
        soldeAfter: m.soldeApres,
        createdAt: m.createdAt,
        siteId: siteId ?? '',
        venteId: m.venteId ?? undefined,
      })),
    };
  }

  async getClientData(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        prenom: true,
        nom: true,
        telephone: true,
        niveauFidelite: true,
        pointsFidelite: true,
        pointsCumules: true,
        siteInscription: { select: { id: true, nom: true } },
      },
    });

    if (!client) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
    }

    const remiseMap: Record<NiveauFidelite, number> = {
      BRONZE: 0,
      ARGENT: 3,
      OR: 5,
      PLATINE: 8,
    };

    const totalGagne = await this.prisma.mouvementPoints.aggregate({
      where: { clientId, delta: { gt: 0 } },
      _sum: { delta: true },
    });
    const totalDeduit = await this.prisma.mouvementPoints.aggregate({
      where: { clientId, delta: { lt: 0 } },
      _sum: { delta: true },
    });

    return {
      client: {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        telephone: client.telephone,
        siteNom: client.siteInscription?.nom ?? '',
        niveauFidelite: client.niveauFidelite,
        pointsFidelite: client.pointsFidelite,
        remisePct: remiseMap[client.niveauFidelite] ?? 0,
        totalPointsGagnes: totalGagne._sum.delta ?? 0,
        totalPointsDeduits: Math.abs(totalDeduit._sum.delta ?? 0),
      },
    };
  }

  async getClientMouvements(
    clientId: string,
    query: { type?: string; page?: number; limit?: number; sortOrder?: 'asc' | 'desc' },
  ) {
    const { type, page = 1, limit = 50, sortOrder = 'desc' } = query;

    const where: any = { clientId };
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.mouvementPoints.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: sortOrder },
        include: { client: { select: { id: true, prenom: true, nom: true } } },
      }),
      this.prisma.mouvementPoints.count({ where }),
    ]);

    const gained = await this.prisma.mouvementPoints.aggregate({
      where: { clientId, delta: { gt: 0 } },
      _sum: { delta: true },
    });
    const deducted = await this.prisma.mouvementPoints.aggregate({
      where: { clientId, delta: { lt: 0 } },
      _sum: { delta: true },
    });

    return {
      mouvements: data.map((m) => ({
        id: m.id,
        clientId: m.clientId,
        clientNom: m.client.nom,
        clientPrenom: m.client.prenom,
        type: m.type,
        description: m.description ?? '',
        deltaPoints: m.delta,
        soldeBefore: m.soldeApres - m.delta,
        soldeAfter: m.soldeApres,
        createdAt: m.createdAt,
        siteId: '',
        venteId: m.venteId ?? undefined,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: {
        totalGagne: gained._sum.delta ?? 0,
        totalDeduit: Math.abs(deducted._sum.delta ?? 0),
      },
    };
  }

  async getConfig() {
    const config = await this.prisma.configFidelite.findFirst({
      include: { niveaux: true },
    });

    if (!config) {
      return {
        config: {
          id: 'default',
          ratioPtsCDF: 1000,
          niveaux: [],
          dureeValiditeMois: 0,
          periodeInactiviteMois: 12,
          cumulRemises: false,
          updatedAt: new Date(),
        },
        history: [],
      };
    }

    return {
      config: {
        id: config.id,
        ratioPtsCDF: config.ratioPtsCDF,
        niveaux: config.niveaux,
        dureeValiditeMois: config.dureeValiditeMois,
        periodeInactiviteMois: 12,
        cumulRemises: config.cumulRemises,
        updatedAt: config.updatedAt,
      },
      history: [],
    };
  }

  async getConfigHistory() {
    return { history: [] };
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
