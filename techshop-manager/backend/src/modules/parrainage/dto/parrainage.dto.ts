import {
  IsEnum,
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { TypeRecompense } from '@prisma/client';

export class ConfigParrainageDto {
  @IsEnum(TypeRecompense)
  typeRecompense: TypeRecompense;

  @IsNumber()
  @Min(0)
  valeurNiveau1: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valeurNiveau2?: number;

  @IsBoolean()
  multiNiveaux: boolean;

  @IsString()
  conditionDeclenchement: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  plafondMensuel?: number;
}

export class CheckCodeDto {
  @IsString()
  code: string;
}
