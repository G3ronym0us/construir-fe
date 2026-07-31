import { apiClient } from '@/lib/api';
import type { GuestCustomer, IdentificationType } from '@/types';

/**
 * Servicio para gestión de clientes guest
 */
export const guestCustomersService = {
  /**
   * Busca un cliente guest para autocompletar el checkout.
   *
   * Basta la identificación. El endpoint es público y está limitado a 5
   * consultas por minuto en el backend, así que conviene no dispararlo en cada
   * pulsación: el checkout sólo consulta al salir del campo y no repite el
   * mismo número dos veces.
   */
  async searchByIdentification(
    identificationType: IdentificationType,
    identificationNumber: string
  ): Promise<GuestCustomer | null> {
    const params = new URLSearchParams({
      identificationType,
      identificationNumber,
    });

    const response = await apiClient.get<GuestCustomer | null>(
      `/guest-customers/search?${params.toString()}`
    );

    return response || null;
  },
};
