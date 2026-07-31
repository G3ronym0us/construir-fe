import { apiClient } from '@/lib/api';
import type { StoreInfo } from '@/types';

/**
 * Datos de contacto de la tienda física.
 *
 * El endpoint es público (no lleva clave de API) y su fuente son las variables
 * STORE_* del backend. Se cachea en memoria porque no cambia dentro de una
 * sesión y lo piden tres sitios distintos: retiro en tienda, pie de página y
 * la ficha de la cuenta.
 */
let cached: Promise<StoreInfo> | null = null;

export const storeInfoService = {
  get(): Promise<StoreInfo> {
    cached ??= apiClient.get<StoreInfo>('/api/v1/store-info').catch((error) => {
      // No dejar en caché un fallo: el siguiente consumidor vuelve a intentarlo
      cached = null;
      throw error;
    });

    return cached;
  },
};
