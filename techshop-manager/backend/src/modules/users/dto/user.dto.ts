import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  nom: string;

  @IsString()
  telephone: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  siteId?: string;

  @IsString()
  @MinLength(6)
  passwordTemp: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  langue?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  siteId?: string | null;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
