import { useCallback, useEffect, useRef, useState } from 'react';

export function usePolling(
  callback: () => void,
  intervalMs: number,
  options?: { enabled?: boolean; immediate?: boolean },
): { isPolling: boolean; stop: () => void; start: () => void } {
  const { enabled = true, immediate = false } = options ?? {};
  const [isPolling, setIsPolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const shouldPoll = useCallback(() => {
    return enabled && navigator.onLine && document.visibilityState !== 'hidden';
  }, [enabled]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const start = useCallback(() => {
    if (!shouldPoll()) return;
    stop();
    timerRef.current = setInterval(() => {
      if (shouldPoll()) {
        callbackRef.current();
      } else {
        stop();
      }
    }, intervalMs);
    setIsPolling(true);
  }, [shouldPoll, stop, intervalMs]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    if (immediate) callbackRef.current();
    start();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        start();
      } else {
        stop();
      }
    };
    const handleOnline = () => start();
    const handleOffline = () => stop();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, start, stop, immediate]);

  return { isPolling, stop, start };
}
