import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Paperclip, X, Loader2, SendHorizonal, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { supportApi } from '@/lib/support.api';
import { cn } from '@/lib/utils';

const TICKET_TYPES = [
  { value: 'BUG',        label: 'Bug / Erreur' },
  { value: 'SUGGESTION', label: 'Suggestion' },
  { value: 'QUESTION',   label: 'Question' },
  { value: 'CONFIG',     label: 'Configuration' },
  { value: 'URGENCE',    label: 'Urgence' },
] as const;

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN:         'Super Admin',
  DIRECTEUR_REGIONAL:  'Directeur Régional',
  GERANT:              'Gérant',
  AGENT:               'Agent',
  FORMATEUR:           'Formateur',
  CLIENT:              'Client',
};

const schema = z.object({
  nom:         z.string().min(1, 'Requis').max(100),
  email:       z.string().email('Email invalide'),
  siteNom:     z.string().min(1, 'Requis').max(100),
  role:        z.string().min(1, 'Requis'),
  type:        z.enum(['BUG', 'SUGGESTION', 'QUESTION', 'CONFIG', 'URGENCE']),
  sujet:       z.string().min(5, 'Min 5 caractères').max(200),
  description: z.string().min(20, 'Min 20 caractères').max(5000),
  systemInfo:  z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

export function SupportForm() {
  const { user } = useAuthStore();
  const fileRef  = useRef<HTMLInputElement>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const defaultValues: Partial<FormValues> = {
    nom:     user?.name ?? '',
    email:   '',
    siteNom: user?.siteName ?? user?.site?.nom ?? '',
    role:    user?.role ? (ROLE_LABELS[user.role] ?? user.role) : '',
    type:    'QUESTION',
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      supportApi.createTicket({
        ...values,
        screenshot: screenshot ?? undefined,
      }),
    onSuccess: (data) => {
      setSubmitted(data.ticketRef);
      reset(defaultValues);
      setScreenshot(null);
    },
    onError: () => toast.error('Erreur lors de l\'envoi. Veuillez réessayer.'),
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-8 px-4 space-y-4">
        <CheckCircle2 size={56} className="text-success" aria-hidden />
        <div>
          <p className="text-[16px] font-bold text-primary">Ticket envoyé !</p>
          <p className="text-[13px] text-text-muted mt-1">
            Votre demande a été enregistrée sous la référence{' '}
            <span className="font-mono font-bold text-primary">{submitted}</span>.
          </p>
          <p className="text-[12px] text-text-muted mt-1">
            Vous recevrez une réponse par email dans les meilleurs délais.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(null)}
          className="btn-secondary text-[13px]"
        >
          Nouveau ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label" htmlFor="sf-nom">Nom complet</label>
          <input id="sf-nom" {...register('nom')} className={cn(errors.nom && 'border-danger')} />
          {errors.nom && <p className="form-error">{errors.nom.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="sf-email">Email</label>
          <input id="sf-email" type="email" {...register('email')} className={cn(errors.email && 'border-danger')} />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label" htmlFor="sf-site">Site</label>
          <input id="sf-site" {...register('siteNom')} className={cn(errors.siteNom && 'border-danger')} />
          {errors.siteNom && <p className="form-error">{errors.siteNom.message}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="sf-role">Rôle</label>
          <input id="sf-role" {...register('role')} className={cn(errors.role && 'border-danger')} />
          {errors.role && <p className="form-error">{errors.role.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="sf-type">Type de demande</label>
        <select id="sf-type" {...register('type')} className={cn(errors.type && 'border-danger')}>
          {TICKET_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {errors.type && <p className="form-error">{errors.type.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="sf-sujet">Sujet</label>
        <input
          id="sf-sujet"
          placeholder="Résumé bref du problème ou de la demande"
          {...register('sujet')}
          className={cn(errors.sujet && 'border-danger')}
        />
        {errors.sujet && <p className="form-error">{errors.sujet.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="sf-desc">Description détaillée</label>
        <textarea
          id="sf-desc"
          rows={5}
          placeholder="Décrivez le problème en détail : étapes pour reproduire, comportement attendu, comportement observé…"
          {...register('description')}
          className={cn('resize-y', errors.description && 'border-danger')}
        />
        {errors.description && <p className="form-error">{errors.description.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="sf-sys">
          Informations système{' '}
          <span className="text-[11px] font-normal text-text-muted">(optionnel)</span>
        </label>
        <textarea
          id="sf-sys"
          rows={2}
          placeholder="Navigateur, OS, version, message d'erreur exact…"
          {...register('systemInfo')}
          className="resize-y font-mono text-[12px]"
        />
      </div>

      {/* Capture d'écran */}
      <div className="form-group">
        <label className="form-label">
          Capture d'écran{' '}
          <span className="text-[11px] font-normal text-text-muted">(optionnel, max 5 Mo)</span>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && f.size > 5 * 1024 * 1024) {
              toast.error('Fichier trop volumineux (max 5 Mo).');
              return;
            }
            setScreenshot(f ?? null);
          }}
        />
        {screenshot ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-slate-50 px-3 py-2">
            <Paperclip size={13} className="text-text-muted flex-shrink-0" aria-hidden />
            <span className="text-[12px] text-text truncate flex-1">{screenshot.name}</span>
            <button
              type="button"
              onClick={() => { setScreenshot(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="text-text-muted hover:text-danger transition-colors"
              aria-label="Supprimer la capture"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-slate-50 px-4 py-3 text-[13px] text-text-muted hover:border-primary-accent hover:text-primary-accent transition-colors w-full justify-center"
          >
            <Paperclip size={14} aria-hidden />
            Joindre une capture d'écran
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="btn-primary w-full text-[14px] py-3 flex items-center justify-center gap-2"
      >
        {mutation.isPending
          ? <><Loader2 size={15} className="animate-spin" aria-hidden /> Envoi en cours…</>
          : <><SendHorizonal size={15} aria-hidden /> Envoyer le ticket</>
        }
      </button>

      <p className="text-[11px] text-text-muted text-center">
        Limite : 3 tickets par minute. Réponse sous 24–48 h les jours ouvrés.
      </p>
    </form>
  );
}
