"use client";

import { Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { PAYMENT_CONFIG } from "@/config/payment";
import BankSelector from "./BankSelector";
import type { PagoMovilPayment } from "@/types";
import CopyButton from "@/components/ui/CopyButton";

interface PagoMovilFormProps {
  data: PagoMovilPayment;
  onChange: (data: PagoMovilPayment) => void;
  total: number;
}

export default function PagoMovilForm({ data, onChange, total }: PagoMovilFormProps) {
  const t = useTranslations('payment');

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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3">
          Datos para realizar el Pago Móvil:
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Banco:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{PAYMENT_CONFIG.pagomovil.bank}</span>
              <CopyButton text={PAYMENT_CONFIG.pagomovil.bank} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Teléfono:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{PAYMENT_CONFIG.pagomovil.phone}</span>
              <CopyButton text={PAYMENT_CONFIG.pagomovil.phone} />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cédula:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{PAYMENT_CONFIG.pagomovil.cedula}</span>
              <CopyButton text={PAYMENT_CONFIG.pagomovil.cedula} />
            </div>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-600">Monto a pagar:</span>
            <span className="font-bold text-lg text-green-600">
              Bs. {total.toFixed(2)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const phone = PAYMENT_CONFIG.pagomovil.phone.replace(/-/g, '');
            const cedula = PAYMENT_CONFIG.pagomovil.cedula.replace(/-/g, '');
            const allData = `${PAYMENT_CONFIG.pagomovil.bank} ${PAYMENT_CONFIG.pagomovil.bankCode}\n${phone}\n${cedula}\nBs. ${total.toFixed(2)}`;
            navigator.clipboard.writeText(allData);
          }}
          className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Copiar todos los datos
        </button>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Teléfono *
          </label>
          <input
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => onChange({ ...data, phoneNumber: e.target.value })}
            required
            placeholder="0414-1234567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cédula *
          </label>
          <input
            type="text"
            value={data.cedula}
            onChange={(e) => onChange({ ...data, cedula: e.target.value })}
            required
            placeholder="V-12345678"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
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
          Código de Referencia *
        </label>
        <input
          type="text"
          value={data.referenceCode}
          onChange={(e) => onChange({ ...data, referenceCode: e.target.value })}
          required
          placeholder="Código de confirmación del pago"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
