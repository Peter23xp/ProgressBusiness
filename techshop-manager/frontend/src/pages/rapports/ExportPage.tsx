import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, FileText, Loader, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useExportJob } from '@/hooks/useExportJob';
import { reportsApi } from '@/lib/reports.api';
import { PeriodSelector } from '@/components/reports/PeriodSelector';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { getDateRangeFromPreset, type PeriodPreset, type DateRange, toISODate } from '@/lib/dateRange.utils';
import { cn } from '@/lib/utils';
import type { ExportType } from '@/lib/reports.api';

// ── Config métier ─────────────────────────────────────────────────────────────

const EXPORT_TYPES: Array<{ value: ExportType; label: string; desc: string; formats: Array<'XLSX' | 'PDF' | 'CSV'> }> = [
  { value: 'VENTES',        label: 'Ventes (synthèse)',      desc: 'Rapport synthèse des ventes avec graphiques', formats: ['XLSX', 'PDF', 'CSV'] },
  { value: 'VENTES_DETAIL', label: 'Ventes détaillé',        desc: 'Détail ligne par ligne de chaque transaction', formats: ['XLSX', 'CSV'] },
  { value: 'STOCKS',        label: 'Stocks multi-sites',     desc: 'Inventaire consolidé multi-sites', formats: ['XLSX', 'PDF', 'CSV'] },
  { value: 'PARRAINAGE',    label: 'Parrainage',             desc: 'Classement parrains, funnel et récompenses', formats: ['XLSX', 'PDF'] },
  { value: 'CLIENTS',       label: 'Clients',                desc: 'Liste complète des clients avec statuts', formats: ['XLSX', 'CSV'] },
  { value: 'FIDELITE',      label: 'Fidélité',               desc: 'Historique des points et niveaux fidélité', formats: ['XLSX', 'CSV'] },
];

const FORMAT_ICONS: Record<string, { color: string; desc: string }> = {
  XLSX: { color: 'text-green-600', desc: 'Excel' },
  PDF:  { color: 'text-red-500',   desc: 'Portable' },
  CSV:  { color: 'text-blue-500',  desc: 'Données brutes' },
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(1) + ' MB';
  return Math.round(bytes / 1_000) + ' KB';
}

// ── Formulaire export ─────────────────────────────────────────────────────────

interface ExportConfig {
  type: ExportType | '';
  format: 'XLSX' | 'PDF' | 'CSV';
  preset: PeriodPreset;
  dateRange: DateRange;
  siteId: string;
}

