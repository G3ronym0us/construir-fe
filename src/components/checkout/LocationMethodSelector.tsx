'use client';

import { MapPin, Map, Edit3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type LocationMethod = 'auto' | 'map' | 'manual';

/**
 * Métodos de ubicación habilitados hoy.
 *
 * `auto` (GPS del navegador) y `map` (Leaflet) funcionan y guardan latitud y
 * longitud, pero el payload que consume OrbisNet no tiene campo para
 * coordenadas: `address_1` viaja con el relleno «Coordenadas GPS» y el ERP se
 * queda sin saber a dónde ir. Sólo la dirección escrita llega completa.
 *
 * Quedan fuera hasta terminar sus pruebas. Para reactivarlos basta agregarlos
 * a esta lista — el resto del checkout ya los soporta.
 */
export const METODOS_HABILITADOS: LocationMethod[] = ['manual'];

export const esMetodoHabilitado = (m: unknown): m is LocationMethod =>
  typeof m === 'string' && METODOS_HABILITADOS.includes(m as LocationMethod);

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
  ].filter((m) => METODOS_HABILITADOS.includes(m.id));

  // Con un solo método no hay nada que elegir: mostrar un selector de una sola
  // opción sólo agrega ruido al checkout.
  if (methods.length < 2) return null;

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
