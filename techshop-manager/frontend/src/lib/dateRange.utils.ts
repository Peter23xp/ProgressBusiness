import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  subMonths,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export type PeriodPreset =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Calculates the DateRange for a given PeriodPreset.
 * Exported so all module hooks can reuse it.
 */
export function getDateRangeFromPreset(preset: PeriodPreset): DateRange {
  const now = new Date();

  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };

    case 'this_week':
      return {
        from: startOfWeek(now, { locale: fr }),
        to: endOfWeek(now, { locale: fr }),
      };

    case 'this_month':
      return { from: startOfMonth(now), to: endOfMonth(now) };

    case 'last_month': {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }

    case 'this_quarter':
      return { from: startOfQuarter(now), to: endOfQuarter(now) };

    case 'this_year':
      return { from: startOfYear(now), to: endOfYear(now) };

    case 'custom':
    default:
      // Default fallback: current month
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

/**
 * Automatically picks granularity based on range duration.
 * ≤ 31 days → day | 32–90 days → week | > 90 days → month
 */
export function getGranulariteFromRange(range: DateRange): 'day' | 'week' | 'month' {
  const diffMs = range.to.getTime() - range.from.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 31) return 'day';
  if (diffDays <= 90) return 'week';
  return 'month';
}

/** Format a Date as ISO date string "YYYY-MM-DD" using local timezone */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const PRESET_LABELS: Record<PeriodPreset, string> = {
  today: "Aujourd'hui",
  this_week: 'Cette semaine',
  this_month: 'Ce mois',
  last_month: 'Mois dernier',
  this_quarter: 'Ce trimestre',
  this_year: 'Cette année',
  custom: 'Personnalisé',
};
