import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher…',
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  // Propagate debounced value upward
  useEffect(() => {
    onChange(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  // Keep local state in sync if parent resets value externally
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        size={16}
        className="absolute left-3 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-accent/30 focus:border-primary-accent transition"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => { setLocalValue(''); onChange(''); }}
          className="absolute right-2.5 text-gray-400 hover:text-gray-600"
          aria-label="Effacer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
