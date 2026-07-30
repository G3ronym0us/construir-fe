'use client';

import { Upload, X } from 'lucide-react';

interface ReceiptUploadProps {
  file: File | null;
  onSelect: (file: File | null) => void;
  label?: string;
  required?: boolean;
}

/** Zona punteada para adjuntar el comprobante de pago. */
export default function ReceiptUpload({
  file,
  onSelect,
  label = 'Comprobante de pago',
  required = false,
}: ReceiptUploadProps) {
  return (
    <div>
      <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
        {label} {required && '*'}
      </label>

      {!file ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-sand-400 bg-sand-50 px-4 py-6 transition-colors hover:bg-sand-100">
          <Upload className="h-5 w-5 text-brand-600" strokeWidth={1.9} />
          <span className="text-[12.5px] font-bold text-ink">Adjuntar comprobante</span>
          <span className="text-[11px] font-medium text-sand-600">
            Foto o captura · JPG, PNG, PDF
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => onSelect(e.target.files?.[0] || null)}
            required={required}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-success-100 bg-success-50 p-3">
          <span className="flex min-w-0 items-center gap-2">
            <Upload className="h-4 w-4 flex-none text-success-600" />
            <span className="truncate text-[13px] font-medium text-sand-700">{file.name}</span>
          </span>
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-label="Quitar comprobante"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-danger-600 hover:bg-danger-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
