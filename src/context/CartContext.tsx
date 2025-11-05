"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { cartService, localCartService } from "@/services/cart";
import type { Cart, LocalCart, Product } from "@/types";

interface CartContextType {
  // Estado
  cart: Cart | null;
  localCart: LocalCart;
  loading: boolean;
  error: string | null;

  // Métodos
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, productId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number, productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;

  // Utilidades
  getTotalItems: () => number;
  getItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [localCart, setLocalCart] = useState<LocalCart>({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar carrito local al montar el componente
  useEffect(() => {
    // Siempre cargar el carrito local en el cliente al iniciar
    if (typeof window !== 'undefined') {
      const stored = localCartService.getCart();
      setLocalCart(stored);
    }
  }, []);

  // Cargar carrito del servidor cuando el usuario esté autenticado
  useEffect(() => {
    if (token && user) {
      loadServerCart();
    } else {
      setCart(null);
    }
  }, [token, user]);

  // Sincronizar carrito local con el servidor después del login
  const syncCartAfterLogin = useCallback(async () => {
    if (!token || !localCartService.hasItems()) return;

    try {
      setLoading(true);
      const syncedCart = await cartService.syncLocalCart();
      setCart(syncedCart);
      setLocalCart({ items: [] });
    } catch (err) {
      console.error("Error syncing cart after login:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Ejecutar sincronización cuando el usuario se loguee
  useEffect(() => {
    if (token && user && localCartService.hasItems()) {
      syncCartAfterLogin();
    }
  }, [token, user, syncCartAfterLogin]);

  /**
   * Carga el carrito desde el servidor
   */
  const loadServerCart = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const serverCart = await cartService.getCart();
      setCart(serverCart);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading cart";
      setError(message);
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agrega un producto al carrito
   */
  const addToCart = async (productId: number, quantity: number) => {
    try {
      setLoading(true);
      setError(null);

      if (token) {
        // Usuario autenticado: agregar al servidor
        const updatedCart = await cartService.addItem({ productId, quantity });
        setCart(updatedCart);
      } else {
        // Usuario no autenticado: agregar a localStorage
        const updatedLocalCart = localCartService.addItem(productId, quantity);
        setLocalCart(updatedLocalCart);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error adding item to cart";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza la cantidad de un producto
   */
  const updateQuantity = async (
    itemId: number,
    productId: number,
    quantity: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (token) {
        // Usuario autenticado
        const updatedCart = await cartService.updateItem(itemId, { quantity });
        setCart(updatedCart);
      } else {
        // Usuario no autenticado
        const updatedLocalCart = localCartService.updateItem(productId, quantity);
        setLocalCart(updatedLocalCart);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating quantity";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un producto del carrito
   */
  const removeFromCart = async (itemId: number, productId: number) => {
    try {
      setLoading(true);
      setError(null);

      if (token) {
        // Usuario autenticado
        const updatedCart = await cartService.removeItem(itemId);
        setCart(updatedCart);
      } else {
        // Usuario no autenticado
        const updatedLocalCart = localCartService.removeItem(productId);
        setLocalCart(updatedLocalCart);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error removing item";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vacía el carrito completamente
   */
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (token) {
        // Usuario autenticado
        const updatedCart = await cartService.clearCart();
        setCart(updatedCart);
      } else {
        // Usuario no autenticado
        localCartService.clearCart();
        setLocalCart({ items: [] });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error clearing cart";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recarga el carrito desde el servidor
   */
  const refreshCart = async () => {
    if (token) {
      await loadServerCart();
    } else {
      const stored = localCartService.getCart();
      setLocalCart(stored);
    }
  };

  /**
   * Obtiene el número total de items en el carrito
   */
  const getTotalItems = useCallback(() => {
    if (token && cart) {
      return cart.items.reduce((total, item) => total + item.quantity, 0);;
    }
    return localCart.items.reduce((total, item) => total + item.quantity, 0);
  }, [token, cart, localCart]);

  /**
   * Obtiene la cantidad de un producto específico en el carrito
   */
  const getItemQuantity = useCallback((productId: number): number => {
    if (token && cart) {
      const item = cart.items.find((item) => item.productId === productId);
      return item?.quantity || 0;
    }

    const item = localCart.items.find((item) => item.productId === productId);
    return item?.quantity || 0;
  }, [token, cart, localCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        localCart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        getTotalItems,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
