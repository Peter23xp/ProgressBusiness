import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const setOfflineMode = useAuthStore((s) => s.setOfflineMode);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      setOfflineMode(false);
    };
    const onOffline = () => {
      setIsOnline(false);
      setOfflineMode(true);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [setOfflineMode]);

  return isOnline;
}
