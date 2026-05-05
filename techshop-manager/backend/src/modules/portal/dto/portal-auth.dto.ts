import { IsString, Matches, Length } from 'class-validator';

export class PortalLoginDto {
  @IsString()
  @Matches(/^\+243\d{9}$/, { message: 'Format téléphone invalide (+243XXXXXXXXX)' })
  telephone: string;

  @IsString()
  @Length(4, 4, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  @Matches(/^\d{4}$/, { message: 'Le PIN doit être numérique' })
  pin: string;
}

export class SetPinDto {
  @IsString()
  @Length(4, 4, { message: 'Le PIN doit contenir exactement 4 chiffres' })
  @Matches(/^\d{4}$/, { message: 'Le PIN doit être numérique' })
  pin: string;

  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  confirmPin: string;
}
