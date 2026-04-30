import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('sites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @Roles(Role.AGENT)
  findAll() {
    return this.sitesService.findAll();
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  createSite(@Body() dto: CreateSiteDto) {
    return this.sitesService.createSite(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  updateSite(@Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.sitesService.updateSite(id, dto);
  }
}
