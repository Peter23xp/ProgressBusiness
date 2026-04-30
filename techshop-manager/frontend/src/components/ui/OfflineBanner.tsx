import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

type BannerState = 'offline' | 'syncing' | 'synced' | 'hidden';

export function OfflineBanner() {
  const { isOnline, pendingSyncCount } = useUIStore();
  const [bannerState, setBannerState] = useState<BannerState>('hidden');

  useEffect(() => {
    if (!isOnline) {
      setBannerState('offline');
      return;
    }

    // Just came back online
    if (pendingSyncCount > 0) {
      setBannerState('syncing');
      return;
    }

    // Online and no pending sync
    if (bannerState === 'syncing') {
      // Sync just finished — show success briefly
      setBannerState('synced');
      const timer = setTimeout(() => setBannerState('hidden'), 3000);
      return () => clearTimeout(timer);
    }

    setBannerState('hidden');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, pendingSyncCount]);

  if (bannerState === 'hidden') return null;

  const configs: Record<Exclude<BannerState, 'hidden'>, {
    bg: string;
    icon: React.ReactNode;
    text: string;
  }> = {
    offline: {
      bg: 'bg-warning',
      icon: <WifiOff size={16} className="flex-shrink-0" />,
      text: `Mode hors-ligne — ${pendingSyncCount} opération(s) en attente`,
    },
    syncing: {
      bg: 'bg-primary-accent',
      icon: <RefreshCw size={16} className="flex-shrink-0 animate-spin" />,
      text: `Reconnexion détectée — synchronisation en cours (${pendingSyncCount} opération(s))…`,
    },
    synced: {
      bg: 'bg-success',
      icon: <CheckCircle2 size={16} className="flex-shrink-0" />,
      text: 'Synchronisation terminée — toutes les opérations ont été envoyées.',
    },
  };

  const { bg, icon, text } = configs[bannerState];

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-white text-sm font-medium shadow-md',
        bg,
      )}
      role="status"
      aria-live="polite"
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}
