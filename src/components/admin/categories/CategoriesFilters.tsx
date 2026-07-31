"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { CategoryListFilter, CategoryStats } from "@/types";

/**
 * Buscador y atajos por problema del listado.
 *
 * Los chips no son categorías de navegación sino trabajo pendiente: "sin
 * imagen" y "ocultas" llevan directo a lo que hay que arreglar, y por eso
 * llevan su conteo al lado.
 */

interface CategoriesFiltersProps {
  search: string;
  filter: CategoryListFilter | null;
  stats: CategoryStats | null;
  onSearchChange: (search: string) => void;
  onFilterChange: (filter: CategoryListFilter | null) => void;
}

export function CategoriesFilters({
  search,
  filter,
  stats,
  onSearchChange,
  onFilterChange,
}: CategoriesFiltersProps) {
  const t = useTranslations("categories");

  const chipClass = (active: boolean) =>
    `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
      active
        ? "bg-ink text-white"
        : "border border-sand-300 bg-white text-sand-700 hover:bg-sand-100"
    }`;

  const countClass = (active: boolean) =>
    `font-extrabold ${active ? "" : "opacity-55"}`;

  const chips: { value: CategoryListFilter | null; label: string; count?: number }[] = [
    { value: null, label: t("chipAll"), count: stats?.total },
    { value: "parents", label: t("chipParents"), count: stats?.parents },
    { value: "no-image", label: t("chipNoImage"), count: stats?.withoutImage },
    { value: "hidden", label: t("chipHidden"), count: stats?.hidden },
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-sand-300 bg-white px-3.5 py-2.5 focus-within:border-brand-400">
        <Search className="h-4 w-4 flex-none text-sand-500" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchLabel")}
          className="w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-sand-500"
        />
      </div>

      <div className="chip-row lg:flex-none">
        {chips.map((chip) => {
          const active = filter === chip.value;
          return (
            <button
              key={chip.value ?? "all"}
              type="button"
              onClick={() => onFilterChange(chip.value)}
              aria-pressed={active}
              className={chipClass(active)}
            >
              {chip.label}
              {chip.count !== undefined && (
                <span className={countClass(active)}>{chip.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
