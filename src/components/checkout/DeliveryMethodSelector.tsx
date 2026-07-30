'use client';

import { Store, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DeliveryMethod } from '@/types';

interface DeliveryMethodSelectorProps {
  value: DeliveryMethod;
  onChange: (method: DeliveryMethod) => void;
}

export default function DeliveryMethodSelector({ value, onChange }: DeliveryMethodSelectorProps) {
  const t = useTranslations('checkout');

  const methods = [
    {
      id: 'delivery' as DeliveryMethod,
      icon: Truck,
      title: t('deliveryTitle'),
      description: t('deliveryDescription'),
      badge: '',
    },
    {
      id: 'pickup' as DeliveryMethod,
      icon: Store,
      title: t('pickupTitle'),
      description: t('pickupDescription'),
      badge: t('free'),
    },
  ];

  return (
    <div>
      <label className="mb-3 block font-display text-[15px] font-bold text-ink">
        {t('deliveryMethodLabel')}
      </label>
      <div className="flex flex-col gap-2.5">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              aria-pressed={isSelected}
              className={`flex items-start gap-3 rounded-2xl p-3.5 text-left transition-all ${
                isSelected
                  ? 'border-[1.5px] border-brand-600 bg-brand-50'
                  : 'border border-sand-300 bg-white hover:border-sand-400'
              }`}
            >
              {/* Radio */}
              <span
                className={`mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full ${
                  isSelected
                    ? 'bg-brand-600 shadow-[inset_0_0_0_3.5px_#fff]'
                    : 'border-[1.5px] border-sand-400'
                }`}
              />

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
                  <Icon className="h-4 w-4 flex-none text-sand-700" strokeWidth={2} />
                  {method.title}
                </span>
                <span className="mt-1 block text-xs font-medium text-sand-700">
                  {method.description}
                </span>
              </span>

              {method.badge && (
                <span className="flex-none text-[13.5px] font-extrabold text-success-600">
                  {method.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
