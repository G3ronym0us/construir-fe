"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, Package } from "lucide-react";
import {
  DualAmount,
  Pill,
  orderStatusTone,
  paymentStatusTone,
} from "@/components/admin/order-detail/primitives";
import type { AdminOrderRow } from "@/types";

/**
 * Tabla del listado de órdenes.
 *
 * Las filas cuyo pago sigue sin revisar van destacadas en ámbar: son el trabajo
 * que el panel existe para despachar y tienen que saltar a la vista sin tener
 * que leer la columna de pago fila por fila.
 */

function needsPaymentReview(order: AdminOrderRow): boolean {
  return order.paymentStatus === "pending" && order.status !== "cancelled";
}

function OrdersTableRow({ order }: { order: AdminOrderRow }) {
  const t = useTranslations("orders");
  const pendingPayment = needsPaymentReview(order);

  return (
    <tr
      className={`border-t border-sand-200 ${
        pendingPayment ? "bg-accent-50" : "hover:bg-sand-50"
      }`}
    >
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex items-center gap-2">
          {pendingPayment && (
            <span
              title={t("unpaidRow")}
              className="h-1.5 w-1.5 flex-none rounded-full bg-accent-500"
            />
          )}
          <span className="text-[13px] font-bold text-ink">
            {order.orderNumber}
          </span>
        </div>
      </td>

      <td className="whitespace-nowrap px-5 py-3.5 text-[12.5px] font-medium text-sand-700">
        {new Date(order.createdAt).toLocaleDateString("es-VE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      <td className="min-w-0 px-5 py-3.5">
        <div className="truncate text-[13px] font-semibold text-ink">
          {order.customerName ?? t("unknownCustomer")}
        </div>
        {order.customerIdentification && (
          <div className="text-[11.5px] font-medium text-sand-600">
            {order.customerIdentification}
          </div>
        )}
      </td>

      <td className="px-5 py-3.5">
        <Pill tone={orderStatusTone(order.status)}>
          {t(`statuses.${order.status}`)}
        </Pill>
      </td>

      <td className="px-5 py-3.5">
        {order.paymentStatus ? (
          <Pill tone={paymentStatusTone(order.paymentStatus)}>
            {t(`paymentStatuses.${order.paymentStatus}`)}
          </Pill>
        ) : (
          <span className="text-sand-500">—</span>
        )}
      </td>

      <td className="whitespace-nowrap px-5 py-3.5 text-[12.5px] font-medium text-sand-700">
        {order.deliveryMethod === "pickup"
          ? t("methodPickup")
          : t("methodDelivery")}
      </td>

      <td className="px-5 py-3.5 text-right text-[12.5px] font-semibold text-sand-700">
        {order.totalItems}
      </td>

      <td className="whitespace-nowrap px-5 py-3.5">
        <DualAmount usd={order.total} ves={order.totalVes} size="md" />
      </td>

      <td className="px-5 py-3.5">
        <Link
          href={`/admin/dashboard/ordenes/${order.uuid}`}
          aria-label={t("viewOrder", { orderNumber: order.orderNumber })}
          className="flex items-center justify-end gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
        >
          <Eye className="h-3.5 w-3.5" />
          {t("view")}
        </Link>
      </td>
    </tr>
  );
}

export function OrdersTable({
  orders,
  filtered,
}: {
  orders: AdminOrderRow[];
  /** Cambia el vacío: "no hay órdenes" no es lo mismo que "ninguna coincide". */
  filtered: boolean;
}) {
  const t = useTranslations("orders");

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-sand-300 bg-white px-6 py-14 text-center">
        <Package className="mx-auto mb-3 h-10 w-10 text-sand-500" />
        <p className="text-[13px] font-medium text-sand-700">
          {filtered ? t("noOrdersWithFilters") : t("noOrdersYet")}
        </p>
      </div>
    );
  }

  const headerClass =
    "whitespace-nowrap px-5 py-3 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-sand-600";

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-300 bg-white">
      <table className="w-full min-w-[1040px] border-collapse">
        <thead className="bg-sand-100">
          <tr>
            <th className={headerClass}>{t("colOrder")}</th>
            <th className={headerClass}>{t("colDate")}</th>
            <th className={headerClass}>{t("colCustomer")}</th>
            <th className={headerClass}>{t("colStatus")}</th>
            <th className={headerClass}>{t("colPayment")}</th>
            <th className={headerClass}>{t("colDelivery")}</th>
            <th className={`${headerClass} text-right`}>{t("colUnits")}</th>
            <th className={`${headerClass} text-right`}>{t("colTotalDual")}</th>
            <th className={`${headerClass} text-right`}>{t("colAction")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrdersTableRow key={order.uuid} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
