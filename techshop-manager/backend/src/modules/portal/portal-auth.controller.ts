import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PortalAuthService } from './portal-auth.service';
import { PortalLoginDto, SetPinDto } from './dto/portal-auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('portal/auth')
export class PortalAuthController {
  constructor(private readonly portalAuthService: PortalAuthService) {}

  @Post('login')
  login(@Body() dto: PortalLoginDto) {
    return this.portalAuthService.login(dto);
  }

  @Post('clients/:id/set-pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENT', 'GERANT', 'SUPER_ADMIN')
  setPin(@Param('id') clientId: string, @Body() dto: SetPinDto) {
    return this.portalAuthService.setPin(clientId, dto);
  }
}
