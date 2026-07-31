"use client";

import { useTranslations } from "next-intl";
import type { CategoryUsage } from "@/types";

/**
 * "Dónde se usa hoy" la categoría que se está editando.
 *
 * Antes de ocultarla o moverla conviene saber a qué está enganchada: su
 * lugar en el menú, si ocupa un espacio de la portada, qué banners la
 * enlazan y cuántos productos dependen de ella.
 */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-sand-200 py-2 last:border-b-0">
      <span className="text-[12.5px] text-sand-700">{label}</span>
      <span className="text-[12.5px] font-semibold text-ink">{value}</span>
    </div>
  );
}

export function CategoryUsagePanel({ usage }: { usage: CategoryUsage | null }) {
  const t = useTranslations("categories");

  if (!usage) {
    return (
      <div className="rounded-xl border border-sand-300 bg-white p-5">
        <span className="text-[13px] font-semibold text-ink">{t("usageTitle")}</span>
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-4 animate-pulse rounded bg-sand-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-sand-300 bg-white p-5">
      <span className="text-[13px] font-semibold text-ink">{t("usageTitle")}</span>

      <div className="mt-2">
        <Row
          label={t("usageMenu")}
          value={
            usage.menuPosition === null
              ? t("usageMenuAbsent")
              : t("usageMenuPosition", {
                  position: usage.menuPosition,
                  total: usage.menuTotal,
                })
          }
        />
        <Row
          label={t("usageFeatured")}
          value={
            usage.featuredSlot === null
              ? t("usageFeaturedAbsent")
              : t("usageFeaturedSlot", {
                  slot: usage.featuredSlot,
                  slots: usage.featuredSlots,
                })
          }
        />
        <Row
          label={t("usageBanners")}
          value={t("usageBannersValue", { count: usage.activeBanners })}
        />
        <Row
          label={t("usageProducts")}
          value={t("usageProductsValue", {
            published: usage.publishedProducts,
            total: usage.totalProducts,
          })}
        />
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-sand-600">
        {t("usageHideHint")}
      </p>
    </div>
  );
}
