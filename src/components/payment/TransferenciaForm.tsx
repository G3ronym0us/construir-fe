"use client";

import { Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import BankSelector from "./BankSelector";
import type { TransferenciaPayment } from "@/types";
import CopyButton from "@/components/ui/CopyButton";
import { usePaymentMethodDetails } from "@/hooks/usePaymentMethods";
import { PaymentMethod } from "@/lib/enums";

interface TransferenciaFormProps {
  data: TransferenciaPayment;
  onChange: (data: TransferenciaPayment) => void;
  total: number;
}

export default function TransferenciaForm({ data, onChange, total }: TransferenciaFormProps) {
  const t = useTranslations('payment');
  const { details, loading, error, reload } = usePaymentMethodDetails(PaymentMethod.TRANSFERENCIA);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-3">
          Datos para realizar la Transferencia:
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Banco:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{details.bank}</span>
              <CopyButton text={details.bank || ''} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Número de Cuenta:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{details.accountNumber}</span>
              <CopyButton text={details.accountNumber || ''} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">RIF:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{details.rif}</span>
              <CopyButton text={details.rif || ''} />
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
            <span className="font-bold text-lg text-purple-600">
              Bs. {total.toFixed(2)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const accountNumber = (details.accountNumber || '').replace(/-/g, '');
            const rif = (details.rif || '').replace(/-/g, '');
            const allData = `${details.bank} ${details.bankCode}\n${accountNumber}\n${rif}\n${details.beneficiary}\nBs. ${total.toFixed(2)}`;
            navigator.clipboard.writeText(allData);
          }}
          className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Copiar todos los datos
        </button>
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

      <BankSelector
        value={data.bankCode}
        onChange={(bankCode) => onChange({ ...data, bankCode })}
        required
        label={t('senderBank', { defaultValue: 'Banco Emisor *' })}
        placeholder={t('selectBank', { defaultValue: 'Seleccione el banco desde donde realizó el pago' })}
      />

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
