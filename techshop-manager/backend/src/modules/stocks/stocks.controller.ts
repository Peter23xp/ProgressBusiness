import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import {
  EntreeStockDto,
  TransfertDto,
  ReceptionTransfertDto,
  UpdateSeuilDto,
  InventaireDto,
} from './dto/stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.AGENT)
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('stocks')
  getInventaire(
    @Query('siteId') siteId?: string,
    @Query('produitId') produitId?: string,
    @Query('categorie') categorie?: string,
    @Query('alerteOnly') alerteOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stocksService.getInventaire({
      siteId,
      produitId,
      categorie,
      alerteOnly: alerteOnly === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('produits/:id/stocks')
  getProduitStocks(@Param('id') produitId: string) {
    return this.stocksService.getProduitStocks(produitId);
  }

  @Post('stocks/entree')
  entreeStock(@Body() dto: EntreeStockDto, @CurrentUser() user: any) {
    return this.stocksService.entreeStock(dto, user.id);
  }

  @Post('stocks/transfert')
  transfert(@Body() dto: TransfertDto, @CurrentUser() user: any) {
    return this.stocksService.transfert(dto, user.id);
  }

  @Patch('stocks/transfert/:id/recevoir')
  recevoirTransfert(
    @Param('id') transfertId: string,
    @Body() dto: ReceptionTransfertDto,
    @CurrentUser() user: any,
  ) {
    return this.stocksService.recevoirTransfert(transfertId, dto, user.id);
  }

  @Get('stocks/alertes')
  getAlertes(
    @Query('siteId') siteId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stocksService.getAlertes({
      siteId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Patch('stocks/:siteId/:produitId/seuil')
  @Roles(Role.GERANT)
  updateSeuil(
    @Param('siteId') siteId: string,
    @Param('produitId') produitId: string,
    @Body() dto: UpdateSeuilDto,
  ) {
    return this.stocksService.updateSeuil(siteId, produitId, dto);
  }

  @Post('stocks/inventaire')
  @Roles(Role.GERANT)
  inventairePhysique(@Body() dto: InventaireDto, @CurrentUser() user: any) {
    return this.stocksService.inventairePhysique(dto, user.id);
  }
}
