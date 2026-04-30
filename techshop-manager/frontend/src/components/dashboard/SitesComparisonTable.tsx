import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCDF } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import type { ComparisonData } from '@/hooks/useRegionalDashboard';

interface SitesComparisonTableProps {
  data: ComparisonData | undefined;
  isLoading: boolean;
}

export function SitesComparisonTable({ data, isLoading }: SitesComparisonTableProps) {
  const navigate = useNavigate();
  const setSelectedSiteId = useUIStore((s) => s.setSelectedSiteId);

  const handleSiteClick = (siteId: string) => {
    setSelectedSiteId(siteId);
    navigate('/dashboard');
  };

  return (
    <div className="rounded-xl shadow-card border border-border bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-section-title text-primary">Performance par site</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-5 py-3">Site</th>
              <th className="px-5 py-3 text-right">CA</th>
              <th className="px-5 py-3 text-right">Variation</th>
              <th className="px-5 py-3 text-right">Ventes</th>
              <th className="px-5 py-3 text-right">Clients actifs</th>
              <th className="px-5 py-3 text-right">Alertes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="skeleton h-4 w-full rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <>
                {(data?.sites ?? []).map((site, i) => (
                  <tr
                    key={site.siteId}
                    className={cn(
                      'cursor-pointer transition-colors duration-100',
                      'hover:bg-blue-50/60',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-accent',
                    )}
                    style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                    onClick={() => handleSiteClick(site.siteId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSiteClick(site.siteId);
                      }
                    }}
                  >
                    <td className="px-5 py-3 font-semibold text-text">{site.siteNom}</td>
                    <td className="px-5 py-3 text-right font-bold text-success font-mono">
                      {formatCDF(site.ca)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {site.caVariation !== 0 ? (
                        <span className={cn(
                          'flex items-center justify-end gap-1 font-semibold',
                          site.caVariation > 0 ? 'text-success' : 'text-danger',
                        )}>
                          {site.caVariation > 0
                            ? <TrendingUp size={13} aria-hidden />
                            : <TrendingDown size={13} aria-hidden />}
                          {Math.abs(site.caVariation)}%
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-text-muted">{site.nbVentes}</td>
                    <td className="px-5 py-3 text-right text-text-muted">{site.nbClientsActifs}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-[11px] font-bold',
                        site.alertesStock > 0
                          ? 'bg-red-100 text-danger'
                          : 'bg-green-100 text-success',
                      )}>
                        {site.alertesStock}
                      </span>
                    </td>
                  </tr>
                ))}

                {data && (
                  <tr className="font-bold border-t border-border bg-slate-50">
                    <td className="px-5 py-3 text-text uppercase text-[12px] tracking-wide">TOTAL</td>
                    <td className="px-5 py-3 text-right text-success font-mono">
                      {formatCDF(data.totaux.ca)}
                    </td>
                    <td className="px-5 py-3" />
                    <td className="px-5 py-3 text-right text-text-muted">{data.totaux.nbVentes}</td>
                    <td className="px-5 py-3 text-right text-text-muted">{data.totaux.nbClientsActifs}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-[11px] font-bold',
                        data.totaux.alertesStock > 0
                          ? 'bg-red-100 text-danger'
                          : 'bg-green-100 text-success',
                      )}>
                        {data.totaux.alertesStock}
                      </span>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
