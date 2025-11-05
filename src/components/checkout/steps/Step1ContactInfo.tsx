'use client';

import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { CheckoutData } from '@/types';

interface Step1ContactInfoProps {
  register: UseFormRegister<CheckoutData>;
  errors: FieldErrors<CheckoutData>;
}

export default function Step1ContactInfo({ register, errors }: Step1ContactInfoProps) {
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
