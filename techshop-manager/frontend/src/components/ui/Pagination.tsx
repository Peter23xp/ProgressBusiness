import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          'btn-ghost flex items-center gap-1 px-3 py-1.5 text-sm',
          page <= 1 && 'opacity-40 cursor-not-allowed',
        )}
      >
        <ChevronLeft size={16} />
        Préc.
      </button>

      <span className="text-sm text-gray-600 min-w-[90px] text-center">
        Page <span className="font-semibold text-primary-DEFAULT">{page}</span> / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          'btn-ghost flex items-center gap-1 px-3 py-1.5 text-sm',
          page >= totalPages && 'opacity-40 cursor-not-allowed',
        )}
      >
        Suiv.
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
