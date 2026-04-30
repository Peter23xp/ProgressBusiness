import { Module } from '@nestjs/common';
import { VentesController } from './ventes.controller';
import { VentesService } from './ventes.service';

@Module({
  imports: [],
  controllers: [VentesController],
  providers: [VentesService],
  exports: [VentesService],
})
export class VentesModule {}
