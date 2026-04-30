import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/login.dto';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  // In-memory stores (use Redis in production)
  private otpStore = new Map<string, { otpHash: string; expiresAt: Date; attempts: number }>();
  private resetTokenStore = new Map<string, { phone: string; expiresAt: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ telephone: dto.identifier }, { email: dto.identifier }] },
      include: { site: { select: { id: true, nom: true } } },
    });

    if (!user) {
      throw new UnauthorizedException({
        error: { code: 'INVALID_CREDENTIALS', message: 'Téléphone ou mot de passe incorrect' },
      });
    }

    if (user.bloqueJusquA && user.bloqueJusquA > new Date()) {
      throw new UnauthorizedException({
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Compte bloqué',
          unlocksAt: user.bloqueJusquA.toISOString(),
        },
      });
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      const attempts = user.tentativesConnexion + 1;
      const bloqueJusquA =
        attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60000) : null;
      await this.prisma.utilisateur.update({
        where: { id: user.id },
        data: { tentativesConnexion: attempts, bloqueJusquA: bloqueJusquA },
      });
      throw new UnauthorizedException({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Téléphone ou mot de passe incorrect',
          attemptsLeft: MAX_ATTEMPTS - attempts,
        },
      });
    }

    await this.prisma.utilisateur.update({
      where: { id: user.id },
      data: { tentativesConnexion: 0, bloqueJusquA: null, derniereConnexion: new Date() },
    });

    const payload = { sub: user.id, role: user.role, siteId: user.siteId };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '8h'),
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: dto.rememberMe ? '30d' : '7d',
    });

    return {
      accessToken,
      refreshToken, // stripped from response body in controller; set as httpOnly cookie
      user: {
        id: user.id,
        role: user.role,
        name: user.nom,
        siteId: user.siteId ?? null,
        siteName: user.site?.nom ?? null,
      },
    };
  }

  async refreshToken(token: string | undefined) {
    if (!token) {
      throw new UnauthorizedException({
        error: { code: 'REFRESH_TOKEN_INVALID', message: 'Refresh token manquant' },
      });
    }
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      }) as { sub: string; role: string; siteId?: string };

      const accessToken = this.jwt.sign(
        { sub: payload.sub, role: payload.role, siteId: payload.siteId },
        { expiresIn: this.config.get('JWT_EXPIRES_IN', '8h') },
      );
      return { accessToken, newRefreshToken: null };
    } catch {
      throw new UnauthorizedException({
        error: { code: 'REFRESH_TOKEN_INVALID', message: 'Refresh token invalide ou expiré' },
      });
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { telephone: dto.phone },
    });
    if (!user) {
      throw new NotFoundException({
        error: { code: 'PHONE_NOT_FOUND', message: 'Aucun compte trouvé pour ce numéro' },
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60000);
    this.otpStore.set(dto.phone, { otpHash, expiresAt, attempts: 0 });

    // Log OTP in dev; replace with Africa's Talking SMS in production
    console.log(`[DEV SMS OTP] ${dto.phone}: ${otp}`);

    const maskedPhone =
      dto.phone.slice(0, 7) + ' *** ' + dto.phone.slice(-4);

    return { success: true, maskedPhone, expiresIn: 600, retryAfter: 120 };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const entry = this.otpStore.get(dto.phone);

    if (!entry || entry.expiresAt < new Date()) {
      this.otpStore.delete(dto.phone);
      throw new BadRequestException({
        error: { code: 'OTP_EXPIRED', message: 'Code OTP expiré. Demandez un nouveau code.' },
      });
    }

    if (entry.attempts >= 3) {
      this.otpStore.delete(dto.phone);
      throw new BadRequestException({
        error: {
          code: 'TOO_MANY_OTP_ATTEMPTS',
          message: 'Trop de tentatives invalides. Recommencez.',
        },
      });
    }

    const valid = await bcrypt.compare(dto.otp, entry.otpHash);
    if (!valid) {
      this.otpStore.set(dto.phone, { ...entry, attempts: entry.attempts + 1 });
      throw new BadRequestException({
        error: {
          code: 'INVALID_OTP',
          message: 'Code incorrect.',
          attemptsLeft: 3 - (entry.attempts + 1),
        },
      });
    }

    this.otpStore.delete(dto.phone);

    const resetToken = crypto.randomUUID();
    this.resetTokenStore.set(resetToken, {
      phone: dto.phone,
      expiresAt: new Date(Date.now() + 10 * 60000),
    });

    return { success: true, resetToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const entry = this.resetTokenStore.get(dto.resetToken);

    if (!entry || entry.expiresAt < new Date()) {
      this.resetTokenStore.delete(dto.resetToken);
      throw new BadRequestException({
        error: {
          code: 'RESET_TOKEN_EXPIRED',
          message: 'Session expirée. Recommencez la réinitialisation.',
        },
      });
    }

    const user = await this.prisma.utilisateur.findFirst({
      where: { telephone: entry.phone },
    });
    if (!user) {
      throw new NotFoundException({
        error: { code: 'ERR_NOT_FOUND', message: 'Utilisateur introuvable' },
      });
    }

    const sameAsOld = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (sameAsOld) {
      throw new BadRequestException({
        error: {
          code: 'PASSWORD_ALREADY_USED',
          message: 'Ce mot de passe a déjà été utilisé. Choisissez-en un nouveau.',
        },
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.utilisateur.update({
      where: { id: user.id },
      data: { passwordHash, tentativesConnexion: 0, bloqueJusquA: null },
    });

    this.resetTokenStore.delete(dto.resetToken);

    return { success: true, message: 'Mot de passe mis à jour avec succès.' };
  }
}
