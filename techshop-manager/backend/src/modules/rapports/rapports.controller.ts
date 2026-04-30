import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RapportsService } from './rapports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('rapports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) {}

  @Get('ventes')
  @Roles(Role.AGENT)
  getVentes(
    @Query('siteId') siteId?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('granularite') granularite?: string,
  ) {
    return this.rapportsService.getVentes({
      siteId,
      dateDebut: dateDebut ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      dateFin: dateFin ?? new Date().toISOString(),
      granularite,
    });
  }

  @Get('ventes/detail')
  @Roles(Role.DIRECTEUR_REGIONAL)
  getVentesDetail(
    @Query('siteId') siteId?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.rapportsService.getVentesDetail({ siteId, dateDebut, dateFin, page, limit });
  }

  @Get('stocks')
  @Roles(Role.DIRECTEUR_REGIONAL)
  getStocksConsolide(
    @Query('siteId') siteId?: string,
    @Query('categorie') categorie?: string,
  ) {
    return this.rapportsService.getStocksConsolide({ siteId, categorie });
  }

  @Get('parrainage')
  @Roles(Role.AGENT)
  getParrainage(
    @Query('siteId') siteId?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.rapportsService.getParrainage({ siteId, dateDebut, dateFin });
  }

  @Post('export')
  @Roles(Role.AGENT)
  createExport(
    @Body() body: { type: string; format: string; filtres?: Record<string, any> },
  ) {
    return this.rapportsService.createExport(body);
  }

  @Get('export/:jobId')
  @Roles(Role.AGENT)
  getExportStatus(@Param('jobId') jobId: string) {
    return this.rapportsService.getExportStatus(jobId);
  }
}
