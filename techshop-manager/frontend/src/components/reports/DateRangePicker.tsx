import { useState, useRef, useEffect } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isWithinInterval, isBefore, isAfter, getDay, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { type DateRange } from '@/lib/dateRange.utils';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  maxDate?: Date;
  minDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

function formatRange(range: DateRange): string {
  return `Du ${format(range.from, 'dd/MM/yyyy')} au ${format(range.to, 'dd/MM/yyyy')}`;
}

function MonthCalendar({
  month,
  selectionStart,
  selectionEnd,
  hoverDate,
  onDayClick,
  onDayHover,
  minDate,
  maxDate,
}: {
  month: Date;
  selectionStart: Date | null;
  selectionEnd: Date | null;
  hoverDate: Date | null;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date | null) => void;
  minDate: Date;
  maxDate: Date;
}) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  // Leading blanks — week starts Monday
  const firstDayOfWeek = (getDay(startOfMonth(month)) + 6) % 7; // 0=Mon
  const blanks = Array.from({ length: firstDayOfWeek });

  const rangeEnd = selectionEnd ?? hoverDate;

  const isInRange = (d: Date) => {
    if (!selectionStart || !rangeEnd) return false;
    const lo = isBefore(selectionStart, rangeEnd) ? selectionStart : rangeEnd;
    const hi = isBefore(selectionStart, rangeEnd) ? rangeEnd : selectionStart;
    return isWithinInterval(d, { start: lo, end: hi });
  };

  return (
    <div className="flex-1 min-w-[220px]">
      <p className="text-center text-sm font-semibold text-primary mb-3 capitalize">
        {format(month, 'MMMM yyyy', { locale: fr })}
      </p>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-center text-[11px] font-bold text-text-muted py-1">
            {d}
          </div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map((day) => {
          const isDisabled = isBefore(day, minDate) || isAfter(day, maxDate);
          const isStart = selectionStart ? isSameDay(day, selectionStart) : false;
          const isEnd = selectionEnd ? isSameDay(day, selectionEnd) : false;
          const inRange = isInRange(day);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => !isDisabled && onDayClick(day)}
              onMouseEnter={() => !isDisabled && onDayHover(day)}
              onMouseLeave={() => onDayHover(null)}
              disabled={isDisabled}
              aria-label={format(day, 'dd MMMM yyyy', { locale: fr })}
              className={cn(
                'relative h-8 w-full flex items-center justify-center text-[12px] transition-colors duration-100',
                isDisabled && 'opacity-30 cursor-not-allowed',
                !isDisabled && 'cursor-pointer',
                (isStart || isEnd) && 'bg-primary-accent text-white font-bold rounded-full z-10',
                inRange && !isStart && !isEnd && 'bg-blue-100 text-primary rounded-none',
                !inRange && !isStart && !isEnd && !isDisabled && 'hover:bg-slate-100 rounded-full',
                isToday && !isStart && !isEnd && 'font-bold text-primary-accent',
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  value,
  onChange,
  maxDate,
  minDate,
  placeholder = 'Sélectionner une plage',
  disabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [leftMonth, setLeftMonth] = useState<Date>(startOfMonth(value.from));
  const [selectionStart, setSelectionStart] = useState<Date | null>(value.from);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(value.to);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [step, setStep] = useState<'start' | 'end'>('start');
  const ref = useRef<HTMLDivElement>(null);

  const effectiveMax = maxDate ?? new Date();
  const effectiveMin = minDate ?? subMonths(new Date(), 24);

  const rightMonth = addMonths(leftMonth, 1);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Sync internal state when value prop changes
  useEffect(() => {
    setSelectionStart(value.from);
    setSelectionEnd(value.to);
    setLeftMonth(startOfMonth(value.from));
    setStep('start');
  }, [value]);

  const handleOpen = () => {
    if (disabled) return;
    setSelectionStart(value.from);
    setSelectionEnd(value.to);
    setStep('start');
    setOpen(true);
  };

  const handleDayClick = (day: Date) => {
    if (step === 'start') {
      setSelectionStart(day);
      setSelectionEnd(null);
      setStep('end');
    } else {
      if (selectionStart && isBefore(day, selectionStart)) {
        // Clicked before start → swap
        setSelectionEnd(selectionStart);
        setSelectionStart(day);
      } else {
        setSelectionEnd(day);
      }
      setStep('start');
    }
  };

  const handleApply = () => {
    if (selectionStart && selectionEnd) {
      const from = isBefore(selectionStart, selectionEnd) ? selectionStart : selectionEnd;
      const to = isBefore(selectionStart, selectionEnd) ? selectionEnd : selectionStart;
      onChange({ from, to });
      setOpen(false);
    }
  };

  const handleReset = () => {
    setSelectionStart(value.from);
    setSelectionEnd(value.to);
    setStep('start');
  };

  function subMonthsFn(d: Date, n: number) {
    return subMonths(d, n);
  }

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        id="date-range-picker-trigger"
        className={cn(
          'inline-flex items-center gap-2 h-9 rounded-lg border border-border bg-white px-3',
          'text-sm text-text transition-colors duration-150',
          'hover:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          open && 'border-primary-accent ring-2 ring-primary-accent/30',
        )}
        aria-label={
          open && selectionStart && selectionEnd
            ? `Du ${format(selectionStart, 'dd/MM/yyyy')} au ${format(selectionEnd, 'dd/MM/yyyy')}`
            : placeholder
        }
        aria-expanded={open}
      >
        <CalendarRange size={14} className="text-primary-accent flex-shrink-0" />
        <span className="whitespace-nowrap">
          {selectionStart && selectionEnd ? formatRange({ from: selectionStart, to: selectionEnd }) : placeholder}
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-border p-4
                     animate-in fade-in-0 zoom-in-95 duration-150"
          role="dialog"
          aria-label="Sélecteur de plage de dates"
        >
          {/* Step hint */}
          <p className="text-xs text-text-muted mb-3">
            {step === 'start' ? '① Cliquez sur la date de début' : '② Cliquez sur la date de fin'}
          </p>

          {/* Month navigation + calendars */}
          <div className="flex items-start gap-6">
            {/* Left month nav */}
            <button
              type="button"
              onClick={() => setLeftMonth((m) => subMonthsFn(m, 1))}
              className="mt-5 btn-ghost !min-h-0 !p-1 rounded-md"
              aria-label="Mois précédent"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Left calendar */}
            <MonthCalendar
              month={leftMonth}
              selectionStart={selectionStart}
              selectionEnd={selectionEnd}
              hoverDate={hoverDate}
              onDayClick={handleDayClick}
              onDayHover={setHoverDate}
              minDate={effectiveMin}
              maxDate={effectiveMax}
            />

            {/* Right calendar (hidden on small screens) */}
            <div className="hidden sm:block">
              <MonthCalendar
                month={rightMonth}
                selectionStart={selectionStart}
                selectionEnd={selectionEnd}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
                minDate={effectiveMin}
                maxDate={effectiveMax}
              />
            </div>

            {/* Right month nav */}
            <button
              type="button"
              onClick={() => setLeftMonth((m) => addMonths(m, 1))}
              className="mt-5 btn-ghost !min-h-0 !p-1 rounded-md"
              aria-label="Mois suivant"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <button
              type="button"
              onClick={handleReset}
              className="btn-ghost !min-h-0 text-xs px-2 py-1 flex items-center gap-1"
            >
              <X size={12} />
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!selectionStart || !selectionEnd}
              className="btn-primary !min-h-0 text-xs px-3 py-1.5 disabled:opacity-40"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
