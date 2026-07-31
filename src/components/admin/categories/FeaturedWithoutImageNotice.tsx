"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import type { Category } from "@/types";

/**
 * Aviso de la categoría destacada que la portada no está mostrando.
 *
 * Es el único fallo del listado que no se ve mirando la tabla: la estrella
 * está encendida y la fila parece correcta, pero sin imagen la franja de
 * destacadas la salta. Por eso sube a la cabecera con la acción de arreglo.
 */

interface FeaturedWithoutImageNoticeProps {
  /** Las destacadas sin imagen de la página actual. */
  categories: Category[];
  /** Total del catálogo: puede haber más fuera de esta página. */
  total: number;
  onFixImage: (category: Category) => void;
  /** Salida cuando ninguna de las afectadas está en la página actual. */
  onShowThem: () => void;
}

export function FeaturedWithoutImageNotice({
  categories,
  total,
  onFixImage,
  onShowThem,
}: FeaturedWithoutImageNoticeProps) {
  const t = useTranslations("categories");

  if (total === 0) return null;

  const first = categories[0];
  const name = first ? first.customName ?? first.name : null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3.5">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-accent-600" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[13.5px] font-semibold text-accent-700">
          {name && total === 1
            ? t("featuredNoImageOne", { name })
            : t("featuredNoImageMany", { count: total })}
        </span>
        <span className="text-[12.5px] leading-relaxed text-accent-700/90">
          {t("featuredNoImageHint")}{" "}
          <button
            type="button"
            onClick={() => (first ? onFixImage(first) : onShowThem())}
            className="font-semibold text-accent-700 underline underline-offset-2 hover:text-accent-600"
          >
            {first ? t("uploadImageNow") : t("showThem")}
          </button>
        </span>
      </div>
    </div>
  );
}
