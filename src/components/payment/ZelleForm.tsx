"use client";

import { Info } from "lucide-react";
import type { ZellePayment } from "@/types";

interface ZelleFormProps {
  data: ZellePayment;
  onChange: (data: ZellePayment) => void;
  total: number;
}

export default function ZelleForm({ }: ZelleFormProps) {
  return (
    <div className="rounded-2xl border border-accent-200 bg-accent-50 p-4">
      <div className="flex items-start gap-2.5">
        <Info className="mt-0.5 h-4 w-4 flex-none text-accent-700" strokeWidth={1.9} />
        <p className="text-[12.5px] font-medium leading-relaxed text-sand-700">
          Un vendedor de <strong>Construir</strong> se comunicará contigo para suministrarte los datos de pago Zelle. Por favor mantén tu teléfono disponible.
        </p>
      </div>
    </div>
  );
}
