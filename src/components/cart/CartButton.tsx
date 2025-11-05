"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import React, { useMemo } from "react";

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { cart, localCart, getTotalItems } = useCart();

  // Recalcular el total cada vez que cambie cart o localCart
  const totalItems = useMemo(
    () => getTotalItems(),
    [cart, localCart, getTotalItems]
  );

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
      aria-label="Carrito de compras"
    >
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
