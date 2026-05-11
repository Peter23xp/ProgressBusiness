import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { PortalModule } from '../portal/portal.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [PortalModule, MailerModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
