import { cn } from '@/lib/utils';
import type { NiveauFidelite } from '@/types';

interface ClientLevelBadgeProps {
  niveau: NiveauFidelite;
  showPoints?: boolean;
  points?: number;
  size?: 'sm' | 'md';
}

const CONFIG: Record<NiveauFidelite, { label: string; classes: string }> = {
  BRONZE:  { label: 'Bronze',  classes: 'bg-amber-100 text-amber-800' },
  ARGENT:  { label: 'Argent',  classes: 'bg-slate-100 text-slate-600' },
  OR:      { label: 'Or',      classes: 'bg-yellow-100 text-yellow-700' },
  PLATINE: { label: 'Platine', classes: 'bg-violet-100 text-platine' },
};

export function ClientLevelBadge({
  niveau,
  showPoints = false,
  points,
  size = 'md',
}: ClientLevelBadgeProps) {
  const { label, classes } = CONFIG[niveau] ?? CONFIG.BRONZE;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        classes,
      )}
    >
      <span aria-hidden>■</span>
      {label}
      {showPoints && points !== undefined && (
        <span className="ml-1 font-mono">{points.toLocaleString('fr')} pts</span>
      )}
    </span>
  );
}
