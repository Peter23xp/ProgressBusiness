import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; role: string; siteId?: string }) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: payload.sub },
      select: { id: true, nom: true, role: true, siteId: true, actif: true },
    });

    if (!user || !user.actif) {
      throw new UnauthorizedException({ code: 'ERR_UNAUTHORIZED', message: 'Compte inactif ou introuvable' });
    }

    return user;
  }
}
