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
        <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Mail className="w-5 h-5 text-brand-600" />
          {t('contactInfo')}
        </h2>
        <p className="text-sm text-sand-700">
          {t('contactInfoDescription', { defaultValue: 'Ingresa tu información de contacto para procesar tu pedido' })}
        </p>
      </div>

      {/* Campos de Identificación (solo para guests) */}
      {!isAuthenticated && (
        <div className="border border-brand-200 bg-brand-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 text-brand-900 font-medium">
            <Search className="w-4 h-4" />
            <span>{t('identification', { defaultValue: 'Identificación' })}</span>
          </div>
          <p className="text-sm text-brand-700">
            {t('identificationDescription', { defaultValue: 'Si ya compraste antes, ingresa tu identificación y luego tu correo o teléfono para autocompletar tus datos' })}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
                {t('identificationType', { defaultValue: 'Tipo' })}
              </label>
              <select
                value={identificationType || IdentificationType.V}
                onChange={(e) => onIdentificationChange(e.target.value as IdentificationType, identificationNumber || '')}
                className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              >
                <option value={IdentificationType.V}>V - Venezolano</option>
                <option value={IdentificationType.E}>E - Extranjero</option>
                <option value={IdentificationType.J}>J - Jurídico</option>
                <option value={IdentificationType.G}>G - Gobierno</option>
                <option value={IdentificationType.P}>P - Pasaporte</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
                {t('identificationNumber', { defaultValue: 'Número de Identificación' })}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identificationNumber || ''}
                  onChange={(e) => onIdentificationChange(identificationType || IdentificationType.V, e.target.value)}
                  onBlur={onIdentificationBlur}
                  placeholder={t('identificationPlaceholder', { defaultValue: 'Ej: 12345678' })}
                  className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
            {t('firstName')} *
          </label>
          <input
            type="text"
            {...register('firstName', { required: true })}
            className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
          {errors.firstName && (
            <span className="text-danger-500 text-xs mt-1">
              {t('errors.fieldRequired', { defaultValue: 'Este campo es requerido' })}
            </span>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
            {t('lastName')} *
          </label>
          <input
            type="text"
            {...register('lastName', { required: true })}
            className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
          {errors.lastName && (
            <span className="text-danger-500 text-xs mt-1">
              {t('errors.fieldRequired', { defaultValue: 'Este campo es requerido' })}
            </span>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
            {t('email')} *
          </label>
          <input
            type="email"
            {...register('email', {
              required: true,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
            })}
            className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
          {errors.email && (
            <span className="text-danger-500 text-xs mt-1">
              {t('errors.emailInvalid', { defaultValue: 'Email válido requerido' })}
            </span>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
            {t('phone')} *
          </label>
          <input
            type="tel"
            {...register('phone', { required: true })}
            className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
          {errors.phone && (
            <span className="text-danger-500 text-xs mt-1">
              {t('errors.fieldRequired', { defaultValue: 'Este campo es requerido' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
