'use client';

import { Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import DeliveryMethodSelector from '@/components/checkout/DeliveryMethodSelector';
import StoreInfo from '@/components/checkout/StoreInfo';
import type { DeliveryMethod } from '@/types';

interface Step2DeliveryMethodProps {
  deliveryMethod: DeliveryMethod;
  onChange: (method: DeliveryMethod) => void;
}

export default function Step2DeliveryMethod({ deliveryMethod, onChange }: Step2DeliveryMethodProps) {
  const t = useTranslations('checkout');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          {t('deliveryMethodTitle', { defaultValue: 'Método de Entrega' })}
        </h2>
        <p className="text-sm text-gray-600">
          {t('deliveryMethodDescription', { defaultValue: 'Elige cómo deseas recibir tu pedido' })}
        </p>
      </div>

      <DeliveryMethodSelector
        value={deliveryMethod}
        onChange={onChange}
      />

      {/* Mostrar información de la tienda si elige pickup */}
      {deliveryMethod === 'pickup' && (
        <div className="mt-6">
          <StoreInfo />
        </div>
      )}
    </div>
  );
}
