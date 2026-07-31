import { describe, it, expect } from 'vitest';
import {
  buildMonth,
  countDays,
  fromISODate,
  matchPreset,
  pickDay,
  presetRange,
  rangeBounds,
  toISODate,
} from '../date-range';

// Martes 28 de julio de 2026, el "hoy" del diseño.
const TODAY = new Date(2026, 6, 28);

describe('toISODate / fromISODate', () => {
  it('serializa en fecha local, sin correrse por la zona horaria', () => {
    // El bug clásico: new Date("2026-07-28") es medianoche UTC y en Venezuela
    // (UTC−4) cae el día 27. La ida y vuelta tiene que conservar el día.
    expect(toISODate(new Date(2026, 6, 28))).toBe('2026-07-28');
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('vuelve a la misma fecha al parsear lo serializado', () => {
    const date = new Date(2026, 6, 28);
    expect(fromISODate(toISODate(date))?.getTime()).toBe(date.getTime());
  });

  it('devuelve null con texto vacío o con formato ajeno', () => {
    expect(fromISODate('')).toBeNull();
    expect(fromISODate('28/07/2026')).toBeNull();
    expect(fromISODate('2026-7-8')).toBeNull();
  });

  it('devuelve null en fechas que no existen en vez de desbordar de mes', () => {
    expect(fromISODate('2026-02-31')).toBeNull();
  });
});

describe('pickDay', () => {
  const first = new Date(2026, 6, 10);
  const later = new Date(2026, 6, 20);

  it('el primer clic abre un rango sin fecha final', () => {
    expect(pickDay({ start: null, end: null }, first)).toEqual({
      start: first,
      end: null,
    });
  });

  it('el segundo clic posterior cierra el rango', () => {
    expect(pickDay({ start: first, end: null }, later)).toEqual({
      start: first,
      end: later,
    });
  });

  it('intercambia cuando la segunda fecha es anterior a la primera', () => {
    expect(pickDay({ start: later, end: null }, first)).toEqual({
      start: first,
      end: later,
    });
  });

  it('un clic sobre un rango ya cerrado empieza otro', () => {
    expect(pickDay({ start: first, end: later }, TODAY)).toEqual({
      start: TODAY,
      end: null,
    });
  });

  it('permite elegir el mismo día como inicio y fin', () => {
    expect(pickDay({ start: first, end: null }, first)).toEqual({
      start: first,
      end: first,
    });
  });
});

describe('rangeBounds', () => {
  const start = new Date(2026, 6, 10);
  const hovered = new Date(2026, 6, 15);

  it('usa el día bajo el cursor mientras falta la fecha final', () => {
    expect(rangeBounds({ start, end: null }, hovered)).toEqual([start, hovered]);
  });

  it('ordena los extremos si el cursor está antes del inicio', () => {
    const earlier = new Date(2026, 6, 3);
    expect(rangeBounds({ start, end: null }, earlier)).toEqual([earlier, start]);
  });

  it('ignora el cursor una vez cerrado el rango', () => {
    const end = new Date(2026, 6, 20);
    expect(rangeBounds({ start, end }, hovered)).toEqual([start, end]);
  });
});

describe('presetRange', () => {
  it('"hoy" es un rango de un solo día', () => {
    const range = presetRange('today', TODAY);
    expect(range).toEqual({ start: TODAY, end: TODAY });
    expect(countDays(range.start!, range.end!)).toBe(1);
  });

  it('"últimos 7 días" incluye hoy y suma siete', () => {
    const range = presetRange('last7', TODAY);
    expect(toISODate(range.start!)).toBe('2026-07-22');
    expect(countDays(range.start!, range.end!)).toBe(7);
  });

  it('"últimos 30 días" suma treinta', () => {
    const range = presetRange('last30', TODAY);
    expect(countDays(range.start!, range.end!)).toBe(30);
  });

  it('"este mes" va del día 1 a hoy', () => {
    const range = presetRange('thisMonth', TODAY);
    expect(toISODate(range.start!)).toBe('2026-07-01');
    expect(toISODate(range.end!)).toBe('2026-07-28');
  });

  it('"mes pasado" termina en el último día de junio, no en el 1 de julio', () => {
    const range = presetRange('lastMonth', TODAY);
    expect(toISODate(range.start!)).toBe('2026-06-01');
    expect(toISODate(range.end!)).toBe('2026-06-30');
  });

  it('"este año" arranca el 1 de enero', () => {
    expect(toISODate(presetRange('thisYear', TODAY).start!)).toBe('2026-01-01');
  });

  it('"todo el histórico" deja el rango vacío, que es no filtrar', () => {
    expect(presetRange('all', TODAY)).toEqual({ start: null, end: null });
  });

  it('cruza el año al pedir el mes pasado en enero', () => {
    const range = presetRange('lastMonth', new Date(2026, 0, 15));
    expect(toISODate(range.start!)).toBe('2025-12-01');
    expect(toISODate(range.end!)).toBe('2025-12-31');
  });
});

describe('matchPreset', () => {
  it('reconoce el rango rápido que reproduce el borrador', () => {
    expect(matchPreset(presetRange('last30', TODAY), TODAY)).toBe('last30');
  });

  it('marca "todo el histórico" cuando no hay fechas', () => {
    expect(matchPreset({ start: null, end: null }, TODAY)).toBe('all');
  });

  it('no marca ninguno con un rango elegido a mano', () => {
    expect(
      matchPreset(
        { start: new Date(2026, 6, 3), end: new Date(2026, 6, 9) },
        TODAY
      )
    ).toBeNull();
  });
});

describe('buildMonth', () => {
  const emptyBounds: [Date | null, Date | null] = [null, null];

  it('rellena semanas completas', () => {
    const days = buildMonth(2026, 6, emptyBounds, TODAY);
    expect(days.length % 7).toBe(0);
  });

  it('empieza en lunes', () => {
    const [first] = buildMonth(2026, 6, emptyBounds, TODAY);
    expect(first.date.getDay()).toBe(1);
  });

  it('marca como ajenos los días de relleno del mes vecino', () => {
    const days = buildMonth(2026, 6, emptyBounds, TODAY);
    // Julio de 2026 empieza en miércoles: los dos primeros son de junio.
    expect(days[0].outside).toBe(true);
    expect(days.find((day) => day.label === '1')?.outside).toBe(false);
  });

  it('señala hoy', () => {
    const days = buildMonth(2026, 6, emptyBounds, TODAY);
    expect(days.filter((day) => day.isToday)).toHaveLength(1);
    expect(days.find((day) => day.isToday)?.label).toBe('28');
  });

  it('distingue extremos e intermedios del rango', () => {
    const bounds: [Date, Date] = [new Date(2026, 6, 10), new Date(2026, 6, 13)];
    const days = buildMonth(2026, 6, bounds, TODAY).filter(
      (day) => !day.outside
    );

    expect(days.find((day) => day.label === '10')?.isStart).toBe(true);
    expect(days.find((day) => day.label === '13')?.isEnd).toBe(true);
    expect(days.find((day) => day.label === '11')?.inRange).toBe(true);
    expect(days.find((day) => day.label === '12')?.inRange).toBe(true);
    // Los extremos no cuentan como intermedios: se pintan distinto.
    expect(days.find((day) => day.label === '10')?.inRange).toBe(false);
    expect(days.find((day) => day.label === '14')?.inRange).toBe(false);
  });

  it('un rango de un día es a la vez inicio y fin', () => {
    const day = new Date(2026, 6, 10);
    const cell = buildMonth(2026, 6, [day, day], TODAY).find(
      (candidate) => candidate.label === '10' && !candidate.outside
    );

    expect(cell?.isStart).toBe(true);
    expect(cell?.isEnd).toBe(true);
  });
});
