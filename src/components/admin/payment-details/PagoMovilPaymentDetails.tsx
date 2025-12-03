'use client';

import { Smartphone } from 'lucide-react';
import { PagoMovilDetails } from '@/types';

interface PagoMovilPaymentDetailsProps {
  details: PagoMovilDetails;
}

export function PagoMovilPaymentDetails({ details }: PagoMovilPaymentDetailsProps) {

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Smartphone className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900">Detalles del Pago - Pago Móvil</h3>
      </div>
      <div className="space-y-2">
        {details.phone && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm text-gray-600">Teléfono:</span>
            <span className="text-sm font-medium text-gray-900">{details.phone}</span>
          </div>
        )}
        {details.cedula && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm text-gray-600">Cédula:</span>
            <span className="text-sm font-medium text-gray-900">{details.cedula}</span>
          </div>
        )}
        {details.bankCode && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm text-gray-600">Código de banco:</span>
            <span className="text-sm font-medium text-gray-900 font-mono">{details.bankCode}</span>
          </div>
        )}
        {details.bank && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm text-gray-600">Banco:</span>
            <span className="text-sm font-medium text-gray-900">{details.bank}</span>
          </div>
        )}
        {details.referenceCode && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm text-gray-600">Código de referencia:</span>
            <span className="text-sm font-medium text-gray-900 font-mono">{details.referenceCode}</span>
          </div>
        )}

      </div>
    </div>
  );
}
