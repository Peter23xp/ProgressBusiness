import {
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsDateString,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EntreeStockDto {
  @IsString()
  @IsNotEmpty()
  siteId: string;

  @IsString()
  @IsNotEmpty()
  produitId: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantite: number;

  @IsOptional()
  @IsString()
  referenceFournisseur?: string;

  @IsDateString()
  dateReception: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class TransfertDto {
  @IsString()
  @IsNotEmpty()
  siteSourceId: string;

  @IsString()
  @IsNotEmpty()
  siteDestinationId: string;

  @IsString()
  @IsNotEmpty()
  produitId: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantite: number;

  @IsOptional()
  @IsString()
  motif?: string;
}

export class ReceptionTransfertDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantiteRecue: number;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class UpdateSeuilDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  seuilAlerte: number;
}

export class LigneInventaireDto {
  @IsString()
  @IsNotEmpty()
  produitId: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantiteComptee: number;
}

export class InventaireDto {
  @IsString()
  @IsNotEmpty()
  siteId: string;

  @IsDateString()
  dateInventaire: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LigneInventaireDto)
  lignes: LigneInventaireDto[];
}
