import { Line } from 'react-chartjs-2';
import { formatCDF } from '@/lib/utils';
import type { RevenueChartData } from '@/hooks/useRegionalDashboard';

interface RevenueLineChartProps {
  data: RevenueChartData | undefined;
  isLoading: boolean;
}

export function RevenueLineChart({ data, isLoading }: RevenueLineChartProps) {
  const datasets = (data?.datasets ?? []).map((d) => ({
    label: d.site,
    data: d.data,
    borderColor: d.color,
    backgroundColor: d.color + '18',
    tension: 0.35,
    fill: false,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: d.color,
    borderWidth: 2,
  }));

  return (
    <div className="rounded-xl shadow-card border border-border bg-bg-card p-5">
      <h2 className="text-section-title text-primary mb-5">Évolution du chiffre d'affaires</h2>

      {isLoading ? (
        <div className="skeleton w-full rounded-lg" style={{ height: 300 }} />
      ) : (
        <div style={{ height: 300 }}>
          <Line
            data={{ labels: data?.labels ?? [], datasets }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index' as const,
                intersect: false,
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top' as const,
                  labels: { boxWidth: 10, boxHeight: 10, borderRadius: 5, padding: 16 },
                },
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
                  grid: { display: false },
                  border: { display: false },
                  ticks: { font: { size: 11 }, maxRotation: 0 },
                },
                y: {
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
              animation: { duration: 300 },
            }}
          />
        </div>
      )}
    </div>
  );
}
