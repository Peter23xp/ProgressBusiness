import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  variant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        {/* Icon + message */}
        <div className="flex gap-3 items-start">
          <div
            className={cn(
              'flex-shrink-0 rounded-full p-2',
              variant === 'danger' ? 'bg-red-50' : 'bg-primary-light',
            )}
          >
            {variant === 'danger' ? (
              <Trash2 size={20} className="text-danger" />
            ) : (
              <AlertTriangle size={20} className="text-primary-accent" />
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pt-1">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex items-center gap-2',
              variant === 'danger' ? 'btn-danger' : 'btn-primary',
            )}
          >
            {loading && <LoadingSpinner size="sm" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
