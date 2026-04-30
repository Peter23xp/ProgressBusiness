import { useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const focus = (idx: number) => {
    const target = inputsRef.current[Math.max(0, Math.min(idx, length - 1))];
    target?.focus();
    target?.select();
  };

  const update = (idx: number, char: string) => {
    const next = digits.slice();
    next[idx] = char;
    const newVal = next.join('');
    onChange(newVal);
    if (newVal.replace(/\s/g, '').length === length && !next.includes('')) {
      onComplete?.(newVal);
    }
    return next;
  };

  const handleChange = (idx: number, raw: string) => {
    const char = raw.replace(/\D/g, '').slice(-1);
    if (!char) return;
    update(idx, char);
    if (idx < length - 1) focus(idx + 1);
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[idx]) {
        update(idx, '');
      } else if (idx > 0) {
        update(idx - 1, '');
        focus(idx - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focus(idx - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focus(idx + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    const newVal = next.join('');
    onChange(newVal);
    if (pasted.length === length) {
      onComplete?.(newVal);
      focus(length - 1);
    } else {
      focus(pasted.length);
    }
  };

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="Code OTP">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] ?? ''}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Chiffre ${idx + 1}`}
          className={cn(
            'w-11 h-13 text-center text-xl font-mono border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent transition',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError
              ? 'border-danger bg-red-50 animate-shake'
              : digits[idx]
              ? 'border-primary-accent bg-blue-50'
              : 'border-gray-300 bg-white',
          )}
          style={{ width: '2.75rem', height: '3.25rem' }}
        />
      ))}
    </div>
  );
}