function ExportConfigForm({ config, setConfig, onSubmit, isSubmitting }: {
  config: ExportConfig;
  setConfig: (c: ExportConfig) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const selectedType = EXPORT_TYPES.find((t) => t.value === config.type);
  const availableFormats = selectedType?.formats ?? [];

  const estimateQuery = useQuery({
    queryKey: ['export-estimate', config.type, config.dateRange, config.siteId],
    queryFn: () =>
      reportsApi.getExportEstimate({
        type: config.type as string,
        dateDebut: toISODate(config.dateRange.from),
        dateFin: toISODate(config.dateRange.to),
        siteId: config.siteId || undefined,
      }),
    enabled: !!config.type,
    staleTime: 30_000,
  });

  const estimatedRows = estimateQuery.data?.estimatedRows ?? 0;
  const isHighVolume = estimatedRows > 50_000;

  const handlePresetChange = (p: PeriodPreset, r: DateRange) => {
    setConfig({ ...config, preset: p, dateRange: p !== 'custom' ? r : config.dateRange });
  };

  const handleTypeChange = (type: ExportType) => {
    const newType = EXPORT_TYPES.find((t) => t.value === type);
    const newFormat = newType?.formats.includes(config.format) ? config.format : newType?.formats[0] ?? 'XLSX';
    setConfig({ ...config, type, format: newFormat });
  };

  const canSubmit = !!config.type && !!config.format && !isSubmitting;

  // Aperçu textuel
  const preview = config.type
    ? `Export ${config.format} — ${selectedType?.label ?? config.type} — Du ${toISODate(config.dateRange.from)} au ${toISODate(config.dateRange.to)}${config.siteId ? ` — ${config.siteId}` : ' — Tous sites'}${estimatedRows > 0 ? ` — ~${estimatedRows.toLocaleString('fr-FR')} lignes` : ''}`
    : null;

  return (
    <div className="card space-y-6 max-w-2xl mx-auto">
      <h2 className="text-sm font-bold text-primary">Configuration de l'export</h2>

      {/* Type de rapport */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Type de rapport *</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXPORT_TYPES.map((t) => (
            <label
              key={t.value}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                config.type === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
              )}
            >
              <input
                type="radio"
                name="export-type"
                value={t.value}
                checked={config.type === t.value}
                onChange={() => handleTypeChange(t.value)}
                className="sr-only"
              />
              <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-current">
                {config.type === t.value && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-primary">{t.label}</p>
                <p className="text-[11px] text-text-muted">{t.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Format */}
      {config.type && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Format *</p>
          <div className="flex gap-3">
            {(['XLSX', 'PDF', 'CSV'] as const).map((fmt) => {
              const isAvailable = availableFormats.includes(fmt);
              const info = FORMAT_ICONS[fmt];
              return (
                <label
                  key={fmt}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-4 border-2 rounded-xl transition-all',
                    !isAvailable && 'opacity-30 cursor-not-allowed',
                    isAvailable && 'cursor-pointer',
                    config.format === fmt && isAvailable ? 'border-primary bg-primary/5' : 'border-border',
                    isAvailable && config.format !== fmt && 'hover:border-primary/50',
                  )}
                >
                  <input
                    type="radio"
                    name="export-format"
                    value={fmt}
                    checked={config.format === fmt}
                    disabled={!isAvailable}
                    onChange={() => isAvailable && setConfig({ ...config, format: fmt })}
                    className="sr-only"
                  />
                  <FileText size={22} className={info.color} />
                  <span className="font-bold text-sm text-primary">{fmt}</span>
                  <span className="text-[11px] text-text-muted">{info.desc}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Période */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Période *</p>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector value={config.preset} onChange={handlePresetChange} />
          {config.preset === 'custom' && (
            <DateRangePicker
              value={config.dateRange}
              onChange={(r) => setConfig({ ...config, dateRange: r, preset: 'custom' })}
              maxDate={new Date()}
            />
          )}
        </div>
      </div>

      {/* Site */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Site</p>
        <select
          value={config.siteId}
          onChange={(e) => setConfig({ ...config, siteId: e.target.value })}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm"
          aria-label="Sélectionner un site"
        >
          <option value="">Tous les sites</option>
          <option value="goma">Goma</option>
          <option value="bukavu">Bukavu</option>
          <option value="kinshasa">Kinshasa</option>
        </select>
      </div>

      {/* Estimation */}
      {config.type && estimatedRows > 0 && (
        <div className={cn(
          'rounded-xl border p-3 text-sm',
          isHighVolume ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200',
        )}>
          {isHighVolume && <AlertTriangle size={14} className="inline mr-1 text-warning" />}
          <span className={isHighVolume ? 'text-warning font-semibold' : 'text-primary-accent'}>
            ~{estimatedRows.toLocaleString('fr-FR')} lignes estimées
            {isHighVolume && ' — La génération peut prendre 2-3 minutes.'}
          </span>
        </div>
      )}

      {/* Aperçu */}
      {preview && (
        <div className="rounded-xl bg-slate-50 border border-border p-3 text-xs text-text-muted font-mono">
          {preview}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
        Générer l'export
      </button>
    </div>
  );
}

// ── Carte progression export ──────────────────────────────────────────────────

function ExportProgressCard({ config, status, isPolling, onReset }: {
  config: ExportConfig;
  status: ReturnType<typeof useExportJob>['status'];
  isPolling: boolean;
  onReset: () => void;
}) {
  const statut = status?.statut;

  return (
    <div className={cn(
      'card max-w-2xl mx-auto',
      statut === 'READY' && 'bg-green-50 border-green-200',
      statut === 'ERROR' && 'bg-red-50 border-red-200',
      (!statut || statut === 'PENDING') && 'bg-blue-50 border-blue-200',
    )}>
      <div className="flex items-center gap-3 mb-4">
        {(!statut || statut === 'PENDING') && <Loader size={20} className="text-blue-600 animate-spin" />}
        {statut === 'READY' && <CheckCircle size={20} className="text-success" />}
        {statut === 'ERROR' && <AlertTriangle size={20} className="text-danger" />}
        <div>
          <p className="font-semibold text-primary text-sm">
            {statut === 'READY' ? 'Export prêt !' : statut === 'ERROR' ? 'Erreur de génération' : 'Génération en cours…'}
          </p>
          <p className="text-xs text-text-muted">
            {config.type} — {config.format}
          </p>
        </div>
      </div>

      {(!statut || statut === 'PENDING') && (
        <div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-blue-500">Vérification automatique toutes les 2 secondes…</p>
          <p className="text-xs text-text-muted mt-1">Cela peut prendre jusqu'à 2 minutes.</p>
        </div>
      )}

      {statut === 'READY' && (
        <div className="space-y-3">
          {status?.fileName && (
            <p className="text-sm text-text">
              {status.fileName}
              {status.rowCount != null && ` — ${status.rowCount.toLocaleString('fr-FR')} lignes`}
              {status.fileSize != null && ` — ${formatFileSize(status.fileSize)}`}
            </p>
          )}
          {status?.downloadUrl && (
            <a
              href={status.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              <Download size={16} />
              Télécharger maintenant
            </a>
          )}
          {status?.expiresAt && (
            <p className="text-xs text-text-muted text-center">
              Lien valide jusqu'à {new Date(status.expiresAt).toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
      )}

      {statut === 'ERROR' && (
        <div className="space-y-3">
          <p className="text-sm text-danger">{status?.errorMsg ?? 'Une erreur est survenue lors de la génération.'}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="btn-secondary mt-4 w-full flex items-center justify-center gap-2 !min-h-0 h-9 text-sm"
      >
        <RefreshCw size={14} />
        Générer un autre export
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultPreset: PeriodPreset = 'this_month';
  const defaultRange = getDateRangeFromPreset(defaultPreset);

  const [config, setConfig] = useState<ExportConfig>({
    type: (searchParams.get('type') as ExportType) || '',
    format: 'XLSX',
    preset: defaultPreset,
    dateRange: (() => {
      const d = searchParams.get('dateDebut');
      const f = searchParams.get('dateFin');
      if (d && f) return { from: new Date(d), to: new Date(f) };
      return defaultRange;
    })(),
    siteId: searchParams.get('siteId') ?? '',
  });

  const { startJob, isStarting, status, isPolling, reset, startError } = useExportJob();

  const hasJob = status !== null;

  const handleSubmit = () => {
    if (!config.type) return;
    startJob({
      type: config.type as ExportType,
      format: config.format,
      filtres: {
        dateDebut: toISODate(config.dateRange.from),
        dateFin: toISODate(config.dateRange.to),
        ...(config.siteId ? { siteId: config.siteId } : {}),
      },
    });
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/reports')} className="btn-ghost !min-h-0 !p-1.5 rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-page-title text-primary">Export de rapports</h1>
            <p className="text-xs text-text-muted">Générer et télécharger des fichiers XLSX, PDF ou CSV</p>
          </div>
        </div>
      </div>

      {/* Erreur démarrage */}
      {startError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-danger max-w-2xl mx-auto">
          <AlertTriangle size={14} className="inline mr-1" />
          {startError instanceof Error ? startError.message : 'Erreur lors de la création du job.'}
        </div>
      )}

      {/* Formulaire ou progression */}
      {!hasJob ? (
        <ExportConfigForm
          config={config}
          setConfig={setConfig}
          onSubmit={handleSubmit}
          isSubmitting={isStarting}
        />
      ) : (
        <ExportProgressCard
          config={config}
          status={status}
          isPolling={isPolling}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
