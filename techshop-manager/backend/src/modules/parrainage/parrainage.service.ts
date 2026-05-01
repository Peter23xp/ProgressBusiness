import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { ConfigParrainageDto } from './dto/parrainage.dto';
import { StatutParrainage } from '@prisma/client';

@Injectable()
export class ParrainageService {
  constructor(private prisma: PrismaService) {}

  async getStats(query: { siteId?: string; period?: string }) {
    const { siteId, period } = query;

    const dateDebut = this.getPeriodStart(period);

    const whereParrainage: any = {};
    if (dateDebut) {
      whereParrainage.dateCreation = { gte: dateDebut };
    }
    if (siteId) {
      whereParrainage.parrain = { siteInscriptionId: siteId };
    }

    const [total, valides, recompensesVersees, enAttente] = await Promise.all([
      this.prisma.parrainage.count({ where: whereParrainage }),
      this.prisma.parrainage.count({
        where: { ...whereParrainage, statut: StatutParrainage.VALIDE },
      }),
      this.prisma.parrainage.count({
        where: { ...whereParrainage, statut: StatutParrainage.RECOMPENSE_VERSEE },
      }),
      this.prisma.parrainage.count({
        where: { ...whereParrainage, statut: StatutParrainage.EN_ATTENTE },
      }),
    ]);

    const totalRecompenses = await this.prisma.parrainage.aggregate({
      where: {
        ...whereParrainage,
        statut: StatutParrainage.RECOMPENSE_VERSEE,
      },
      _sum: { recompenseValeur: true },
    });

    const topParrains = await this.prisma.parrainage.groupBy({
      by: ['parrainId'],
      where: whereParrainage,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topParrainsWithDetails = await Promise.all(
      topParrains.map(async (p) => {
        const client = await this.prisma.client.findUnique({
          where: { id: p.parrainId },
          select: { id: true, prenom: true, nom: true, codeParrain: true },
        });
        return { ...client, filleulsCount: p._count.id };
      }),
    );

    const meilleurParrain = topParrainsWithDetails[0] ?? null;

    return {
      kpis: {
        totalActifs: valides + recompensesVersees,
        totalActifsDelta: 0,
        recompensesVersees,
        meilleurParrain: meilleurParrain
          ? {
              id: meilleurParrain.id,
              nom: meilleurParrain.nom,
              prenom: meilleurParrain.prenom,
              nbFilleuls: meilleurParrain.filleulsCount,
            }
          : null,
      },
    };
  }

  async findAll(query: {
    siteId?: string;
    statut?: string;
    page?: number;
    limit?: number;
  }) {
    const { siteId, statut, page = 1, limit = 50 } = query;

    const where: any = {};
    if (statut) where.statut = statut;
    if (siteId) {
      where.parrain = { siteInscriptionId: siteId };
    }

    const [data, total] = await Promise.all([
      this.prisma.parrainage.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { dateCreation: 'desc' },
        include: {
          parrain: {
            select: {
              id: true,
              prenom: true,
              nom: true,
              codeParrain: true,
              siteInscription: { select: { id: true, nom: true } },
            },
          },
          filleul: {
            select: {
              id: true,
              prenom: true,
              nom: true,
              statut: true,
              dateActivation: true,
            },
          },
        },
      }),
      this.prisma.parrainage.count({ where }),
    ]);

    const parrainages = data.map((p) => ({
      id: p.id,
      parrain: {
        id: p.parrain.id,
        nom: p.parrain.nom,
        prenom: p.parrain.prenom,
        telephone: '',
        codeParrain: p.parrain.codeParrain ?? '',
      },
      filleul: {
        id: p.filleul.id,
        nom: p.filleul.nom,
        prenom: p.filleul.prenom,
        telephone: '',
        statut: p.filleul.statut,
        dateActivation: p.filleul.dateActivation?.toISOString() ?? null,
      },
      niveau: (p as any).niveau ?? 1,
      statut: p.statut,
      recompenseType: (p as any).recompenseType ?? null,
      recompenseValeur: (p as any).recompenseValeur ?? null,
      dateCreation: p.dateCreation,
      siteId: p.parrain.siteInscription?.id ?? '',
    }));

    return {
      parrainages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTop(query: { siteId?: string; period?: string; limit?: number }) {
    const { siteId, period, limit = 5 } = query;
    const dateDebut = this.getPeriodStart(period);

    const whereParrainage: any = {};
    if (dateDebut) whereParrainage.dateCreation = { gte: dateDebut };
    if (siteId) whereParrainage.parrain = { siteInscriptionId: siteId };

    const grouped = await this.prisma.parrainage.groupBy({
      by: ['parrainId'],
      where: whereParrainage,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const topParrains = await Promise.all(
      grouped.map(async (g, idx) => {
        const client = await this.prisma.client.findUnique({
          where: { id: g.parrainId },
          select: { id: true, prenom: true, nom: true, telephone: true },
        });
        const actifs = await this.prisma.parrainage.count({
          where: { parrainId: g.parrainId, statut: StatutParrainage.VALIDE },
        });
        return {
          rang: idx + 1,
          client: client ?? { id: g.parrainId, prenom: '', nom: '', telephone: '' },
          nbFilleulsActifs: actifs,
          nbFilleulsTotal: g._count.id,
          recompensesTotales: 0,
          caGenere: 0,
        };
      }),
    );

    return { topParrains };
  }

  async getTree(clientId: string, niveaux: 1 | 2) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        prenom: true,
        nom: true,
        codeParrain: true,
        niveauFidelite: true,
      },
    });

    if (!client) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
    }

