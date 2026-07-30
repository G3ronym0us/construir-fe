'use client';

import { useExchangeRate, formatRate } from '@/hooks/useExchangeRate';

interface RateChipProps {
  className?: string;
}

/**
 * Chip con la tasa BCV vigente. Se mantiene a la vista en el header porque todos
 * los precios se muestran en Bs. con el USD como referencia.
 */
export default function RateChip({ className = '' }: RateChipProps) {
  const { rate, loading } = useExchangeRate();

  if (loading || rate === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-sand-300 bg-sand-100 px-2.5 py-1.5 text-[11px] font-bold text-sand-700 whitespace-nowrap ${className}`}
      title="Tasa oficial BCV"
    >
      BCV {formatRate(rate)}
    </span>
  );
}
