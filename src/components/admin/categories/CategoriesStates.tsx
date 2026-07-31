"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ListTree, PlusCircle, SearchX } from "lucide-react";

/**
 * Los tres estados del listado que no son "hay filas".
 *
 * Se separan del cuerpo de la página porque cada uno tiene una salida
 * distinta: esperar, corregir la búsqueda o crear la primera categoría.
 */

/** Esqueleto con la forma de la tabla, para que no salte al cargar. */
export function CategoriesLoading() {
  const t = useTranslations("categories");

  return (
    <div
      className="overflow-hidden rounded-xl border border-sand-300 bg-white"
      aria-busy="true"
    >
      <div className="border-b border-sand-300 bg-sand-50 px-[18px] py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-700">
        {t("loading")}
      </div>
      <div className="divide-y divide-sand-200">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex items-center gap-4 px-[18px] py-4">
            <div className="h-4 flex-1 animate-pulse rounded bg-sand-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-sand-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-sand-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-sand-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Búsqueda o filtro sin coincidencias, con la corrección más probable. */
export function CategoriesNoResults({
  search,
  suggestion,
  onUseSuggestion,
  onClearFilters,
}: {
  search: string;
  suggestion: string | null;
  onUseSuggestion: (suggestion: string) => void;
  onClearFilters: () => void;
}) {
  const t = useTranslations("categories");

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-sand-300 bg-white px-6 py-12 text-center">
      <SearchX className="h-7 w-7 text-sand-500" />
      <p className="text-[14px] font-semibold text-ink">
        {search ? t("noResultsFor", { search }) : t("noResultsForFilter")}
      </p>
      <p className="text-[13px] text-sand-700">
        {t("noResultsHint")}{" "}
        {suggestion && (
          <>
            {t("didYouMean")}{" "}
            <button
              type="button"
              onClick={() => onUseSuggestion(suggestion)}
              className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              {suggestion}
            </button>
            ?
          </>
        )}
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-2 rounded-lg border border-sand-300 px-4 py-2 text-[12.5px] font-semibold text-sand-700 transition-colors hover:bg-sand-50"
      >
        {t("clearFilters")}
      </button>
    </div>
  );
}

/** Catálogo sin ninguna categoría todavía. */
export function CategoriesEmpty() {
  const t = useTranslations("categories");

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-sand-300 bg-white px-6 py-12 text-center">
      <ListTree className="h-7 w-7 text-sand-500" />
      <p className="text-[14px] font-semibold text-ink">{t("emptyTitle")}</p>
      <p className="max-w-sm text-[13px] text-sand-700">{t("emptyHint")}</p>
      <Link
        href="/admin/dashboard/categories/new"
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        <PlusCircle className="h-4 w-4" />
        {t("newCategory")}
      </Link>
    </div>
  );
}
