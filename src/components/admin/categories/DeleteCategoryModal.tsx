"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import type { Category, CategoryUsage } from "@/types";

/**
 * Confirmación de eliminado con lo que se pierde de verdad.
 *
 * En vez de un "¿estás seguro?", enumera lo que quedaría roto —productos sin
 * categoría, banners que la enlazan, subcategorías huérfanas— y ofrece la
 * salida que casi siempre es la correcta: ocultarla y conservar todo.
 */

interface DeleteCategoryModalProps {
  category: Category | null;
  usage: CategoryUsage | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onHideInstead: () => void;
  onCancel: () => void;
}

export function DeleteCategoryModal({
  category,
  usage,
  isDeleting,
  onConfirm,
  onHideInstead,
  onCancel,
}: DeleteCategoryModalProps) {
  const t = useTranslations("categories");

  if (!category) return null;

  const name = category.customName ?? category.name;
  const products = usage?.publishedProducts ?? category.publishedProductCount ?? 0;
  const children = usage?.children.length ?? category.childrens?.length ?? 0;

  // Solo se listan las consecuencias que existen: un modal con viñetas en
  // cero asusta sin informar.
  const consequences = [
    products > 0 ? t("deleteConsequenceProducts", { count: products }) : null,
    usage && usage.activeBanners > 0
      ? t("deleteConsequenceBanners", {
          count: usage.activeBanners,
          slug: category.slug,
        })
      : null,
    children > 0 ? t("deleteConsequenceChildren", { count: children }) : null,
  ].filter((line): line is string => line !== null);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/30 transition-opacity"
        onClick={isDeleting ? undefined : onCancel}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-category-title"
          className="relative w-full max-w-lg rounded-2xl border border-sand-300 bg-white p-6 shadow-xl animate-[modalSlide_0.3s_ease-out]"
        >
          <div className="flex items-start gap-3.5">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-danger-50">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
            </span>

            <div className="min-w-0">
              <h3
                id="delete-category-title"
                className="font-display text-lg font-bold text-ink"
              >
                {t("deleteTitle", { name })}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-sand-700">
                {products > 0
                  ? t("deleteWarningWithProducts", { count: products })
                  : t("deleteWarning")}
              </p>

              {consequences.length > 0 && (
                <div className="mt-4 rounded-lg border border-sand-300 bg-sand-50 p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-700">
                    {t("deleteBeforeYouGo")}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {consequences.map((line) => (
                      <li key={line} className="text-[12.5px] text-sand-700">
                        · {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-sand-700 transition-colors hover:bg-sand-50 disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger-700 disabled:opacity-50"
              >
                {isDeleting ? t("deleting") : t("deleteAnyway")}
              </button>
            </div>

            {category.visible && (
              <button
                type="button"
                onClick={onHideInstead}
                disabled={isDeleting}
                className="self-center text-[12.5px] font-semibold text-brand-600 underline underline-offset-2 transition-colors hover:text-brand-700 disabled:opacity-50"
              >
                {t("hideInstead")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
