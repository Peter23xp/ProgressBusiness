import {
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NiveauConfigDto {
  // Frontend envoie "niveau" (ex: "ARGENT"), backend stocke "nom"
  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  niveau?: string;

  // Frontend envoie "seuilMin", backend stocke "seuilPts"
  @IsNumber()
  @Min(0)
  @IsOptional()
  seuilPts?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  seuilMin?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  remisePct: number;
}

export class ConfigFideliteDto {
  @IsNumber()
  @Min(1)
  ratioPtsCDF: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NiveauConfigDto)
  niveaux: NiveauConfigDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  dureeValiditeMois?: number;

  @IsOptional()
  @IsBoolean()
  cumulRemises?: boolean;
}
