import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatutStock } from '@/types';

interface StockStatusBadgeProps {
  statut: StatutStock;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const config: Record<StatutStock, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  OK:      { label: 'OK',      icon: CheckCircle2,   cls: 'bg-green-100 text-success' },
  ALERTE:  { label: 'Alerte',  icon: AlertTriangle,  cls: 'bg-amber-100 text-warning' },
  RUPTURE: { label: 'Rupture', icon: XCircle,        cls: 'bg-red-100 text-danger' },
};

export function StockStatusBadge({ statut, size = 'md', showIcon = true }: StockStatusBadgeProps) {
  const { label, icon: Icon, cls } = config[statut];
  const iconSize = size === 'sm' ? 10 : 11;
  const textCls = size === 'sm' ? 'text-[10px]' : 'text-[11px]';

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold tracking-wide', textCls, cls)}>
      {showIcon && <Icon size={iconSize} aria-hidden />}
      {label}
    </span>
  );
}
