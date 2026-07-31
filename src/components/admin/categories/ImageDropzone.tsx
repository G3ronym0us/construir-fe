"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus } from "lucide-react";

/**
 * Zona de arrastre para la imagen de la categoría.
 *
 * Acepta arrastrar o seleccionar, y valida tipo y tamaño antes de devolver
 * el archivo: es preferible avisar acá que después de subir 6 MB al S3.
 */

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

interface ImageDropzoneProps {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export function ImageDropzone({ onSelect, disabled = false }: ImageDropzoneProps) {
  const t = useTranslations("categories");
  const inputId = useId();
  const [isOver, setIsOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setError(t("dropzoneWrongType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("dropzoneTooBig"));
      return;
    }

    setError(null);
    onSelect(file);
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsOver(false);
          if (!disabled) accept(event.dataTransfer.files[0]);
        }}
        className={`rounded-lg border-2 border-dashed transition-colors ${
          isOver ? "border-brand-400 bg-brand-50" : "border-sand-400 bg-sand-50"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <label
          htmlFor={inputId}
          className={`flex flex-col items-center gap-1.5 px-6 py-8 text-center ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <ImagePlus className="h-6 w-6 text-sand-500" />
          <span className="text-[13px] font-semibold text-sand-800">
            {t("dropzoneTitle")}
          </span>
          <span className="text-[12px] text-sand-600">{t("dropzoneHint")}</span>
        </label>

        <input
          id={inputId}
          type="file"
          accept={ACCEPTED.join(",")}
          disabled={disabled}
          onChange={(event) => {
            accept(event.target.files?.[0]);
            // Permite volver a elegir el mismo archivo tras un error.
            event.target.value = "";
          }}
          className="sr-only"
        />
      </div>

      {error && (
        <p className="mt-1.5 text-[12.5px] font-medium text-danger-600">{error}</p>
      )}
    </div>
  );
}
