import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Circle, ArrowRight } from 'lucide-react';
import { cn, formatUSD, formatDateTime } from '@/lib/utils';
import type { OnboardingEtapeDetail } from '@/lib/clients.api';
import type { EtapeOnboarding } from '@/types';

interface OnboardingTimelineProps {
  etapes: OnboardingEtapeDetail[];
  clientId: string;
}

const ETAPE_CONFIG: Record<EtapeOnboarding, { label: string; route: string }> = {
  RECIT:      { label: 'Récit de vente',   route: 'new/recit' },
  FORMATION:  { label: 'Formation',        route: 'formation' },
  FICHE:      { label: 'Fiche client',     route: 'fiche' },
  ACTIVATION: { label: 'Activation',       route: 'activate' },
};

const ALL_ETAPES: EtapeOnboarding[] = ['RECIT', 'FORMATION', 'FICHE', 'ACTIVATION'];

export function OnboardingTimeline({ etapes, clientId }: OnboardingTimelineProps) {
  const navigate = useNavigate();

  // Complète les étapes manquantes avec EN_ATTENTE
  const allSteps: OnboardingEtapeDetail[] = ALL_ETAPES.map((key) => {
    const found = etapes.find((e) => e.etape === key);
    return found ?? {
      etape: key,
      statut: 'EN_ATTENTE',
      completeeAt: null,
      agentNom: null,
      agentRole: null,
      montant: null,
      modePaiement: null,
      referenceTransaction: null,
      notes: null,
    };
  });

  return (
    <ol className="relative pl-9 space-y-1" aria-label="Timeline onboarding">
      {/* Ligne verticale */}
      <div
        className="absolute left-4 top-3 bottom-3 w-px bg-border"
        aria-hidden
      />

      {allSteps.map((step, idx) => {
        const done   = step.statut === 'COMPLETE';
        const active = step.statut === 'EN_COURS';
        const waiting = step.statut === 'EN_ATTENTE';
        const prevDone = idx === 0 || allSteps[idx - 1].statut === 'COMPLETE';
        const canAct = (active || waiting) && prevDone;

        const { label, route } = ETAPE_CONFIG[step.etape];

        return (
          <li key={step.etape} className="relative pb-5 last:pb-0">
            {/* Icône sur la ligne */}
            <div
              className={cn(
                'absolute -left-9 top-3.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white z-10',
                done   ? 'border-success'
                : active ? 'border-primary-accent'
                         : 'border-border',
              )}
              aria-hidden
            >
              {done   ? <CheckCircle2 size={14} className="text-success" /> :
               active ? <Clock size={12} className="text-warning" /> :
                        <Circle size={12} className="text-border" />}
            </div>

            {/* Carte étape */}
            <div
              className={cn(
                'rounded-xl border p-4 transition-colors',
                done   ? 'border-green-200 bg-green-50'
                : active ? 'border-blue-200 bg-blue-50'
                         : 'border-border bg-bg',
              )}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-[13px] font-bold',
                    done ? 'text-success' : active ? 'text-primary-accent' : 'text-text-muted',
                  )}>
                    Étape {idx + 1} — {label}
                  </p>

                  {done && step.completeeAt && (
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {formatDateTime(step.completeeAt)}
                      {step.agentNom && ` · Par ${step.agentNom}`}
                      {step.agentRole && ` (${step.agentRole})`}
                    </p>
                  )}

                  {waiting && (
                    <p className="text-[11px] text-text-subtle mt-0.5">En attente</p>
                  )}
                </div>

                {done && step.montant != null && step.montant > 0 && (
                  <div className="text-right flex-shrink-0">
                    <span className="text-[13px] font-bold text-text font-mono">
                      {formatUSD(step.montant)}
                    </span>
                    {step.modePaiement && (
                      <p className="text-[10px] text-text-muted capitalize">
                        {step.modePaiement.replace(/_/g, ' ').toLowerCase()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {done && step.referenceTransaction && (
                <p className="text-[11px] text-text-muted mt-1.5 font-mono">
                  Réf. transaction : {step.referenceTransaction}
                </p>
              )}

              {done && step.notes && (
                <p className="text-[12px] text-text-muted mt-1.5 italic border-l-2 border-border pl-2">
                  "{step.notes}"
                </p>
              )}

              {/* Bouton action conditionnel */}
              {canAct && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      step.etape === 'RECIT'
                        ? `/clients/new/recit`
                        : `/clients/${clientId}/${route}`,
                    )
                  }
                  className={cn(
                    'mt-3 flex items-center gap-1.5 text-[12px] font-semibold rounded-lg px-3 py-1.5 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent',
                    active
                      ? 'bg-primary-accent text-white hover:bg-blue-700'
                      : 'border border-border text-text-muted hover:text-text hover:border-border-strong bg-white',
                  )}
                >
                  {active ? 'Continuer' : 'Démarrer'}
                  <ArrowRight size={12} aria-hidden />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
