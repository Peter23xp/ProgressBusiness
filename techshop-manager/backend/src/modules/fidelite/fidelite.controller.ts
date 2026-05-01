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
import { FideliteService } from './fidelite.service';
import { ConfigFideliteDto } from './dto/fidelite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('fidelite')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FideliteController {
  constructor(private readonly fideliteService: FideliteService) {}

  @Get('stats')
  @Roles(Role.AGENT)
  getStats(
    @Query('siteId') siteId?: string,
    @Query('period') period?: string,
  ) {
    return this.fideliteService.getStats(siteId, period);
  }

  @Get('top-clients')
  @Roles(Role.AGENT)
  getTopClients(
    @Query('siteId') siteId?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.fideliteService.getTopClients(siteId, limit);
  }

  @Get('mouvements')
  @Roles(Role.AGENT)
  getRecentMouvements(
    @Query('siteId') siteId?: string,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit?: number,
  ) {
    return this.fideliteService.getRecentMouvements(siteId, limit);
  }

  @Get('config')
  @Roles(Role.AGENT)
  getConfig() {
    return this.fideliteService.getConfig();
  }

  @Get('config/history')
  @Roles(Role.AGENT)
  getConfigHistory() {
    return this.fideliteService.getConfigHistory();
  }

  @Get('client/:clientId')
  @Roles(Role.AGENT)
  getClientData(@Param('clientId') clientId: string) {
    return this.fideliteService.getClientData(clientId);
  }

  @Get('client/:clientId/mouvements')
  @Roles(Role.AGENT)
  getClientMouvements(
    @Param('clientId') clientId: string,
    @Query('type') type?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.fideliteService.getClientMouvements(clientId, { type, page, limit, sortOrder });
  }

  @Put('config')
  @Roles(Role.SUPER_ADMIN)
  updateConfig(@Body() dto: ConfigFideliteDto) {
    return this.fideliteService.updateConfig(dto);
  }
}
