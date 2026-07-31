'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productsService } from '@/services/products';
import { localCartService } from '@/services/cart';
import { parsePrice } from '@/lib/currency';
import type { CartItem, Product } from '@/types';

export interface EnrichedLocalCartItem {
  productUuid: string;
  quantity: number;
  product: Product;
}

/**
 * Un 404 es la única prueba de que el producto dejó de existir. Cualquier otro
 * fallo — red caída, 500, timeout — no dice nada sobre el catálogo y no debe
 * costarle el ítem al cliente.
 */
function isGone(error: unknown): boolean {
  return (error as { statusCode?: number } | null)?.statusCode === 404;
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

  // Se resuelve cada producto por su uuid. Antes se pedía la primera página del
  // catálogo (`limit: 100`) y se trataba como "ya no existe" todo lo que no
  // viniera en ella: con 1089 productos publicados, eso hacía que el 91% del
  // catálogo se auto-borrara del carrito del invitado apenas lo agregaba.
  useEffect(() => {
    if (isAuthenticated || localCart.items.length === 0) return;

    const loadedUuids = new Set(products.map((p) => p.uuid));
    const pendingUuids = localCart.items
      .map((item) => item.productUuid)
      .filter((uuid) => !loadedUuids.has(uuid));
    if (pendingUuids.length === 0) return;

    let cancelled = false;

    const loadLocalCartProducts = async () => {
      setLoadingProducts(true);

      const results = await Promise.allSettled(
        pendingUuids.map((uuid) => productsService.getByUuid(uuid)),
      );
      if (cancelled) return;

      const fetched: Product[] = [];
      const goneUuids: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          fetched.push(result.value);
        } else if (isGone(result.reason)) {
          goneUuids.push(pendingUuids[index]);
        } else {
          // Fallo transitorio: se reintenta cuando cambie el carrito.
          console.error('Error loading cart product:', result.reason);
        }
      });

      if (fetched.length > 0) {
        const fetchedUuids = new Set(fetched.map((p) => p.uuid));
        setProducts((prev) => [
          ...prev.filter((p) => !fetchedUuids.has(p.uuid)),
          ...fetched,
        ]);
      }

      if (goneUuids.length > 0) {
        const gone = new Set(goneUuids);
        localCartService.saveCart({
          items: localCart.items.filter((item) => !gone.has(item.productUuid)),
        });
        await refreshCart();
      }

      setLoadingProducts(false);
    };

    loadLocalCartProducts();

    return () => {
      cancelled = true;
    };
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
