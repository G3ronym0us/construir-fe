import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/services/products', () => ({
  productsService: { getByUuid: vi.fn() },
}));

vi.mock('@/services/cart', () => ({
  localCartService: { saveCart: vi.fn() },
}));

vi.mock('@/context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('@/context/CartContext', () => ({ useCart: vi.fn() }));

import { useCartTotals } from '../useCartTotals';
import { productsService } from '@/services/products';
import { localCartService } from '@/services/cart';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

const SIDERURGICO_UUID = 'd12d530e-7568-4006-823d-4da2877bec33';

function makeProduct(uuid: string): Product {
  return {
    uuid,
    name: 'ANGULO H.NEGRO 50X50X4MM X6MT',
    sku: '10943',
    inventory: 30,
    price: '32.00',
    priceWithIva: 37.12,
    priceVes: '15398.97',
    priceWithIvaVes: 17862.81,
    published: true,
  } as unknown as Product;
}

const refreshCart = vi.fn();

function mockCart(items: { productUuid: string; quantity: number }[]) {
  vi.mocked(useAuth).mockReturnValue({ token: null } as ReturnType<typeof useAuth>);
  vi.mocked(useCart).mockReturnValue({
    cart: null,
    localCart: { items },
    loading: false,
    refreshCart,
    getTotalItems: () => items.reduce((acc, i) => acc + i.quantity, 0),
  } as unknown as ReturnType<typeof useCart>);
}

function notFound() {
  const error = new Error('Product not found') as Error & { statusCode?: number };
  error.statusCode = 404;
  return error;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCartTotals — resolución del carrito del invitado', () => {
  /**
   * Regresión: antes se pedía la primera página del catálogo (`limit: 100`) y se
   * purgaba todo lo que no viniera en ella. Con 1089 productos publicados, un
   * producto del puesto 101 en adelante se auto-borraba del carrito apenas se
   * agregaba — el 91% del catálogo era inagregable para un invitado.
   */
  it('resuelve por uuid un producto fuera de la primera página y no lo purga', async () => {
    mockCart([{ productUuid: SIDERURGICO_UUID, quantity: 1 }]);
    vi.mocked(productsService.getByUuid).mockResolvedValue(makeProduct(SIDERURGICO_UUID));

    const { result } = renderHook(() => useCartTotals());

    await waitFor(() => expect(result.current.items).toHaveLength(1));

    expect(productsService.getByUuid).toHaveBeenCalledWith(SIDERURGICO_UUID);
    expect(localCartService.saveCart).not.toHaveBeenCalled();
    expect(result.current.subtotal).toBe(37.12);
  });

  it('purga el ítem sólo cuando el producto responde 404', async () => {
    mockCart([{ productUuid: 'borrado', quantity: 1 }]);
    vi.mocked(productsService.getByUuid).mockRejectedValue(notFound());

    renderHook(() => useCartTotals());

    await waitFor(() =>
      expect(localCartService.saveCart).toHaveBeenCalledWith({ items: [] }),
    );
    expect(refreshCart).toHaveBeenCalled();
  });

  it('deja el carrito intacto si la petición falla por red', async () => {
    mockCart([{ productUuid: SIDERURGICO_UUID, quantity: 1 }]);
    vi.mocked(productsService.getByUuid).mockRejectedValue(new Error('Failed to fetch'));

    renderHook(() => useCartTotals());

    await waitFor(() => expect(productsService.getByUuid).toHaveBeenCalled());

    expect(localCartService.saveCart).not.toHaveBeenCalled();
    expect(refreshCart).not.toHaveBeenCalled();
  });

  it('conserva los ítems vivos y purga sólo el que ya no existe', async () => {
    mockCart([
      { productUuid: SIDERURGICO_UUID, quantity: 2 },
      { productUuid: 'borrado', quantity: 1 },
    ]);
    vi.mocked(productsService.getByUuid).mockImplementation(async (uuid: string) => {
      if (uuid === 'borrado') throw notFound();
      return makeProduct(uuid);
    });

    renderHook(() => useCartTotals());

    await waitFor(() =>
      expect(localCartService.saveCart).toHaveBeenCalledWith({
        items: [{ productUuid: SIDERURGICO_UUID, quantity: 2 }],
      }),
    );
  });
});
