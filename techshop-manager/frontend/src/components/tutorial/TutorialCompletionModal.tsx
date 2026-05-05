import { useEffect, createPortal } from 'react';
import { useTutorialStore } from '@/store/tutorial.store';
import { useAuthStore } from '@/store/auth.store';
import { useTutorialContext } from './TutorialProvider';

export function TutorialCompletionModal() {
  const { showCompletionModal } = useTutorialStore();
  const { user } = useAuthStore();
  const tutorial = useTutorialContext();

  useEffect(() => {
    if (!showCompletionModal) return;
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#2E86C1', '#1A6B3A', '#E65100'],
      });
      setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.4 } }), 500);
    });
  }, [showCompletionModal]);

  if (!showCompletionModal) return null;

  const firstName = user?.name?.split(' ')[0] ?? 'vous';

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div
        role="dialog"
        aria-label="Tutoriel terminé"
        aria-modal="true"
        style={{
          background: 'white', borderRadius: 16, padding: 32,
          maxWidth: 440, width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          textAlign: 'center',
          animation: 'tutorialFadeIn 0.25s ease',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: '#1E3A5F', margin: '0 0 12px', fontSize: 22 }}>
          Félicitations, {firstName} !
        </h2>
        <p style={{ fontSize: 14, color: '#444', marginBottom: 20, lineHeight: 1.6 }}>
          Vous connaissez maintenant les fonctionnalités essentielles de TechShop Manager.
        </p>

        <div style={{
          background: '#F5F8FF', borderRadius: 10, padding: 16, marginBottom: 20,
          textAlign: 'left', fontSize: 13, color: '#444', lineHeight: 1.7,
        }}>
          <p style={{ margin: '0 0 8px' }}>
            📌 Pour retrouver cette aide plus tard :<br />
            <strong>Paramètres → Profil → Relancer le tutoriel</strong>
          </p>
          <p style={{ margin: 0 }}>
            📌 Besoin d'aide sur une fonctionnalité ?<br />
            Cherchez l'icône <strong>❓</strong> en bas à droite de chaque écran.
          </p>
        </div>

        <button
          onClick={() => tutorial.complete()}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 8,
            border: 'none', background: '#1E3A5F', color: 'white',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44,
          }}
        >
          🚀 Commencer à utiliser l'app
        </button>
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
