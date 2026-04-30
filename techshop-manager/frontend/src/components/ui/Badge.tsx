import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'platine' | 'bronze' | 'argent' | 'or';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  gray: 'badge-gray',
  platine: 'badge-platine',
  bronze: 'badge bg-amber-100 text-amber-800',
  argent: 'badge bg-gray-100 text-gray-700',
  or: 'badge bg-yellow-100 text-yellow-700',
};

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant])}>
      {children}
    </span>
  );
}
