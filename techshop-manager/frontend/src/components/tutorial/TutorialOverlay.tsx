import { useEffect, useRef, useState, useId } from 'react';
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

export function TutorialOverlay() {
  const { isActive, highlightedElementId } = useTutorialStore();
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const uid = useId();
  const maskId = `tutorial-spotlight-mask-${uid}`;

  function calculateRect(el: Element): SpotlightRect {
    const r = el.getBoundingClientRect();
    return {
      x: r.left - PADDING,
      y: r.top - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
    };
  }

  useEffect(() => {
    if (!isActive || !highlightedElementId) {
      setVisible(false);
      setRect(null);
      return;
    }

    setVisible(false);

    observerRef.current?.disconnect();
    mutationObserverRef.current?.disconnect();

    const cancelled = { current: false };

    function attachElement(el: Element) {
      if (cancelled.current) return;
      setRect(calculateRect(el));
      setVisible(true);
      observerRef.current = new ResizeObserver(() => {
        if (!cancelled.current) setRect(calculateRect(el));
      });
      observerRef.current.observe(el);
    }

    const el = document.querySelector(`[data-tutorial="${highlightedElementId}"]`);
    if (el) {
      attachElement(el);
    } else {
      mutationObserverRef.current = new MutationObserver(() => {
        if (cancelled.current) return;
        const found = document.querySelector(`[data-tutorial="${highlightedElementId}"]`);
        if (found) {
          mutationObserverRef.current?.disconnect();
          attachElement(found);
        }
      });
      mutationObserverRef.current.observe(document.body, { childList: true, subtree: true });

      // Retry x5 every 500ms as fallback (MutationObserver may miss some cases)
      let attempt = 0;
      const MAX_RETRIES = 5;
      const RETRY_DELAY = 500;
      function retry() {
        if (cancelled.current) return;
        attempt++;
        const found = document.querySelector(`[data-tutorial="${highlightedElementId}"]`);
        if (found) {
          mutationObserverRef.current?.disconnect();
          attachElement(found);
          return;
        }
        if (attempt < MAX_RETRIES) {
          setTimeout(retry, RETRY_DELAY);
        } else {
          if (!cancelled.current) {
            console.warn(`[Tutorial] Element not found: data-tutorial="${highlightedElementId}" after ${MAX_RETRIES} retries`);
            setRect(null);
            setVisible(true);
          }
        }
      }
      setTimeout(retry, RETRY_DELAY);
    }

    return () => {
      cancelled.current = true;
      observerRef.current?.disconnect();
      mutationObserverRef.current?.disconnect();
    };
  }, [isActive, highlightedElementId]);

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
        pointerEvents: 'none',
      }}
    >
      <svg
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <defs>
          <mask id={maskId}>
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
          mask={`url(#${maskId})`}
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
