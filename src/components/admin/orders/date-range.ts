/**
 * Lógica del filtro por rango de fechas, aparte de su pintado.
 *
 * Todo se trabaja con fechas locales a medianoche. `new Date("2026-07-28")` se
 * interpreta como UTC y en Venezuela (UTC−4) retrocede al día 27, así que ni se
 * parsea ni se serializa con `Date`: se arma a mano el `yyyy-mm-dd` que espera
 * el backend.
 */

export const MS_PER_DAY = 86_400_000;

export function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  // Descarta fechas imposibles ("2026-02-31" desbordaría a marzo).
  return date.getMonth() === Number(month) - 1 ? date : null;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return !!a && !!b && a.getTime() === b.getTime();
}

export function countDays(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

export interface DraftRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Extremos a pintar, contando la fecha bajo el cursor mientras el rango está a
 * medias, y ordenados aunque se haya elegido primero la final.
 */
export function rangeBounds(
  draft: DraftRange,
  hover: Date | null
): [Date | null, Date | null] {
  const start = draft.start;
  const end = draft.end ?? (draft.start ? hover : null);
  if (start && end && end.getTime() < start.getTime()) return [end, start];
  return [start, end];
}

/**
 * Un clic sobre un día.
 *
 * El primero abre un rango nuevo; el segundo lo cierra, y si cae antes del
 * inicio se intercambian en vez de rechazarlo — es más rápido que obligar a
 * empezar de nuevo.
 */
export function pickDay(draft: DraftRange, day: Date): DraftRange {
  if (!draft.start || draft.end) return { start: day, end: null };
  if (day.getTime() < draft.start.getTime()) {
    return { start: day, end: draft.start };
  }
  return { start: draft.start, end: day };
}

export type PresetId =
  | "all"
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "thisYear";

/** Orden del riel de rangos rápidos del diseño, con "todo" al frente. */
export const PRESET_IDS: PresetId[] = [
  "all",
  "today",
  "yesterday",
  "last7",
  "last30",
  "thisMonth",
  "lastMonth",
  "thisYear",
];

/** Los que caben en la tira deslizable de la hoja móvil. */
export const MOBILE_PRESET_IDS: PresetId[] = [
  "all",
  "last7",
  "last30",
  "thisMonth",
  "lastMonth",
];

export function presetRange(id: PresetId, today: Date): DraftRange {
  const year = today.getFullYear();
  const month = today.getMonth();

  switch (id) {
    case "all":
      return { start: null, end: null };
    case "today":
      return { start: today, end: today };
    case "yesterday": {
      const day = addDays(today, -1);
      return { start: day, end: day };
    }
    case "last7":
      return { start: addDays(today, -6), end: today };
    case "last30":
      return { start: addDays(today, -29), end: today };
    case "thisMonth":
      return { start: new Date(year, month, 1), end: today };
    case "lastMonth":
      return {
        start: new Date(year, month - 1, 1),
        // Día 0 del mes actual es el último del anterior.
        end: new Date(year, month, 0),
      };
    case "thisYear":
      return { start: new Date(year, 0, 1), end: today };
  }
}

/** Qué rango rápido reproduce el borrador actual, si alguno. */
export function matchPreset(draft: DraftRange, today: Date): PresetId | null {
  return (
    PRESET_IDS.find((id) => {
      const range = presetRange(id, today);
      return (
        (range.start?.getTime() ?? null) === (draft.start?.getTime() ?? null) &&
        (range.end?.getTime() ?? null) === (draft.end?.getTime() ?? null)
      );
    }) ?? null
  );
}

export interface DayCell {
  date: Date;
  label: string;
  /** Fuera del mes que se está pintando: se muestra apagado. */
  outside: boolean;
  isStart: boolean;
  isEnd: boolean;
  /** Entre ambos extremos, sin serlo. */
  inRange: boolean;
  isToday: boolean;
}

/**
 * Rejilla de un mes, siempre empezando en lunes y completando las semanas con
 * los días vecinos para que no queden huecos.
 */
export function buildMonth(
  year: number,
  month: number,
  bounds: [Date | null, Date | null],
  today: Date
): DayCell[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const length = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((offset + length) / 7);
  const [start, end] = bounds;

  return Array.from({ length: weeks * 7 }, (_, index) => {
    const date = new Date(year, month, 1 - offset + index);
    const time = date.getTime();
    const isStart = isSameDay(date, start);
    const isEnd = isSameDay(date, end);

    return {
      date,
      label: String(date.getDate()),
      outside: date.getMonth() !== month,
      isStart,
      isEnd,
      inRange:
        !!start && !!end && time > start.getTime() && time < end.getTime(),
      isToday: isSameDay(date, today),
    };
  });
}
