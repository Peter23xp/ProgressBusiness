import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /* Ping toutes les 10 minutes pour éviter le spindown Render Free */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async ping() {
    const url = this.config.get<string>('APP_URL');
    if (!url) return;
    try {
      await firstValueFrom(this.http.get(`${url}/api/v1/health`));
      this.logger.log('Keep-alive ping OK');
    } catch {
      this.logger.warn('Keep-alive ping failed');
    }
  }
}
