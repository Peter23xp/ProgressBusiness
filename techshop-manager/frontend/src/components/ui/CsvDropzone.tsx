import { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CsvDropzoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function CsvDropzone({
  onFileSelected,
  accept = '.csv',
  maxSizeMB = 5,
  disabled,
}: CsvDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validate = (f: File): string | null => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!accept.includes(`.${ext}`)) return 'Seuls les fichiers .csv sont acceptés.';
    if (f.size > maxSizeMB * 1024 * 1024) return `Fichier trop volumineux (max ${maxSizeMB} MB).`;
    return null;
  };

  const pick = (f: File) => {
    const err = validate(f);
    setFileError(err);
    if (err) return;
    setSelected(f);
    onFileSelected(f);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) pick(f);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) pick(f);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Zone de dépôt de fichier CSV"
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-150',
          disabled && 'opacity-50 cursor-not-allowed',
          dragging && !disabled       ? 'border-primary-accent bg-primary-light/30'
          : selected && !fileError    ? 'border-success bg-green-50'
          : fileError                 ? 'border-danger bg-red-50'
                                      : 'border-border hover:border-primary-accent hover:bg-primary-light/10',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          aria-hidden
          disabled={disabled}
          onChange={handleChange}
        />

        {selected && !fileError ? (
          <div className="flex flex-col items-center gap-2">
            <FileText size={40} className="text-success" aria-hidden />
            <p className="font-semibold text-success text-[14px]">{selected.name}</p>
            <p className="text-[12px] text-text-muted">
              {(selected.size / 1024).toFixed(1)} Ko
            </p>
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1 mt-1 px-3 py-1 rounded-lg border border-border text-[12px] text-text-muted hover:text-danger hover:border-danger transition-colors"
            >
              <X size={12} aria-hidden /> Supprimer
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={40} className="text-text-muted opacity-40" aria-hidden />
            <p className="font-medium text-[14px] text-text">
              Glissez votre fichier CSV ici
            </p>
            <p className="text-[12px] text-text-muted">
              ou <span className="text-primary-accent font-semibold">parcourir…</span>
              {' '}— max {maxSizeMB} MB, UTF-8
            </p>
          </div>
        )}
      </div>

      {fileError && (
        <p className="mt-2 text-[12px] text-danger font-medium">{fileError}</p>
      )}
    </div>
  );
}
