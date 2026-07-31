"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

/**
 * Confirmación de mover una categoría de padre.
 *
 * El slug no cambia, así que los enlaces compartidos siguen funcionando,
 * pero sí se mueve de lugar en el menú y en las migas de pan de todos sus
 * productos. Eso es lo que hay que decir antes de aceptar.
 */

interface MoveParentModalProps {
  isOpen: boolean;
  categoryName: string;
  currentParent: string | null;
  newParent: string | null;
  productCount: number;
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MoveParentModal({
  isOpen,
  categoryName,
  currentParent,
  newParent,
  productCount,
  isSaving,
  onConfirm,
  onCancel,
}: MoveParentModalProps) {
  const t = useTranslations("categories");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/30 transition-opacity"
        onClick={isSaving ? undefined : onCancel}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="move-parent-title"
          className="relative w-full max-w-md rounded-2xl border border-sand-300 bg-white p-6 shadow-xl animate-[modalSlide_0.3s_ease-out]"
        >
          <h3
            id="move-parent-title"
            className="font-display text-lg font-bold text-ink"
          >
            {t("moveParentTitle", { name: categoryName })}
          </h3>

          <div className="mt-4 flex items-center gap-3 rounded-lg border border-sand-300 bg-sand-50 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-600">
                {t("moveParentCurrent")}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-semibold text-sand-800">
                {currentParent ?? t("noParentShort")}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 flex-none text-sand-500" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-600">
                {t("moveParentNew")}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-semibold text-ink">
                {newParent ?? t("noParentShort")}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[12.5px] leading-relaxed text-sand-700">
            {t("moveParentWarning", { count: productCount })}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-sand-700 transition-colors hover:bg-sand-50 disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSaving}
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {isSaving ? t("saving") : t("moveParentConfirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
