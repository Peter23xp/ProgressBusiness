import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConfigAppService {
  constructor(private prisma: PrismaService) {}

  async getConfig() {
    const [configGenerale, configFidelite, regleParrainage] = await Promise.all([
      this.prisma.configGenerale.findFirst(),
      this.prisma.configFidelite.findFirst({
        include: { niveaux: { orderBy: { seuilPts: 'asc' } } },
      }),
      this.prisma.regleParrainage.findFirst(),
    ]);

    return {
      generale: configGenerale ?? {
        matriculeExterneActif: false,
        matriculeRegex: null,
        dureeSectionHeures: 8,
        delaiRetourJours: 7,
        fraisRetourPct: 0,
        smsApiKey: null,
        smsUsername: null,
        smsSenderId: null,
      },
      fidelite: configFidelite ?? {
        ratioPtsCDF: 1000,
        dureeValiditeMois: 0,
        cumulRemises: false,
        niveaux: [
          { nom: 'Bronze', seuilPts: 0, remisePct: 0 },
          { nom: 'Argent', seuilPts: 500, remisePct: 3 },
          { nom: 'Or', seuilPts: 2000, remisePct: 5 },
          { nom: 'Platine', seuilPts: 5000, remisePct: 8 },
        ],
      },
      parrainage: regleParrainage ?? {
        multiNiveaux: false,
        typeRecompense: 'POINTS',
        valeurNiveau1: 500,
        valeurNiveau2: null,
        conditionDeclenchement: 'ACTIVATION',
        plafondMensuel: null,
      },
    };
  }

  async updateConfig(dto: any) {
    const results: any = {};

    if (dto.generale) {
      const existing = await this.prisma.configGenerale.findFirst();
      if (existing) {
        results.generale = await this.prisma.configGenerale.update({
          where: { id: existing.id },
          data: {
            ...(dto.generale.smsApiKey !== undefined && { smsApiKey: dto.generale.smsApiKey }),
            ...(dto.generale.smsUsername !== undefined && { smsUsername: dto.generale.smsUsername }),
            ...(dto.generale.smsSenderId !== undefined && { smsSenderId: dto.generale.smsSenderId }),
            ...(dto.generale.matriculeExterneActif !== undefined && {
              matriculeExterneActif: dto.generale.matriculeExterneActif,
            }),
            ...(dto.generale.matriculeRegex !== undefined && { matriculeRegex: dto.generale.matriculeRegex }),
            ...(dto.generale.dureeSectionHeures !== undefined && {
              dureeSectionHeures: dto.generale.dureeSectionHeures,
            }),
            ...(dto.generale.delaiRetourJours !== undefined && {
              delaiRetourJours: dto.generale.delaiRetourJours,
            }),
            ...(dto.generale.fraisRetourPct !== undefined && { fraisRetourPct: dto.generale.fraisRetourPct }),
          },
        });
      } else {
        results.generale = await this.prisma.configGenerale.create({
          data: {
            smsApiKey: dto.generale.smsApiKey ?? null,
            smsUsername: dto.generale.smsUsername ?? null,
            smsSenderId: dto.generale.smsSenderId ?? null,
            matriculeExterneActif: dto.generale.matriculeExterneActif ?? false,
            matriculeRegex: dto.generale.matriculeRegex ?? null,
            dureeSectionHeures: dto.generale.dureeSectionHeures ?? 8,
            delaiRetourJours: dto.generale.delaiRetourJours ?? 7,
            fraisRetourPct: dto.generale.fraisRetourPct ?? 0,
          },
        });
      }
    }

    if (dto.fidelite) {
      const existing = await this.prisma.configFidelite.findFirst();
      if (existing) {
        if (dto.fidelite.niveaux) {
          await this.prisma.niveauConfig.deleteMany({ where: { configId: existing.id } });
        }
        results.fidelite = await this.prisma.configFidelite.update({
          where: { id: existing.id },
          data: {
            ...(dto.fidelite.ratioPtsCDF !== undefined && { ratioPtsCDF: dto.fidelite.ratioPtsCDF }),
            ...(dto.fidelite.dureeValiditeMois !== undefined && {
              dureeValiditeMois: dto.fidelite.dureeValiditeMois,
            }),
            ...(dto.fidelite.cumulRemises !== undefined && { cumulRemises: dto.fidelite.cumulRemises }),
            ...(dto.fidelite.niveaux && {
              niveaux: {
                create: dto.fidelite.niveaux.map((n: any) => ({
                  nom: n.nom,
                  seuilPts: n.seuilPts,
                  remisePct: n.remisePct,
                })),
              },
            }),
          },
          include: { niveaux: true },
        });
      }
    }

    if (dto.parrainage) {
      const existing = await this.prisma.regleParrainage.findFirst();
      if (existing) {
        results.parrainage = await this.prisma.regleParrainage.update({
          where: { id: existing.id },
          data: {
            ...(dto.parrainage.typeRecompense !== undefined && { typeRecompense: dto.parrainage.typeRecompense }),
            ...(dto.parrainage.valeurNiveau1 !== undefined && { valeurNiveau1: dto.parrainage.valeurNiveau1 }),
            ...(dto.parrainage.valeurNiveau2 !== undefined && { valeurNiveau2: dto.parrainage.valeurNiveau2 }),
            ...(dto.parrainage.multiNiveaux !== undefined && { multiNiveaux: dto.parrainage.multiNiveaux }),
            ...(dto.parrainage.conditionDeclenchement !== undefined && {
              conditionDeclenchement: dto.parrainage.conditionDeclenchement,
            }),
            ...(dto.parrainage.plafondMensuel !== undefined && { plafondMensuel: dto.parrainage.plafondMensuel }),
          },
        });
      }
    }

    return { success: true, updated: results };
  }
}
