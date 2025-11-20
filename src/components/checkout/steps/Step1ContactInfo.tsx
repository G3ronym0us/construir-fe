'use client';

import { Mail, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { CheckoutData } from '@/types';
import { IdentificationType } from '@/types';

interface Step1ContactInfoProps {
  register: UseFormRegister<CheckoutData>;
  errors: FieldErrors<CheckoutData>;
  isAuthenticated: boolean;
  identificationType?: IdentificationType;
  identificationNumber?: string;
  onIdentificationChange: (type: IdentificationType, number: string) => void;
  onIdentificationBlur?: () => void;
  isSearching?: boolean;
}

export default function Step1ContactInfo({
  register,
  errors,
  isAuthenticated,
  identificationType,
  identificationNumber,
  onIdentificationChange,
  onIdentificationBlur,
  isSearching
}: Step1ContactInfoProps) {
  const t = useTranslations('checkout');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          {t('contactInfo')}
        </h2>
        <p className="text-sm text-gray-600">
          {t('contactInfoDescription', { defaultValue: 'Ingresa tu información de contacto para procesar tu pedido' })}
        </p>
      </div>

      {/* Campos de Identificación (solo para guests) */}
      {!isAuthenticated && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 text-blue-900 font-medium">
            <Search className="w-4 h-4" />
            <span>{t('identification', { defaultValue: 'Identificación' })}</span>
          </div>
          <p className="text-sm text-blue-700">
            {t('identificationDescription', { defaultValue: 'Ingresa tu identificación para autocompletar tus datos si ya has comprado antes' })}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('identificationType', { defaultValue: 'Tipo' })}
              </label>
              <select
                value={identificationType || IdentificationType.V}
                onChange={(e) => onIdentificationChange(e.target.value as IdentificationType, identificationNumber || '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={IdentificationType.V}>V - Venezolano</option>
                <option value={IdentificationType.E}>E - Extranjero</option>
                <option value={IdentificationType.J}>J - Jurídico</option>
                <option value={IdentificationType.G}>G - Gobierno</option>
                <option value={IdentificationType.P}>P - Pasaporte</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('identificationNumber', { defaultValue: 'Número de Identificación' })}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identificationNumber || ''}
                  onChange={(e) => onIdentificationChange(identificationType || IdentificationType.V, e.target.value)}
                  onBlur={onIdentificationBlur}
                  placeholder={t('identificationPlaceholder', { defaultValue: 'Ej: 12345678' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('firstName')} *
          </label>
          <input
            type="text"
            {...register('firstName', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.firstName && (
            <span className="text-red-500 text-xs mt-1">
              {t('errors.fieldRequired', { defaultValue: 'Este campo es requerido' })}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('lastName')} *
          </label>
          <input
            type="text"
            {...register('lastName', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.lastName && (
            <span className="text-red-500 text-xs mt-1">
              {t('errors.fieldRequired', { defaultValue: 'Este campo es requerido' })}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('email')} *
          </label>
          <input
            type="email"
            {...register('email', {
              required: true,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.email && (
            <span className="text-red-500 text-xs mt-1">
              {t('errors.emailInvalid', { defaultValue: 'Email válido requerido' })}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('phone')} *
          </label>
          <input
            type="tel"
            {...register('phone', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.phone && (
            <span className="text-red-500 text-xs mt-1">
              {t('errors.fieldRequired', { defaultValue: 'Este campo es requerido' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
