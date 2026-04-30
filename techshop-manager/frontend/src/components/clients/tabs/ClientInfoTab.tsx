import { Link } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { cn, formatDate, initials } from '@/lib/utils';
import { ClientStatusBadge } from '@/components/clients/ClientStatusBadge';
import type { ClientDetail } from '@/lib/clients.api';

interface ClientInfoTabProps {
  client: ClientDetail;
}

function Field({
  label,
  value,
  mono = false,
  faded = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  faded?: boolean;
}) {
  return (
    <div className="rounded-xl bg-bg border border-border px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">{label}</p>
      <p className={cn('text-[13px] font-semibold', mono && 'font-mono', faded && 'text-text-muted italic')}>
        {value ?? <span className="text-text-muted italic font-normal">Non renseigné</span>}
      </p>
    </div>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function ClientInfoTab({ client }: ClientInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Deux colonnes desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Colonne gauche — Infos personnelles */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted px-1">
            Informations personnelles
          </p>
          <Field label="Prénom"           value={client.prenom} />
          <Field label="Nom"              value={client.nom} />
          <Field label="Téléphone"        value={client.telephone} mono />
          <Field label="Email"            value={client.email || undefined} />
          <Field label="Site d'inscription" value={client.site?.nom} />
          <Field label="Date d'inscription" value={formatDate(client.dateInscription)} />
        </div>

        {/* Colonne droite — Infos commerciales */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted px-1">
            Informations commerciales
          </p>

          {/* Code parrain + copier */}
          <div className="rounded-xl bg-bg border border-border px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Code parrain</p>
            {client.codeParrain ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold font-mono text-primary-accent">{client.codeParrain}</p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(client.codeParrain!)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-primary-accent hover:bg-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent"
                  aria-label="Copier le code parrain"
                  title="Copier"
                >
                  <Copy size={13} aria-hidden />
                </button>
              </div>
            ) : (
              <p className="text-[13px] text-text-muted italic font-normal">Non généré</p>
            )}
          </div>

          <Field label="Matricule externe"  value={client.matriculeExterne || undefined} mono />

          {/* Statut */}
          <div className="rounded-xl bg-bg border border-border px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">Statut du compte</p>
            <ClientStatusBadge statut={client.statut} />
          </div>

          <Field
            label="Date d'activation"
            value={client.dateActivation ? formatDate(client.dateActivation) : undefined}
          />

          {/* Parrain — lien cliquable */}
          <div className="rounded-xl bg-bg border border-border px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Parrain</p>
            {client.parrain ? (
              <Link
                to={`/clients/${client.parrain.id}`}
                className="flex items-center gap-2 group"
              >
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold bg-primary-light text-primary-accent"
                  aria-hidden
                >
                  {initials(client.parrain.nom, client.parrain.prenom)}
                </span>
                <span className="text-[13px] font-semibold text-primary-accent group-hover:underline">
                  {client.parrain.prenom} {client.parrain.nom}
                </span>
                <span className="text-[11px] font-mono text-text-muted">{client.parrain.codeParrain}</span>
              </Link>
            ) : (
              <p className="text-[13px] text-text-muted italic font-normal">Aucun parrain</p>
            )}
          </div>
        </div>
      </div>

      {/* Notes pleine largeur */}
      <div className="rounded-xl bg-bg border border-border px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Notes</p>
        {client.notes ? (
          <p className="text-[13px] text-text whitespace-pre-wrap leading-relaxed">{client.notes}</p>
        ) : (
          <p className="text-[13px] text-text-muted italic">Aucune note pour ce client.</p>
        )}
      </div>
    </div>
  );
}
