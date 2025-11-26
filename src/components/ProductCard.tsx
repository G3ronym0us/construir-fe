"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import AddToCartButton from "./cart/AddToCartButton";
import type { Product } from "@/types";
import { formatVES, formatUSD, parsePrice } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary);
  const imageUrl = primaryImage?.url || "/placeholder-product.png";
  const priceUSD = parsePrice(product.price);
  const priceVES = product.priceVes ? parsePrice(product.priceVes) : null;

  const isLowStock = product.inventory > 0 && product.inventory <= 5;
  const isOutOfStock = product.inventory === 0;

  return (
    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen del producto */}
      <Link href={`/productos/${product.uuid}`} className="block relative aspect-square bg-gray-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.featured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
              Destacado
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
              Agotado
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
              Últimas unidades
            </span>
          )}
        </div>
      </Link>

      {/* Información del producto */}
      <div className="p-4 space-y-3">
        {/* Categorías */}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.categories.slice(0, 2).map((category) => (
              <Link
                key={category.uuid}
                href={`/productos?category=${category.slug}`}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Nombre y SKU */}
        <Link href={`/productos/${product.uuid}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
        </Link>

        {/* Descripción corta */}
        {product.shortDescription && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Precio y stock */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Precio VES destacado */}
            {priceVES && (
              <p className="text-2xl font-bold text-blue-600">{formatVES(priceVES)}</p>
            )}
            {/* Precio USD más pequeño */}
            <p className={`${priceVES ? 'text-sm text-gray-600' : 'text-2xl font-bold text-blue-600'}`}>
              {formatUSD(priceUSD)}
            </p>
            {/* Stock */}
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Package className="w-4 h-4" />
              <span>{product.inventory} en stock</span>
            </div>
          </div>
        </div>

        {/* Botón agregar al carrito */}
        {product.published && !isOutOfStock && (
          <AddToCartButton
            productId={product.id}
            quantity={1}
            className="w-full"
          />
        )}

        {isOutOfStock && (
          <button
            disabled
            className="w-full px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
          >
            Producto no disponible
          </button>
        )}
      </div>
    </div>
  );
}
