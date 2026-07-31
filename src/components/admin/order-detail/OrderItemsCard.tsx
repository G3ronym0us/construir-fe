"use client";

import { Package } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Order } from "@/types";
import { Card, DualAmount, DualAmountInline } from "./primitives";

/**
 * Artículos del pedido y el desglose de totales.
 *
 * Los `*Ves` vienen calculados del backend con la tasa fijada al crear la orden,
 * no se recalculan aquí: el monto exigible es el que se cobró ese día aunque el
 * BCV se haya movido después.
 */
export function OrderItemsCard({ order }: { order: Order }) {
  const t = useTranslations("orders");
  const hasVes = order.totalVes !== null;

  return (
    <Card
      title={t("itemsTitle")}
      icon={<Package className="h-[17px] w-[17px] text-brand-600" />}
      aside={
        hasVes ? (
          <span className="text-[11.5px] font-semibold text-sand-600">
            {t("dualCurrencyNote")}
          </span>
        ) : null
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[1fr_80px_130px_150px] border-b border-sand-300 pb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-sand-600">
            <span>{t("colProduct")}</span>
            <span className="text-center">{t("colQuantity")}</span>
            <span className="text-right">{t("colUnitPrice")}</span>
            <span className="text-right">{t("colSubtotal")}</span>
          </div>

          {order.items.map((item) => (
            <div
              key={item.uuid}
              className="grid grid-cols-[1fr_80px_130px_150px] items-center border-b border-sand-200 py-3.5 last:border-0"
            >
              <div className="flex min-w-0 items-center gap-3 pr-3">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] border border-sand-300 bg-sand-100">
                  <Package className="h-5 w-5 text-sand-500" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-bold text-ink">
                    {item.productName}
                  </div>
                  <div className="mt-0.5 truncate text-[11.5px] font-medium text-sand-600">
                    {t("sku", { sku: item.productSku })}
                  </div>
                </div>
              </div>
              <span className="text-center text-[13.5px] font-bold text-ink">
                {item.quantity}
              </span>
              <DualAmount
                usd={parseFloat(item.price)}
                ves={item.priceVes !== null ? parseFloat(item.priceVes) : null}
              />
              <DualAmount
                usd={item.subtotal}
                ves={item.subtotalVes}
                size="md"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 rounded-xl border border-sand-300 bg-sand-100 p-4">
        <Row label={t("totalsSubtotal")}>
          <DualAmountInline usd={order.subtotal} ves={order.subtotalVes} />
        </Row>

        {order.tax > 0 && (
          <Row label={t("totalsTax")}>
            <DualAmountInline usd={order.tax} ves={order.taxVes} />
          </Row>
        )}

        {order.shipping > 0 && (
          <Row label={t("totalsShipping")}>
            <DualAmountInline usd={order.shipping} ves={order.shippingVes} />
          </Row>
        )}

        {!!order.discountAmount && order.discountAmount > 0 && (
          <Row
            label={
              order.discountCode
                ? t("discountWithCode", { code: order.discountCode })
                : t("discount")
            }
          >
            <span className="text-success-600">
              −{" "}
              <DualAmountInline
                usd={order.discountAmount}
                ves={order.discountAmountVes ?? null}
              />
            </span>
          </Row>
        )}

        <div className="flex items-end justify-between gap-4 border-t border-sand-400 pt-2.5">
          <div>
            <div className="font-display text-sm font-bold text-ink">
              {t("totalCharged")}
            </div>
            {order.exchangeRate !== null && (
              <div className="mt-0.5 text-[11.5px] font-medium text-sand-600">
                {t("rateFixedAtCreation", {
                  rate: Number(order.exchangeRate).toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                })}
              </div>
            )}
          </div>
          <DualAmount
            usd={order.total}
            ves={order.totalVes}
            size="lg"
            tone="brand"
          />
        </div>
      </div>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 text-[13px] font-semibold text-sand-700">
      <span>{label}</span>
      {children}
    </div>
  );
}
