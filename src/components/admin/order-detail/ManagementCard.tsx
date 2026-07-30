"use client";

import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderStatus, PaymentStatus } from "@/types";

/**
 * Estados que el backend acepta de verdad.
 *
 * El tipo `OrderStatus` del front lista diez y `PaymentStatus` cuatro, herencia
 * de la tienda en WordPress, pero los enums de las entidades solo tienen estos.
 * Como el DTO valida con `@IsEnum`, ofrecer cualquier otro devuelve 400 al
 * guardar, así que el selector se ciñe a lo que existe.
 */
const SELECTABLE_ORDER_STATUSES: OrderStatus[] = [
  "on-hold",
  "pending",
  "completed",
  "cancelled",
];

const SELECTABLE_PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "verified",
  "rejected",
];

interface ManagementCardProps {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  adminNotes: string;
  saving: boolean;
  cancelling: boolean;
  isCancelled: boolean;
  onOrderStatusChange: (value: OrderStatus) => void;
  onPaymentStatusChange: (value: PaymentStatus) => void;
  onAdminNotesChange: (value: string) => void;
  onSave: () => void;
  onCancelOrder: () => void;
}

export function ManagementCard({
  orderStatus,
  paymentStatus,
  adminNotes,
  saving,
  cancelling,
  isCancelled,
  onOrderStatusChange,
  onPaymentStatusChange,
  onAdminNotesChange,
  onSave,
  onCancelOrder,
}: ManagementCardProps) {
  const t = useTranslations("orders");

  return (
    <section className="rounded-2xl border border-sand-300 bg-white p-5">
      <h2 className="mb-4 font-display text-base font-bold text-ink">
        {t("management")}
      </h2>

      <div className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-sand-600">
            {t("orderStatus")}
          </span>
          <select
            value={orderStatus}
            onChange={(event) =>
              onOrderStatusChange(event.target.value as OrderStatus)
            }
            className="rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-[13px] font-bold text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {SELECTABLE_ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`statuses.${status}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-sand-600">
            {t("paymentStatus")}
          </span>
          <select
            value={paymentStatus}
            onChange={(event) =>
              onPaymentStatusChange(event.target.value as PaymentStatus)
            }
            className="rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-[13px] font-bold text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {SELECTABLE_PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`paymentStatuses.${status}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-sand-600">
            {t("adminNotes")}
          </span>
          <textarea
            value={adminNotes}
            onChange={(event) => onAdminNotesChange(event.target.value)}
            rows={3}
            placeholder={t("adminNotesPlaceholder")}
            className="resize-y rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-[12.5px] font-medium leading-relaxed text-ink placeholder:text-sand-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-[13.5px] font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? t("saving") : t("saveChanges")}
        </button>

        {!isCancelled && (
          <button
            type="button"
            onClick={onCancelOrder}
            disabled={cancelling}
            className="text-center text-xs font-semibold text-danger-600 transition-colors hover:text-danger-700 disabled:opacity-60"
          >
            {cancelling ? t("cancelling") : t("cancelOrder")}
          </button>
        )}
      </div>
    </section>
  );
}
