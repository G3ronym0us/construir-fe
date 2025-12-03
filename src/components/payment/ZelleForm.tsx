"use client";

import { Upload, X } from "lucide-react";
import type { ZellePayment } from "@/types";
import CopyButton from "@/components/ui/CopyButton";
import { usePaymentMethodDetails } from "@/hooks/usePaymentMethods";
import { PaymentMethod } from "@/lib/enums";

interface ZelleFormProps {
  data: ZellePayment;
  onChange: (data: ZellePayment) => void;
  total: number;
}

export default function ZelleForm({ data, onChange, total }: ZelleFormProps) {
  const { details, loading, error, reload } = usePaymentMethodDetails(PaymentMethod.ZELLE);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange({ ...data, receipt: file });
  };

  const removeFile = () => {
    onChange({ ...data, receipt: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando información de pago...</span>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          No se pudo cargar la información de pago. Por favor, intenta nuevamente.
        </p>
        <button
          type="button"
          onClick={reload}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Datos de la empresa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">
          Datos para enviar el pago:
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Email Zelle:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{details.email}</span>
              <CopyButton text={details.email || ''} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Beneficiario:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{details.beneficiary}</span>
              <CopyButton text={details.beneficiary || ''} />
            </div>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-600">Monto a pagar:</span>
            <span className="font-bold text-lg text-blue-600">
              ${total.toFixed(2)} USD
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const allData = `${details.email}\n${details.beneficiary}\n$${total.toFixed(2)} USD`;
            navigator.clipboard.writeText(allData);
          }}
          className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Copiar todos los datos
        </button>
      </div>

      {/* Formulario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo (Emisor) *
        </label>
        <input
          type="text"
          value={data.senderName}
          onChange={(e) => onChange({ ...data, senderName: e.target.value })}
          required
          placeholder="Nombre de quien realizó el pago"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Banco Emisor *
        </label>
        <input
          type="text"
          value={data.senderBank}
          onChange={(e) => onChange({ ...data, senderBank: e.target.value })}
          required
          placeholder="Banco desde donde realizó el pago"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comprobante de Pago *
        </label>
        {!data.receipt ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click para subir</span> o arrastra
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG o PDF (máx. 5MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              required
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">{data.receipt.name}</span>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
