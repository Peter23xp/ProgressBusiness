import {
  Controller, Post, UseGuards, UseInterceptors,
  UploadedFile, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/ticket.dto';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('ticket')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('screenshot', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(null, false);
    },
  }))
  createTicket(
    @Body() dto: CreateTicketDto,
    @UploadedFile() screenshot?: Express.Multer.File,
  ) {
    return this.supportService.createTicket(dto, screenshot?.path);
  }
}
