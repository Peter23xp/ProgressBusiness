// frontend/src/components/tutorial/TutorialOverlay.tsx
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTutorialStore } from '@/store/tutorial.store';

interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PADDING = 6;
const BORDER_RADIUS = 8;
const RETRY_DELAY = 500;
const MAX_RETRIES = 5;

export function TutorialOverlay() {
  const { isActive, highlightedElementId } = useTutorialStore();
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [visible, setVisible] = useState(false);
  const retryCountRef = useRef(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  function calculateRect(el: Element): SpotlightRect {
    const r = el.getBoundingClientRect();
    return {
      x: r.left - PADDING,
      y: r.top - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
    };
  }

  function findAndSetElement(targetId: string, attempt = 0) {
    const el = document.querySelector(`[data-tutorial="${targetId}"]`);
    if (el) {
      retryCountRef.current = 0;
      setRect(calculateRect(el));
      setVisible(true);

      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new ResizeObserver(() => setRect(calculateRect(el)));
      observerRef.current.observe(el);
      observerRef.current.observe(document.body);
      return;
    }

    if (attempt < MAX_RETRIES) {
      setTimeout(() => findAndSetElement(targetId, attempt + 1), RETRY_DELAY);
    } else {
      console.warn(`[Tutorial] Element not found: data-tutorial="${targetId}" after ${MAX_RETRIES} retries`);
      setRect(null);
      setVisible(true);
    }
  }

  useEffect(() => {
    if (!isActive || !highlightedElementId) {
      setVisible(false);
      setRect(null);
      return;
    }

    setVisible(false);
    retryCountRef.current = 0;

    if (mutationObserverRef.current) mutationObserverRef.current.disconnect();

    const el = document.querySelector(`[data-tutorial="${highlightedElementId}"]`);
    if (el) {
      setRect(calculateRect(el));
      setVisible(true);
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new ResizeObserver(() => setRect(calculateRect(el)));
      observerRef.current.observe(el);
      observerRef.current.observe(document.body);
    } else {
      mutationObserverRef.current = new MutationObserver(() => {
        const found = document.querySelector(`[data-tutorial="${highlightedElementId}"]`);
        if (found) {
          mutationObserverRef.current?.disconnect();
          findAndSetElement(highlightedElementId);
        }
      });
      mutationObserverRef.current.observe(document.body, { childList: true, subtree: true });
      findAndSetElement(highlightedElementId);
    }

    return () => {
      observerRef.current?.disconnect();
      mutationObserverRef.current?.disconnect();
    };
  }, [isActive, highlightedElementId]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      mutationObserverRef.current?.disconnect();
    };
  }, []);

  if (!isActive) return null;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
        pointerEvents: rect ? 'auto' : 'none',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <svg
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <defs>
          <mask id="tutorial-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                rx={BORDER_RADIUS}
                fill="black"
                style={{ transition: 'x 300ms ease-in-out, y 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out' }}
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#tutorial-spotlight-mask)"
        />
        {rect && (
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            rx={BORDER_RADIUS}
            fill="none"
            stroke="#2E86C1"
            strokeWidth="2"
            strokeDasharray="6 3"
            style={{ transition: 'x 300ms ease-in-out, y 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out' }}
          />
        )}
      </svg>
    </div>,
    document.body,
  );
}
