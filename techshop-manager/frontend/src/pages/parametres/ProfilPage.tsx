import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, KeyRound, CheckCircle, AlertCircle, RefreshCw, X,
  Save, Eye, EyeOff, Phone, Mail, Clock, Shield,
  Building2, Calendar, Activity, ChevronRight,
} from 'lucide-react';
import { useTutorialContext } from '@/components/tutorial/TutorialProvider';
import { usersApi } from '@/lib/settings.api';
import { useAuthStore } from '@/store/auth.store';
import { UserRoleBadge } from '@/components/settings/UserRoleBadge';
import type { AuthUser, Utilisateur } from '@/types';
import { cn, formatDate, formatRelative } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api';

// ── Schemas ────────────────────────────────────────────────────────
const profileSchema = z.object({
  nom: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide').or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Requis'),
  newPassword: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/^(?=.*[A-Z])(?=.*\d)/, 'Au moins une majuscule et un chiffre'),
  confirmPassword: z.string().min(1, 'Requis'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

type Tab = 'info' | 'securite';

// ── InlineAlert ────────────────────────────────────────────────────
function InlineAlert({ msg, ok, onDismiss }: { msg: string; ok: boolean; onDismiss: () => void }) {
  return (
    <div role="alert" className={cn(
      'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm',
      ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800',
    )}>
      {ok
        ? <CheckCircle size={15} className="flex-shrink-0 text-success" />
        : <AlertCircle size={15} className="flex-shrink-0 text-danger" />}
      <span className="flex-1 font-medium">{msg}</span>
      <button onClick={onDismiss} className="opacity-50 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}

// ── Password strength bar ──────────────────────────────────────────
function PasswordStrength({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  const checks = [
    { label: '8 car. min.', ok: pwd.length >= 8 },
    { label: 'Majuscule',   ok: /[A-Z]/.test(pwd) },
    { label: 'Chiffre',     ok: /\d/.test(pwd) },
    { label: 'Spécial',     ok: /[^A-Za-z0-9]/.test(pwd) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-danger', 'bg-warning', 'bg-amber-400', 'bg-success'];
  const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1 h-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'flex-1 rounded-full transition-all duration-300',
                i < score ? colors[score - 1] : 'bg-slate-200',
              )}
            />
          ))}
        </div>
        {score > 0 && (
          <span className={cn(
            'text-[10px] font-bold',
            score <= 1 ? 'text-danger' : score === 2 ? 'text-warning' : score === 3 ? 'text-amber-500' : 'text-success',
          )}>
            {labels[score]}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span key={c.label} className={cn(
            'text-[10px] flex items-center gap-1 transition-colors',
            c.ok ? 'text-success font-semibold' : 'text-text-subtle',
          )}>
            <span className={cn('inline-flex h-3 w-3 items-center justify-center rounded-full text-white',
              c.ok ? 'bg-success' : 'bg-slate-200',
            )}>
              {c.ok && <CheckCircle size={8} />}
            </span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── AvatarHero ─────────────────────────────────────────────────────
function AvatarHero({ user, me }: {
  user: AuthUser;
  me?: Utilisateur;
}) {
  const abbr = user.name?.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <div className="card overflow-hidden p-0">
      {/* Bandeau gradient */}
      <div
        className="h-24 w-full"
        style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2E86C1 50%, #1a5276 100%)' }}
      />

      <div className="px-6 pb-6">
        {/* Avatar flottant sur le bandeau */}
        <div className="-mt-10 flex items-end justify-between mb-4">
          <div className="relative">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white shadow-lg text-white font-black text-2xl select-none"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
            >
              {abbr}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-success shadow-sm">
              <CheckCircle size={12} className="text-white" />
            </div>
          </div>
          <UserRoleBadge role={user.role} className="mb-1" />
        </div>

        {/* Nom + infos */}
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-black text-primary leading-none">{user.name}</h2>
            {(me as any)?.telephone && (
              <p className="text-sm text-text-muted font-mono mt-1">{(me as any).telephone}</p>
            )}
          </div>

          {/* Méta-données */}
          <div className="space-y-2 pt-2 border-t border-border">
            {user.siteName && (
              <div className="flex items-center gap-2 text-[12px] text-text-muted">
                <Building2 size={13} className="text-primary-accent flex-shrink-0" />
                <span className="font-medium text-text">{user.siteName}</span>
              </div>
            )}
            {(me as any)?.derniereConnexion && (
              <div className="flex items-center gap-2 text-[12px] text-text-muted">
                <Clock size={13} className="text-text-subtle flex-shrink-0" />
                <span>Connexion {formatRelative((me as any).derniereConnexion)}</span>
              </div>
            )}
            {(me as any)?.createdAt && (
              <div className="flex items-center gap-2 text-[12px] text-text-muted">
                <Calendar size={13} className="text-text-subtle flex-shrink-0" />
                <span>Membre depuis {formatDate((me as any).createdAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── InfoItem ───────────────────────────────────────────────────────
function InfoItem({ icon: Icon, label, value, mono = false }: {
  icon: React.ElementType; label: string; value: React.ReactNode; mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/60 last:border-0">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-bg-inset">
        <Icon size={14} className="text-text-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">{label}</p>
        <p className={cn('text-[13px] font-semibold text-text mt-0.5 truncate', mono && 'font-mono')}>{value}</p>
      </div>
    </div>
  );
}

// ── ProfileInfoForm ────────────────────────────────────────────────
function ProfileInfoForm({ me }: { me: any }) {
  const qc = useQueryClient();
  const { user: authUser, setAuth, accessToken } = useAuthStore();
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: me
      ? { nom: me.nom, email: me.email ?? '' }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      usersApi.updateProfile({ ...data, email: data.email || undefined }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
      if (authUser && accessToken) setAuth({ ...authUser, name: updated.nom }, accessToken);
      setFeedback({ msg: 'Profil mis à jour avec succès', ok: true });
    },
    onError: (e) => setFeedback({ msg: getErrorMessage(e), ok: false }),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
      {/* Nom */}
      <div className="form-group">
        <label className="form-label" htmlFor="pf-nom">Nom complet</label>
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
          <input id="pf-nom" {...register('nom')} className="pl-9" placeholder="Votre nom complet" />
        </div>
        {errors.nom && <p className="form-error">{errors.nom.message}</p>}
      </div>

      {/* Email */}
      <div className="form-group">
        <label className="form-label" htmlFor="pf-email">
          Email <span className="text-text-subtle normal-case font-normal">(optionnel)</span>
        </label>
        <div className="relative">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
          <input id="pf-email" type="email" {...register('email')} className="pl-9" placeholder="votre@email.com" />
        </div>
        {errors.email && <p className="form-error">{errors.email.message}</p>}
      </div>

      {/* Téléphone (lecture seule) */}
      {me?.telephone && (
        <div className="form-group">
          <label className="form-label">Téléphone</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
            <div className="pl-9 flex items-center h-11 rounded-lg border border-border/50 bg-bg-inset text-[13px] font-mono text-text-muted cursor-not-allowed">
              {me.telephone}
              <span className="ml-auto pr-3 text-[10px] font-sans font-normal text-text-subtle italic">
                Non modifiable
              </span>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <InlineAlert msg={feedback.msg} ok={feedback.ok} onDismiss={() => setFeedback(null)} />
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          className="btn-primary"
          disabled={mutation.isPending || !isDirty}
        >
          {mutation.isPending
            ? <><RefreshCw size={14} className="animate-spin" /> Enregistrement…</>
            : <><Save size={14} /> Enregistrer</>}
        </button>
        {isDirty && !mutation.isPending && (
          <span className="text-[11px] text-text-subtle italic">Modifications non sauvegardées</span>
        )}
      </div>
    </form>
  );
}

// ── ChangePasswordForm ─────────────────────────────────────────────
function ChangePasswordForm() {
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const newPwd = watch('newPassword', '');

  const mutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      usersApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      reset();
      setFeedback({ msg: 'Mot de passe modifié avec succès', ok: true });
    },
    onError: (e) => setFeedback({ msg: getErrorMessage(e), ok: false }),
  });

  const PwdField = ({
    id, label, regKey, show, onToggle, autoComplete, hint,
  }: {
    id: string; label: string; regKey: 'currentPassword' | 'newPassword' | 'confirmPassword';
    show: boolean; onToggle: () => void; autoComplete: string; hint?: React.ReactNode;
  }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          {...register(regKey)}
          className="pl-9 pr-10"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors"
          tabIndex={-1}
          aria-label={show ? 'Masquer' : 'Afficher'}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {errors[regKey] && <p className="form-error">{errors[regKey]?.message}</p>}
      {hint}
    </div>
  );

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
      {/* Info sécurité */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
        <Shield size={16} className="text-success flex-shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-green-800">Connexion sécurisée</p>
          <p className="text-[11px] text-green-700 mt-0.5">Votre session est protégée par JWT + cookie httpOnly</p>
        </div>
      </div>

      <PwdField
        id="cp-current"
        label="Mot de passe actuel"
        regKey="currentPassword"
        show={showCurrent}
        onToggle={() => setShowCurrent(v => !v)}
        autoComplete="current-password"
      />

      <PwdField
        id="cp-new"
        label="Nouveau mot de passe"
        regKey="newPassword"
        show={showNew}
        onToggle={() => setShowNew(v => !v)}
        autoComplete="new-password"
        hint={<PasswordStrength pwd={newPwd} />}
      />

      <PwdField
        id="cp-confirm"
        label="Confirmer le nouveau mot de passe"
        regKey="confirmPassword"
        show={false}
        onToggle={() => {}}
        autoComplete="new-password"
      />

      {feedback && (
        <InlineAlert msg={feedback.msg} ok={feedback.ok} onDismiss={() => setFeedback(null)} />
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={mutation.isPending}
      >
        {mutation.isPending
          ? <><RefreshCw size={14} className="animate-spin" /> Modification…</>
          : <><KeyRound size={14} /> Changer le mot de passe</>}
      </button>
    </form>
  );
}

// ── ProfilPage ─────────────────────────────────────────────────────
export default function ProfilPage() {
  const { user: authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const tutorial = useTutorialContext();

  const { data: me, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.me(),
    enabled: !!authUser,
  });

  if (!authUser) return null;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'info',     label: 'Informations',  icon: User },
    { id: 'securite', label: 'Sécurité',       icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* En-tête page */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light" aria-hidden>
          <User size={20} className="text-primary-accent" />
        </div>
        <div>
          <h1 className="text-page-title text-primary">Mon profil</h1>
          <p className="text-xs text-text-muted mt-0.5">Gérer vos informations et votre sécurité</p>
        </div>
      </div>

      {/* Layout deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── Colonne gauche — carte profil ─────────────────────── */}
        <div className="space-y-4">
          {/* Hero card */}
          {isLoading ? (
            <div className="card animate-pulse space-y-4">
              <div className="skeleton h-24 w-full rounded-xl" />
              <div className="flex items-end gap-3">
                <div className="skeleton h-20 w-20 rounded-2xl -mt-10" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-5 w-3/4 rounded-full" />
                <div className="skeleton h-3.5 w-1/2 rounded-full" />
              </div>
            </div>
          ) : (
            <AvatarHero user={authUser} me={me} />
          )}

          {/* Informations détaillées */}
          <div className="card py-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-subtle px-1 pb-1">Compte</h3>
            <InfoItem icon={User}     label="Nom"       value={me?.nom ?? authUser.name ?? '—'} />
            <InfoItem icon={Phone}    label="Téléphone" value={me?.telephone ?? '—'} mono />
            {me?.email && <InfoItem icon={Mail} label="Email" value={me.email} />}
          </div>

          {/* Accès rapide */}
          <div className="card py-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-subtle px-1 pb-1">Accès</h3>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className="flex w-full items-center gap-2 py-2.5 text-[13px] text-text-muted hover:text-primary-accent transition-colors group"
            >
              <User size={14} className="flex-shrink-0" />
              <span className="flex-1 text-left">Modifier le profil</span>
              <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('securite')}
              className="flex w-full items-center gap-2 py-2.5 text-[13px] text-text-muted hover:text-primary-accent transition-colors group border-t border-border/50"
            >
              <KeyRound size={14} className="flex-shrink-0" />
              <span className="flex-1 text-left">Changer le mot de passe</span>
              <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('securite')}
              className="flex w-full items-center gap-2 py-2.5 text-[13px] text-text-muted hover:text-primary-accent transition-colors group border-t border-border/50"
            >
              <Activity size={14} className="flex-shrink-0" />
              <span className="flex-1 text-left">Sécurité du compte</span>
              <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* ── Colonne droite — formulaires avec onglets ─────────── */}
        <div className="lg:col-span-2 space-y-0">
          {/* Onglets */}
          <div className="flex border-b border-border bg-white rounded-t-xl overflow-hidden">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold transition-all border-b-2 -mb-px',
                  activeTab === id
                    ? 'border-primary-accent text-primary-accent'
                    : 'border-transparent text-text-muted hover:text-text hover:border-border',
                )}
                aria-selected={activeTab === id}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Contenu de l'onglet */}
          <div className="card rounded-tl-none rounded-tr-none border-t-0 pt-6">
            {activeTab === 'info' && (
              <>
                <div className="mb-5">
                  <h2 className="font-bold text-primary">Informations personnelles</h2>
                  <p className="text-[12px] text-text-muted mt-0.5">
                    Ces informations sont visibles uniquement par les administrateurs.
                  </p>
                </div>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="skeleton h-3 w-24 rounded-full animate-pulse" />
                        <div className="skeleton h-11 w-full rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ProfileInfoForm me={me} />
                )}
              </>
            )}

            {activeTab === 'securite' && (
              <>
                <div className="mb-5">
                  <h2 className="font-bold text-primary">Sécurité du compte</h2>
                  <p className="text-[12px] text-text-muted mt-0.5">
                    Modifiez votre mot de passe régulièrement pour protéger votre compte.
                  </p>
                </div>
                <ChangePasswordForm />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Aide et tutoriel */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm mt-6">
        <h3 className="text-sm font-semibold text-text mb-1">Aide et tutoriel</h3>
        <div className="h-px bg-border mb-4" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted">
              Revoyez les fonctionnalités de votre espace de travail à votre rythme.
            </p>
            <p className="text-xs text-text-muted mt-1">Durée : ~ 8 minutes</p>
          </div>
          <button
            data-tutorial="profile-btn-restart-tutorial"
            onClick={() => tutorial.restart()}
            className="flex items-center gap-2 rounded-lg border border-primary-accent px-4 py-2 text-sm font-medium text-primary-accent hover:bg-primary-light transition-colors flex-shrink-0"
          >
            ▶ Relancer le tutoriel guidé
          </button>
        </div>
      </div>
    </div>
  );
}