    const parrainagesNiveau1 = await this.prisma.parrainage.findMany({
      where: { parrainId: clientId, niveau: 1 },
      include: {
        filleul: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            statut: true,
            dateActivation: true,
            pointsFidelite: true,
            niveauFidelite: true,
          },
        },
      },
    });

    const tree: any = {
      client,
      niveau1: parrainagesNiveau1.map((p) => ({
        parrainageId: p.id,
        statut: p.statut,
        recompenseType: p.recompenseType,
        recompenseValeur: p.recompenseValeur,
        dateCreation: p.dateCreation,
        filleul: p.filleul,
        niveau2: [],
      })),
    };

    if (niveaux === 2) {
      for (const n1 of tree.niveau1) {
        const parrainagesNiveau2 = await this.prisma.parrainage.findMany({
          where: { parrainId: n1.filleul.id, niveau: 2 },
          include: {
            filleul: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                statut: true,
                dateActivation: true,
              },
            },
          },
        });
        n1.niveau2 = parrainagesNiveau2.map((p) => ({
          parrainageId: p.id,
          statut: p.statut,
          recompenseType: p.recompenseType,
          recompenseValeur: p.recompenseValeur,
          dateCreation: p.dateCreation,
          filleul: p.filleul,
        }));
      }
    }

    return tree;
  }

  async getConfig() {
    const config = await this.prisma.regleParrainage.findFirst();
    if (!config) {
      return {
        multiNiveaux: false,
        typeRecompense: 'POINTS',
        valeurNiveau1: 500,
        valeurNiveau2: null,
        conditionDeclenchement: 'ACTIVATION',
        plafondMensuel: null,
      };
    }
    return config;
  }

  async updateConfig(dto: ConfigParrainageDto) {
    const existing = await this.prisma.regleParrainage.findFirst();

    if (existing) {
      return this.prisma.regleParrainage.update({
        where: { id: existing.id },
        data: {
          typeRecompense: dto.typeRecompense,
          valeurNiveau1: dto.valeurNiveau1,
          valeurNiveau2: dto.valeurNiveau2 ?? null,
          multiNiveaux: dto.multiNiveaux,
          conditionDeclenchement: dto.conditionDeclenchement,
          plafondMensuel: dto.plafondMensuel ?? null,
        },
      });
    }

    return this.prisma.regleParrainage.create({
      data: {
        typeRecompense: dto.typeRecompense,
        valeurNiveau1: dto.valeurNiveau1,
        valeurNiveau2: dto.valeurNiveau2 ?? null,
        multiNiveaux: dto.multiNiveaux,
        conditionDeclenchement: dto.conditionDeclenchement,
        plafondMensuel: dto.plafondMensuel ?? null,
      },
    });
  }

  async checkCode(code: string) {
    const client = await this.prisma.client.findUnique({
      where: { codeParrain: code },
      select: {
        id: true,
        prenom: true,
        nom: true,
        statut: true,
        codeParrain: true,
        niveauFidelite: true,
        siteInscription: { select: { id: true, nom: true } },
        _count: { select: { filleuls: true } },
      },
    });

    if (!client) {
      return { valid: false, message: 'Code parrain invalide' };
    }

    if (client.statut !== 'ACTIF') {
      return { valid: false, message: 'Le parrain doit être actif' };
    }

    return {
      valid: true,
      parrain: {
        id: client.id,
        prenom: client.prenom,
        nom: client.nom,
        codeParrain: client.codeParrain,
        niveauFidelite: client.niveauFidelite,
        site: client.siteInscription,
        nombreFilleuls: client._count.filleuls,
      },
    };
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
