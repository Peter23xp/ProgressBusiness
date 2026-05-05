import { createPortal } from 'react-dom';
import { Zap } from 'lucide-react';
import { useTutorialStore } from '@/store/tutorial.store';
import { useAuthStore } from '@/store/auth.store';

const ROLE_CONFIG: Record<string, { points: string[]; duration: string }> = {
  SUPER_ADMIN: {
    points: [
      'Administrer tous les sites et utilisateurs',
      "Configurer le programme de fidélité et parrainage",
      "Accéder à toutes les données de l'application",
    ],
    duration: '~ 8 minutes',
  },
  DIRECTEUR_REGIONAL: {
    points: [
      'Comparer les performances de vos 3 sites',
      'Analyser les ventes et le parrainage en détail',
      'Exporter des rapports pour votre direction',
    ],
    duration: '~ 5 minutes',
  },
  GERANT: {
    points: [
      'Suivre les performances de votre site en temps réel',
      'Gérer les stocks (entrées, transferts, alertes)',
      'Consulter les rapports et exporter vos données',
    ],
    duration: '~ 7 minutes',
  },
  AGENT: {
    points: [
      'Enregistrer de nouveaux clients en 4 étapes',
      'Encaisser des ventes à la caisse',
      "Consulter l'inventaire de votre site",
    ],
    duration: '~ 5 minutes',
  },
  FORMATEUR: {
    points: [
      'Consulter la liste de vos clients à former',
      "Valider les formations et faire avancer l'onboarding",
      'Suivre la progression de chaque client',
    ],
    duration: '~ 3 minutes',
  },
  CLIENT: {
    points: [
      'Consulter vos achats et votre solde de points',
      'Suivre vos filleuls et gains de parrainage',
      'Connaître votre niveau de fidélité',
    ],
    duration: '~ 2 minutes',
  },
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrateur',
  DIRECTEUR_REGIONAL: 'Directeur Régional',
  GERANT: 'Gérant de Site',
  AGENT: 'Agent Commercial',
  FORMATEUR: 'Formateur',
  CLIENT: 'Client',
};

export function TutorialWelcomeModal() {
  const { showWelcomeModal, start, setShowWelcomeModal } = useTutorialStore();
  const { user } = useAuthStore();

  if (!showWelcomeModal || !user) return null;

  const role = user.role;
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.AGENT;
  const firstName = user.name?.split(' ')[0] ?? user.name ?? 'vous';
  const siteName = user.siteName ?? '';
  const roleLabel = ROLE_LABELS[role] ?? role;

  function handleSkip() {
    setShowWelcomeModal(false);
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div
        role="dialog"
        aria-label="Bienvenue dans TechShop Manager"
        aria-modal="true"
        style={{
          background: 'white', borderRadius: 16, padding: 32,
          maxWidth: 480, width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          animation: 'tutorialFadeIn 0.25s ease',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#1E3A5F', borderRadius: 12, padding: '10px 18px',
          }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="white" />
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Progress Business</span>
          </div>
        </div>

        <h2 style={{ textAlign: 'center', color: '#1E3A5F', margin: '0 0 8px', fontSize: 22 }}>
          Bienvenue, {firstName} !
        </h2>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{
            display: 'inline-block', background: '#E3F2FD', color: '#1E3A5F',
            borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600,
          }}>
            {roleLabel}
          </span>
          {siteName && (
            <span style={{ fontSize: 13, color: '#666', display: 'block', marginTop: 4 }}>
              Site de {siteName}
            </span>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 0 20px' }} />

        <p style={{ fontSize: 14, color: '#444', marginBottom: 14, textAlign: 'center' }}>
          TechShop Manager vous permet de :
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
          {config.points.map((point) => (
            <li key={point} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              fontSize: 13, color: '#333', marginBottom: 10,
            }}>
              <span style={{ color: '#1A6B3A', flexShrink: 0, marginTop: 1 }}>✅</span>
              {point}
            </li>
          ))}
        </ul>

        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 }}>
          Ce tutoriel guidé vous présentera les fonctionnalités essentielles.
          <br />
          <strong>Durée estimée : {config.duration}</strong>
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSkip}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 8,
              border: '1px solid #ddd', background: 'none',
              fontSize: 13, cursor: 'pointer', color: '#666',
              minHeight: 44,
            }}
          >
            Passer le tutoriel
          </button>
          <button
            onClick={start}
            style={{
              flex: 2, padding: '10px 16px', borderRadius: 8,
              border: 'none', background: '#1E3A5F', color: 'white',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Démarrer le tutoriel →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tutorialFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
}
