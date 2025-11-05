"use client";

import { Upload, X } from "lucide-react";
import { PAYMENT_CONFIG } from "@/config/payment";
import type { TransferenciaPayment } from "@/types";

interface TransferenciaFormProps {
  data: TransferenciaPayment;
  onChange: (data: TransferenciaPayment) => void;
  total: number;
}

export default function TransferenciaForm({ data, onChange, total }: TransferenciaFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange({ ...data, receipt: file });
  };

  const removeFile = () => {
    onChange({ ...data, receipt: null });
  };

  return (
    <div className="space-y-4">
      {/* Datos de la empresa */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-3">
          Datos para realizar la Transferencia:
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Banco:</span>
            <span className="font-medium">{PAYMENT_CONFIG.transferencia.bank}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Número de Cuenta:</span>
            <span className="font-medium">{PAYMENT_CONFIG.transferencia.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">RIF:</span>
            <span className="font-medium">{PAYMENT_CONFIG.transferencia.rif}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Beneficiario:</span>
            <span className="font-medium">{PAYMENT_CONFIG.transferencia.beneficiary}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-600">Monto a pagar:</span>
            <span className="font-bold text-lg text-purple-600">
              Bs. {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Cuenta (Emisor) *
        </label>
        <input
          type="text"
          value={data.accountName}
          onChange={(e) => onChange({ ...data, accountName: e.target.value })}
          required
          placeholder="Nombre de la cuenta desde la que realizó el pago"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Banco Emisor *
        </label>
        <input
          type="text"
          value={data.bank}
          onChange={(e) => onChange({ ...data, bank: e.target.value })}
          required
          placeholder="Banco desde donde realizó el pago"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de Referencia *
        </label>
        <input
          type="text"
          value={data.referenceNumber}
          onChange={(e) => onChange({ ...data, referenceNumber: e.target.value })}
          required
          placeholder="Número de referencia de la transferencia"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
