'use client';

import { MapPin, Map, Edit3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type LocationMethod = 'auto' | 'map' | 'manual';

interface LocationMethodSelectorProps {
  value: LocationMethod;
  onChange: (method: LocationMethod) => void;
}

export default function LocationMethodSelector({ value, onChange }: LocationMethodSelectorProps) {
  const t = useTranslations('checkout');

  const methods = [
    {
      id: 'auto' as LocationMethod,
      icon: MapPin,
      title: t('locationAuto'),
      description: t('locationAutoDesc'),
    },
    {
      id: 'map' as LocationMethod,
      icon: Map,
      title: t('locationMap'),
      description: t('locationMapDesc'),
    },
    {
      id: 'manual' as LocationMethod,
      icon: Edit3,
      title: t('locationManual'),
      description: t('locationManualDesc'),
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-900">
        {t('locationMethodLabel')}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              className={`
                p-4 border-2 rounded-lg text-left transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
                }
              `}
            >
              <div className={`
                inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3
                ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
              `}>
                <Icon className="w-5 h-5" />
              </div>

              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {method.title}
              </h4>
              <p className="text-xs text-gray-600">
                {method.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
