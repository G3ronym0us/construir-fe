'use client';

import { CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { PAYMENT_METHODS } from '@/config/payment';
import ZelleForm from '@/components/payment/ZelleForm';
import PagoMovilForm from '@/components/payment/PagoMovilForm';
import TransferenciaForm from '@/components/payment/TransferenciaForm';
import type { CheckoutData, PaymentMethod, ZellePayment, PagoMovilPayment, TransferenciaPayment } from '@/types';

interface Step4PaymentProps {
  register: UseFormRegister<CheckoutData>;
  errors: FieldErrors<CheckoutData>;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  zellePayment: ZellePayment;
  onZelleChange: (data: ZellePayment) => void;
  pagomovilPayment: PagoMovilPayment;
  onPagomovilChange: (data: PagoMovilPayment) => void;
  transferenciaPayment: TransferenciaPayment;
  onTransferenciaChange: (data: TransferenciaPayment) => void;
  total: number;
  isAuthenticated: boolean;
  createAccount: boolean;
}

export default function Step4Payment({
  register,
  errors,
  paymentMethod,
  onPaymentMethodChange,
  zellePayment,
  onZelleChange,
  pagomovilPayment,
  onPagomovilChange,
  transferenciaPayment,
  onTransferenciaChange,
  total,
  isAuthenticated,
  createAccount
}: Step4PaymentProps) {
  const t = useTranslations('checkout');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          {t('paymentMethod')}
        </h2>
        <p className="text-sm text-gray-600">
          {t('paymentDescription', { defaultValue: 'Selecciona tu método de pago y completa la información' })}
        </p>
      </div>

      {/* Selector de Método de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onPaymentMethodChange(method.id as PaymentMethod)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              paymentMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">{method.icon}</div>
            <div className="font-semibold text-gray-900">{method.name}</div>
            <div className="text-xs text-gray-500 mt-1">{method.description}</div>
          </button>
        ))}
      </div>

      {/* Formulario según método seleccionado */}
      {paymentMethod === 'zelle' && (
        <ZelleForm
          data={zellePayment}
          onChange={onZelleChange}
          total={total}
        />
      )}

      {paymentMethod === 'pagomovil' && (
        <PagoMovilForm
          data={pagomovilPayment}
          onChange={onPagomovilChange}
          total={total}
        />
      )}

      {paymentMethod === 'transferencia' && (
        <TransferenciaForm
          data={transferenciaPayment}
          onChange={onTransferenciaChange}
          total={total}
        />
      )}

      {/* Crear Cuenta (solo para invitados) */}
      {!isAuthenticated && (
        <div className="border-t pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('createAccount')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {t('createAccount')}
            </span>
          </label>

          {createAccount && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')} *
              </label>
              <input
                type="password"
                {...register('password', {
                  required: createAccount,
                  minLength: 6
                })}
                placeholder={t('passwordPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">
                  {t('errors.passwordMin', { defaultValue: 'Mínimo 6 caracteres' })}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
