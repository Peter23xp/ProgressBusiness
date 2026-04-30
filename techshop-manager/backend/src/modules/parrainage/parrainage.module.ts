import { Module } from '@nestjs/common';
import { ParrainageController } from './parrainage.controller';
import { ParrainageService } from './parrainage.service';

@Module({
  imports: [],
  controllers: [ParrainageController],
  providers: [ParrainageService],
  exports: [ParrainageService],
})
export class ParrainageModule {}
