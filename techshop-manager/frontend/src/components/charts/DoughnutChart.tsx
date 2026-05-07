import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DEFAULT_COLORS = [
  '#2E86C1',
  '#1A6B3A',
  '#E65100',
  '#4A148C',
  '#B71C1C',
  '#1E3A5F',
  '#D6E4F0',
  '#FFC107',
];

interface DoughnutChartProps {
  labels: string[];
  data: number[];
  colors?: string[];
}

export function DoughnutChart({ labels, data, colors }: DoughnutChartProps) {
  const backgroundColors = colors?.length
    ? colors
    : labels.map((_, i) => DEFAULT_COLORS[i % DEFAULT_COLORS.length]);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors.map((c) => c + 'CC'),
        borderColor: backgroundColors,
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'doughnut'>) => {
            const value = typeof ctx.raw === 'number' ? ctx.raw : 0;
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            const formatted = new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
            return ` ${ctx.label}: ${formatted} $ (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-sm">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
