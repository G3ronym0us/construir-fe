'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import CartStepper from '../cart/CartStepper';
import { formatVES, formatUSD } from '@/lib/currency';
import type { Product } from '@/types';

interface ProductCardContentProps {
  product: Product;
  variant: 'default' | 'compact';
  classes: {
    padding: string;
    nameSize: string;
    priceSize: string;
    categorySize: string;
    minHeight: string;
    spacingY: string;
  };
  showSku: boolean;
  showDescription: boolean;
  showStock: boolean;
  showAddToCart: boolean;
  priceUSD: number;
  priceVES: number | null;
  isOutOfStock: boolean;
}

export default function ProductCardContent({
  product,
  variant,
  classes,
  showSku,
  showDescription,
  showStock,
  showAddToCart,
  priceUSD,
  priceVES,
  isOutOfStock,
}: ProductCardContentProps) {
  const tCart = useTranslations('cart');
  const isCompact = variant === 'compact';

  return (
    <div className={`flex flex-1 flex-col ${classes.padding} ${classes.spacingY}`}>
      {/* Categoría: etiqueta corta en mayúsculas */}
      {product.categories && product.categories.length > 0 && (
        <div className={`${classes.categorySize} font-bold uppercase tracking-[0.08em] text-sand-600`}>
          <span className="block truncate">{product.categories[0]?.name}</span>
        </div>
      )}

      {/* Nombre del producto: dos líneas de alto fijo para alinear la rejilla.
          El enlace se estira sobre toda la tarjeta con `after:inset-0`, así que
          es un <a> de verdad -- navega antes de que hidrate, se abre en pestaña
          nueva y se alcanza con el teclado -- y el nombre le sirve de etiqueta
          accesible sin necesidad de aria-label. */}
      <h3
        className={`${classes.nameSize} ${classes.minHeight} line-clamp-2 leading-[1.3] text-ink transition-colors group-hover:text-brand-600`}
      >
        <Link
          href={`/productos/${product.uuid}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {product.customName ?? product.name}
        </Link>
      </h3>

      {showSku && !isCompact && (
        <p className="text-xs text-sand-600">{tCart('sku')}: {product.sku}</p>
      )}

      {showDescription && !isCompact && product.shortDescription && (
        <p className="hidden text-sm text-sand-700 line-clamp-2 sm:block">
          {product.shortDescription}
        </p>
      )}

      {/* Precio dual: Bs. protagonista, USD de referencia */}
      <div className="mt-auto pt-1">
        {priceVES ? (
          <>
            <p className={`${classes.priceSize} font-extrabold leading-tight ${isOutOfStock ? 'text-sand-600' : 'text-ink'}`}>
              {formatVES(priceVES)}
            </p>
            <p className="text-[11px] font-medium text-sand-600">
              {formatUSD(priceUSD)} · IVA incl.
            </p>
          </>
        ) : (
          <p className={`${classes.priceSize} font-extrabold leading-tight ${isOutOfStock ? 'text-sand-600' : 'text-ink'}`}>
            {formatUSD(priceUSD)}
          </p>
        )}
      </div>

      {/* Stock disponible */}
      {showStock && !isCompact && !isOutOfStock && (
        <p
          className={`text-xs font-semibold ${
            product.inventory <= 5 ? 'text-accent-700' : 'text-success-600'
          }`}
        >
          {product.inventory} {tCart('stock')}
        </p>
      )}

      {/* Acción: stepper cuando hay stock, aviso cuando no */}
      {showAddToCart && product.published && !isOutOfStock && (
        <CartStepper
          productUuid={product.uuid}
          inventory={product.inventory}
          className="relative z-10 mt-1 w-full"
          compact={true}
          addLabel={tCart('add')}
        />
      )}

      {showAddToCart && isOutOfStock && (
        <button
          disabled
          className="relative z-10 mt-1 w-full cursor-not-allowed rounded-xl border-[1.5px] border-sand-300 px-4 py-2.5 text-[12.5px] font-bold text-sand-600"
        >
          {tCart('notAvailable')}
        </button>
      )}
    </div>
  );
}
