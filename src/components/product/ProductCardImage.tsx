'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ProductCardImageProps {
  imageUrl: string;
  productName: string;
  priority?: boolean;
  showBadges: boolean;
  featured: boolean;
  isOutOfStock: boolean;
  isLowStock: boolean;
  imageHeight: string;
}

function ProductImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-sand-200">
      <svg
        className="h-16 w-16 text-sand-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    </div>
  );
}

export default function ProductCardImage({
  imageUrl,
  productName,
  priority,
  showBadges,
  featured,
  isOutOfStock,
  isLowStock,
  imageHeight,
}: ProductCardImageProps) {
  const tProducts = useTranslations('products');
  const tCart = useTranslations('cart');
  const [imgError, setImgError] = useState(false);

  const showPlaceholder = !imageUrl || imageUrl === '/placeholder-product.png' || imgError;

  return (
    <div className={`relative flex ${imageHeight} items-center justify-center bg-sand-100 p-2 sm:p-3`}>
      {showPlaceholder ? (
        <ProductImagePlaceholder />
      ) : (
        <Image
          src={imageUrl}
          alt={productName}
          width={200}
          height={200}
          className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          priority={priority}
          onError={() => setImgError(true)}
        />
      )}

      {/* Distintivos: ámbar de seguridad para destacado y stock bajo */}
      {showBadges && (
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {featured && (
            <span className="rounded-lg bg-accent-500 px-2 py-1 text-[9.5px] font-extrabold uppercase tracking-wide text-ink">
              {tProducts('featured')}
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="rounded-lg bg-accent-100 px-2 py-1 text-[9.5px] font-extrabold uppercase tracking-wide text-accent-700">
              {tCart('lowStock')}
            </span>
          )}
        </div>
      )}

      {/* Sin stock: velo sobre la foto en vez de distintivo suelto */}
      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/65">
          <span className="text-[11px] font-bold text-sand-700">{tCart('outOfStock')}</span>
        </div>
      )}
    </div>
  );
}
