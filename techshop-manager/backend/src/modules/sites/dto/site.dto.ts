import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  nom: string;

  @IsString()
  ville: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  gerantId?: string;
}

export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  gerantId?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
