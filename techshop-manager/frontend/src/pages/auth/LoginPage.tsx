import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Wifi, WifiOff, ShoppingCart, Users, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';
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
    case 'GERANT':       return '/dashboard';
    case 'DIRECTEUR_REGIONAL': return '/dashboard/regional';
    case 'AGENT':        return '/sales/pos';
    case 'FORMATEUR':    return '/clients';
    case 'CLIENT':       return '/portal/home';
    default:             return '/dashboard';
  }
}

export default function LoginPage() {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnline      = useOnlineStatus();
  const { setAuth, loginAttempts, lockedUntil, incrementAttempts, resetAttempts, setLockedUntil } =
    useAuthStore();

  const [identifier,    setIdentifier]    = useState('');
  const [password,      setPassword]      = useState('');
  const [rememberMe,    setRememberMe]     = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [errorMsg,      setErrorMsg]      = useState('');
  const [lockCountdown, setLockCountdown] = useState('');

  const identifierRef  = useRef<HTMLInputElement>(null);
  const lockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const identifierFormat = detectFormat(identifier);
  const isLocked  = lockedUntil !== null && lockedUntil > new Date();
  const isDisabled = isLoading || isLocked;
  const canSubmit  = identifier.trim().length > 0 && password.length > 0 && !isDisabled;

  useEffect(() => {
    if (!isLocked || !lockedUntil) {
      setLockCountdown('');
      if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
      return;
    }
    const update = () => {
      const remaining = Math.max(0, lockedUntil.getTime() - Date.now());
      if (remaining <= 0) {
        resetAttempts(); setLockCountdown('');
        if (lockIntervalRef.current) clearInterval(lockIntervalRef.current);
        return;
      }
      const m = Math.floor(remaining / 60000).toString().padStart(2, '0');
      const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
      setLockCountdown(`${m}:${s}`);
    };
    update();
    lockIntervalRef.current = setInterval(update, 1000);
    return () => { if (lockIntervalRef.current) clearInterval(lockIntervalRef.current); };
  }, [isLocked, lockedUntil, resetAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true); setErrorMsg('');
    try {
      const { data } = await authApi.login({ identifier, password, rememberMe });
      const { user, accessToken } = data;
      setAuth(user, accessToken);
      toast.success(`Bienvenue, ${user.name} !`);
      const redirect = searchParams.get('redirect');
      navigate(redirect ?? getRoleRedirect(user.role), { replace: true });
    } catch (error: unknown) {
      const axErr = error as { response?: { status?: number; data?: { error?: { attemptsLeft?: number; unlocksAt?: string } } } };
      const status = axErr?.response?.status;
      if (status === 401) {
        incrementAttempts(); setPassword('');
        setTimeout(() => identifierRef.current?.focus(), 50);
        const attemptsLeft = axErr.response?.data?.error?.attemptsLeft;
        if (loginAttempts + 1 >= MAX_ATTEMPTS) {
          setLockedUntil(new Date(Date.now() + 15 * 60 * 1000));
          setErrorMsg('Compte temporairement bloqué.');
        } else {
          const rem = attemptsLeft ?? MAX_ATTEMPTS - (loginAttempts + 1);
          setErrorMsg(`Identifiant ou mot de passe incorrect — ${rem} tentative${rem > 1 ? 's' : ''} restante${rem > 1 ? 's' : ''}`);
        }
      } else if (status === 423) {
        const unlocksAt = axErr.response?.data?.error?.unlocksAt;
        if (unlocksAt) setLockedUntil(new Date(unlocksAt));
        setErrorMsg('Compte temporairement bloqué.');
      } else {
        toast.error(getErrorMessage(error) || 'Serveur inaccessible. Vérifiez votre connexion.');
      }
    } finally { setIsLoading(false); }
  };

  // Input glass — posé directement sur fond sombre
  const glassInput = (hasErr = false) => cn(
    'w-full bg-white/[0.07] border rounded-xl px-4 py-3.5 text-[14px] text-white',
    'placeholder:text-white/25 caret-primary-accent',
    'focus:outline-none focus:bg-white/[0.11] transition duration-150',
    hasErr
      ? 'border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/15'
      : 'border-white/[0.10] focus:border-primary-accent/70 focus:ring-2 focus:ring-primary-accent/15',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  );

  const identifierHasErr = identifier.length > 3 && identifierFormat === 'unknown';

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#0A1628' }}
    >
      {/* Fond texturé — grille de points subtile */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />
      {/* Halo bleu bas-gauche */}
      <div
        className="fixed bottom-0 left-0 pointer-events-none"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 65%)',
          transform: 'translate(-30%, 30%)',
        }}
        aria-hidden
      />

      {/* ── Bandeau hors-ligne ─────────────────────────────────────── */}
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-warning py-2 text-white text-[12px] font-bold">
          <WifiOff size={12} aria-hidden />
          Mode hors-ligne — Données de la dernière session utilisées
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          Layout 2 colonnes sur desktop, empilement sur mobile
      ════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full">

        {/* ── Colonne gauche : identité ──────────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between w-[400px] xl:w-[460px] flex-shrink-0 px-12 py-14 border-r border-white/[0.06]">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-3 mb-16">
              <img src="/assets/Progress business logo.png" alt="Progress Business" className="h-16 w-16 rounded-xl object-contain flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold tracking-[0.25em] text-white/30 uppercase">Progress Business</p>
                <p className="text-[15px] font-black text-white tracking-tight leading-none">MANAGER</p>
              </div>
            </div>

            {/* Accroche */}
            <h2 className="text-[40px] xl:text-[46px] font-black text-white leading-[1.08] tracking-[-0.03em]">
              Gestion<br />commerciale<br />
              <span className="text-primary-accent">centralisée.</span>
            </h2>
            <p className="mt-4 text-[13px] text-white/40 leading-relaxed max-w-[280px]">
              Caisse, clients, stocks et parrainage —
              en un seul outil, même sans réseau.
            </p>
          </div>

          {/* Capacités */}
          <div className="space-y-2.5">
            {([
              { Icon: ShoppingCart, label: 'Caisse POS offline-first',           sub: 'Vente en < 90 secondes' },
              { Icon: Users,        label: 'Onboarding clients en 4 étapes',      sub: 'Récit · Formation · Fiche · Activation' },
              { Icon: BarChart3,    label: 'Rapports multi-sites',                sub: 'Goma · Bukavu · Kinshasa' },
            ] as const).map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-accent/15">
                  <Icon size={14} className="text-primary-accent" aria-hidden />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white/80">{label}</p>
                  <p className="text-[11px] text-white/30">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pied */}
          <p className="text-[11px] text-white/20">v1.0 · Progress Business RDC © 2025</p>
        </div>

        {/* ── Colonne droite : formulaire ────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-14 lg:px-16 xl:px-24">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10 self-start">
            <img src="/assets/Progress business logo.png" alt="Progress Business" className="h-14 w-14 rounded-xl object-contain flex-shrink-0" />
            <p className="text-[14px] font-black text-white tracking-tight">PROGRESS BUSINESS</p>
          </div>

          <div className="w-full max-w-[400px]">

            {/* Titre section */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-black text-white tracking-tight leading-tight">Connexion</h1>
                <p className="text-[13px] text-white/35 mt-1">
                  Entrez vos identifiants pour continuer.
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 mt-1',
                  isOnline
                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
                )}
              >
                {isOnline ? <Wifi size={10} aria-hidden /> : <WifiOff size={10} aria-hidden />}
                {isOnline ? 'En ligne' : 'Hors-ligne'}
              </span>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Identifiant */}
              <div className="space-y-1.5">
                <label
                  htmlFor="identifier"
                  className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/40"
                >
                  Téléphone ou Email
                </label>
                <input
                  id="identifier"
                  ref={identifierRef}
                  type="text"
                  autoComplete="username"
                  placeholder="+243 8XX XXX XXX"
                  disabled={isDisabled}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={glassInput(identifierHasErr)}
                />
                {identifier.length > 3 && identifierFormat !== 'empty' && (
                  <p className={cn(
                    'text-[11px] font-medium',
                    identifierFormat === 'unknown' ? 'text-red-400' : 'text-green-400',
                  )}>
                    {identifierFormat === 'unknown'
                      ? '✗ Format non reconnu'
                      : `✓ ${identifierFormat === 'phone' ? 'Téléphone' : 'Email'} reconnu`}
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/40"
                  >
                    Mot de passe
                  </label>
                  <a
                    href="/reset-password"
                    className="text-[12px] font-semibold text-primary-accent hover:text-blue-400 transition-colors"
                  >
                    Oublié ?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isDisabled}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(glassInput(), 'pr-12')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  </button>
                </div>
              </div>

              {/* Se souvenir */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isDisabled}
                    className="peer sr-only"
                  />
                  <div className={cn(
                    'w-4 h-4 rounded border transition-colors',
                    rememberMe
                      ? 'bg-primary-accent border-primary-accent'
                      : 'bg-white/[0.07] border-white/[0.15] group-hover:border-white/30',
                  )} />
                  {rememberMe && (
                    <svg
                      className="absolute inset-0 m-auto w-2.5 h-2.5 text-white pointer-events-none"
                      viewBox="0 0 10 10" fill="none" aria-hidden
                    >
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-white/35 group-hover:text-white/55 transition-colors select-none">
                  Se souvenir de moi
                </span>
              </label>

              {/* Erreur */}
              {errorMsg && (
                <div
                  className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3.5"
                  role="alert"
                >
                  <p className="text-[13px] font-semibold text-red-400">{errorMsg}</p>
                  {isLocked && lockCountdown && (
                    <p className="mt-2 text-[24px] font-black font-mono text-red-400 tabular-nums">
                      {lockCountdown}
                    </p>
                  )}
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  'w-full py-3.5 rounded-xl text-[14px] font-bold tracking-wide mt-1',
                  'bg-primary-accent text-white',
                  'shadow-[0_0_32px_rgba(37,99,235,0.35)]',
                  'hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.50)]',
                  'active:scale-[0.99] transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1628]',
                  'flex items-center justify-center gap-2',
                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100',
                )}
              >
                {isLoading
                  ? <><Loader2 size={16} className="animate-spin" aria-hidden />Connexion en cours…</>
                  : 'Se connecter'
                }
              </button>
            </form>

            {/* Continuer hors-ligne */}
            {!isOnline && (
              <div className="mt-6 pt-5 border-t border-white/[0.07] text-center">
                <button
                  type="button"
                  className="text-[12px] font-semibold text-primary-accent hover:text-blue-400 transition-colors"
                  onClick={() => toast.error('Aucune session locale disponible.')}
                >
                  Continuer sans connexion →
                </button>
              </div>
            )}

            {/* Version mobile */}
            <p className="lg:hidden text-center text-[11px] text-white/15 mt-8">
              v1.0 · Progress Business RDC © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
