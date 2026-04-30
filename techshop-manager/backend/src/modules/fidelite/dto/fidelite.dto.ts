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
  @IsString()
  nom: string;

  @IsNumber()
  @Min(0)
  seuilPts: number;

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

  @IsBoolean()
  cumulRemises: boolean;
}
