import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

interface BarChartProps {
  labels: string[];
  datasets: DatasetInput[];
  title?: string;
}

export function BarChart({ labels, datasets, title }: BarChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] + 'CC',
      borderColor: ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      borderWidth: 1,
      borderRadius: 4,
    })),
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
          label: (ctx: import('chart.js').TooltipItem<'bar'>) => {
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
      <Bar data={chartData} options={options} />
    </div>
  );
}
