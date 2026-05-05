import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCDF, truncate } from '@/lib/utils';
import type { TopProduit } from '@/lib/reports.api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface TopProductsBarChartProps {
  data: TopProduit[];
  isLoading: boolean;
}

export function TopProductsBarChart({ data, isLoading }: TopProductsBarChartProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton h-5 w-48 rounded" />
          <div className="skeleton h-4 w-28 rounded" />
        </div>
        <div className="skeleton rounded" style={{ height: 220 }} />
      </div>
    );
  }

  const isEmpty = !data || data.length === 0;

  const chartData = {
    labels: (data ?? []).map((p) => truncate(p.nom, 25)),
    datasets: [
      {
        label: 'Quantité vendue',
        data: (data ?? []).map((p) => p.quantite),
        backgroundColor: '#2E86C1CC',
        borderColor: '#2E86C1',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: '#1A5C8ACC',
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'bar'>) => {
            const idx = ctx.dataIndex;
            const produit = data?.[idx];
            if (!produit) return '';
            return [
              ` ${produit.quantite} unités vendues`,
              ` CA : ${formatCDF(produit.ca)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f0f4f8' },
        ticks: {
          font: { size: 11 },
          callback: (v: number | string) => String(Math.round(Number(v))),
        },
        title: {
          display: true,
          text: 'Quantité vendue',
          font: { size: 11 },
          color: '#64748b',
        },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-primary">
          Top 5 produits — par quantité vendue
        </h2>
        <button
          type="button"
          onClick={() => navigate('/reports/sales')}
          className="flex items-center gap-1 text-xs text-primary-accent font-semibold
                     hover:underline focus:outline-none focus:ring-2 focus:ring-primary-accent/30 rounded"
        >
          Rapport détaillé
          <ArrowRight size={12} />
        </button>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center text-sm text-text-muted" style={{ height: 220 }}>
          Aucune vente sur la période
        </div>
      ) : (
        <div style={{ height: 220 }}>
          <Bar data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
