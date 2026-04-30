import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Download, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRegionalDashboard } from '@/hooks/useRegionalDashboard';
import { SitesComparisonTable } from '@/components/dashboard/SitesComparisonTable';
import { RevenueLineChart } from '@/components/dashboard/RevenueLineChart';
import { TopProductsList } from '@/components/dashboard/TopProductsList';
import { TopParrainsList } from '@/components/dashboard/TopParrainsList';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type Period = 'month' | 'quarter' | 'year';

const periodLabel: Record<Period, string> = {
  month: 'Ce mois',
  quarter: 'Ce trimestre',
  year: 'Cette année',
};

export default function DashboardRegionalPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('month');
  const [isExporting, setIsExporting] = useState(false);

  const { comparison, revenueChart, topProducts, topParrains, isAnyLoading, refetchAll, error } =
    useRegionalDashboard(period);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: job } = await api.post('/rapports/export', {
        type: 'DASHBOARD_REGIONAL',
        format: 'PDF',
        filtres: { period },
      });
      const jobId = job.id ?? job.jobId;

      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > 30) {
          clearInterval(poll);
          setIsExporting(false);
          toast.error('Erreur lors de la génération du rapport.');
          return;
        }
        try {
          const { data: status } = await api.get(`/rapports/export/${jobId}`);
          if (status.statut === 'READY' || status.status === 'READY') {
            clearInterval(poll);
            setIsExporting(false);
            window.open(status.downloadUrl, '_blank');
            toast.success('Rapport PDF téléchargé avec succès.');
          } else if (status.statut === 'ERROR' || status.status === 'ERROR') {
            clearInterval(poll);
            setIsExporting(false);
            toast.error('Erreur lors de la génération du rapport.');
          }
        } catch {
          clearInterval(poll);
          setIsExporting(false);
          toast.error('Erreur lors de la génération du rapport.');
        }
      }, 2000);
    } catch {
      setIsExporting(false);
      toast.error('Erreur lors de la génération du rapport.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Vue Régionale</h1>
          <p className="text-sm text-text-muted mt-1">Comparatif de performance par site</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period selector */}
          <div className="period-toggle" role="group" aria-label="Période">
            {(['month', 'quarter', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn('period-btn', period === p && 'active')}
              >
                {periodLabel[p]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={refetchAll}
            disabled={isAnyLoading}
            className={cn(
              'p-1.5 rounded-lg border border-border text-text-muted transition-colors',
              'hover:border-border-strong hover:text-text',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
            title="Actualiser"
            aria-label="Actualiser les données"
          >
            <RefreshCw size={16} className={cn(isAnyLoading && 'animate-spin')} aria-hidden />
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
              'bg-primary-accent text-white hover:bg-blue-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2',
              'disabled:opacity-60 disabled:cursor-not-allowed',
            )}
          >
            {isExporting ? (
              <>
                <RefreshCw size={14} className="animate-spin" aria-hidden />
                Génération...
              </>
            ) : (
              <>
                <Download size={14} aria-hidden />
                Export PDF
              </>
            )}
          </button>

          <button
            type="button"
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent rounded',
            )}
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={14} aria-hidden />
            Vue principale
          </button>
        </div>
      </div>

      {error && (
        <div
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-danger">Impossible de charger les données régionales.</p>
          <button
            type="button"
            onClick={refetchAll}
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium text-danger hover:underline',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger rounded',
            )}
          >
            <RefreshCw size={14} aria-hidden />
            Réessayer
          </button>
        </div>
      )}

      <SitesComparisonTable data={comparison.data} isLoading={comparison.isLoading} />

      <RevenueLineChart data={revenueChart.data} isLoading={revenueChart.isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsList data={topProducts.data} isLoading={topProducts.isLoading} />
        <TopParrainsList data={topParrains.data} isLoading={topParrains.isLoading} />
      </div>
    </div>
  );
}
