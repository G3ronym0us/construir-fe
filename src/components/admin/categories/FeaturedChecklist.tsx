"use client";

import { useTranslations } from "next-intl";
import { Check, Circle } from "lucide-react";

/**
 * Qué le falta a la categoría para poder ir a la portada.
 *
 * La franja de destacadas descarta en silencio a las que no cumplen, así que
 * los requisitos se dicen antes de guardar en vez de después, cuando la
 * categoría simplemente no aparece y no se sabe por qué.
 */

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export function FeaturedChecklist({ items }: { items: ChecklistItem[] }) {
  const t = useTranslations("categories");

  return (
    <div className="rounded-xl border border-sand-300 bg-sand-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-700">
        {t("featuredChecklistTitle")}
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.done ? (
              <Check className="h-3.5 w-3.5 flex-none text-success-600" />
            ) : (
              <Circle className="h-3.5 w-3.5 flex-none text-sand-500" />
            )}
            <span
              className={`text-[12.5px] ${
                item.done ? "text-sand-700" : "font-medium text-ink"
              }`}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
