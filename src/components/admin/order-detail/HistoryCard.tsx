"use client";

import { useTranslations } from "next-intl";
import type { Order } from "@/types";

/**
 * Historial de la orden.
 *
 * No hay bitácora de eventos por orden en el backend, así que la línea de tiempo
 * se arma con las marcas de tiempo que sí existen en la tabla. Por eso no
 * aparece quién hizo cada cambio ni pasos intermedios: se muestra lo que está
 * registrado y nada más. Si algún día hace falta el detalle completo (autor,
 * cambios de estado uno por uno), el lugar es la tabla de audit logs.
 */
export function HistoryCard({ order }: { order: Order }) {
  const t = useTranslations("orders");

  const format = (value: string) =>
    new Date(value).toLocaleString("es-VE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const events: Array<{ title: string; meta: string }> = [];

  // El `updatedAt` es lo más cercano a "cuándo quedó en este estado".
  events.push({
    title: t(`statuses.${order.status}`),
    meta: t("lastUpdated", { date: format(order.updatedAt) }),
  });

  if (order.dateCompleted) {
    events.push({
      title: t("historyCompleted"),
      meta: format(order.dateCompleted),
    });
  }

  if (order.paymentInfo.verifiedAt) {
    events.push({
      title: t("historyPaymentVerified"),
      meta: format(order.paymentInfo.verifiedAt),
    });
  }

  events.push({
    title: t("historyCreated"),
    meta:
      order.exchangeRate !== null
        ? `${format(order.createdAt)} · ${t("rateShort", {
            rate: Number(order.exchangeRate).toLocaleString("es-VE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          })}`
        : format(order.createdAt),
  });

  return (
    <section className="rounded-2xl border border-sand-300 bg-white p-5">
      <h2 className="mb-3.5 font-display text-base font-bold text-ink">
        {t("history")}
      </h2>
      <ol className="flex flex-col gap-3">
        {events.map((event, index) => (
          <li key={`${event.title}-${index}`} className="flex gap-3">
            <span
              className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${
                index === 0
                  ? "bg-brand-600 ring-[3px] ring-brand-100"
                  : "bg-sand-400"
              }`}
            />
            <div className="min-w-0">
              <div className="text-[12.5px] font-bold text-ink">
                {event.title}
              </div>
              <div className="mt-0.5 text-[11.5px] font-medium text-sand-600">
                {event.meta}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
