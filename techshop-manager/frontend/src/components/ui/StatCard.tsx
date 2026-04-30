import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  isLoading?: boolean;
}

const variantStyles: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'border-primary-light',
  success: 'border-green-200',
  warning: 'border-orange-200',
  danger: 'border-red-200',
};

const iconBgStyles: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'bg-primary-light text-primary-accent',
  success: 'bg-green-50 text-success',
  warning: 'bg-orange-50 text-warning',
  danger: 'bg-red-50 text-danger',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className={cn('stat-card border', variantStyles[variant])}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-7 w-32 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          <div className="skeleton h-10 w-10 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('stat-card border', variantStyles[variant])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
            {title}
          </p>
          <p
            className="mt-1 font-bold text-primary-DEFAULT leading-tight"
            style={{ fontSize: '22px' }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400 truncate">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              'flex-shrink-0 rounded-lg p-2.5',
              iconBgStyles[variant],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
