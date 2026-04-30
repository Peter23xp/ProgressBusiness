import { Module } from '@nestjs/common';
import { RapportsController } from './rapports.controller';
import { RapportsService } from './rapports.service';

@Module({
  imports: [],
  controllers: [RapportsController],
  providers: [RapportsService],
  exports: [RapportsService],
})
export class RapportsModule {}
