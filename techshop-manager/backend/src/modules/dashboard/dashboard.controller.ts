import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(
    @Query('siteId') siteId?: string,
    @Query('period') period?: string,
    @CurrentUser() user?: any,
  ) {
    return this.dashboardService.getStats(siteId, period ?? 'today', user);
  }

  @Get('sales-chart')
  getSalesChart(
    @Query('siteId') siteId?: string,
    @Query('days') days?: string,
  ) {
    return this.dashboardService.getSalesChart(siteId, days ? parseInt(days, 10) : 7);
  }

  @Get('recent-transactions')
  getRecentTransactions(
    @Query('siteId') siteId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getRecentTransactions(siteId, limit ? parseInt(limit, 10) : 5);
  }

  @Get('stock-alerts')
  getStockAlerts(
    @Query('siteId') siteId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getStockAlerts(siteId, limit ? parseInt(limit, 10) : 3);
  }

  @Get('regional')
  @Roles(Role.DIRECTEUR_REGIONAL, Role.SUPER_ADMIN)
  getRegionalDashboard(
    @Query('period') period?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @CurrentUser() user?: any,
  ) {
    return this.dashboardService.getRegionalDashboard(period ?? 'month', dateFrom, dateTo, user);
  }
}
