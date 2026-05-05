import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { CreateTicketDto } from './dto/ticket.dto';
import { TicketType } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async createTicket(
    dto: CreateTicketDto,
    screenshotPath?: string,
  ) {
    const year  = new Date().getFullYear();
    const count = await this.prisma.supportTicket.count();
    const ticketRef = `TKT-${year}-${String(count + 1).padStart(4, '0')}`;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketRef,
        nom:           dto.nom,
        email:         dto.email,
        siteNom:       dto.siteNom,
        role:          dto.role,
        type:          dto.type as TicketType,
        sujet:         dto.sujet,
        description:   dto.description,
        systemInfo:    dto.systemInfo,
        hasScreenshot: !!screenshotPath,
      },
    });

    await this.mailer.sendSupportTicket({
      ticketRef:     ticket.ticketRef,
      nom:           ticket.nom,
      email:         ticket.email,
      siteNom:       ticket.siteNom,
      role:          ticket.role,
      type:          ticket.type,
      sujet:         ticket.sujet,
      description:   ticket.description,
      systemInfo:    ticket.systemInfo ?? undefined,
      hasScreenshot: ticket.hasScreenshot,
    });

    return { ticketRef: ticket.ticketRef, message: 'Ticket créé avec succès.' };
  }
}
