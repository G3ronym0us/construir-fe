'use client';

import { TransferenciaDetails } from '@/types';
import { Building2 } from 'lucide-react';

interface TransferenciaPaymentDetailsProps {
  details: TransferenciaDetails;
}

export function TransferenciaPaymentDetails({ details }: TransferenciaPaymentDetailsProps) {

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-900">Detalles del Pago - Transferencia</h3>
      </div>
      <div className="space-y-2">
        {details.beneficiary && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm text-gray-600">Nombre de cuenta:</span>
            <span className="text-sm font-medium text-gray-900">{details.beneficiary}</span>
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
            <span className="text-sm text-gray-600">Número de referencia:</span>
            <span className="text-sm font-medium text-gray-900 font-mono">{details.referenceCode}</span>
          </div>
        )}
        {details.accountNumber && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm text-gray-600">Cuenta origen:</span>
            <span className="text-sm font-medium text-gray-900 font-mono">{details.accountNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}
