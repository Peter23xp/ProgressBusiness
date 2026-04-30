import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { Role } from '@/types';

const PHONE_RE = /^(\+243|0)[0-9]{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTEMPTS = 5;

function detectFormat(value: string): 'phone' | 'email' | 'unknown' | 'empty' {
  if (!value) return 'empty';
  if (PHONE_RE.test(value)) return 'phone';
  if (EMAIL_RE.test(value)) return 'email';
  return 'unknown';
}

function getRoleRedirect(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'GERANT':
      return '/dashboard';
    case 'DIRECTEUR_REGIONAL':
      return '/dashboard/regional';
    case 'AGENT':
      return '/sales/pos';
    case 'FORMATEUR':
      return '/clients';
    case 'CLIENT':
      return '/portal/home';
    default:
      return '/dashboard';
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnline = useOnlineStatus();
  const { setAuth, loginAttempts, lockedUntil, incrementAttempts, resetAttempts, setLockedUntil } =
    useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockCountdown, setLockCountdown] = useState('');

  const identifierRef = useRef<HTMLInputElement>(null);
  const lockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const identifierFormat = detectFormat(identifier);
  const isLocked = lockedUntil !== null && lockedUntil > new Date();
  const isDisabled = isLoading || isLocked;
  const canSubmit = identifier.trim().length > 0 && password.length > 0 && !isDisabled;

  // Lockout countdown
  useEffect(() => {
    if (!isLocked || !lockedUntil) {
      setLockCountdown('');
      if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, lockedUntil.getTime() - Date.now());
      if (remaining <= 0) {
        resetAttempts();
        setLockCountdown('');
        if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
        return;
      }
      const m = Math.floor(remaining / 60000).toString().padStart(2, '0');
      const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
      setLockCountdown(`${m}:${s}`);
    };

    update();
    lockIntervalRef.current = setInterval(update, 1000);
    return () => {
      if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
    };
  }, [isLocked, lockedUntil, resetAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data } = await authApi.login({ identifier, password, rememberMe });
      const { user, accessToken } = data;
      setAuth(user, accessToken);
      toast.success(`Bienvenue, ${user.name} !`);

      const redirect = searchParams.get('redirect');
      navigate(redirect ?? getRoleRedirect(user.role), { replace: true });
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { error?: { attemptsLeft?: number; unlocksAt?: string } } } };
      const status = axiosError?.response?.status;

      if (status === 401) {
        const attemptsLeft = axiosError.response?.data?.error?.attemptsLeft;
        incrementAttempts();
        setPassword('');
        setTimeout(() => identifierRef.current?.focus(), 50);

        if (loginAttempts + 1 >= MAX_ATTEMPTS) {
          const until = new Date(Date.now() + 15 * 60 * 1000);
          setLockedUntil(until);
          setErrorMsg('Compte temporairement bloqué.');
        } else {
          const remaining = attemptsLeft ?? MAX_ATTEMPTS - (loginAttempts + 1);
          setErrorMsg(
            `Identifiant ou mot de passe incorrect. Tentative ${loginAttempts + 1} / ${MAX_ATTEMPTS} (${remaining} restante(s))`,
          );
        }
      } else if (status === 423) {
        const unlocksAt = axiosError.response?.data?.error?.unlocksAt;
        if (unlocksAt) setLockedUntil(new Date(unlocksAt));
        setErrorMsg('Compte temporairement bloqué.');
      } else {
        toast.error(getErrorMessage(error) || 'Serveur inaccessible. Vérifiez votre connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-default flex items-center justify-center p-4">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-yellow-900 text-center py-2 text-sm font-semibold flex items-center justify-center gap-2 z-50">
          <WifiOff size={14} />
          Mode hors-ligne — Données de la dernière session utilisées
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4 bg-primary">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#1E3A5F" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="24" cy="22" r="4" fill="#2E86C1" />
              <path d="M22.5 22l1 1 2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-primary tracking-tight">TECHSHOP MANAGER</h1>
          <p className="text-text-muted mt-1 text-sm">Système de Gestion Commercial — Goma, RDC</p>
        </div>

        {/* Card */}
        <div className="bg-bg-card rounded-2xl shadow-lg p-8">
          {/* Online badge */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-default">Connexion</h2>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                isOnline
                  ? 'bg-green-100 text-success'
                  : 'bg-red-100 text-danger'
              }`}
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'En ligne' : 'Hors-ligne'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Identifier */}
            <div>
              <label className="form-label" htmlFor="identifier">
                Téléphone ou Email
              </label>
              <input
                id="identifier"
                ref={identifierRef}
                type="text"
                autoComplete="username"
                placeholder="+243 8XX XXX XXX ou email@techshop.cd"
                disabled={isDisabled}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent transition disabled:opacity-50 border-gray-300"
              />
              {identifier.length > 3 && identifierFormat !== 'empty' && (
                <p
                  className={`text-xs mt-1 ${
                    identifierFormat === 'unknown' ? 'text-danger' : 'text-success'
                  }`}
                >
                  {identifierFormat === 'unknown'
                    ? 'Format non reconnu'
                    : `Format reconnu : ${identifierFormat === 'phone' ? 'Téléphone' : 'Email'}`}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isDisabled}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent transition disabled:opacity-50 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isDisabled}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-text-muted">Se souvenir de moi</span>
              </label>
              <a
                href="/reset-password"
                className="text-sm text-primary-accent hover:underline font-medium"
              >
                Mot de passe oublié ?
              </a>
            </div>

            {/* Error block */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-danger text-sm" role="alert">
                <p>{errorMsg}</p>
                {isLocked && lockCountdown && (
                  <p className="mt-1 font-bold">Réessayez dans {lockCountdown}</p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary w-full py-3 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'SE CONNECTER'
              )}
            </button>
          </form>

          {/* Offline continue */}
          {!isOnline && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-primary-accent hover:underline"
                onClick={() => toast.error('Aucune session locale disponible.')}
              >
                Continuer sans connexion
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          v1.0 — TechShop © 2025
        </p>
      </div>
    </div>
  );
}
