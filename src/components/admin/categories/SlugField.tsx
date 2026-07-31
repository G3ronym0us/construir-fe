"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, X } from "lucide-react";
import { categoriesService } from "@/services/categories";

/**
 * Slug con la URL real delante y la disponibilidad al lado.
 *
 * El slug es la URL que se comparte por WhatsApp, así que se muestra dentro
 * del dominio y se comprueba contra el backend mientras se escribe: enterarse
 * de que "plomeria" ya existe al guardar es tarde.
 */

export type SlugAvailability =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  /** No se pudo consultar: se calla en vez de prometer que está libre. */
  | "unknown";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHECK_DEBOUNCE_MS = 400;

/** Deriva un slug legible del nombre, sin acentos ni signos. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Consulta si el slug está libre. `ownUuid` es el de la categoría que se está
 * editando: su propio slug no cuenta como ocupado.
 */
export function useSlugAvailability(
  slug: string,
  ownUuid?: string
): { status: SlugAvailability; takenBy: string | null } {
  const [status, setStatus] = useState<SlugAvailability>("idle");
  const [takenBy, setTakenBy] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setStatus("idle");
      setTakenBy(null);
      return;
    }

    if (!SLUG_PATTERN.test(slug)) {
      setStatus("invalid");
      setTakenBy(null);
      return;
    }

    let cancelled = false;
    setStatus("checking");

    const timer = setTimeout(async () => {
      try {
        /*
         * Se consulta por búsqueda y no por `getBySlug`: ese endpoint responde
         * 404 cuando el slug está libre, que es el caso normal mientras se
         * escribe. Usar un error esperado como respuesta llena la consola y,
         * peor, no distingue "libre" de "el backend no contestó".
         */
        const { data } = await categoriesService.searchPaginated({
          search: slug,
          limit: 50,
        });
        if (cancelled) return;

        // La búsqueda es por coincidencia parcial: solo cuenta el slug exacto,
        // y el de la propia categoría que se está editando no ocupa nada.
        const existing = data.find(
          (category) => category.slug === slug && category.uuid !== ownUuid
        );

        setStatus(existing ? "taken" : "available");
        setTakenBy(existing ? existing.customName ?? existing.name : null);
      } catch (error) {
        console.error("Error checking slug availability:", error);
        if (!cancelled) {
          setStatus("unknown");
          setTakenBy(null);
        }
      }
    }, CHECK_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, ownUuid]);

  return { status, takenBy };
}

export function SlugAvailabilityBadge({
  status,
  takenBy,
}: {
  status: SlugAvailability;
  takenBy: string | null;
}) {
  const t = useTranslations("categories");

  // "unknown" no dice nada: el guardado igual valida contra el backend, que
  // es el que manda sobre la unicidad del slug.
  if (status === "idle" || status === "unknown") return null;

  if (status === "checking") {
    return (
      <span className="inline-flex flex-none items-center gap-1 text-[11.5px] font-semibold text-sand-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        {t("slugChecking")}
      </span>
    );
  }

  if (status === "available") {
    return (
      <span className="inline-flex flex-none items-center gap-1 text-[11.5px] font-semibold text-success-600">
        <Check className="h-3 w-3" />
        {t("slugAvailable")}
      </span>
    );
  }

  return (
    <span
      className="inline-flex flex-none items-center gap-1 text-[11.5px] font-semibold text-danger-600"
      title={takenBy ?? undefined}
    >
      <X className="h-3 w-3" />
      {status === "invalid" ? t("slugInvalid") : t("slugTaken")}
    </span>
  );
}
