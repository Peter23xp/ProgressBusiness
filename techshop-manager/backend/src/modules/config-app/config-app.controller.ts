import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Patch,
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

  @Patch()
  @Roles(Role.SUPER_ADMIN)
  patchConfig(@Body() dto: any) {
    return this.configAppService.updateConfig(dto);
  }

  @Post('test-sms')
  @Roles(Role.SUPER_ADMIN)
  testSms(@Body('phone') phone: string) {
    return this.configAppService.testSms(phone);
  }

  @Get('system-stats')
  @Roles(Role.SUPER_ADMIN)
  getSystemStats() {
    return this.configAppService.getSystemStats();
  }
}
