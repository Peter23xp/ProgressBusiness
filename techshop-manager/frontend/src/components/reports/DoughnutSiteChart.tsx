import { useRef, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCDF } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

const SITE_COLORS: Record<string, string> = {
  Goma: '#2E86C1',
  Bukavu: '#1A6B3A',
  Kinshasa: '#E65100',
};
const FALLBACK_COLORS = ['#2E86C1', '#1A6B3A', '#E65100', '#4A148C', '#B71C1C'];

interface DoughnutSiteChartProps {
  data: Array<{ siteNom: string; ca: number; pourcentage: number }>;
  totalCA: number;
  isLoading: boolean;
}

/** Custom centre-text plugin for the doughnut */
function useCentrePlugin(totalCA: number) {
  return useRef({
    id: 'centreText',
    beforeDraw(chart: ChartJS) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const cx = (chartArea.left + chartArea.right) / 2;
      const cy = (chartArea.top + chartArea.bottom) / 2;
      ctx.save();

      // Main value
      ctx.font = 'bold 13px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#1E3A5F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Total', cx, cy - 10);

      ctx.font = 'bold 12px "Roboto Mono", monospace';
      ctx.fillStyle = '#2E86C1';
      const shortVal =
        totalCA >= 1_000_000
          ? (totalCA / 1_000_000).toFixed(1) + ' M CDF'
          : formatCDF(totalCA);
      ctx.fillText(shortVal, cx, cy + 8);

      ctx.restore();
    },
  }).current;
}

export function DoughnutSiteChart({ data, totalCA, isLoading }: DoughnutSiteChartProps) {
  const centrePlugin = useCentrePlugin(totalCA);

  if (isLoading) {
    return (
      <div className="card h-full flex flex-col gap-3">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
        <div className="flex justify-center mt-2">
          <div className="skeleton rounded-full" style={{ width: 180, height: 180 }} />
        </div>
        <div className="space-y-2 mt-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-4 w-full rounded" />)}
        </div>
      </div>
    );
  }

  const isEmpty = !data || data.length === 0;

  const chartData = {
    labels: data.map((s) => s.siteNom),
    datasets: [
      {
        data: data.map((s) => s.ca),
        backgroundColor: data.map((s, i) =>
          (SITE_COLORS[s.siteNom] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]) + 'CC',
        ),
        borderColor: data.map((s, i) =>
          SITE_COLORS[s.siteNom] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        ),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: { size: 12 },
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'doughnut'>) => {
            const val = typeof ctx.raw === 'number' ? ctx.raw : 0;
            const pct = data[ctx.dataIndex]?.pourcentage?.toFixed(1) ?? '0';
            return ` ${ctx.label} — ${formatCDF(val)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="mb-1">
        <h2 className="text-sm font-bold text-primary">Répartition par site</h2>
        <p className="text-xs text-text-muted mt-0.5">
          {totalCA >= 1_000_000
            ? (totalCA / 1_000_000).toFixed(1) + ' M CDF'
            : formatCDF(totalCA)}
        </p>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center text-sm text-text-muted py-8">
          Aucune vente sur la période
        </div>
      ) : (
        <div className="flex-1 flex items-center">
          <Doughnut
            data={chartData}
            options={options}
            plugins={[centrePlugin]}
          />
        </div>
      )}

    </div>
  );
}
