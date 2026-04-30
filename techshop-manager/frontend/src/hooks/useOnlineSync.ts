import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/ui.store';
import { getPendingVentes, removePendingVente } from '@/lib/offline';
import { api } from '@/lib/api';

async function syncPendingVentes(setPendingSyncCount: (n: number) => void) {
  const pending = await getPendingVentes();
  setPendingSyncCount(pending.length);

  if (pending.length === 0) return;

  for (const vente of pending) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { localId, ...payload } = vente as Record<string, unknown> & { localId: string };
      await api.post('/ventes', payload);
      await removePendingVente(localId);

      // Refresh count after each successful sync
      const remaining = await getPendingVentes();
      setPendingSyncCount(remaining.length);
    } catch {
      // Leave failing vente in the queue for next attempt
    }
  }
}

export function useOnlineSync() {
  const { setOnline, setPendingSyncCount } = useUIStore();
  const isSyncing = useRef(false);

  // Refresh pending count on mount
  useEffect(() => {
    getPendingVentes()
      .then((pending) => setPendingSyncCount(pending.length))
      .catch(() => {});
  }, [setPendingSyncCount]);

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      if (isSyncing.current) return;
      isSyncing.current = true;
      try {
        await syncPendingVentes(setPendingSyncCount);
      } finally {
        isSyncing.current = false;
      }
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // If the app starts online, attempt to drain the queue
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, setPendingSyncCount]);
}
