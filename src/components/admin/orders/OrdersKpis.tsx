"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Clock, DollarSign, Package, TrendingUp } from "lucide-react";
import { formatUSD, formatVES } from "@/lib/currency";
import type { AdminOrderStats } from "@/types";

/**
 * Los cuatro KPIs de la cabecera del listado.
 *
 * Mismo criterio de moneda que el detalle: Bs. es lo que se cobra y va de
 * protagonista, el USD queda debajo de referencia. Cuando no hay ninguna orden
 * con tasa fijada no hay Bs. que mostrar y el USD sube a protagonista.
 */

type Tone = "brand" | "accent" | "success" | "ink";

const toneText: Record<Tone, string> = {
  brand: "text-brand-600",
  accent: "text-accent-600",
  success: "text-success-600",
  ink: "text-ink",
};

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint: string;
  icon: ReactNode;
  tone: Tone;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-sand-300 bg-white p-5">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-sand-700">{label}</div>
        <div className={`mt-1 ${toneText[tone]}`}>{value}</div>
        <div className="mt-0.5 text-[11.5px] font-medium text-sand-600">
          {hint}
        </div>
      </div>
      <span className={`flex-none ${toneText[tone]}`}>{icon}</span>
    </div>
  );
}

/** Monto grande en Bs. con el USD debajo, al tamaño de las tarjetas. */
function KpiAmount({ usd, ves }: { usd: number; ves: number | null }) {
  return (
    <>
      <div className="whitespace-nowrap text-[21px] font-extrabold">
        {ves !== null ? formatVES(ves) : formatUSD(usd)}
      </div>
      {ves !== null && (
        <div className="whitespace-nowrap text-[11.5px] font-medium text-sand-600">
          {formatUSD(usd)}
        </div>
      )}
    </>
  );
}

/**
 * Cuánto lleva esperando el pago más viejo sin revisar, en la unidad que se
 * lee de un vistazo: minutos la primera hora, horas hasta dos días, días
 * después.
 */
export function formatAge(
  t: ReturnType<typeof useTranslations>,
  iso: string
): string {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  );
  if (minutes < 60) return t("ageMinutes", { value: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return t("ageHours", { value: hours });

  return t("ageDays", { value: Math.floor(hours / 24) });
}

export function OrdersKpis({ stats }: { stats: AdminOrderStats }) {
  const t = useTranslations("orders");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        tone="brand"
        label={t("kpiTotalOrders")}
        value={<div className="text-[26px] font-extrabold">{stats.totalOrders}</div>}
        hint={t("kpiTotalOrdersHint", {
          month: stats.monthOrders,
          today: stats.todayOrders,
        })}
        icon={<Package className="h-8 w-8" />}
      />

      <KpiCard
        tone="accent"
        label={t("kpiPaymentReview")}
        value={
          <div className="text-[26px] font-extrabold">
            {stats.paymentReviewCount}
          </div>
        }
        hint={
          stats.oldestPaymentReviewAt
            ? t("kpiPaymentReviewHint", {
                age: formatAge(t, stats.oldestPaymentReviewAt),
              })
            : t("kpiPaymentReviewEmpty")
        }
        icon={<Clock className="h-8 w-8" />}
      />

      <KpiCard
        tone="success"
        label={t("kpiVerifiedRevenue")}
        value={
          <KpiAmount
            usd={stats.verifiedRevenue}
            ves={stats.verifiedRevenueVes}
          />
        }
        hint={t("kpiVerifiedRevenueHint", { count: stats.verifiedOrders })}
        icon={<DollarSign className="h-8 w-8" />}
      />

      <KpiCard
        tone="ink"
        label={t("kpiAverageTicket")}
        value={
          <KpiAmount usd={stats.averageTicket} ves={stats.averageTicketVes} />
        }
        hint={t("kpiAverageTicketHint", { count: stats.verifiedOrders })}
        icon={<TrendingUp className="h-8 w-8" />}
      />
    </div>
  );
}
