import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  UpdateClientDto,
  OnboardingFormationDto,
  OnboardingFicheDto,
} from './dto/client.dto';
import { EtapeOnboarding, ModePaiement, Role, StatutClient, StatutEtape } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    query: {
      siteId?: string;
      statut?: string;
      niveau?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
    user: { id: string; role: Role; siteId?: string },
  ) {
    const { statut, niveau, search, page = 1, limit = 50 } = query;

    // AGENT voit uniquement les clients de son site
    const effectiveSiteId =
      user.role === Role.AGENT ? user.siteId : query.siteId;

    const where: any = {};

    if (effectiveSiteId) {
      where.siteInscriptionId = effectiveSiteId;
    }
    if (statut) {
      where.statut = statut;
    }
    if (niveau) {
      where.niveauFidelite = niveau;
    }
    if (search) {
      where.OR = [
        { prenom: { contains: search, mode: 'insensitive' } },
        { nom: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search } },
        { codeParrain: { contains: search, mode: 'insensitive' } },
        { matriculeExterne: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          siteInscription: { select: { id: true, nom: true } },
          onboardingEtapes: { select: { etape: true, statut: true, completeeAt: true } },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    const mappedData = data.map(({ siteInscription, ...rest }) => ({
      ...rest,
      site: siteInscription,
    }));

    return {
      data: mappedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        siteInscription: { select: { id: true, nom: true } },
        onboardingEtapes: {
          include: {
            agent: { select: { id: true, nom: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        parrain: { select: { id: true, prenom: true, nom: true, codeParrain: true } },
        filleuls: { select: { id: true, prenom: true, nom: true, statut: true, createdAt: true } },
        ventes: {
          select: { id: true, numeroVente: true, montantNet: true, pointsAttribues: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        mouvementsPoints: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!client) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
    }

    const { siteInscription, ...rest } = client;
    return { ...rest, site: siteInscription };
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    user: { id: string; role: Role },
  ) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
    }

    if (dto.telephone && dto.telephone !== client.telephone) {
      const exists = await this.prisma.client.findUnique({
        where: { telephone: dto.telephone },
      });
      if (exists) {
        throw new ConflictException({
          code: 'ERR_CONFLICT',
          message: 'Ce numéro de téléphone est déjà utilisé',
        });
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        ...(dto.prenom && { prenom: dto.prenom }),
        ...(dto.nom && { nom: dto.nom }),
        ...(dto.telephone && { telephone: dto.telephone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        siteInscription: { select: { id: true, nom: true } },
      },
    });
  }

  async checkPhone(phone: string) {
    const client = await this.prisma.client.findUnique({
      where: { telephone: phone },
      select: { id: true, prenom: true, nom: true, statut: true, telephone: true },
    });

    return {
      exists: !!client,
      client: client ?? null,
    };
  }

  async onboardingRecit(dto: {
    prenom: string;
    nom: string;
    telephone: string;
    email?: string;
    siteId: string;
    codeParrain?: string;
    matriculeExterne?: string;
    montantRecit: number;
    modePaiement: ModePaiement;
    numeroRecu?: string;
  }) {
    // Vérifier doublon téléphone
    const existingPhone = await this.prisma.client.findUnique({
      where: { telephone: dto.telephone },
    });
    if (existingPhone) {
      throw new ConflictException({
        code: 'ERR_CONFLICT',
        message: 'Un client avec ce numéro existe déjà',
      });
    }

    // Vérifier matricule externe si fourni
    if (dto.matriculeExterne) {
      const existingMatricule = await this.prisma.client.findUnique({
        where: { matriculeExterne: dto.matriculeExterne },
      });
      if (existingMatricule) {
        throw new ConflictException({
          code: 'ERR_CONFLICT',
          message: 'Ce matricule externe est déjà utilisé',
        });
      }
    }

    // Résoudre le parrain par code
    let parrainId: string | undefined;
    if (dto.codeParrain) {
      const parrain = await this.prisma.client.findUnique({
        where: { codeParrain: dto.codeParrain },
      });
      if (!parrain) {
        throw new BadRequestException({
          code: 'ERR_BAD_REQUEST',
          message: 'Code parrain invalide',
        });
      }
      if (parrain.statut !== StatutClient.ACTIF) {
        throw new BadRequestException({
          code: 'ERR_BAD_REQUEST',
          message: 'Le parrain doit être actif',
        });
      }
      parrainId = parrain.id;
    }

    // Vérifier que le site existe
    const site = await this.prisma.site.findUnique({ where: { id: dto.siteId } });
    if (!site) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Site introuvable' });
    }

    // Créer le client et l'étape RECIT dans une transaction
    const client = await this.prisma.$transaction(async (tx) => {
      const newClient = await tx.client.create({
        data: {
          prenom: dto.prenom,
          nom: dto.nom,
          telephone: dto.telephone,
          email: dto.email,
          matriculeExterne: dto.matriculeExterne,
          siteInscriptionId: dto.siteId,
          createdById: dto.agentId,
          parrainId: parrainId,
          statut: StatutClient.EN_COURS,
        },
      });

      await tx.onboardingEtape.create({
        data: {
          etape: EtapeOnboarding.RECIT,
          statut: StatutEtape.COMPLETE,
          completeeAt: new Date(),
          montant: dto.montantRecit,
          modePaiement: dto.modePaiement,
          referenceTransaction: dto.numeroRecu,
          clientId: newClient.id,
          agentId: dto.agentId,
          siteId: dto.siteId,
        },
      });

      return newClient;
    });

    return this.findOne(client.id);
  }

  async onboardingFormation(
    clientId: string,
    dto: OnboardingFormationDto,
    agentId: string,
  ) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { onboardingEtapes: true },
    });
    if (!client) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
    }

    const recitEtape = client.onboardingEtapes.find(
      (e) => e.etape === EtapeOnboarding.RECIT,
    );
    if (!recitEtape || recitEtape.statut !== StatutEtape.COMPLETE) {
      throw new BadRequestException({
        code: 'ERR_BAD_REQUEST',
        message: "L'étape RECIT doit être complétée avant la formation",
      });
    }

    const existingFormation = client.onboardingEtapes.find(
      (e) => e.etape === EtapeOnboarding.FORMATION,
    );
    if (existingFormation && existingFormation.statut === StatutEtape.COMPLETE) {
      throw new ConflictException({
        code: 'ERR_CONFLICT',
        message: 'La formation a déjà été complétée',
      });
    }

    // Vérifier que le formateur existe
    const formateur = await this.prisma.utilisateur.findUnique({
      where: { id: dto.formateurId },
    });
    if (!formateur) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Formateur introuvable' });
    }

    const notes = dto.dureeMinutes
      ? `Durée: ${dto.dureeMinutes} min${dto.notes ? '. ' + dto.notes : ''}`
      : dto.notes;

    if (existingFormation) {
      return this.prisma.onboardingEtape.update({
        where: { id: existingFormation.id },
        data: {
          statut: StatutEtape.COMPLETE,
          completeeAt: new Date(dto.dateFormation),
          notes: notes,
          agentId: dto.formateurId,
        },
      });
    }

    return this.prisma.onboardingEtape.create({
      data: {
        etape: EtapeOnboarding.FORMATION,
        statut: StatutEtape.COMPLETE,
        completeeAt: new Date(dto.dateFormation),
        notes: notes,
        clientId,
        agentId: dto.formateurId,
        siteId: client.siteInscriptionId,
      },
    });
  }

  async onboardingFiche(
    clientId: string,
    dto: OnboardingFicheDto,
    agentId: string,
  ) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { onboardingEtapes: true },
    });
    if (!client) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
    }

    const formationEtape = client.onboardingEtapes.find(
      (e) => e.etape === EtapeOnboarding.FORMATION,
    );
    if (!formationEtape || formationEtape.statut !== StatutEtape.COMPLETE) {
      throw new BadRequestException({
        code: 'ERR_BAD_REQUEST',
        message: "L'étape FORMATION doit être complétée avant la fiche",
      });
    }

    const existingFiche = client.onboardingEtapes.find(
      (e) => e.etape === EtapeOnboarding.FICHE,
    );
    if (existingFiche && existingFiche.statut === StatutEtape.COMPLETE) {
      throw new ConflictException({
        code: 'ERR_CONFLICT',
        message: 'La fiche a déjà été complétée',
      });
    }

    if (existingFiche) {
      return this.prisma.onboardingEtape.update({
        where: { id: existingFiche.id },
        data: {
          statut: StatutEtape.COMPLETE,
          completeeAt: new Date(),
          montant: dto.montantFiche,
          modePaiement: dto.modePaiement,
          referenceTransaction: dto.numeroTransaction,
          agentId,
        },
      });
    }

    return this.prisma.onboardingEtape.create({
      data: {
        etape: EtapeOnboarding.FICHE,
        statut: StatutEtape.COMPLETE,
        completeeAt: new Date(),
        montant: dto.montantFiche,
        modePaiement: dto.modePaiement,
        referenceTransaction: dto.numeroTransaction,
        clientId,
        agentId,
        siteId: client.siteInscriptionId,
      },
    });
  }

  async onboardingActivate(clientId: string, agentId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { onboardingEtapes: true },
    });
    if (!client) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Client introuvable' });
    }

    if (client.statut === StatutClient.ACTIF) {
      throw new ConflictException({
        code: 'ERR_CONFLICT',
        message: 'Ce client est déjà actif',
      });
    }

    const ficheEtape = client.onboardingEtapes.find(
      (e) => e.etape === EtapeOnboarding.FICHE,
    );
    if (!ficheEtape || ficheEtape.statut !== StatutEtape.COMPLETE) {
      throw new BadRequestException({
        code: 'ERR_BAD_REQUEST',
        message: "Toutes les étapes d'onboarding doivent être complétées",
      });
    }

    // Générer un code parrain unique format TSG-XXXX
    const codeParrain = await this.generateUniqueCodeParrain();

    const activatedClient = await this.prisma.$transaction(async (tx) => {
      // Activer le client
      const updated = await tx.client.update({
        where: { id: clientId },
        data: {
          statut: StatutClient.ACTIF,
          codeParrain,
          dateActivation: new Date(),
        },
      });

      // Créer l'étape ACTIVATION
      await tx.onboardingEtape.upsert({
        where: { clientId_etape: { clientId, etape: EtapeOnboarding.ACTIVATION } },
        create: {
          etape: EtapeOnboarding.ACTIVATION,
          statut: StatutEtape.COMPLETE,
          completeeAt: new Date(),
          clientId,
          agentId,
          siteId: client.siteInscriptionId,
        },
        update: {
          statut: StatutEtape.COMPLETE,
          completeeAt: new Date(),
          agentId,
        },
      });

      // Créer le parrainage si le client a un parrain
      if (client.parrainId) {
        const existingParrainage = await tx.parrainage.findUnique({
          where: { filleulId: clientId },
        });
        if (!existingParrainage) {
          await tx.parrainage.create({
            data: {
              parrainId: client.parrainId,
              filleulId: clientId,
              niveau: 1,
            },
          });
        }
      }

      return updated;
    });

    return this.findOne(activatedClient.id);
  }

  private async generateUniqueCodeParrain(): Promise<string> {
    // Trouver le dernier code TSG-XXXX pour incrémenter
    const lastClient = await this.prisma.client.findFirst({
      where: { codeParrain: { startsWith: 'TSG-' } },
      orderBy: { dateActivation: 'desc' },
      select: { codeParrain: true },
    });

    let nextNumber = 1;
    if (lastClient?.codeParrain) {
      const match = lastClient.codeParrain.match(/^TSG-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Chercher un code disponible en cas de collisions
    let code: string;
    let attempts = 0;
    do {
      code = `TSG-${String(nextNumber + attempts).padStart(4, '0')}`;
      const exists = await this.prisma.client.findUnique({
        where: { codeParrain: code },
      });
      if (!exists) break;
      attempts++;
    } while (attempts < 100);

    return code;
  }

  async importPreview(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ code: 'ERR_BAD_REQUEST', message: 'Fichier requis' });
    }

    const content = file.buffer.toString('utf-8');
    const lines = content.split('\n').filter((l) => l.trim());

    if (lines.length < 2) {
      throw new BadRequestException({
        code: 'ERR_BAD_REQUEST',
        message: 'Le fichier doit contenir au moins un en-tête et une ligne de données',
      });
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredHeaders = ['prenom', 'nom', 'telephone'];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new BadRequestException({
        code: 'ERR_BAD_REQUEST',
        message: `Colonnes manquantes: ${missingHeaders.join(', ')}`,
      });
    }

    const rows: Array<{
      ligne: number;
      nom: string;
      telephone: string;
      matricule: string;
      statut: 'OK' | 'DOUBLON' | 'ERREUR';
      message?: string;
    }> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ?? '';
      });

      const nom = `${row.prenom ?? ''} ${row.nom ?? ''}`.trim();
      const telephone = row.telephone ?? '';
      const matricule = row.matricule ?? row.matriculeexterne ?? '';

      const rowErrors: string[] = [];
      if (!row.prenom) rowErrors.push('Prénom requis');
      if (!row.nom) rowErrors.push('Nom requis');
      if (!telephone) rowErrors.push('Téléphone requis');
      else if (!/^\+243[0-9]{9}$/.test(telephone)) {
        rowErrors.push('Format téléphone invalide (+243XXXXXXXXX)');
      }

      if (rowErrors.length > 0) {
        rows.push({ ligne: i + 1, nom, telephone, matricule, statut: 'ERREUR', message: rowErrors.join(', ') });
        continue;
      }

      const exists = await this.prisma.client.findUnique({ where: { telephone } });
      if (exists) {
        rows.push({ ligne: i + 1, nom, telephone, matricule, statut: 'DOUBLON', message: 'Numéro déjà enregistré' });
        continue;
      }

      rows.push({ ligne: i + 1, nom, telephone, matricule, statut: 'OK' });
    }

    return { rows };
  }

  async importExecute(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ code: 'ERR_BAD_REQUEST', message: 'Fichier requis' });
    }

    const content = file.buffer.toString('utf-8');
    const lines = content.split('\n').filter((l) => l.trim());

    if (lines.length < 2) {
      throw new BadRequestException({
        code: 'ERR_BAD_REQUEST',
        message: 'Le fichier est vide',
      });
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const results = { success: 0, doublons: 0, errors: 0, details: [] as { ligne: number; message: string }[] };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ?? '';
      });

      try {
        if (!row.telephone || !/^\+243[0-9]{9}$/.test(row.telephone)) {
          results.errors++;
          results.details.push({ ligne: i + 1, message: 'Téléphone invalide ou manquant' });
          continue;
        }

        const exists = await this.prisma.client.findUnique({
          where: { telephone: row.telephone },
        });

        if (exists) {
          results.doublons++;
          continue;
        }

        if (!row.siteid) {
          results.errors++;
          results.details.push({ ligne: i + 1, message: 'siteId requis' });
          continue;
        }

        const site = await this.prisma.site.findUnique({ where: { id: row.siteid } });
        if (!site) {
          results.errors++;
          results.details.push({ ligne: i + 1, message: `Site introuvable: ${row.siteid}` });
          continue;
        }

        const agent = await this.prisma.utilisateur.findFirst({
          where: { siteId: row.siteid, actif: true },
        });
        if (!agent) {
          results.errors++;
          results.details.push({ ligne: i + 1, message: 'Aucun agent actif pour ce site' });
          continue;
        }

        await this.prisma.client.create({
          data: {
            prenom: row.prenom,
            nom: row.nom,
            telephone: row.telephone,
            email: row.email || undefined,
            matriculeExterne: row.matriculeexterne || undefined,
            siteInscriptionId: row.siteid,
            createdById: agent.id,
            statut: StatutClient.EN_COURS,
          },
        });

        results.success++;
      } catch (err) {
        results.errors++;
        results.details.push({ ligne: i + 1, message: err.message || 'Erreur inattendue' });
      }
    }

    return results;
  }
}
