import { Link } from 'react-router-dom';
import { Copy, GitBranch } from 'lucide-react';
import { cn, formatDate, initials } from '@/lib/utils';
import { ClientStatusBadge } from '@/components/clients/ClientStatusBadge';
import type { ClientDetail } from '@/lib/clients.api';

interface ClientParrainageTabProps {
  client: ClientDetail;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function ClientParrainageTab({ client }: ClientParrainageTabProps) {
  const filleuls = client.parrainage?.filleuls ?? [];
  const totalGains = client.parrainage?.totalGains ?? 0;

  const nbActifs   = filleuls.filter((f) => f.statut === 'ACTIF').length;
  const nbEnCours  = filleuls.filter((f) => f.statut === 'EN_COURS').length;

  // Tri : ACTIF → EN_COURS → autres
  const sortedFilleuls = [...filleuls].sort((a, b) => {
    const order = { ACTIF: 0, EN_COURS: 1, SUSPENDU: 2, ARCHIVE: 3 };
    return (order[a.statut] ?? 9) - (order[b.statut] ?? 9);
  });

  return (
    <div className="space-y-6">

      {/* Section A — Parrain */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Mon parrain</p>
        {client.parrain ? (
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold bg-primary-light text-primary-accent"
                aria-hidden
              >
                {initials(client.parrain.nom, client.parrain.prenom)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-text">
                  {client.parrain.prenom} {client.parrain.nom}
                </p>
                <p className="text-[11px] text-text-muted font-mono">{client.parrain.codeParrain}</p>
              </div>
              <Link
                to={`/clients/${client.parrain.id}`}
                className="text-[13px] font-semibold text-primary-accent hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent rounded"
              >
                Voir fiche →
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-text-muted italic">Ce client n'a pas été parrainé.</p>
        )}
      </div>

      {/* Section B — Code parrain */}
      {client.codeParrain && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Mon code parrain</p>
          <div className="rounded-xl bg-bg border border-border px-4 py-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-[22px] font-extrabold font-mono text-primary tracking-wider">
                {client.codeParrain}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(client.codeParrain!)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-text-muted hover:text-primary-accent hover:border-primary-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent"
              >
                <Copy size={13} aria-hidden />
                Copier
              </button>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-text-muted">
              <GitBranch size={13} className="text-primary-accent" aria-hidden />
              <span>
                <span className="font-semibold text-success">{nbActifs} filleul{nbActifs !== 1 ? 's' : ''} actif{nbActifs !== 1 ? 's' : ''}</span>
                {nbEnCours > 0 && (
                  <span className="ml-1 text-warning">· {nbEnCours} en cours d'activation</span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section C — Filleuls */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">
          Mes filleuls ({filleuls.length})
        </p>

        {filleuls.length === 0 ? (
          <p className="text-[13px] text-text-muted italic text-center py-8">
            Aucun filleul pour ce client.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm" aria-label="Liste des filleuls">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">Filleul</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Code</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Activation</th>
                    <th className="px-4 py-3 text-right hidden lg:table-cell">Points générés</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFilleuls.map((f, i) => (
                    <tr
                      key={f.id}
                      className="border-b border-border/60 last:border-b-0 transition-colors hover:bg-blue-50/40"
                      style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/clients/${f.id}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <span
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold bg-primary-light text-primary-accent"
                            aria-hidden
                          >
                            {initials(f.nom, f.prenom)}
                          </span>
                          <span className="text-[13px] font-semibold text-primary-accent group-hover:underline truncate">
                            {f.prenom} {f.nom}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-mono text-text-muted hidden sm:table-cell">
                        {f.codeParrain ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <ClientStatusBadge statut={f.statut} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-[12px] text-text-muted hidden md:table-cell">
                        {f.dateActivation ? formatDate(f.dateActivation) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] font-bold text-platine font-mono hidden lg:table-cell">
                        {f.pointsGeneres.toLocaleString('fr')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalGains > 0 && (
              <div className="mt-3 flex items-center justify-end gap-2 px-1">
                <span className="text-[12px] text-text-muted">Total gains parrainage :</span>
                <span className="text-[13px] font-bold text-platine font-mono">
                  {totalGains.toLocaleString('fr')} pts
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
