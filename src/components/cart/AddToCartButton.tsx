"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2, Minus, Plus } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  productUuid: string;
  quantity?: number;
  className?: string;
  variant?: "default" | "icon";
  showSuccessMessage?: boolean;
  showStepper?: boolean;
}

export default function AddToCartButton({
  productUuid,
  quantity = 1,
  className = "",
  variant = "default",
  showSuccessMessage = true,
  showStepper = false,
}: AddToCartButtonProps) {
  const t = useTranslations('cart');
  const tErrors = useTranslations('errors');
  const { addToCart, loading, cart, getItemQuantity, updateQuantity, removeFromCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const currentQty = getItemQuantity(productUuid);

  const getCartItemUuid = () =>
    cart?.items.find(i => i.product.uuid === productUuid)?.uuid ?? productUuid;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(productUuid, quantity);

      if (showSuccessMessage && !showStepper) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(tErrors('addToCartError'));
    }
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(productUuid, 1);
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const itemUuid = getCartItemUuid();
      if (currentQty === 1) {
        await removeFromCart(itemUuid, productUuid);
      } else {
        await updateQuantity(itemUuid, productUuid, currentQty - 1);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  if (showStepper && currentQty > 0) {
    return (
      <div
        className={`flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDecrease}
          disabled={loading}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Disminuir cantidad"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-semibold text-gray-800 dark:text-gray-200 min-w-[2ch] text-center">
          {currentQty}
        </span>
        <button
          onClick={handleIncrease}
          disabled={loading}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Aumentar cantidad"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleAddToCart}
        disabled={loading || justAdded}
        className={`p-2 rounded-lg transition-colors ${
          justAdded
            ? "bg-green-600 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700"
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
      disabled={loading || justAdded}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
        justAdded
          ? "bg-green-600 text-white"
          : "bg-blue-600 text-white hover:bg-blue-700"
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
