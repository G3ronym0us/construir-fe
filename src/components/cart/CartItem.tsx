"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, X, Package } from "lucide-react";
import type { CartItem as CartItemType, Product } from "@/types";
import { formatVES, formatUSD, parsePrice } from "@/lib/currency";

interface CartItemProps {
  item:
    | CartItemType
    | { productUuid: string; quantity: number; product: Product };
  onUpdateQuantity: (productUuid: string, quantity: number) => Promise<void>;
  onRemove: (productUuid: string) => Promise<void>;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { product, quantity } = item;
  const priceUSD = parsePrice(product.priceWithIva);
  const priceVES = product.priceWithIvaVes
    ? parsePrice(product.priceWithIvaVes)
    : null;
  const subtotalUSD = priceUSD * quantity;
  const subtotalVES = priceVES ? priceVES * quantity : null;

  const primaryImage = product.images?.find((img) => img.isPrimary);
  const imageUrl = primaryImage?.url || "/placeholder-product.png";
  const showPlaceholder =
    !imageUrl || imageUrl === "/placeholder-product.png" || imgError;

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > product.inventory) return;

    try {
      setLoading(true);
      await onUpdateQuantity(product.uuid, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      await onRemove(product.uuid);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex gap-3 py-3.5 transition-opacity ${loading ? "opacity-50" : ""}`}>
      {/* Imagen */}
      <div className="relative flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-xl border border-sand-300 bg-sand-100">
        {showPlaceholder ? (
          <Package className="h-6 w-6 text-sand-500" strokeWidth={1.6} />
        ) : (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="64px"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Nombre, precio unitario y cantidad */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-[1.3] text-ink">
          {product.customName ?? product.name}
        </h3>
        <p className="text-[11.5px] font-medium text-sand-600">
          {priceVES ? `${formatVES(priceVES)} · ` : ""}
          {formatUSD(priceUSD)} c/u
        </p>

        <div className="flex w-[112px] items-center justify-between rounded-xl border-[1.5px] border-sand-300 bg-white">
          <button
            onClick={() => handleUpdateQuantity(quantity - 1)}
            disabled={loading || quantity <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-l-[10px] text-brand-600 transition-colors hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={2.6} />
          </button>
          <span className="min-w-[2ch] text-center text-[13.5px] font-extrabold tabular-nums text-ink">
            {quantity}
          </span>
          <button
            onClick={() => handleUpdateQuantity(quantity + 1)}
            disabled={loading || quantity >= product.inventory}
            className="flex h-10 w-10 items-center justify-center rounded-r-[10px] text-brand-600 transition-colors hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
          </button>
        </div>

        {quantity > product.inventory && (
          <p className="text-[11px] font-semibold text-accent-700">
            Solo {product.inventory} disponibles
          </p>
        )}
      </div>

      {/* Quitar y total de la línea */}
      <div className="flex flex-none flex-col items-end justify-between">
        <button
          onClick={handleRemove}
          disabled={loading}
          className="-mr-1.5 -mt-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-danger-600 transition-colors hover:bg-danger-50 disabled:opacity-30"
          aria-label="Eliminar del carrito"
        >
          <X className="h-4 w-4" strokeWidth={2.4} />
        </button>
        <div className="text-right">
          <p className="text-sm font-extrabold leading-none text-ink">
            {subtotalVES ? formatVES(subtotalVES) : formatUSD(subtotalUSD)}
          </p>
          {subtotalVES && (
            <p className="mt-1 text-[11px] font-medium text-sand-600">
              {formatUSD(subtotalUSD)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
