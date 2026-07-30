"use client";

import { useTranslations } from "next-intl";
import BankSelector from "./BankSelector";
import type { TransferenciaPayment } from "@/types";
import PaymentDetailsPanel from "./PaymentDetailsPanel";
import ReceiptUpload from "./ReceiptUpload";
import { formatVES } from "@/lib/currency";
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
          { label: 'Cuenta', value: details.accountNumber || '' },
          { label: 'RIF', value: details.rif || '' },
          { label: 'Beneficiario', value: details.beneficiary || '' },
        ]}
        amount={formatVES(total)}
        copyAllText={[
          `${details.bank} ${details.bankCode}`,
          (details.accountNumber || '').replace(/-/g, ''),
          (details.rif || '').replace(/-/g, ''),
          details.beneficiary || '',
          formatVES(total),
        ].join('\n')}
      />

      {/* Formulario */}
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
          Nombre de la Cuenta (Emisor) *
        </label>
        <input
          type="text"
          value={data.accountName}
          onChange={(e) => onChange({ ...data, accountName: e.target.value })}
          required
          placeholder="Nombre de la cuenta desde la que realizó el pago"
          className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
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
        <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
          Número de Referencia *
        </label>
        <input
          type="text"
          value={data.referenceNumber}
          onChange={(e) => onChange({ ...data, referenceNumber: e.target.value })}
          required
          placeholder="Número de referencia de la transferencia"
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
