"use client";

import { useTranslations } from "next-intl";
import BankSelector from "./BankSelector";
import PaymentDetailsPanel from "./PaymentDetailsPanel";
import ReceiptUpload from "./ReceiptUpload";
import type { PagoMovilPayment } from "@/types";
import { formatVES } from "@/lib/currency";
import { usePaymentMethodDetails } from "@/hooks/usePaymentMethods";
import { PaymentMethod } from "@/lib/enums";

interface PagoMovilFormProps {
  data: PagoMovilPayment;
  onChange: (data: PagoMovilPayment) => void;
  total: number;
}

export default function PagoMovilForm({ data, onChange, total }: PagoMovilFormProps) {
  const t = useTranslations('payment');
  const { details, loading, error, reload } = usePaymentMethodDetails(PaymentMethod.PAGO_MOVIL);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        <span className="ml-3 text-sand-700">Cargando información de pago...</span>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="bg-danger-50 border border-danger-100 rounded-lg p-4">
        <p className="text-danger-700">
          No se pudo cargar la información de pago. Por favor, intenta nuevamente.
        </p>
        <button
          type="button"
          onClick={reload}
          className="mt-2 text-brand-600 hover:text-brand-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PaymentDetailsPanel
        rows={[
          { label: 'Banco', value: `${details.bankCode ?? ''} · ${details.bank ?? ''}`.trim() },
          { label: 'Teléfono', value: details.phone || '' },
          { label: 'Cédula', value: details.cedula || '' },
        ]}
        amount={formatVES(total)}
        copyAllText={[
          `${details.bank} ${details.bankCode}`,
          (details.phone || '').replace(/-/g, ''),
          (details.cedula || '').replace(/-/g, ''),
          formatVES(total),
        ].join('\n')}
      />

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
            Número de Teléfono *
          </label>
          <input
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => onChange({ ...data, phoneNumber: e.target.value })}
            required
            placeholder="0414-1234567"
            className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
            Cédula *
          </label>
          <input
            type="text"
            value={data.cedula}
            onChange={(e) => onChange({ ...data, cedula: e.target.value })}
            required
            placeholder="V-12345678"
            className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
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
        <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
          Código de Referencia *
        </label>
        <input
          type="text"
          value={data.referenceCode}
          onChange={(e) => onChange({ ...data, referenceCode: e.target.value })}
          required
          placeholder="Código de confirmación del pago"
          className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        />
      </div>

      <ReceiptUpload
        file={data.receipt}
        onSelect={(file) => onChange({ ...data, receipt: file })}
        label="Comprobante de pago"
        required
      />
    </div>
  );
}
