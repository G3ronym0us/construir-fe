'use client';

import { MapPin, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import LocationMethodSelector, { LocationMethod } from '@/components/checkout/LocationMethodSelector';
import MapPicker from '@/components/checkout/MapPicker';
import type { CheckoutData } from '@/types';

interface Step3LocationProps {
  register: UseFormRegister<CheckoutData>;
  errors: FieldErrors<CheckoutData>;
  locationMethod: LocationMethod;
  onLocationMethodChange: (method: LocationMethod) => void;
  latitude?: number;
  longitude?: number;
  onGetLocation: () => void;
  onMapLocationSelect: (lat: number, lng: number) => void;
}

export default function Step3Location({
  register,
  errors,
  locationMethod,
  onLocationMethodChange,
  latitude,
  longitude,
  onGetLocation,
  onMapLocationSelect
}: Step3LocationProps) {
  const t = useTranslations('checkout');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          {t('shippingAddress')}
        </h2>
        <p className="text-sm text-gray-600">
          {t('locationDescription', { defaultValue: 'Ingresa la dirección donde deseas recibir tu pedido' })}
        </p>
      </div>

      {/* Selector de Método de Ubicación */}
      <LocationMethodSelector
        value={locationMethod}
        onChange={onLocationMethodChange}
      />

      {/* Método Manual - Formulario completo */}
      {locationMethod === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('address')} *
            </label>
            <input
              type="text"
              {...register('address', { required: locationMethod === 'manual' })}
              placeholder={t('addressPlaceholder', { defaultValue: 'Calle, número, colonia' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.address && (
              <span className="text-red-500 text-xs mt-1">
                {t('errors.fieldRequired', { defaultValue: 'Este campo es requerido' })}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('city')} *
              </label>
              <input
                type="text"
                {...register('city', { required: locationMethod === 'manual' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('state')} *
              </label>
              <input
                type="text"
                {...register('state', { required: locationMethod === 'manual' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('zipCode')} *
              </label>
              <input
                type="text"
                {...register('zipCode', { required: locationMethod === 'manual' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('country')} *
              </label>
              <input
                type="text"
                {...register('country')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('additionalInfo')} ({t('optional')})
            </label>
            <textarea
              {...register('additionalInfo')}
              rows={3}
              placeholder={t('additionalInfoPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Método Automático */}
      {locationMethod === 'auto' && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <button
              type="button"
              onClick={onGetLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-5 h-5" />
              {t('getMyLocation')}
            </button>
            {latitude && longitude && (
              <div className="mt-3 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                ✓ {t('locationReceived')}: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            )}
          </div>

          {/* Campo opcional de detalles */}
          {latitude && longitude && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('locationDetails', { defaultValue: 'Detalles adicionales de la dirección' })} ({t('optional')})
              </label>
              <textarea
                {...register('additionalInfo')}
                rows={3}
                placeholder={t('locationDetailsPlaceholder', { defaultValue: 'Ej: Casa color blanca, portón negro, cerca del supermercado...' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      )}

      {/* Método Mapa */}
      {locationMethod === 'map' && (
        <div className="space-y-4">
          <MapPicker
            latitude={latitude}
            longitude={longitude}
            onLocationSelect={onMapLocationSelect}
          />

          {/* Campo opcional de detalles */}
          {latitude && longitude && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('locationDetails', { defaultValue: 'Detalles adicionales de la dirección' })} ({t('optional')})
              </label>
              <textarea
                {...register('additionalInfo')}
                rows={3}
                placeholder={t('locationDetailsPlaceholder', { defaultValue: 'Ej: Casa color blanca, portón negro, cerca del supermercado...' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
