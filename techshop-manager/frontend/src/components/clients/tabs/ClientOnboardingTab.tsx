import { OnboardingTimeline } from '@/components/clients/OnboardingTimeline';
import type { ClientDetail } from '@/lib/clients.api';

interface ClientOnboardingTabProps {
  client: ClientDetail;
}

export function ClientOnboardingTab({ client }: ClientOnboardingTabProps) {
  return (
    <div>
      <OnboardingTimeline
        etapes={client.onboardingEtapes}
        clientId={client.id}
      />
    </div>
  );
}
