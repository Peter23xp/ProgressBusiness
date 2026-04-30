import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (valid: boolean) => void;
  disabled?: boolean;
  error?: string;
}

type PhoneState = 'idle' | 'checking' | 'ok' | 'exists' | 'invalid';

function normalize(raw: string): string {
  let v = raw.trim();
  if (v.startsWith('+243')) v = v.slice(4);
  else if (v.startsWith('243')) v = v.slice(3);
  else if (v.startsWith('0')) v = v.slice(1);
  return v.replace(/\D/g, '').slice(0, 9);
}

export function PhoneInput({
  value,
  onChange,
  onValidityChange,
  disabled,
  error,
}: PhoneInputProps) {
  // value is always the full "+243XXXXXXXXX" or ""
  const digits = value.startsWith('+243') ? value.slice(4) : '';
  const [state, setState] = useState<PhoneState>('idle');
  const [existingClientId, setExistingClientId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValid = /^[0-9]{9}$/.test(digits);
  const showInvalid = digits.length > 3 && !isValid;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isValid) {
      setState(showInvalid ? 'invalid' : 'idle');
      onValidityChange?.(false);
      setExistingClientId(null);
      return;
    }

    setState('checking');
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get<{ exists: boolean; client?: { id: string } }>(
          `/clients/check-phone/${encodeURIComponent('+243' + digits)}`,
        );
        if (res.data.exists) {
          setState('exists');
          setExistingClientId(res.data.client?.id ?? null);
          onValidityChange?.(false);
        } else {
          setState('ok');
          setExistingClientId(null);
          onValidityChange?.(true);
        }
      } catch {
        setState('idle');
        onValidityChange?.(false);
      }
    }, 500);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [digits]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalize(e.target.value);
    onChange(normalized ? '+243' + normalized : '');
  };

  const borderClass =
    error || state === 'exists' || state === 'invalid'
      ? 'border-danger focus:ring-danger/30 focus:border-danger'
      : state === 'ok'
        ? 'border-success focus:ring-success/30 focus:border-success'
        : '';

  return (
    <div>
      <div className={cn(
        'flex items-center rounded-lg border border-border overflow-hidden transition-shadow',
        'focus-within:ring-2 focus-within:ring-primary-accent/30 focus-within:border-primary-accent',
        borderClass,
        disabled && 'opacity-50 cursor-not-allowed bg-bg',
      )}>
        <span className="px-3 py-2.5 text-[13px] text-text-muted font-mono bg-slate-50 border-r border-border select-none flex-shrink-0">
          +243
        </span>
        <div className="relative flex-1">
          <input
            type="tel"
            inputMode="numeric"
            placeholder="8X XXX XXXX"
            value={digits}
            onChange={handleChange}
            disabled={disabled}
            className="w-full px-3 py-2.5 text-[13px] font-mono text-text bg-transparent outline-none pr-9 disabled:cursor-not-allowed"
            maxLength={9}
            aria-invalid={state === 'exists' || state === 'invalid'}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden>
            {state === 'checking' && <Loader2 size={15} className="text-text-muted animate-spin" />}
            {state === 'ok'       && <CheckCircle2 size={15} className="text-success" />}
            {(state === 'exists' || state === 'invalid') && <XCircle size={15} className="text-danger" />}
          </span>
        </div>
      </div>

      {(error || state === 'invalid') && (
        <p className="mt-1 text-[11px] text-danger">Format : +243 8X XXX XXXX (9 chiffres)</p>
      )}
      {state === 'ok' && (
        <p className="mt-1 text-[11px] text-success">Numéro disponible ✓</p>
      )}
      {state === 'exists' && (
        <p className="mt-1 text-[11px] text-danger">
          Ce numéro est déjà enregistré.{' '}
          {existingClientId && (
            <Link
              to={`/clients/${existingClientId}`}
              className="underline font-semibold hover:text-danger/80"
            >
              Voir la fiche →
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
