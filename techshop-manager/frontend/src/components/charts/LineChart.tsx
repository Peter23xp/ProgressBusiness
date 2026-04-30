import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const DEFAULT_COLORS = [
  '#2E86C1',
  '#1A6B3A',
  '#E65100',
  '#4A148C',
  '#B71C1C',
  '#1E3A5F',
];

interface DatasetInput {
  label: string;
  data: number[];
  color?: string;
}

interface LineChartProps {
  labels: string[];
  datasets: DatasetInput[];
  title?: string;
}

export function LineChart({ labels, datasets, title }: LineChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((ds, i) => {
      const color = ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 12 } },
      },
      title: title
        ? {
            display: true,
            text: title,
            font: { size: 14, weight: 'bold' as const },
            color: '#1E3A5F',
          }
        : { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'line'>) => {
            const value = typeof ctx.raw === 'number' ? ctx.raw : 0;
            const formatted = new Intl.NumberFormat('fr-CD', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
            return ` ${ctx.dataset.label}: ${formatted} CDF`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: '#f0f0f0' },
        ticks: {
          font: { size: 11 },
          callback: (value: number | string) =>
            new Intl.NumberFormat('fr-CD', { notation: 'compact' }).format(
              Number(value),
            ) + ' CDF',
        },
      },
    },
  };

  return (
    <div className="w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
