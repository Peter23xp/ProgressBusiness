// frontend/src/components/tutorial/TutorialProgressBar.tsx
import { createPortal } from 'react-dom';
import { useTutorialStore } from '@/store/tutorial.store';

export function TutorialProgressBar() {
  const { isActive, currentStepIndex, steps } = useTutorialStore();

  if (!isActive || steps.length === 0) return null;

  const pct = Math.round((currentStepIndex / steps.length) * 100);

  return createPortal(
    <div
      title={`Tutoriel — Étape ${currentStepIndex + 1} sur ${steps.length}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 10000,
        backgroundColor: '#E0E0E0',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: '#2E86C1',
          transition: 'width 300ms ease',
        }}
      />
    </div>,
    document.body,
  );
}
