import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StockAlert } from '@/hooks/useDashboard';

interface StockAlertsProps {
  data: StockAlert[] | undefined;
  isLoading: boolean;
  canManage?: boolean;
}

const alertStyle: Record<StockAlert['type'], { row: string; icon: string; badge: string }> = {
  RUPTURE: {
    row:   'bg-red-50 border border-red-100',
    icon:  'text-danger',
    badge: 'bg-red-100 text-danger',
  },
  ALERTE: {
    row:   'bg-amber-50 border border-amber-100',
    icon:  'text-warning',
    badge: 'bg-amber-100 text-warning',
  },
};

export function StockAlerts({ data, isLoading, canManage = true }: StockAlertsProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl shadow-card border border-border bg-white p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-section-title text-primary">Alertes stock</h2>
        {canManage && (
          <button
            type="button"
            className="text-[13px] font-semibold text-primary-accent hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent rounded"
            onClick={() => navigate('/stocks/alerts')}
          >
            Gérer →
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div
          className="flex items-center gap-3 rounded-lg p-4 bg-green-50 border border-green-100"
          role="status"
          aria-live="polite"
        >
          <CheckCircle size={20} className="text-success flex-shrink-0" aria-hidden />
          <p className="text-[13px] font-semibold text-success">Tous les stocks sont suffisants</p>
        </div>
      ) : (
        <ol className="space-y-2">
          {data.slice(0, 3).map((alert, i) => {
            const { row, icon, badge } = alertStyle[alert.type];
            return (
              <li key={i}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-150',
                    row,
                    'hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent',
                  )}
                  onClick={() => navigate(`/stocks?alert=${alert.sku}`)}
                >
                  <Package size={18} className={cn(icon, 'flex-shrink-0')} aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-text truncate">{alert.produitNom}</p>
                    <p className="text-[11px] text-text-muted font-mono">{alert.siteNom} · SKU: {alert.sku}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[11px] text-text-muted font-mono">
                      {alert.stockActuel}/{alert.seuilAlerte}
                    </span>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide', badge)}>
                      {alert.type}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
