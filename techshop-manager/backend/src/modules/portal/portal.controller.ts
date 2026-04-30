import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('portal')
@UseGuards(JwtAuthGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('me')
  getPortalData(@CurrentUser() user: any) {
    return this.portalService.getPortalData(user.sub);
  }

  @Get('purchases')
  getPurchases(
    @CurrentUser() user: any,
    @Query('period') period?: string,
  ) {
    return this.portalService.getPurchases(user.sub, { period });
  }

  @Get('points')
  getPoints(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.portalService.getPoints(user.sub, { page, limit });
  }

  @Get('filleuls')
  getFilleuls(@CurrentUser() user: any) {
    return this.portalService.getFilleuls(user.sub);
  }
}
