import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTutorialStore } from '@/store/tutorial.store';
import { useTutorialContext } from './TutorialProvider';

type Placement = 'top' | 'bottom' | 'left' | 'right';

function calcPlacement(targetEl: Element | null, requestedPlacement?: string): Placement {
  if (requestedPlacement && requestedPlacement !== 'auto') return requestedPlacement as Placement;
  if (!targetEl) return 'bottom';
  const r = targetEl.getBoundingClientRect();
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  if (r.left < vw * 0.25) return 'right';
  if (r.top < vh * 0.33) return 'bottom';
  if (r.top > vh * 0.66) return 'top';
  return r.right < vw / 2 ? 'right' : 'left';
}

function computeTooltipPosition(
  targetEl: Element | null,
  tooltipEl: HTMLDivElement | null,
  placement: Placement,
): { top: number; left: number } {
  if (!targetEl || !tooltipEl) return { top: 100, left: Math.max(16, (window.innerWidth - 340) / 2) };
  const tr = targetEl.getBoundingClientRect();
  const tw = tooltipEl.offsetWidth;
  const th = tooltipEl.offsetHeight;
  const OFFSET = 12;

  if (window.innerWidth < 480) {
    return {
      top: window.innerHeight - th - 16,
      left: Math.max(8, (window.innerWidth - tw) / 2),
    };
  }

  switch (placement) {
    case 'bottom': return { top: tr.bottom + OFFSET, left: tr.left + (tr.width - tw) / 2 };
    case 'top': return { top: tr.top - th - OFFSET, left: tr.left + (tr.width - tw) / 2 };
    case 'right': return { top: tr.top + (tr.height - th) / 2, left: tr.right + OFFSET };
    case 'left': return { top: tr.top + (tr.height - th) / 2, left: tr.left - tw - OFFSET };
  }
}

