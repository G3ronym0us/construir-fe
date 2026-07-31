"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  MOBILE_PRESET_IDS,
  PRESET_IDS,
  addMonths,
  atMidnight,
  buildMonth,
  countDays,
  fromISODate,
  matchPreset,
  pickDay,
  presetRange,
  rangeBounds,
  startOfMonth,
  toISODate,
  type DayCell,
  type DraftRange,
  type PresetId,
} from "./date-range";

/**
 * Filtro por rango de fechas del listado de órdenes.
 *
 * Un solo componente con dos formas: en escritorio un popover con dos meses y
 * el riel de rangos rápidos; en móvil una hoja inferior con un mes a la vez y
 * celdas de 44 px, que es lo mínimo que se acierta con el pulgar.
 *
 * Lo elegido no se aplica hasta pulsar "Aplicar": el listado consulta al
 * backend en cada cambio de filtro y elegir un rango son dos clics, así que
 * confirmar evita una consulta con el rango a medias.
 */

const MOBILE_BREAKPOINT = "(min-width: 768px)";

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_BREAKPOINT);
    const sync = () => setIsDesktop(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const t = useTranslations("orders");
  const locale = useLocale();
  const isDesktop = useIsDesktop();

  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Hoy se fija al montar: si el componente viviera abierto a medianoche, un
  // "hoy" recalculado en cada render movería el rango bajo el cursor.
  const today = useMemo(() => atMidnight(new Date()), []);

  const applied = useMemo<DraftRange>(
    () => ({
      start: fromISODate(value.startDate),
      end: fromISODate(value.endDate),
    }),
    [value.startDate, value.endDate]
  );

  const [draft, setDraft] = useState<DraftRange>(applied);
  const [hover, setHover] = useState<Date | null>(null);
  const [cursor, setCursor] = useState<Date>(() =>
    startOfMonth(applied.end ?? applied.start ?? today)
  );

  const close = useCallback(() => {
    setOpen(false);
    setHover(null);
  }, []);

  /** Cierra descartando: el borrador vuelve a lo que ya estaba aplicado. */
  const cancel = useCallback(() => {
    setDraft(applied);
    close();
  }, [applied, close]);

  const openPanel = () => {
    setDraft(applied);
    setHover(null);
    // En escritorio se ven dos meses: se retrocede uno para que el final del
    // rango (o el mes en curso) quede a la derecha, que es donde se mira.
    const anchor = startOfMonth(applied.end ?? applied.start ?? today);
    setCursor(isDesktop ? addMonths(anchor, -1) : anchor);
    setOpen(true);
  };

  const apply = () => {
    if (draft.start && !draft.end) {
      // Un solo día elegido vale como rango de un día.
      onChange({
        startDate: toISODate(draft.start),
        endDate: toISODate(draft.start),
      });
    } else {
      onChange({
        startDate: draft.start ? toISODate(draft.start) : "",
        endDate: draft.end ? toISODate(draft.end) : "",
      });
    }
    close();
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) cancel();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, cancel]);

  // La hoja móvil tapa la pantalla: el fondo no debe seguir desplazándose.
  useEffect(() => {
    if (!open || isDesktop) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isDesktop]);

  const formatDay = (date: Date | null) =>
    date
      ? date.toLocaleDateString(locale, { day: "2-digit", month: "short" })
      : "···";

  const formatDayYear = (date: Date | null) =>
    date
      ? date.toLocaleDateString(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : t("noDate");

  const triggerLabel = applied.start
    ? `${formatDay(applied.start)} – ${formatDayYear(applied.end ?? applied.start)}`
    : t("dateRangeAll");

  const bounds = rangeBounds(draft, hover);
  const [boundStart, boundEnd] = bounds;
  const daysLabel =
    boundStart && boundEnd
      ? t("dateRangeDays", { count: countDays(boundStart, boundEnd) })
      : t("pickEndDate");

  const activePreset = matchPreset(draft, today);

  const choosePreset = (id: PresetId) => {
    const range = presetRange(id, today);
    setDraft(range);
    setHover(null);
    if (range.end) {
      const anchor = startOfMonth(range.end);
      setCursor(isDesktop ? addMonths(anchor, -1) : anchor);
    }
  };

  const onPickDay = (day: Date) => {
    setDraft((current) => pickDay(current, day));
    setHover(null);
  };

  const monthsShown = isDesktop ? 2 : 1;
  const months = Array.from({ length: monthsShown }, (_, index) => {
    const month = addMonths(cursor, index);
    return {
      key: `${month.getFullYear()}-${month.getMonth()}`,
      label: month.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      }),
      isFirst: index === 0,
      isLast: index === monthsShown - 1,
      days: buildMonth(month.getFullYear(), month.getMonth(), bounds, today),
    };
  });

  // Lunes primero, como el diseño. Se derivan del locale en vez de fijarlas
  // para que la versión en inglés no muestre iniciales en español.
  const weekdays = useMemo(
    () =>
      // 1 de enero de 2024 fue lunes.
      Array.from({ length: 7 }, (_, index) => ({
        key: index,
        label: new Date(2024, 0, 1 + index)
          .toLocaleDateString(locale, { weekday: "narrow" })
          .toUpperCase(),
      })),
    [locale]
  );

  return (
    <div ref={rootRef} className="relative flex-none">
      <button
        type="button"
        onClick={() => (open ? cancel() : openPanel())}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex w-full items-center gap-2 rounded-lg border bg-white px-3.5 py-2.5 text-[12.5px] font-semibold text-sand-700 transition-colors md:w-auto ${
          open ? "border-brand-500" : "border-sand-300 hover:bg-sand-100"
        }`}
      >
        <Calendar className="h-[15px] w-[15px] flex-none text-sand-600" />
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 flex-none text-sand-600" />
      </button>

      {open &&
        (isDesktop ? (
          <div
            role="dialog"
            aria-label={t("dateRangeTitle")}
            className="absolute right-0 top-[calc(100%+10px)] z-50 flex flex-col overflow-hidden rounded-2xl border border-sand-300 bg-white shadow-[0_24px_48px_-14px_rgba(20,24,29,0.32)]"
          >
            <div className="flex items-stretch">
              <div className="flex w-[172px] flex-none flex-col gap-0.5 border-r border-sand-200 bg-sand-50 p-2.5">
                <span className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-sand-600">
                  {t("quickRanges")}
                </span>
                {PRESET_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choosePreset(id)}
                    aria-pressed={activePreset === id}
                    className={`flex items-center rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors ${
                      activePreset === id
                        ? "bg-brand-50 font-extrabold text-brand-600"
                        : "font-semibold text-sand-700 hover:bg-sand-100"
                    }`}
                  >
                    {t(`presets.${id}`)}
                  </button>
                ))}
              </div>

              <div className="flex gap-6 p-4">
                {months.map((month) => (
                  <div key={month.key} className="flex w-[238px] flex-col gap-2">
                    <div className="flex h-7 items-center justify-between">
                      {month.isFirst ? (
                        <NavButton
                          direction="prev"
                          label={t("previousMonth")}
                          onClick={() => setCursor(addMonths(cursor, -1))}
                        />
                      ) : (
                        <span className="w-[27px] flex-none" />
                      )}
                      <span className="font-display text-[13.5px] font-bold text-ink first-letter:uppercase">
                        {month.label}
                      </span>
                      {month.isLast ? (
                        <NavButton
                          direction="next"
                          label={t("nextMonth")}
                          onClick={() => setCursor(addMonths(cursor, 1))}
                        />
                      ) : (
                        <span className="w-[27px] flex-none" />
                      )}
                    </div>

                    <div className="grid grid-cols-[repeat(7,34px)]">
                      {weekdays.map((weekday) => (
                        <span
                          key={weekday.key}
                          className="flex h-6 items-center justify-center text-[10.5px] font-bold text-sand-600"
                        >
                          {weekday.label}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-[repeat(7,34px)] gap-y-[3px]">
                      {month.days.map((day) => (
                        <DayButton
                          key={day.date.getTime()}
                          day={day}
                          size="sm"
                          locale={locale}
                          onPick={onPickDay}
                          onHover={setHover}
                          hoverEnabled={!!draft.start && !draft.end}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 border-t border-sand-200 bg-sand-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="whitespace-nowrap rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-[12.5px] font-bold text-ink">
                  {formatDayYear(draft.start)}
                </span>
                <span aria-hidden className="text-sand-500">
                  →
                </span>
                <span className="whitespace-nowrap rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-[12.5px] font-bold text-ink">
                  {formatDayYear(draft.end)}
                </span>
                <span className="whitespace-nowrap text-[11.5px] font-semibold text-sand-600">
                  {daysLabel}
                </span>
              </div>

              <div className="flex flex-none gap-2">
                <button
                  type="button"
                  onClick={cancel}
                  className="rounded-lg border border-sand-300 bg-white px-3.5 py-2.5 text-[12.5px] font-semibold text-sand-700 transition-colors hover:bg-sand-100"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={apply}
                  className="rounded-lg bg-brand-600 px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-brand-700"
                >
                  {t("applyRange")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-50 flex items-end bg-ink/40">
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("dateRangeTitle")}
              className="flex w-full flex-col gap-3.5 rounded-t-3xl bg-white px-4 pb-5 pt-2.5"
            >
              <span
                aria-hidden
                className="h-1 w-11 self-center rounded-full bg-sand-300"
              />

              <div className="flex items-center justify-between">
                <span className="font-display text-[17px] font-bold text-ink">
                  {t("dateRangeTitle")}
                </span>
                <button
                  type="button"
                  onClick={cancel}
                  aria-label={t("close")}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-sand-700"
                >
                  <X className="h-[15px] w-[15px]" />
                </button>
              </div>

              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {MOBILE_PRESET_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choosePreset(id)}
                    aria-pressed={activePreset === id}
                    className={`flex-none whitespace-nowrap rounded-full px-3.5 py-2.5 text-[12.5px] font-bold transition-colors ${
                      activePreset === id
                        ? "bg-brand-600 text-white"
                        : "border border-sand-300 bg-white text-sand-700"
                    }`}
                  >
                    {t(`presets.${id}`)}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <NavButton
                  direction="prev"
                  label={t("previousMonth")}
                  size="lg"
                  onClick={() => setCursor(addMonths(cursor, -1))}
                />
                <span className="font-display text-[15px] font-bold text-ink first-letter:uppercase">
                  {months[0].label}
                </span>
                <NavButton
                  direction="next"
                  label={t("nextMonth")}
                  size="lg"
                  onClick={() => setCursor(addMonths(cursor, 1))}
                />
              </div>

              <div className="grid grid-cols-7">
                {weekdays.map((weekday) => (
                  <span
                    key={weekday.key}
                    className="flex h-[26px] items-center justify-center text-[11px] font-bold text-sand-600"
                  >
                    {weekday.label}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {months[0].days.map((day) => (
                  <DayButton
                    key={day.date.getTime()}
                    day={day}
                    size="lg"
                    locale={locale}
                    onPick={onPickDay}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-sand-200 pt-2">
                <span className="text-[13.5px] font-bold text-ink">
                  {formatDay(draft.start)} – {formatDay(draft.end)}
                </span>
                <span className="text-[11.5px] font-semibold text-sand-600">
                  {daysLabel}
                </span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={cancel}
                  className="flex-none rounded-xl border border-sand-300 px-5 py-4 text-sm font-bold text-sand-700"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={apply}
                  className="flex-1 rounded-xl bg-brand-600 px-5 py-4 text-[14.5px] font-bold text-white"
                >
                  {t("apply")}
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

function NavButton({
  direction,
  label,
  onClick,
  size = "sm",
}: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
  size?: "sm" | "lg";
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const box = size === "lg" ? "h-[34px] w-[34px]" : "h-[27px] w-[27px]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${box} flex flex-none items-center justify-center rounded-lg border border-sand-300 text-sand-700 transition-colors hover:bg-sand-100`}
    >
      <Icon className="h-[15px] w-[15px]" />
    </button>
  );
}

