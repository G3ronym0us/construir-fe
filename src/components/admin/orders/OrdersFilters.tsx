"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { DateRangeFilter } from "./DateRangeFilter";
import type { AdminOrderStats, OrderStatus, PaymentStatus } from "@/types";

/**
 * Buscador, filtros y chips por estado del listado de órdenes.
 *
 * Los chips y el selector de estado del pago mueven el mismo filtro, así que
 * comparten estado: "Pago en revisión" es el atajo al trabajo pendiente y deja
 * el selector en "Pendiente", no un filtro paralelo que se contradiga con él.
 */

/** Los cuatro estados que el backend guarda de verdad, en orden de avance. */
const STATUS_CHIPS: OrderStatus[] = [
  "on-hold",
  "pending",
  "completed",
  "cancelled",
];

export interface OrdersFilterState {
  search: string;
  status: OrderStatus | "";
  paymentStatus: PaymentStatus | "";
  startDate: string;
  endDate: string;
}

export const EMPTY_FILTERS: OrdersFilterState = {
  search: "",
  status: "",
  paymentStatus: "",
  startDate: "",
  endDate: "",
};

export function hasActiveFilters(filters: OrdersFilterState): boolean {
  return Object.values(filters).some(Boolean);
}

interface OrdersFiltersProps {
  filters: OrdersFilterState;
  stats: AdminOrderStats | null;
  onChange: (filters: OrdersFilterState) => void;
}

export function OrdersFilters({
  filters,
  stats,
  onChange,
}: OrdersFiltersProps) {
  const t = useTranslations("orders");

  const patch = (changes: Partial<OrdersFilterState>) =>
    onChange({ ...filters, ...changes });

  const paymentReviewActive =
    filters.paymentStatus === "pending" && !filters.status;
  const allActive = !filters.status && !filters.paymentStatus;

  const chipClass = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
      active
        ? "bg-brand-600 text-white"
        : "border border-sand-300 bg-white text-sand-700 hover:bg-sand-100"
    }`;

  const countClass = (active: boolean) =>
    `font-extrabold ${active ? "" : "opacity-55"}`;

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-sand-300 bg-white p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-sand-300 px-3.5 py-2.5 focus-within:border-brand-400">
          <Search className="h-4 w-4 flex-none text-sand-500" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="w-full bg-transparent text-[13px] font-medium text-ink outline-none placeholder:text-sand-500"
          />
        </div>

        <select
          value={filters.paymentStatus}
          onChange={(event) =>
            patch({ paymentStatus: event.target.value as PaymentStatus | "" })
          }
          aria-label={t("paymentStatus")}
          className="rounded-lg border border-sand-300 bg-white px-3.5 py-2.5 text-[12.5px] font-semibold text-sand-700 outline-none focus:border-brand-400"
        >
          <option value="">{t("paymentStatusAll")}</option>
          {["pending", "verified", "rejected"].map((status) => (
            <option key={status} value={status}>
              {t(`paymentStatuses.${status}`)}
            </option>
          ))}
        </select>

        <DateRangeFilter
          value={{ startDate: filters.startDate, endDate: filters.endDate }}
          onChange={(range) => patch(range)}
        />

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-[12.5px] font-semibold text-brand-600 hover:text-brand-700"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => patch({ status: "", paymentStatus: "" })}
          aria-pressed={allActive}
          className={chipClass(allActive)}
        >
          {t("chipAll")}
          {stats && (
            <span className={countClass(allActive)}>{stats.totalOrders}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => patch({ status: "", paymentStatus: "pending" })}
          aria-pressed={paymentReviewActive}
          className={chipClass(paymentReviewActive)}
        >
          {t("chipPaymentReview")}
          {stats && (
            <span className={countClass(paymentReviewActive)}>
              {stats.paymentReviewCount}
            </span>
          )}
        </button>

        {STATUS_CHIPS.map((status) => {
          const active = filters.status === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => patch({ status, paymentStatus: "" })}
              aria-pressed={active}
              className={chipClass(active)}
            >
              {t(`statusChips.${status}`)}
              {stats && (
                <span className={countClass(active)}>
                  {stats.ordersByStatus[status] ?? 0}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
