import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ConfigAppService } from './config-app.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfigAppController {
  constructor(private readonly configAppService: ConfigAppService) {}

  @Get()
  @Roles(Role.AGENT)
  getConfig() {
    return this.configAppService.getConfig();
  }

  @Put()
  @Roles(Role.SUPER_ADMIN)
  updateConfig(@Body() dto: any) {
    return this.configAppService.updateConfig(dto);
  }
}
