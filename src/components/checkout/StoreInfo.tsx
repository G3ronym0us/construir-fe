'use client';

import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Información de la tienda (puede moverse a un archivo de configuración)
const STORE_INFO = {
  name: "Construir",
  address: "Tu dirección de tienda aquí",
  city: "Ciudad",
  phone: "0212-XXX-XXXX",
  hours: "Lunes a Viernes: 8am - 6pm, Sábados: 9am - 2pm",
  mapUrl: "https://maps.google.com/..."
};

export default function StoreInfo() {
  const t = useTranslations('checkout');

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        {t('pickupLocationTitle')}
      </h3>

      <div className="space-y-3">
        {/* Dirección */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">{STORE_INFO.name}</p>
            <p className="text-sm text-gray-600">{STORE_INFO.address}</p>
            <p className="text-sm text-gray-600">{STORE_INFO.city}</p>
          </div>
        </div>

        {/* Teléfono */}
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <a
            href={`tel:${STORE_INFO.phone}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {STORE_INFO.phone}
          </a>
        </div>

        {/* Horario */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">{STORE_INFO.hours}</p>
        </div>

        {/* Link al mapa */}
        <a
          href={STORE_INFO.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
        >
          {t('viewOnMap')}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Instrucciones */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">{t('note')}:</strong> {t('pickupInstructions')}
        </p>
      </div>
    </div>
  );
}
