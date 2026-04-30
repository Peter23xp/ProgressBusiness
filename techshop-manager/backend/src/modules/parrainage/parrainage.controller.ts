import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ParrainageService } from './parrainage.service';
import { ConfigParrainageDto } from './dto/parrainage.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('parrainage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParrainageController {
  constructor(private readonly parrainageService: ParrainageService) {}

  @Get('stats')
  @Roles(Role.AGENT)
  getStats(
    @Query('siteId') siteId?: string,
    @Query('period') period?: string,
  ) {
    return this.parrainageService.getStats({ siteId, period });
  }

  @Get()
  @Roles(Role.AGENT)
  findAll(
    @Query('siteId') siteId?: string,
    @Query('statut') statut?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.parrainageService.findAll({ siteId, statut, page, limit });
  }

  @Get('tree/:clientId')
  @Roles(Role.AGENT)
  getTree(
    @Param('clientId') clientId: string,
    @Query('niveaux', new DefaultValuePipe(1), ParseIntPipe) niveaux: 1 | 2,
  ) {
    return this.parrainageService.getTree(clientId, niveaux as 1 | 2);
  }

  @Get('config')
  @Roles(Role.AGENT)
  getConfig() {
    return this.parrainageService.getConfig();
  }

  @Put('config')
  @Roles(Role.SUPER_ADMIN)
  updateConfig(@Body() dto: ConfigParrainageDto) {
    return this.parrainageService.updateConfig(dto);
  }

  @Get('check-code/:code')
  @Roles(Role.AGENT)
  checkCode(@Param('code') code: string) {
    return this.parrainageService.checkCode(code);
  }
}
