"use client";

import { ZellePayment } from "@/types";
import { DollarSign } from "lucide-react";

interface ZellePaymentDetailsProps {
  details: ZellePayment;
}

export function ZellePaymentDetails({ details }: ZellePaymentDetailsProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">
          Detalles del Pago - Zelle
        </h3>
      </div>
      <div className="space-y-2">
        {details.senderName && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm text-gray-600">Nombre del emisor:</span>
            <span className="text-sm font-medium text-gray-900">
              {details.senderName}
            </span>
          </div>
        )}
        {details.senderBank && (
          <div className="grid grid-cols-2 gap-2">
            <span className="text-sm text-gray-600">Banco emisor:</span>
            <span className="text-sm font-medium text-gray-900">
              {details.senderBank}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
