"use client";

import type { ReactNode } from "react";
import { formatUSD, formatVES } from "@/lib/currency";

/**
 * Piezas compartidas por las tarjetas del detalle de orden.
 *
 * El criterio de moneda es el mismo del checkout: Bs. es el monto de cobro y va
 * de protagonista, el USD queda debajo como referencia. Cuando la orden no
 * guardó tasa (`exchangeRate` nulo, órdenes viejas) no hay Bs. que mostrar y el
 * USD sube a protagonista en vez de dejar el hueco.
 */

export function Card({
  title,
  icon,
  aside,
  children,
  className = "",
}: {
  title?: string;
  icon?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-sand-300 bg-white p-5 ${className}`}
    >
      {title && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
            {icon}
            {title}
          </h2>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

/** Etiqueta en versalitas + valor, el patrón de campo que usa todo el diseño. */
export function Field({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-sand-600">
        {label}
      </span>
      <span
        className={`text-[13.5px] font-semibold leading-relaxed text-ink ${
          mono ? "font-mono" : ""
        }`}
      >
        {children}
      </span>
    </div>
  );
}

export type PillTone = "neutral" | "brand" | "success" | "warning" | "danger";

const pillTones: Record<PillTone, string> = {
  neutral: "bg-sand-100 text-sand-700 border-sand-300",
  brand: "bg-brand-50 text-brand-600 border-brand-200",
  success: "bg-success-50 text-success-600 border-success-100",
  warning: "bg-accent-50 text-accent-700 border-accent-200",
  danger: "bg-danger-50 text-danger-600 border-danger-100",
};

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-bold ${pillTones[tone]}`}
    >
      {children}
    </span>
  );
}

interface DualAmountProps {
  usd: number;
  ves: number | null;
  /** `lg` es el total de la orden; `md` los subtotales de línea; `sm` el resto. */
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  /** Colorea el monto principal, para el total y el monto reportado. */
  tone?: "ink" | "brand" | "success";
}

export function DualAmount({
  usd,
  ves,
  size = "sm",
  align = "right",
  tone = "ink",
}: DualAmountProps) {
  const primarySize =
    size === "lg"
      ? "text-2xl font-extrabold"
      : size === "md"
        ? "text-[14.5px] font-extrabold"
        : "text-[13px] font-semibold";
  const primaryTone =
    tone === "brand"
      ? "text-brand-600"
      : tone === "success"
        ? "text-success-600"
        : "text-ink";

  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className={`${primarySize} ${primaryTone}`}>
        {ves !== null ? formatVES(ves) : formatUSD(usd)}
      </div>
      {ves !== null && (
        <div
          className={`font-medium text-sand-600 ${
            size === "lg" ? "text-[13px]" : "text-[11.5px]"
          }`}
        >
          {formatUSD(usd)}
        </div>
      )}
    </div>
  );
}

/** Variante en una sola línea, para las filas de subtotal/IVA/envío. */
export function DualAmountInline({
  usd,
  ves,
}: {
  usd: number;
  ves: number | null;
}) {
  return (
    <span className="text-ink">
      {ves !== null ? formatVES(ves) : formatUSD(usd)}
      {ves !== null && (
        <span className="font-medium text-sand-600"> · {formatUSD(usd)}</span>
      )}
    </span>
  );
}