function ArrowSVG({ placement }: { placement: Placement }) {
  const size = 10;
  const style: React.CSSProperties = { position: 'absolute' };
  let points = '';

  switch (placement) {
    case 'right':
      Object.assign(style, { left: -size, top: '50%', transform: 'translateY(-50%)' });
      points = `${size},0 0,${size / 2} ${size},${size}`;
      break;
    case 'left':
      Object.assign(style, { right: -size, top: '50%', transform: 'translateY(-50%)' });
      points = `0,0 ${size},${size / 2} 0,${size}`;
      break;
    case 'bottom':
      Object.assign(style, { top: -size, left: '50%', transform: 'translateX(-50%)' });
      points = `0,${size} ${size / 2},0 ${size},${size}`;
      break;
    case 'top':
      Object.assign(style, { bottom: -size, left: '50%', transform: 'translateX(-50%)' });
      points = `0,0 ${size / 2},${size} ${size},0`;
      break;
  }

  return (
    <svg width={size} height={size} style={style}>
      <polygon points={points} fill="white" />
    </svg>
  );
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export function TutorialTooltip() {
  const store = useTutorialStore();
  const tutorial = useTutorialContext();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<Placement>('bottom');

  const { isActive, currentStepIndex, steps, highlightedElementId } = store;
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const totalSteps = steps.length;

  function updatePosition() {
    if (!currentStep || !tooltipRef.current) return;
    const targetEl = highlightedElementId
      ? document.querySelector(`[data-tutorial="${highlightedElementId}"]`)
      : null;
    const p = calcPlacement(targetEl, currentStep.placement);
    setPlacement(p);
    const newPos = computeTooltipPosition(targetEl, tooltipRef.current, p);
    setPos(newPos);
  }

  useEffect(() => {
    if (!isActive || !currentStep) return;
    const timer = setTimeout(updatePosition, 50);
    window.addEventListener('resize', updatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isActive, currentStepIndex, highlightedElementId]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (!isLastStep) store.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!isFirstStep) store.previous();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        store.setShowQuitDialog(true);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isActive, isLastStep, isFirstStep, currentStepIndex]);

  // Focus trap
  useEffect(() => {
    if (!isActive || !tooltipRef.current) return;
    tooltipRef.current.focus();
  }, [isActive, currentStepIndex]);

  if (!isActive || !currentStep) return null;
  if (currentStep.type === 'welcome' || currentStep.type === 'completion') return null;

  const tooltipWidth = window.innerWidth < 480 ? 280 : 340;

  return createPortal(
    <>
      <div
        ref={tooltipRef}
        role="dialog"
        aria-label="Tutoriel TechShop Manager"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: tooltipWidth,
          zIndex: 9999,
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          outline: 'none',
          transition: 'top 300ms ease, left 300ms ease',
        }}
      >
        <ArrowSVG placement={placement} />

        {/* Progress dots + section label */}
        <div style={{
          background: '#f0f4f8',
          padding: '8px 14px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px 12px 0 0',
        }}>
          <div
            style={{ display: 'flex', gap: 5 }}
            aria-live="polite"
            aria-label={`Étape ${currentStepIndex + 1} sur ${totalSteps}`}
          >
            {steps.slice(0, Math.min(8, totalSteps)).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i <= currentStepIndex ? '#2E86C1' : '#ccc',
                transition: 'background 200ms',
              }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#888' }}>
            {currentStep.sectionLabel} · Étape {currentStepIndex + 1}/{totalSteps}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1E3A5F', marginBottom: 8 }}>
            {currentStep.title}
          </div>
          <div
            style={{ fontSize: 13, color: '#212121', lineHeight: 1.6, marginBottom: 12 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(currentStep.description) }}
          />

          {currentStep.tip && (
            <div style={{
              background: '#D6E4F0',
              borderLeft: '3px solid #2E86C1',
              borderRadius: '0 6px 6px 0',
              padding: '8px 10px',
              fontSize: 12,
              color: '#1E3A5F',
              marginBottom: 14,
            }}>
              💡 {currentStep.tip}
            </div>
          )}

          {currentStep.requiresOnline && (
            <div style={{
              background: '#FFF3E0',
              borderLeft: '3px solid #E65100',
              borderRadius: '0 6px 6px 0',
              padding: '6px 10px',
              fontSize: 11,
              color: '#E65100',
              marginBottom: 12,
            }}>
              ⚠️ Cette fonctionnalité nécessite une connexion internet.
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => store.setShowQuitDialog(true)}
              style={{
                fontSize: 12, color: '#999', background: 'none', border: 'none',
                cursor: 'pointer', padding: '0 4px', minHeight: 44,
              }}
              aria-label="Quitter le tutoriel"
            >
              ✕ Quitter
            </button>
            <div style={{ flex: 1 }} />
            {!isFirstStep && (
              <button
                onClick={store.previous}
                style={{
                  fontSize: 12, color: '#1E3A5F', background: 'none',
                  border: '1px solid #1E3A5F', borderRadius: 6,
                  padding: '5px 12px', cursor: 'pointer', minHeight: 44,
                }}
                aria-label="Étape précédente"
              >
                ← Précédent
              </button>
            )}
            <button
              onClick={isLastStep ? () => tutorial.complete() : store.next}
              style={{
                fontSize: 12, color: 'white', background: '#1E3A5F',
                border: 'none', borderRadius: 6,
                padding: '5px 12px', cursor: 'pointer', minHeight: 44,
              }}
              aria-label={isLastStep ? 'Terminer le tutoriel' : 'Étape suivante'}
            >
              {isLastStep ? (currentStep.nextLabel ?? 'Terminer ✓') : (currentStep.nextLabel ?? 'Suivant →')}
            </button>
          </div>
        </div>
      </div>

      {/* Quit dialog */}
      {store.showQuitDialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10001,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 24,
            maxWidth: 360, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 8px', color: '#1E3A5F', fontSize: 16 }}>
              Quitter le tutoriel ?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#555' }}>
              Votre progression est sauvegardée. Vous pourrez reprendre ou relancer le tutoriel depuis votre profil.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => store.setShowQuitDialog(false)}
                style={{
                  padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd',
                  background: 'none', cursor: 'pointer', fontSize: 13,
                }}
              >
                Continuer le tutoriel
              </button>
              <button
                onClick={store.quit}
                style={{
                  padding: '8px 16px', borderRadius: 6, border: 'none',
                  background: '#B71C1C', color: 'white', cursor: 'pointer', fontSize: 13,
                }}
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
