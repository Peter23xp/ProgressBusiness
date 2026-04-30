import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatutExport, StatutParrainage } from '@prisma/client';

@Injectable()
export class RapportsService {
  constructor(private prisma: PrismaService) {}

  async getVentes(query: {
    siteId?: string;
    dateDebut: string;
    dateFin: string;
    granularite?: string;
  }) {
    const { siteId, dateDebut, dateFin, granularite = 'day' } = query;

    const where: any = {
      createdAt: {
        gte: new Date(dateDebut),
        lte: new Date(dateFin),
      },
      statut: { not: 'ANNULEE' },
    };
    if (siteId) where.siteId = siteId;

    const [ventes, totaux] = await Promise.all([
      this.prisma.vente.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          montantNet: true,
          montantBrut: true,
          remiseFidelite: true,
          remiseParrainage: true,
          pointsAttribues: true,
          modePaiement: true,
          siteId: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.vente.aggregate({
        where,
        _sum: {
          montantNet: true,
          montantBrut: true,
          remiseFidelite: true,
          remiseParrainage: true,
          pointsAttribues: true,
        },
        _count: { id: true },
      }),
    ]);

    // Regrouper par granularité
    const grouped = this.groupByGranularity(ventes, granularite);

    return {
      summary: {
        totalVentes: totaux._count.id,
        montantBrut: totaux._sum.montantBrut ?? 0,
        montantNet: totaux._sum.montantNet ?? 0,
        remiseFidelite: totaux._sum.remiseFidelite ?? 0,
        remiseParrainage: totaux._sum.remiseParrainage ?? 0,
        pointsAttribues: totaux._sum.pointsAttribues ?? 0,
      },
      data: grouped,
    };
  }

  async getVentesDetail(query: {
    siteId?: string;
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    limit?: number;
  }) {
    const { siteId, dateDebut, dateFin, page = 1, limit = 50 } = query;

    const where: any = { statut: { not: 'ANNULEE' } };
    if (siteId) where.siteId = siteId;
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) where.createdAt.gte = new Date(dateDebut);
      if (dateFin) where.createdAt.lte = new Date(dateFin);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.vente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          site: { select: { id: true, nom: true } },
          agent: { select: { id: true, nom: true } },
          client: { select: { id: true, prenom: true, nom: true } },
          lignes: {
            include: {
              produit: { select: { id: true, sku: true, nom: true } },
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

  async getStocksConsolide(query: { siteId?: string; categorie?: string }) {
    const { siteId, categorie } = query;

    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (categorie) where.produit = { categorie };

    const stocks = await this.prisma.stockSite.findMany({
      where,
      include: {
        produit: {
          select: {
            id: true,
            sku: true,
            nom: true,
            categorie: true,
            prixVente: true,
            prixAchat: true,
            actif: true,
          },
        },
        site: { select: { id: true, nom: true, ville: true } },
      },
      orderBy: [{ produit: { categorie: 'asc' } }, { produit: { nom: 'asc' } }],
    });

    // Consolider par produit
    const byProduit: Record<string, any> = {};
    for (const s of stocks) {
      const pid = s.produitId;
      if (!byProduit[pid]) {
        byProduit[pid] = {
          produit: s.produit,
          totalQuantite: 0,
          sites: [],
          valeurStock: 0,
        };
      }
      byProduit[pid].totalQuantite += s.quantite;
      byProduit[pid].sites.push({
        site: s.site,
        quantite: s.quantite,
        seuilAlerte: s.seuilAlerte,
        alerte: s.quantite <= s.seuilAlerte,
      });
      byProduit[pid].valeurStock +=
        s.quantite * Number(s.produit.prixAchat);
    }

    return {
      data: Object.values(byProduit),
      totalProduits: Object.keys(byProduit).length,
      totalSites: siteId ? 1 : await this.prisma.site.count({ where: { actif: true } }),
    };
  }

  async getParrainage(query: {
    siteId?: string;
    dateDebut?: string;
    dateFin?: string;
  }) {
    const { siteId, dateDebut, dateFin } = query;

    const where: any = {};
    if (dateDebut || dateFin) {
      where.dateCreation = {};
      if (dateDebut) where.dateCreation.gte = new Date(dateDebut);
      if (dateFin) where.dateCreation.lte = new Date(dateFin);
    }
    if (siteId) {
      where.parrain = { siteInscriptionId: siteId };
    }

    const [parrainages, stats] = await Promise.all([
      this.prisma.parrainage.findMany({
        where,
        include: {
          parrain: {
            select: { id: true, prenom: true, nom: true, codeParrain: true },
          },
          filleul: {
            select: { id: true, prenom: true, nom: true, statut: true },
          },
        },
        orderBy: { dateCreation: 'desc' },
        take: 100,
      }),
      this.prisma.parrainage.groupBy({
        by: ['statut'],
        where,
        _count: { id: true },
        _sum: { recompenseValeur: true },
      }),
    ]);

    const statsByStatut: Record<string, any> = {};
    stats.forEach((s) => {
      statsByStatut[s.statut] = {
        count: s._count.id,
        montantRecompenses: s._sum.recompenseValeur ?? 0,
      };
    });

    return {
      data: parrainages,
      stats: statsByStatut,
      total: parrainages.length,
    };
  }

  async createExport(body: {
    type: string;
    format: string;
    filtres?: Record<string, any>;
  }) {
    const job = await this.prisma.exportJob.create({
      data: {
        type: body.type,
        format: body.format,
        filtres: body.filtres ?? {},
        statut: StatutExport.PENDING,
      },
    });

    // Simuler le traitement asynchrone
    this.processExportJob(job.id).catch((err) => {
      console.error(`Export job ${job.id} failed:`, err);
    });

    return {
      jobId: job.id,
      statut: job.statut,
      message: 'Export en cours de génération',
    };
  }

  async getExportStatus(jobId: string) {
    const job = await this.prisma.exportJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Job introuvable' });
    }

    return {
      jobId: job.id,
      type: job.type,
      format: job.format,
      statut: job.statut,
      downloadUrl: job.downloadUrl,
      errorMsg: job.errorMsg,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  private async processExportJob(jobId: string) {
    // Simulation d'un export asynchrone
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const job = await this.prisma.exportJob.findUnique({ where: { id: jobId } });
      if (!job) return;

      // Marquer comme prêt avec URL simulée
      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: {
          statut: StatutExport.READY,
          downloadUrl: `/exports/${jobId}.${job.format.toLowerCase()}`,
        },
      });
    } catch (err) {
      await this.prisma.exportJob.update({
        where: { id: jobId },
        data: {
          statut: StatutExport.ERROR,
          errorMsg: err.message || 'Erreur lors de la génération',
        },
      });
    }
  }

  private groupByGranularity(ventes: any[], granularite: string) {
    const grouped: Record<string, { periode: string; count: number; montantNet: number; montantBrut: number }> = {};

    for (const v of ventes) {
      const date = new Date(v.createdAt);
      let key: string;

      switch (granularite) {
        case 'hour':
          key = `${date.toISOString().slice(0, 13)}:00`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay() + 1);
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default: // day
          key = date.toISOString().slice(0, 10);
      }

      if (!grouped[key]) {
        grouped[key] = { periode: key, count: 0, montantNet: 0, montantBrut: 0 };
      }
      grouped[key].count++;
      grouped[key].montantNet += Number(v.montantNet);
      grouped[key].montantBrut += Number(v.montantBrut);
    }

    return Object.values(grouped).sort((a, b) => a.periode.localeCompare(b.periode));
  }
}
