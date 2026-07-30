'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getProducts } from '@/services/products';
import { localCartService } from '@/services/cart';
import { parsePrice } from '@/lib/currency';
import type { CartItem, Product } from '@/types';

export interface EnrichedLocalCartItem {
  productUuid: string;
  quantity: number;
  product: Product;
}

/**
 * Totales del carrito para invitados y usuarios autenticados.
 *
 * El carrito local sólo guarda uuid + cantidad, así que hay que resolver los
 * productos para poder mostrar precios. El carrito del servidor ya llega con sus
 * totales calculados.
 */
export function useCartTotals() {
  const { token } = useAuth();
  const { cart, localCart, loading: cartLoading, refreshCart, getTotalItems } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    if (isAuthenticated || localCart.items.length === 0) return;

    const cartUuids = localCart.items.map((item) => item.productUuid);
    const loadedUuids = new Set(products.map((p) => p.uuid));
    if (!cartUuids.some((uuid) => !loadedUuids.has(uuid))) return;

    const loadLocalCartProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await getProducts({ page: 1, limit: 100 });
        const matched = response.data.filter((p) => cartUuids.includes(p.uuid));
        setProducts(matched);

        // Purga los productos que ya no existen para no reventar el resumen
        const matchedUuids = new Set(matched.map((p) => p.uuid));
        const validItems = localCart.items.filter((item) => matchedUuids.has(item.productUuid));
        if (validItems.length !== localCart.items.length) {
          localCartService.saveCart({ items: validItems });
          await refreshCart();
        }
      } catch (error) {
        console.error('Error loading cart products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadLocalCartProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, localCart.items]);

  const enrichedLocalItems: EnrichedLocalCartItem[] = localCart.items
    .map((item) => {
      const product = products.find((p) => p.uuid === item.productUuid);
      if (!product) return null;
      return { productUuid: item.productUuid, quantity: item.quantity, product };
    })
    .filter((item): item is EnrichedLocalCartItem => item !== null);

  const items: (CartItem | EnrichedLocalCartItem)[] = isAuthenticated
    ? cart?.items ?? []
    : enrichedLocalItems;

  const subtotal = isAuthenticated
    ? cart?.subtotal ?? 0
    : enrichedLocalItems.reduce((acc, item) => acc + item.product.priceWithIva * item.quantity, 0);

  const subtotalVES = isAuthenticated
    ? cart?.subtotalVes ?? null
    : enrichedLocalItems.reduce(
        (acc, item) => acc + item.product.priceWithIvaVes * item.quantity,
        0
      );

  // Desglose de IVA a partir de la base sin impuesto que trae cada producto.
  // Cada producto puede tener su propia alícuota, así que se suma línea a línea.
  const lines = items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
  }));

  const baseUSD = lines.reduce(
    (acc, line) => acc + parsePrice(line.product.price) * line.quantity,
    0
  );
  const baseVES = lines.reduce(
    (acc, line) => acc + parsePrice(line.product.priceVes ?? 0) * line.quantity,
    0
  );
  const ivaUSD = subtotal - baseUSD;
  const ivaVES = subtotalVES !== null ? subtotalVES - baseVES : null;

  return {
    items,
    totalItems: getTotalItems(),
    subtotal,
    subtotalVES,
    baseUSD,
    baseVES,
    ivaUSD,
    ivaVES,
    loading: cartLoading || loadingProducts,
    isAuthenticated,
  };
}
