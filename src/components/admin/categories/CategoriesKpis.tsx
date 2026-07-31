"use client";

import { useTranslations } from "next-intl";
import type { CategoryStats } from "@/types";

/**
 * Las cuatro tarjetas de la cabecera del listado.
 *
 * Cada una lleva un subtítulo con el dato que explica el número: el total se
 * abre en padres e hijas, las ocultas avisan si todavía tienen productos
 * publicados y las destacadas se leen contra el cupo de la portada.
 */

type Tone = "ink" | "success" | "danger" | "accent";

const toneText: Record<Tone, string> = {
  ink: "text-ink",
  success: "text-success-600",
  danger: "text-danger-600",
  accent: "text-accent-600",
};

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  tone: Tone;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-sand-300 bg-white p-4 sm:p-[18px]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-sand-700">
        {label}
      </span>
      <span className={`font-display text-[26px] font-bold ${toneText[tone]}`}>
        {value}
      </span>
      <span className="text-[12.5px] text-sand-600">{hint}</span>
    </div>
  );
}

export function CategoriesKpis({ stats }: { stats: CategoryStats }) {
  const t = useTranslations("categories");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        tone="ink"
        label={t("kpiTotal")}
        value={stats.total}
        hint={t("kpiTotalHint", {
          parents: stats.parents,
          children: stats.children,
        })}
      />

      <KpiCard
        tone="success"
        label={t("kpiVisible")}
        value={stats.visible}
        hint={t("kpiVisibleHint")}
      />

      <KpiCard
        tone="danger"
        label={t("kpiHidden")}
        value={stats.hidden}
        hint={
          stats.hiddenWithPublishedProducts > 0
            ? t("kpiHiddenHint", { count: stats.hiddenWithPublishedProducts })
            : t("kpiHiddenHintEmpty")
        }
      />

      <KpiCard
        tone="accent"
        label={t("kpiFeatured")}
        value={
          <>
            {stats.featured}{" "}
            <span className="font-sans text-sm font-semibold text-sand-600">
              {t("kpiFeaturedSlots", { slots: stats.featuredSlots })}
            </span>
          </>
        }
        hint={
          stats.featuredWithoutImage > 0
            ? t("kpiFeaturedHint", { count: stats.featuredWithoutImage })
            : t("kpiFeaturedHintEmpty", {
                free: Math.max(0, stats.featuredSlots - stats.featured),
              })
        }
      />
    </div>
  );
}
