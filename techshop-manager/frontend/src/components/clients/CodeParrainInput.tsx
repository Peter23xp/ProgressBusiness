import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface CodeParrainInputProps {
  value: string;
  onChange: (value: string) => void;
  currentClientPhone?: string;
  disabled?: boolean;
  error?: string;
}

type CodeState = 'idle' | 'checking' | 'ok' | 'notfound' | 'self';

export function CodeParrainInput({
  value,
  onChange,
  currentClientPhone,
  disabled,
  error,
}: CodeParrainInputProps) {
  const [state, setState] = useState<CodeState>('idle');
  const [parrainNom, setParrainNom] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value || value.length < 4) {
      setState('idle');
      setParrainNom('');
      return;
    }

    setState('checking');
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get<{ valid: boolean; parrainNom?: string; parrain?: { telephone?: string } }>(
          `/parrainage/check-code/${encodeURIComponent(value)}`,
        );
        if (res.data.valid) {
          // Anti auto-parrainage
          if (currentClientPhone && res.data.parrain?.telephone === currentClientPhone) {
            setState('self');
            setParrainNom('');
          } else {
            setState('ok');
            setParrainNom(res.data.parrainNom ?? '');
          }
        } else {
          setState('notfound');
          setParrainNom('');
        }
      } catch {
        setState('notfound');
        setParrainNom('');
      }
    }, 500);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value, currentClientPhone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Force uppercase, strip non alphanumeric except dash
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    onChange(raw);
  };

  const borderClass =
    error || state === 'notfound' || state === 'self'
      ? 'border-danger focus:ring-danger/30 focus:border-danger'
      : state === 'ok'
        ? 'border-success focus:ring-success/30 focus:border-success'
        : '';

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          placeholder="ex: TSG-0042"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          maxLength={8}
          className={cn(
            'w-full px-3 py-2.5 pr-9 rounded-lg border border-border text-[13px] font-mono text-text bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-accent/30 focus:border-primary-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg',
            'transition-colors',
            borderClass,
          )}
          aria-invalid={state === 'notfound' || state === 'self'}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden>
          {state === 'checking' && <Loader2 size={15} className="text-text-muted animate-spin" />}
          {state === 'ok'       && <CheckCircle2 size={15} className="text-success" />}
          {(state === 'notfound' || state === 'self') && <XCircle size={15} className="text-danger" />}
        </span>
      </div>

      {state === 'ok' && parrainNom && (
        <p className="mt-1 text-[11px] text-success">✓ Parrain : {parrainNom}</p>
      )}
      {state === 'ok' && !parrainNom && (
        <p className="mt-1 text-[11px] text-success">Code parrain valide ✓</p>
      )}
      {state === 'notfound' && (
        <p className="mt-1 text-[11px] text-danger">Code parrain introuvable.</p>
      )}
      {state === 'self' && (
        <p className="mt-1 text-[11px] text-danger">Auto-parrainage interdit.</p>
      )}
    </div>
  );
}
