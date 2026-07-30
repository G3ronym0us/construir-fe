'use client';

import { useTranslations } from 'next-intl';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmModalProps) {
  const t = useTranslations('common');

  if (!isOpen) return null;

  const typeStyles = {
    danger: 'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500',
    warning: 'bg-accent-600 hover:bg-accent-700 focus:ring-accent-500',
    info: 'bg-brand-600 hover:bg-brand-700 focus:ring-brand-500',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative rounded-2xl border border-sand-300 bg-white-xl max-w-md w-full p-6 animate-[modalSlide_0.3s_ease-out]">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-danger-100 rounded-full">
            <svg
              className="w-6 h-6 text-danger-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-ink text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-sand-700 text-center mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-sand-700 bg-white border border-sand-300 rounded-lg hover:bg-sand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sand-500 transition-colors"
            >
              {cancelText || t('cancel')}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${typeStyles[type]}`}
            >
              {confirmText || t('confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
