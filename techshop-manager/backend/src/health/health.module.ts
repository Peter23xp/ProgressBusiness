import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health.controller';
import { KeepAliveService } from './keep-alive.service';

@Module({
  imports: [HttpModule, ScheduleModule],
  controllers: [HealthController],
  providers: [KeepAliveService],
})
export class HealthModule {}
