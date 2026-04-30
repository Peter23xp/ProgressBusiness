import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const sites = await this.prisma.site.findMany({
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: {
            utilisateurs: true,
            clients: true,
          },
        },
      },
    });

    return { data: sites, total: sites.length };
  }

  async createSite(dto: CreateSiteDto) {
    // Vérifier doublon nom
    const existing = await this.prisma.site.findFirst({
      where: { nom: { equals: dto.nom, mode: 'insensitive' } },
    });
    if (existing) {
      throw new ConflictException({
        code: 'ERR_CONFLICT',
        message: 'Un site avec ce nom existe déjà',
      });
    }

    // Vérifier que le gérant existe si fourni
    if (dto.gerantId) {
      const gerant = await this.prisma.utilisateur.findUnique({
        where: { id: dto.gerantId },
      });
      if (!gerant) {
        throw new NotFoundException({
          code: 'ERR_NOT_FOUND',
          message: 'Gérant introuvable',
        });
      }
    }

    return this.prisma.site.create({
      data: {
        nom: dto.nom,
        ville: dto.ville,
        adresse: dto.adresse ?? null,
        gerantId: dto.gerantId ?? null,
      },
    });
  }

  async updateSite(id: string, dto: UpdateSiteDto) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) {
      throw new NotFoundException({ code: 'ERR_NOT_FOUND', message: 'Site introuvable' });
    }

    // Vérifier doublon nom si changé
    if (dto.nom && dto.nom !== site.nom) {
      const existing = await this.prisma.site.findFirst({
        where: {
          nom: { equals: dto.nom, mode: 'insensitive' },
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictException({
          code: 'ERR_CONFLICT',
          message: 'Un site avec ce nom existe déjà',
        });
      }
    }

    // Vérifier que le gérant existe si fourni
    if (dto.gerantId) {
      const gerant = await this.prisma.utilisateur.findUnique({
        where: { id: dto.gerantId },
      });
      if (!gerant) {
        throw new NotFoundException({
          code: 'ERR_NOT_FOUND',
          message: 'Gérant introuvable',
        });
      }
    }

    return this.prisma.site.update({
      where: { id },
      data: {
        ...(dto.nom !== undefined && { nom: dto.nom }),
        ...(dto.ville !== undefined && { ville: dto.ville }),
        ...(dto.adresse !== undefined && { adresse: dto.adresse }),
        ...(dto.gerantId !== undefined && { gerantId: dto.gerantId }),
        ...(dto.actif !== undefined && { actif: dto.actif }),
      },
    });
  }
}
