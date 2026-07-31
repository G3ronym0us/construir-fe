'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShoppingBag, Ticket } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useExchangeRate, formatRate } from '@/hooks/useExchangeRate';
import CartItem from '@/components/cart/CartItem';
import { formatVES, formatUSD } from '@/lib/currency';

export default function CarritoPage() {
  const router = useRouter();
  const { updateQuantity, removeFromCart, clearCart } = useCart();
  const { rate } = useExchangeRate();
  const {
    items,
    totalItems,
    subtotal,
    subtotalVES,
    baseUSD,
    baseVES,
    ivaUSD,
    ivaVES,
    loading,
  } = useCartTotals();

  const hasVES = subtotalVES !== null && subtotalVES > 0;

  const handleClearCart = async () => {
    if (confirm('¿Vaciar el carrito? Esta acción no se puede deshacer.')) {
      await clearCart();
    }
  };

  return (
    // `pb-48` reserva el alto de la barra fija, que ahora lleva el total además
    // de las dos acciones. Con el `pb-40` anterior el botón de vaciar carrito
    // quedaba tapado — el mismo problema que este cambio corrige.
    <div className="min-h-screen bg-white pb-48 md:pb-10">
      <div className="mx-auto max-w-2xl px-4 pt-[calc(1rem+env(safe-area-inset-top))] md:pt-4">
        {/* Cabecera */}
        <div className="mb-3 flex items-baseline gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Volver"
            className="-ml-2 flex h-9 w-9 flex-none items-center justify-center self-center rounded-lg text-ink hover:bg-sand-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 font-display text-xl font-bold text-ink">Carrito</h1>
          <span className="text-[12.5px] font-semibold text-sand-600">
            {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="text-sm text-sand-600">Cargando carrito…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="rounded-2xl bg-sand-100 p-6">
              <ShoppingBag className="h-12 w-12 text-sand-500" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Tu carrito está vacío
              </h2>
              <p className="mt-1 max-w-[220px] text-sm text-sand-600">
                Agrega productos para comenzar tu pedido
              </p>
            </div>
            <Link
              href="/productos"
              className="flex min-h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-bold text-white transition-colors hover:bg-brand-700"
            >
              Ir a productos
            </Link>
          </div>
        ) : (
          <>
            {/* Líneas del pedido */}
            <div className="divide-y divide-sand-200 border-t border-sand-200">
              {items.map((item, index) => (
                <CartItem
                  key={index}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            {/* El cupón se valida en el pago, donde vive su estado */}
            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-sand-100 px-3.5 py-3">
              <Ticket className="h-4 w-4 flex-none text-sand-600" strokeWidth={2} />
              <p className="text-[12.5px] font-medium text-sand-700">
                ¿Tienes un código de descuento? Lo aplicas en el paso de pago.
              </p>
            </div>

            {/* Resumen */}
            <div className="mt-4 rounded-2xl border border-sand-300 p-4">
              <div className="flex justify-between text-[13px] font-semibold text-sand-700">
                <span>Subtotal</span>
                <span className="text-ink">
                  {hasVES ? formatVES(baseVES) : formatUSD(baseUSD)}
                </span>
              </div>
              <div className="mt-2.5 flex justify-between text-[13px] font-semibold text-sand-700">
                <span>IVA</span>
                <span className="text-ink">
                  {hasVES && ivaVES !== null ? formatVES(ivaVES) : formatUSD(ivaUSD)}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-sand-200 pt-3">
                <span className="font-display text-[15px] font-bold text-ink">Total</span>
                <div className="text-right">
                  <p className="text-[19px] font-extrabold text-ink">
                    {hasVES ? formatVES(subtotalVES) : formatUSD(subtotal)}
                  </p>
                  {hasVES && (
                    <p className="text-[11.5px] font-medium text-sand-600">
                      ≈ {formatUSD(subtotal)}
                      {rate !== null && ` · BCV ${formatRate(rate)}`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleClearCart}
              className="mt-4 w-full rounded-lg py-2 text-center text-[12px] font-semibold text-danger-600 transition-colors hover:bg-danger-50"
            >
              Vaciar carrito
            </button>
          </>
        )}
      </div>

      {/* Acciones fijas al borde inferior: esta pantalla no lleva navegación inferior */}
      {!loading && items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-300 bg-white px-4 pb-[calc(1.375rem+env(safe-area-inset-bottom))] pt-3 md:static md:mx-auto md:mt-6 md:max-w-2xl md:border-0 md:px-4 md:pb-0">
          {/* El total viaja con el botón, no con el desglose.
              La tarjeta de Resumen vive en el flujo del scroll, así que a
              partir de dos o tres artículos se va de pantalla y dejaba el CTA
              pidiendo pagar sin decir cuánto. Acá el número está siempre a la
              vista, que es lo que hacía falta — no que el usuario scrollee.
              En md+ la barra deja de ser fija y el Resumen queda justo encima,
              así que repetirlo sobra. */}
          <div className="mb-2.5 flex items-baseline justify-between md:hidden">
            <span className="font-display text-[14px] font-bold text-ink">Total</span>
            <div className="text-right">
              <p className="text-[17px] font-extrabold leading-tight text-ink">
                {hasVES ? formatVES(subtotalVES) : formatUSD(subtotal)}
              </p>
              {hasVES && (
                <p className="text-[11px] font-medium text-sand-600">
                  ≈ {formatUSD(subtotal)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => router.push('/checkout')}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 py-3.5 text-[14.5px] font-bold text-white transition-colors hover:bg-brand-700"
          >
            Proceder al pago
          </button>
          <Link
            href="/productos"
            className="mt-2 block py-2 text-center text-[12.5px] font-bold text-brand-600"
          >
            Seguir comprando
          </Link>
        </div>
      )}
    </div>
  );
}
