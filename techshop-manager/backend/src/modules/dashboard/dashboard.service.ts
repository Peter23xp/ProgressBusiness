import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, StatutClient } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(
    siteId: string | undefined,
    period: string = 'month',
    user: { id: string; role: Role; siteId?: string },
  ) {
    const effectiveSiteId =
      user.role === Role.AGENT || user.role === Role.GERANT
        ? user.siteId
        : siteId;

    const now = new Date();
    let dateDebut: Date;

    switch (period) {
      case 'week':
        dateDebut = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'year':
        dateDebut = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const siteFilter = effectiveSiteId ? { siteId: effectiveSiteId } : {};
    const siteInscriptionFilter = effectiveSiteId
      ? { siteInscriptionId: effectiveSiteId }
      : {};

    const [
      totalClients,
      clientsActifs,
      clientsEnCours,
      ventesCount,
      ventesData,
    ] = await Promise.all([
      this.prisma.client.count({ where: { ...siteInscriptionFilter } }),
      this.prisma.client.count({
        where: { ...siteInscriptionFilter, statut: StatutClient.ACTIF },
      }),
      this.prisma.client.count({
        where: { ...siteInscriptionFilter, statut: StatutClient.EN_COURS },
      }),
      this.prisma.vente.count({
        where: {
          ...siteFilter,
          createdAt: { gte: dateDebut },
          statut: { not: 'ANNULEE' },
        },
      }),
      this.prisma.vente.aggregate({
        where: {
          ...siteFilter,
          createdAt: { gte: dateDebut },
          statut: { not: 'ANNULEE' },
        },
        _sum: { montantNet: true },
        _avg: { montantNet: true },
      }),
    ]);

    // Compter les alertes de stock manuellement
    const stockSites = await this.prisma.stockSite.findMany({
      where: effectiveSiteId ? { siteId: effectiveSiteId } : {},
      select: { quantite: true, seuilAlerte: true },
    });
    const alertesCount = stockSites.filter(
      (s) => s.quantite <= s.seuilAlerte,
    ).length;

    return {
      periode: period,
      siteId: effectiveSiteId,
      clients: {
        total: totalClients,
        actifs: clientsActifs,
        enCours: clientsEnCours,
        tauxActivation:
          totalClients > 0 ? Math.round((clientsActifs / totalClients) * 100) : 0,
      },
      ventes: {
        count: ventesCount,
        montantTotal: ventesData._sum.montantNet ?? 0,
        montantMoyen: ventesData._avg.montantNet ?? 0,
      },
      stock: {
        alertes: alertesCount,
      },
    };
  }

  async getSalesChart(siteId: string | undefined, days: number = 30) {
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - days);

    const ventes = await this.prisma.vente.findMany({
      where: {
        ...(siteId ? { siteId } : {}),
        createdAt: { gte: dateDebut },
        statut: { not: 'ANNULEE' },
      },
      select: {
        createdAt: true,
        montantNet: true,
        modePaiement: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Grouper par jour
    const chartData: Record<string, { date: string; montant: number; count: number }> = {};

    ventes.forEach((v) => {
      const date = v.createdAt.toISOString().split('T')[0];
      if (!chartData[date]) {
        chartData[date] = { date, montant: 0, count: 0 };
      }
      chartData[date].montant += Number(v.montantNet);
      chartData[date].count += 1;
    });

    // Remplir les jours manquants
    const result = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      result.push(chartData[key] ?? { date: key, montant: 0, count: 0 });
    }

    return result;
  }

  async getRecentTransactions(siteId: string | undefined, limit: number = 10) {
    return this.prisma.vente.findMany({
      where: {
        ...(siteId ? { siteId } : {}),
        statut: { not: 'ANNULEE' },
      },
      take: Math.min(limit, 50),
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
    });
  }

  async getStockAlerts(siteId: string | undefined, limit: number = 10) {
    const stockSites = await this.prisma.stockSite.findMany({
      where: {
        ...(siteId ? { siteId } : {}),
      },
      include: {
        produit: { select: { id: true, nom: true, sku: true, categorie: true } },
        site: { select: { id: true, nom: true } },
      },
      orderBy: { quantite: 'asc' },
    });

    const alerts = stockSites
      .filter((s) => s.quantite <= s.seuilAlerte)
      .slice(0, limit)
      .map((s) => ({
        produitId: s.produitId,
        produit: s.produit,
        siteId: s.siteId,
        site: s.site,
        quantite: s.quantite,
        seuilAlerte: s.seuilAlerte,
        statut: s.quantite <= 0 ? 'RUPTURE' : 'ALERTE',
      }));

    return alerts;
  }

  async getRegionalDashboard(
    period: string = 'month',
    user: { id: string; role: Role; siteId?: string },
  ) {
    const now = new Date();
    let dateDebut: Date;

    switch (period) {
      case 'week':
        dateDebut = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'year':
        dateDebut = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const sites = await this.prisma.site.findMany({
      where: { actif: true },
      include: {
        clients: {
          select: { statut: true },
        },
        ventesSource: {
          where: {
            createdAt: { gte: dateDebut },
            statut: { not: 'ANNULEE' },
          },
          select: { montantNet: true },
        },
      },
    });

    const sitesData = sites.map((site) => {
      const clientsActifs = site.clients.filter(
        (c) => c.statut === StatutClient.ACTIF,
      ).length;
      const totalClients = site.clients.length;
      const chiffreAffaires = site.ventesSource.reduce(
        (acc, v) => acc + Number(v.montantNet),
        0,
      );
      const nbVentes = site.ventesSource.length;

      return {
        siteId: site.id,
        siteNom: site.nom,
        ville: site.ville,
        clients: {
          total: totalClients,
          actifs: clientsActifs,
          tauxActivation:
            totalClients > 0 ? Math.round((clientsActifs / totalClients) * 100) : 0,
        },
        ventes: {
          count: nbVentes,
          montantTotal: chiffreAffaires,
        },
      };
    });

    const totaux = {
      totalClients: sitesData.reduce((a, s) => a + s.clients.total, 0),
      totalActifs: sitesData.reduce((a, s) => a + s.clients.actifs, 0),
      totalVentes: sitesData.reduce((a, s) => a + s.ventes.count, 0),
      totalCA: sitesData.reduce((a, s) => a + s.ventes.montantTotal, 0),
    };

    return {
      periode: period,
      sites: sitesData,
      totaux,
    };
  }
}
