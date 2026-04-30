import { cn } from '@/lib/utils';
import type { StatutClient } from '@/types';

interface ClientStatusBadgeProps {
  statut: StatutClient;
  size?: 'sm' | 'md';
}

const CONFIG: Record<StatutClient, { label: string; classes: string; dot: string }> = {
  ACTIF:     { label: 'Actif',     classes: 'bg-green-100 text-success',  dot: 'bg-success' },
  EN_COURS:  { label: 'En cours',  classes: 'bg-amber-100 text-warning',  dot: 'bg-warning' },
  SUSPENDU:  { label: 'Suspendu',  classes: 'bg-red-100 text-danger',     dot: 'bg-danger' },
  ARCHIVE:   { label: 'Archivé',   classes: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
};

export function ClientStatusBadge({ statut, size = 'md' }: ClientStatusBadgeProps) {
  const { label, classes, dot } = CONFIG[statut] ?? CONFIG.ARCHIVE;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        classes,
      )}
    >
      <span className={cn('rounded-full flex-shrink-0', dot, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')} aria-hidden />
      {label}
    </span>
  );
}
