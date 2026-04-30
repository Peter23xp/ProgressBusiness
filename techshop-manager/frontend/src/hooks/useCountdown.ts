import { useCallback, useEffect, useRef, useState } from 'react';

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    stop();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setSeconds(initialSeconds);
  }, [stop, initialSeconds]);

  useEffect(() => () => stop(), [stop]);

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  return {
    seconds,
    formatted: `${mm}:${ss}`,
    isFinished: seconds === 0 && !running,
    start,
    reset,
  };
}
