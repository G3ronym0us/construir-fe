'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: 'bg-success-50 border-success-500 text-success-700',
  error: 'bg-danger-50 border-danger-500 text-danger-700',
  warning: 'bg-accent-50 border-accent-500 text-accent-700',
  info: 'bg-brand-50 border-brand-500 text-brand-900',
};

const iconStyles = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  const t = useTranslations('common');

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 mb-3 rounded-lg border-l-4 shadow-lg
        animate-[slideIn_0.3s_ease-out]
        ${toastStyles[type]}
      `}
    >
      <span className="text-xl font-bold flex-shrink-0">
        {iconStyles[type]}
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-xl leading-none opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label={t('close')}
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
      {children}
    </div>
  );
}
