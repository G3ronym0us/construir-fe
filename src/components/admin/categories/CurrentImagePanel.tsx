"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { RefreshCw, Trash2 } from "lucide-react";

/**
 * La imagen que la categoría tiene hoy, con sus dos únicas acciones.
 *
 * El badge "En portada" existe porque eliminar la imagen de una destacada no
 * es solo borrar un archivo: la saca de la franja de la portada, y eso hay
 * que decirlo antes de pulsar, no en el modal de después.
 */

interface CurrentImagePanelProps {
  image: string;
  name: string;
  isFeatured: boolean;
  isBusy: boolean;
  onReplace: () => void;
  onDelete: () => void;
}

export function CurrentImagePanel({
  image,
  name,
  isFeatured,
  isBusy,
  onReplace,
  onDelete,
}: CurrentImagePanelProps) {
  const t = useTranslations("categories");

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-ink">
          {t("currentImage")}
        </span>
        {isFeatured && (
          <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700">
            {t("onHomepage")}
          </span>
        )}
      </div>

      <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg border border-sand-300">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReplace}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-3 py-1.5 text-[12.5px] font-medium text-sand-800 transition-colors hover:bg-sand-50 disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t("replaceImage")}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-danger-600 transition-colors hover:bg-danger-50 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {isBusy ? t("deleting") : t("deleteImage")}
        </button>
      </div>

      {isFeatured && (
        <p className="mt-2 text-[12px] leading-relaxed text-sand-600">
          {t("deleteImageUnfeatures")}
        </p>
      )}
    </div>
  );
}
