'use client';

import { useCallback, useEffect, useState } from 'react';
import { storeInfoService } from '@/services/storeInfo';
import type { StoreInfo } from '@/types';

/**
 * Datos de contacto de la tienda, servidos por el backend desde las STORE_*.
 *
 * Devuelve `error` en vez de tragarse el fallo: quien muestra la dirección de
 * retiro necesita distinguir "sin datos" de "no cargó", porque esconder la
 * tarjeta deja al comprador sin saber dónde recoger su pedido.
 */
export function useStoreInfo() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);

    storeInfoService
      .get()
      .then((info) => {
        if (active) setStoreInfo(info);
      })
      .catch(() => {
        if (active) {
          setStoreInfo(null);
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  return { storeInfo, loading, error, reload: load };
}
