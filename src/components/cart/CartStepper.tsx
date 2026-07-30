"use client";

import { useState } from "react";
import { ShoppingCart, Loader2, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";

interface CartStepperProps {
  productUuid: string;
  inventory?: number;
  className?: string;
  compact?: boolean;
  /** Reemplaza el texto del botón inicial, p. ej. "Agregar · Bs. 1.480,00". */
  addLabel?: string;
}

export default function CartStepper({
  productUuid,
  inventory,
  className = "",
  compact = false,
  addLabel,
}: CartStepperProps) {
  const t = useTranslations("cart");
  const { addToCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);

  const currentQty = getItemQuantity(productUuid);
  const isAtStockLimit = inventory !== undefined && currentQty >= inventory;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await addToCart(productUuid, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAtStockLimit) return;
    try {
      setLoading(true);
      await addToCart(productUuid, 1);
    } catch (error) {
      console.error("Error updating cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      if (currentQty === 1) {
        await removeFromCart(productUuid);
      } else {
        await updateQuantity(productUuid, currentQty - 1);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    } finally {
      setLoading(false);
    }
  };

  if (currentQty > 0) {
    return (
      <div
        className={`flex min-h-11 items-center justify-between rounded-xl border-[1.5px] border-brand-600 bg-white ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDecrease}
          disabled={loading}
          className="flex h-11 w-11 items-center justify-center rounded-l-[10px] text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Disminuir cantidad"
        >
          <Minus className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <span className="min-w-[2ch] text-center text-[13px] font-extrabold text-ink">
          {loading ? <Loader2 className="inline h-4 w-4 animate-spin" /> : currentQty}
        </span>
        <button
          onClick={handleIncrease}
          disabled={loading || isAtStockLimit}
          className="flex h-11 w-11 items-center justify-center rounded-r-[10px] text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Aumentar cantidad"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 ${compact ? 'px-3 py-2.5 text-[12.5px]' : 'px-6 py-3.5 text-sm'} ${className}`}
    >
      {loading ? (
        <Loader2 className={compact ? 'h-4 w-4 animate-spin' : 'h-5 w-5 animate-spin'} />
      ) : (
        <ShoppingCart className={compact ? 'hidden h-4 w-4 sm:block' : 'h-5 w-5'} />
      )}
      <span>{addLabel ?? t("addToCart")}</span>
    </button>
  );
}
