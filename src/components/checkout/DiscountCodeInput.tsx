'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Ticket } from 'lucide-react';

interface DiscountCodeInputProps {
  onApply: (code: string) => Promise<void>;
  error?: string | null;
  isApplying: boolean;
}

export default function DiscountCodeInput({ onApply, error, isApplying }: DiscountCodeInputProps) {
  const t = useTranslations('checkout');
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim().toUpperCase());
    }
  };

  return (
    <div className="border-t pt-4">
      <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700 mb-1">
        {t('discountCodeLabel')}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          id="discount-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('discountCodePlaceholder')}
          className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isApplying}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isApplying || !code.trim()}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Ticket className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
