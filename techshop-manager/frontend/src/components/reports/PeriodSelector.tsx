import {
  type PeriodPreset,
  type DateRange,
  PRESET_LABELS,
  getDateRangeFromPreset,
} from '@/lib/dateRange.utils';

interface PeriodSelectorProps {
  value: PeriodPreset;
  onChange: (preset: PeriodPreset, range: DateRange) => void;
  allowedPresets?: PeriodPreset[];
  showCustom?: boolean;
  disabled?: boolean;
}

const ALL_PRESETS: PeriodPreset[] = [
  'today',
  'this_week',
  'this_month',
  'last_month',
  'this_quarter',
  'this_year',
  'custom',
];

export function PeriodSelector({
  value,
  onChange,
  allowedPresets,
  showCustom = true,
  disabled = false,
}: PeriodSelectorProps) {
  const presets = (allowedPresets ?? ALL_PRESETS).filter(
    (p) => showCustom || p !== 'custom',
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value as PeriodPreset;
    const range = getDateRangeFromPreset(preset);
    onChange(preset, range);
  };

  return (
    <select
      id="period-selector"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className="h-9 rounded-lg border border-border bg-white px-3 py-0 text-sm text-text
                 focus:outline-none focus:ring-2 focus:ring-primary-accent/30 focus:border-primary-accent
                 transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Sélectionner une période"
    >
      {presets.map((p) => (
        <option key={p} value={p}>
          {PRESET_LABELS[p]}
        </option>
      ))}
    </select>
  );
}
