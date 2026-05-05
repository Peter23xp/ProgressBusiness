import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TicketTypeDto {
  BUG        = 'BUG',
  SUGGESTION = 'SUGGESTION',
  QUESTION   = 'QUESTION',
  CONFIG     = 'CONFIG',
  URGENCE    = 'URGENCE',
}

export class CreateTicketDto {
  @IsNotEmpty() @IsString() @MaxLength(100)
  nom: string;

  @IsNotEmpty() @IsEmail()
  email: string;

  @IsNotEmpty() @IsString() @MaxLength(100)
  siteNom: string;

  @IsNotEmpty() @IsString() @MaxLength(50)
  role: string;

  @IsNotEmpty() @IsEnum(TicketTypeDto)
  type: TicketTypeDto;

  @IsNotEmpty() @IsString() @MaxLength(200)
  sujet: string;

  @IsNotEmpty() @IsString() @MaxLength(5000)
  description: string;

  @IsOptional() @IsString() @MaxLength(2000)
  systemInfo?: string;
}
