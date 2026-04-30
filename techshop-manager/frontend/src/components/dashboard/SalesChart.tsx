import { Bar } from 'react-chartjs-2';
import { ShoppingCart } from 'lucide-react';
import { formatCDF } from '@/lib/utils';
import type { SalesChartData } from '@/hooks/useDashboard';

interface SalesChartProps {
  data: SalesChartData | undefined;
  isLoading: boolean;
  selectedSiteId: string | null;
}

export function SalesChart({ data, isLoading, selectedSiteId }: SalesChartProps) {
  const datasets = (data?.datasets ?? [])
    .filter((d) => !selectedSiteId || d.siteId === selectedSiteId)
    .map((d) => ({
      label: d.site,
      data: d.data,
      backgroundColor: d.color + 'cc',   // 80% opacity
      borderColor: d.color,
      borderWidth: 1,
      borderRadius: 5,
      borderSkipped: false as const,
    }));

  const isEmpty =
    !isLoading &&
    (!data || datasets.length === 0 || datasets.every((d) => d.data.every((v) => v === 0)));

  const stacked = selectedSiteId === null && datasets.length > 1;

  return (
    <div className="rounded-xl shadow-card border border-border bg-white p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-section-title text-primary">Ventes — 7 derniers jours</h2>
        {!isLoading && data && datasets.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {(data.datasets ?? []).map((d) => (
              <span key={d.siteId} className="flex items-center gap-1.5 text-xs text-text-muted">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                  aria-hidden
                />
                {d.site}
              </span>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="skeleton w-full rounded-lg" style={{ height: 280 }} />
      ) : isEmpty ? (
        <div
          className="flex flex-col items-center justify-center text-text-muted"
          style={{ height: 280 }}
          role="status"
          aria-live="polite"
        >
          <ShoppingCart size={30} className="mb-2 opacity-30" aria-hidden />
          <p className="text-sm">Aucune vente sur cette période</p>
        </div>
      ) : (
        <div style={{ height: 280 }}>
          <Bar
            data={{ labels: data?.labels ?? [], datasets }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  padding: 10,
                  cornerRadius: 8,
                  callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${formatCDF(ctx.parsed.y ?? 0)}`,
                  },
                },
              },
              scales: {
                x: {
                  stacked,
                  grid: { display: false },
                  border: { display: false },
                  ticks: { font: { size: 11 } },
                },
                y: {
                  stacked,
                  border: { display: false },
                  grid: { color: '#f1f5f9' },
                  ticks: {
                    font: { size: 11 },
                    callback: (value) => {
                      const n = Number(value as string | number);
                      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                      if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
                      return String(n);
                    },
                  },
                },
              },
              animation: {
                duration: 300,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
