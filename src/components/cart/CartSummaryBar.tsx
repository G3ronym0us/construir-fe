'use client';

import Link from 'next/link';
import { useCartTotals } from '@/hooks/useCartTotals';
import { formatVES, formatUSD } from '@/lib/currency';

/**
 * Barra fija de carrito para las pantallas de catálogo: recuento, total dual y
 * salto al carrito. Se ancla al borde inferior — el catálogo no lleva
 * navegación inferior en móvil.
 */
export default function CartSummaryBar() {
  const { totalItems, subtotal, subtotalVES } = useCartTotals();

  if (totalItems === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-300 bg-white px-4 pb-[calc(1.375rem+env(safe-area-inset-bottom))] pt-3 md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-sand-600">
            Carrito · {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
          </p>
          <p className="truncate text-[15px] font-extrabold text-ink">
            {subtotalVES && subtotalVES > 0 ? formatVES(subtotalVES) : formatUSD(subtotal)}
            {subtotalVES && subtotalVES > 0 && (
              <span className="ml-1 text-xs font-medium text-sand-600">
                · {formatUSD(subtotal)}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/carrito"
          className="flex min-h-11 flex-none items-center rounded-xl bg-brand-600 px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-brand-700"
        >
          Ver carrito
        </Link>
      </div>
    </div>
  );
}
