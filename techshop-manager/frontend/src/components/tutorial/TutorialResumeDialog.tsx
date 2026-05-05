import { createPortal } from 'react-dom';
import { useTutorialStore } from '@/store/tutorial.store';
import { useTutorialContext } from './TutorialProvider';

export function TutorialResumeDialog() {
  const { showResumeDialog, savedStepIndex, steps } = useTutorialStore();
  const tutorial = useTutorialContext();

  if (!showResumeDialog) return null;

  const savedStep = steps[savedStepIndex];
  const totalSteps = steps.length;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-resume-title"
        style={{
          background: 'white', borderRadius: 12, padding: 24,
          maxWidth: 420, width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <h3 id="tutorial-resume-title" style={{ margin: '0 0 8px', color: '#1E3A5F', fontSize: 16 }}>
          Reprendre le tutoriel ?
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#555' }}>
          Vous aviez commencé le tutoriel et vous en étiez à l'étape{' '}
          <strong>{savedStepIndex + 1}</strong>
          {savedStep ? ` : "${savedStep.title}"` : ''}.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={tutorial.resume}
            style={{
              padding: '10px 16px', borderRadius: 8, border: 'none',
              background: '#1E3A5F', color: 'white',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 44,
            }}
          >
            Reprendre ({savedStepIndex + 1}/{totalSteps})
          </button>
          <button
            onClick={() => {
              useTutorialStore.setState({ savedStepIndex: 0, showResumeDialog: false });
              useTutorialStore.getState().start();
            }}
            style={{
              padding: '10px 16px', borderRadius: 8,
              border: '1px solid #ddd', background: 'none',
              fontSize: 13, cursor: 'pointer', minHeight: 44,
            }}
          >
            Recommencer depuis le début
          </button>
          <button
            onClick={tutorial.ignoreForever}
            style={{
              padding: '10px 16px', borderRadius: 8, border: 'none',
              background: 'none', fontSize: 12, color: '#999', cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Ignorer — je n'ai pas besoin du tutoriel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
