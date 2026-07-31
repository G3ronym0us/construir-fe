'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

interface DiscountCodeInputProps {
  onApply: (code: string) => Promise<void>;
  error?: string | null;
  isApplying: boolean;
  /** Sin el filete y la etiqueta superiores, para el carrito. */
  bare?: boolean;
}

export default function DiscountCodeInput({
  onApply,
  error,
  isApplying,
  bare = false,
}: DiscountCodeInputProps) {
  const t = useTranslations('checkout');
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim().toUpperCase());
    }
  };

  return (
    <div className={bare ? '' : 'border-t border-sand-200 pt-4'}>
      {!bare && (
        <label htmlFor="discount-code" className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
          {t('discountCodeLabel')}
        </label>
      )}
      <div className="flex gap-2.5">
        <input
          type="text"
          id="discount-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('discountCodePlaceholder')}
          aria-label={bare ? t('discountCodeLabel') : undefined}
          className="min-h-11 w-full flex-1 rounded-xl border border-sand-300 bg-sand-100 px-3.5 text-[13px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          disabled={isApplying}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isApplying || !code.trim()}
          className="flex min-h-11 flex-none items-center justify-center rounded-xl border-[1.5px] border-ink px-4 text-[13px] font-bold text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : t('applyDiscount')}
        </button>
      </div>
      {error && <p className="mt-2 text-[12.5px] font-semibold text-danger-600">{error}</p>}
    </div>
  );
}
