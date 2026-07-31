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
      <label className="block text-[13px] font-bold text-ink">
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
                rounded-2xl p-3.5 text-left transition-all
                ${isSelected
                  ? 'border-[1.5px] border-brand-600 bg-brand-50'
                  : 'border border-sand-300 bg-white hover:border-sand-400'
                }
              `}
            >
              <div className={`
                mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl
                ${isSelected ? 'bg-brand-100 text-brand-600' : 'bg-sand-100 text-sand-700'}
              `}>
                <Icon className="w-5 h-5" />
              </div>

              <h4 className="mb-1 text-[13.5px] font-bold text-ink">
                {method.title}
              </h4>
              <p className="text-xs font-medium text-sand-700">
                {method.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
