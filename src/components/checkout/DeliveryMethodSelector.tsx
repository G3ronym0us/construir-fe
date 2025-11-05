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
      id: 'pickup' as DeliveryMethod,
      icon: Store,
      title: t('pickupTitle'),
      description: t('pickupDescription'),
      badge: t('free'),
    },
    {
      id: 'delivery' as DeliveryMethod,
      icon: Truck,
      title: t('deliveryTitle'),
      description: t('deliveryDescription'),
      badge: '',
    },
  ];

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-900 mb-4">
        {t('deliveryMethodLabel')}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              className={`
                relative p-6 border-2 rounded-lg text-left transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
                }
              `}
            >
              {/* Badge */}
              {method.badge && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {method.badge}
                </span>
              )}

              {/* Icon */}
              <div className={`
                inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4
                ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
              `}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {method.title}
              </h3>
              <p className="text-sm text-gray-600">
                {method.description}
              </p>

              {/* Radio indicator */}
              <div className="mt-4 flex items-center">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? 'border-blue-500' : 'border-gray-300'}
                `}>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                  {isSelected ? t('selected') : t('selectThis')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
