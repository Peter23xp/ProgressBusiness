import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  // ── GET /portal/me ────────────────────────────────────────────────────────

  async getPortalData(clientId: string) {
    const [client, configFidelite, nbFilleulsActifs, nbFilleulsTotal, dernierVentes] =
      await Promise.all([
        this.prisma.client.findUnique({
          where: { id: clientId },
          select: {
            id: true, prenom: true, nom: true, telephone: true,
            statut: true, pointsFidelite: true, pointsCumules: true,
            niveauFidelite: true, codeParrain: true,
          },
        }),
        this.prisma.configFidelite.findFirst({
          include: { niveaux: { orderBy: { seuilPts: 'asc' } } },
        }),
        this.prisma.parrainage.count({
          where: { parrainId: clientId, filleul: { statut: 'ACTIF' } },
        }),
        this.prisma.parrainage.count({ where: { parrainId: clientId } }),
        this.prisma.vente.findMany({
          where: { clientId },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: {
            lignes: {
              take: 1,
              include: { produit: { select: { nom: true } } },
            },
          },
        }),
      ]);

    if (!client) throw new NotFoundException({ code: 'ERR_NOT_FOUND' });

    // Prochain niveau
    let prochainNiveau = null;
    const niveauxConfig = configFidelite?.niveaux ?? [];
    if (niveauxConfig.length) {
      const nextLevel = niveauxConfig.find((n) => n.seuilPts > client.pointsFidelite);
      if (nextLevel) {
        prochainNiveau = {
          nom: nextLevel.nom,
          seuilPts: nextLevel.seuilPts,
          pointsManquants: nextLevel.seuilPts - client.pointsFidelite,
        };
      }
    }

    // remisePct from current niveau
    const niveauMap: Record<string, string> = {
      BRONZE: 'Bronze', ARGENT: 'Argent', OR: 'Or', PLATINE: 'Platine',
    };
    const currentNiveauNom = niveauMap[client.niveauFidelite];
    const currentNiveauCfg = niveauxConfig.find(
      (n) => n.nom === currentNiveauNom || n.nom.toUpperCase() === client.niveauFidelite,
    );
    const remisePct = currentNiveauCfg ? Number(currentNiveauCfg.remisePct) : 0;

    const dernierAchats = dernierVentes.map((v) => ({
      id: v.id,
      date: v.createdAt.toISOString(),
      produitPrincipal: v.lignes[0]?.produit?.nom ?? '—',
      montantTotal: Number(v.montantNet),
      nbArticles: v.lignes.length,
    }));

    return {
      client: { ...client, remisePct },
      prochainNiveau,
      niveauxConfig: niveauxConfig.map((n) => ({
        id: n.id,
        nom: n.nom,
        seuilPts: n.seuilPts,
        remisePct: Number(n.remisePct),
        couleur: n.couleur,
      })),
      nbFilleulsActifs,
      nbFilleulsTotal,
      dernierAchats,
    };
  }

  // ── GET /portal/purchases ─────────────────────────────────────────────────

  async getPurchases(
    clientId: string,
    query: { period?: string; page?: number; limit?: number },
  ) {
    const { period, page = 1, limit = 20 } = query;
    const dateDebut = this.getPeriodStart(period);
    const where: any = { clientId };
    if (dateDebut) where.createdAt = { gte: dateDebut };

    const [ventes, totaux] = await Promise.all([
      this.prisma.vente.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, limit),
        include: {
          site: { select: { nom: true } },
          lignes: {
            take: 1,
            include: { produit: { select: { nom: true } } },
          },
        },
      }),
      this.prisma.vente.aggregate({
        where,
        _sum: { montantNet: true, pointsAttribues: true },
        _count: { id: true },
      }),
    ]);

    const totalCount = totaux._count.id;

    const achats = ventes.map((v) => ({
      id: v.id,
      date: v.createdAt.toISOString(),
      siteNom: v.site?.nom ?? '—',
      produitPrincipal: v.lignes[0]?.produit?.nom ?? '—',
      nbArticles: v.lignes.length,
      montantTotal: Number(v.montantNet),
      remiseAppliquee: Number(v.remiseFidelite ?? 0),
      pointsAttribues: v.pointsAttribues ?? 0,
      modePaiement: v.modePaiement,
    }));

    return {
      achats,
      stats: {
        totalDepense: Number(totaux._sum.montantNet ?? 0),
        nbAchats: totalCount,
        totalPointsGagnes: totaux._sum.pointsAttribues ?? 0,
      },
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  // ── GET /portal/purchases/:id ─────────────────────────────────────────────

  async getPurchaseDetail(clientId: string, venteId: string) {
    const vente = await this.prisma.vente.findUnique({
      where: { id: venteId },
      include: {
        site: { select: { nom: true } },
        lignes: {
          include: { produit: { select: { nom: true } } },
        },
      },
    });

    if (!vente) throw new NotFoundException({ code: 'ERR_NOT_FOUND' });
    if (vente.clientId !== clientId) throw new ForbiddenException({ code: 'ACCESS_DENIED' });

    // solde après cet achat — last MouvementPoints tied to this vente
    const mouvement = await this.prisma.mouvementPoints.findFirst({
      where: { venteId: vente.id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      vente: {
        id: vente.id,
        numeroVente: (vente as any).numeroVente ?? undefined,
        date: vente.createdAt.toISOString(),
        siteNom: vente.site?.nom ?? '—',
        modePaiement: vente.modePaiement,
        lignes: vente.lignes.map((l) => ({
          nom: l.produit?.nom ?? '—',
          quantite: l.quantite,
          prixUnitaire: Number(l.prixUnitaire),
          sousTotal: Number(l.quantite) * Number(l.prixUnitaire),
        })),
        montantBrut: Number(vente.montantBrut ?? vente.montantNet),
        remiseFidelite: Number(vente.remiseFidelite ?? 0),
        montantNet: Number(vente.montantNet),
        pointsAttribues: vente.pointsAttribues ?? 0,
        soldePointsApres: mouvement?.soldeApres ?? undefined,
      },
    };
  }

  // ── GET /portal/points ────────────────────────────────────────────────────

  async getPoints(
    clientId: string,
    query: { page?: number; limit?: number; typeFilter?: string },
  ) {
    const { page = 1, limit = 20, typeFilter = 'all' } = query;

    const where: any = { clientId };
    if (typeFilter === 'gains') where.delta = { gt: 0 };
    if (typeFilter === 'deductions') where.delta = { lt: 0 };

    const [mouvements, total] = await Promise.all([
      this.prisma.mouvementPoints.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mouvementPoints.count({ where }),
    ]);

    return {
      mouvements: mouvements.map((m) => ({
        id: m.id,
        type: m.type,
        delta: m.delta,
        soldeApres: m.soldeApres,
        description: m.description,
        createdAt: m.createdAt.toISOString(),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── GET /portal/referrals ─────────────────────────────────────────────────

  async getReferrals(
    clientId: string,
    query: { filter?: string; page?: number; limit?: number },
  ) {
    const { filter = 'actifs', page = 1, limit = 20 } = query;

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { codeParrain: true },
    });
    if (!client) throw new NotFoundException({ code: 'ERR_NOT_FOUND' });

    const statutFilter: any =
      filter === 'actifs' ? { filleul: { statut: 'ACTIF' } }
      : filter === 'en_attente' ? { filleul: { statut: { in: ['EN_COURS'] } } }
      : {};

    const [parrainages, total, reglePar, gainsTotal] = await Promise.all([
      this.prisma.parrainage.findMany({
        where: { parrainId: clientId, ...statutFilter },
        ...paginate(page, limit),
        orderBy: { dateCreation: 'desc' },
        include: {
          filleul: {
            select: {
              id: true, prenom: true, nom: true, statut: true,
              dateActivation: true, createdAt: true,
            },
          },
        },
      }),
      this.prisma.parrainage.count({ where: { parrainId: clientId, ...statutFilter } }),
      this.prisma.regleParrainage.findFirst({ orderBy: { updatedAt: 'desc' } }),
      this.prisma.mouvementPoints.aggregate({
        where: { clientId, type: 'PARRAINAGE' },
        _sum: { delta: true },
      }),
    ]);

    const [nbActifs, nbTotal] = await Promise.all([
      this.prisma.parrainage.count({ where: { parrainId: clientId, filleul: { statut: 'ACTIF' } } }),
      this.prisma.parrainage.count({ where: { parrainId: clientId } }),
    ]);

    // Map etapeEnCours for EN_COURS filleuls
    const filleulIds = parrainages
      .filter((p) => p.filleul.statut === 'EN_COURS')
      .map((p) => p.filleul.id);

    const etapesMap: Record<string, string> = {};
    if (filleulIds.length) {
      const etapes = await this.prisma.onboardingEtape.findMany({
        where: { clientId: { in: filleulIds }, statut: 'COMPLETE' },
        orderBy: { completeeAt: 'desc' },
      });
      for (const id of filleulIds) {
        const derniere = etapes.find((e) => e.clientId === id);
        etapesMap[id] = derniere
          ? this.getEtapeMessage(derniere.etape)
          : 'Inscription en cours…';
      }
    }

    const filleuls = parrainages.map((p) => ({
      id: p.filleul.id,
      prenom: p.filleul.prenom,
      nom: p.filleul.nom,
      statut: p.filleul.statut as 'ACTIF' | 'EN_COURS' | 'SUSPENDU',
      dateInscription: (p.filleul.dateActivation ?? p.filleul.createdAt).toISOString(),
      recompenseGeneree: Number(p.recompenseValeur ?? 0),
      etapeEnCours: etapesMap[p.filleul.id],
    }));

    return {
      codeParrain: client.codeParrain ?? '—',
      stats: {
        nbFilleulsActifs: nbActifs,
        nbFilleulsTotal: nbTotal,
        gainsTotaux: gainsTotal._sum.delta ?? 0,
        typeRecompense: reglePar?.typeRecompense ?? 'POINTS',
        recompenseValeur: Number(reglePar?.valeurNiveau1 ?? 500),
      },
      filleuls,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── GET /portal/filleuls (legacy) ─────────────────────────────────────────

  async getFilleuls(clientId: string) {
    return this.getReferrals(clientId, {});
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private getPeriodStart(period?: string): Date | null {
    if (!period || period === 'all') return null;
    const now = new Date();
    if (period === 'month')   return new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === '3months') return new Date(now.getFullYear(), now.getMonth() - 3, 1);
    if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), q * 3, 1);
    }
    if (period === 'year')    return new Date(now.getFullYear(), 0, 1);
    return null;
  }

  private getEtapeMessage(etape: string): string {
    const map: Record<string, string> = {
      RECIT:      'Formation à suivre…',
      FORMATION:  'Achat de la fiche en cours…',
      FICHE:      'Activation en attente…',
    };
    return map[etape] ?? 'Inscription en cours…';
  }
}
