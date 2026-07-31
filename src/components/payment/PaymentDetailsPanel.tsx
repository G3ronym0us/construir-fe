'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export interface PaymentDetailRow {
  label: string;
  value: string;
}

interface PaymentDetailsPanelProps {
  rows: PaymentDetailRow[];
  /** Monto exacto ya formateado, p. ej. "Bs. 4.946,00". */
  amount: string;
  amountLabel?: string;
  /** Bloque de texto con todos los datos, para copiar de una vez. */
  copyAllText?: string;
}

function CopyIcon({ text, tone = 'light' }: { text: string; tone?: 'light' | 'amber' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar"
      aria-label={`Copiar ${text}`}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/10 ${
        tone === 'amber' ? 'text-accent-500' : 'text-white/60'
      }`}
    >
      {copied ? <Check className="h-4 w-4 text-success-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

/**
 * Panel oscuro con los datos de la cuenta receptora. El monto exacto va en ámbar
 * porque es el dato que el comprador tiene que transcribir sin error.
 */
export default function PaymentDetailsPanel({
  rows,
  amount,
  amountLabel = 'Monto exacto',
  copyAllText,
}: PaymentDetailsPanelProps) {
  return (
    <div className="rounded-2xl bg-brand-900 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent-300">
        Datos para pagar
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold text-white/65">{row.label}</span>
            <span className="flex min-w-0 items-center gap-1 text-[13px] font-semibold text-white">
              <span className="truncate">{row.value}</span>
              <CopyIcon text={row.value} />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/15 pt-3">
        <span className="text-[13px] font-semibold text-white/65">{amountLabel}</span>
        <span className="flex items-center gap-1 text-[19px] font-extrabold text-accent-500">
          {amount}
          <CopyIcon text={amount} tone="amber" />
        </span>
      </div>

      {copyAllText && (
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(copyAllText)}
          className="mt-3 min-h-11 w-full rounded-xl border border-white/20 text-[13px] font-bold text-white transition-colors hover:bg-white/10"
        >
          Copiar todos los datos
        </button>
      )}
    </div>
  );
}
