"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  productUuid: string;
  quantity?: number;
  className?: string;
  variant?: "default" | "icon";
  showSuccessMessage?: boolean;
  inventory?: number;
}

export default function AddToCartButton({
  productUuid,
  quantity = 1,
  className = "",
  variant = "default",
  showSuccessMessage = true,
  inventory,
}: AddToCartButtonProps) {
  const t = useTranslations('cart');
  const tErrors = useTranslations('errors');
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = inventory !== undefined && inventory <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    try {
      setLoading(true);
      await addToCart(productUuid, quantity);

      if (showSuccessMessage) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(tErrors('addToCartError'));
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleAddToCart}
        disabled={loading || justAdded || isOutOfStock}
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
          justAdded
            ? "bg-success-600 text-white"
            : "bg-brand-600 text-white hover:bg-brand-700"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={t('addToCart')}
        title={t('addToCart')}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : justAdded ? (
          <Check className="w-5 h-5" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || justAdded || isOutOfStock}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-colors ${
        justAdded
          ? "bg-success-600 text-white"
          : "bg-brand-600 text-white hover:bg-brand-700"
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{t('adding')}</span>
        </>
      ) : justAdded ? (
        <>
          <Check className="w-5 h-5" />
          <span>{t('added')}</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          <span>{t('addToCart')}</span>
        </>
      )}
    </button>
  );
}