/**
 * Celda de un día.
 *
 * Los extremos van rellenos y solo redondean por fuera, de forma que start,
 * intermedios y end se lean como una única barra continua.
 */
function DayButton({
  day,
  size,
  locale,
  onPick,
  onHover,
  hoverEnabled = false,
}: {
  day: DayCell;
  size: "sm" | "lg";
  locale: string;
  onPick: (day: Date) => void;
  onHover?: (day: Date | null) => void;
  hoverEnabled?: boolean;
}) {
  const isEdge = day.isStart || day.isEnd;
  const single = day.isStart && day.isEnd;
  const radius = size === "lg" ? "rounded-xl" : "rounded-lg";

  let tone: string;
  if (isEdge) {
    tone = `bg-brand-600 font-extrabold text-white ${
      single
        ? radius
        : day.isStart
          ? `${radius} rounded-r-none`
          : `${radius} rounded-l-none`
    }`;
  } else if (day.inRange) {
    tone = "bg-brand-50 text-brand-700";
  } else if (day.outside) {
    tone = `${radius} text-sand-400`;
  } else if (day.isToday) {
    tone = `${radius} font-extrabold text-brand-600 ring-1 ring-inset ring-brand-600`;
  } else {
    tone = `${radius} text-sand-700 hover:bg-sand-100`;
  }

  return (
    <button
      type="button"
      onClick={() => onPick(day.date)}
      onMouseEnter={hoverEnabled ? () => onHover?.(day.date) : undefined}
      aria-label={day.date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
      aria-pressed={isEdge}
      className={`flex items-center justify-center transition-colors ${
        size === "lg" ? "h-11 text-[15px]" : "h-8 text-[12.5px]"
      } font-semibold ${tone}`}
    >
      {day.label}
    </button>
  );
}
