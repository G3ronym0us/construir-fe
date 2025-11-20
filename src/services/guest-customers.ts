import { apiClient } from '@/lib/api';
import type { GuestCustomer, IdentificationType } from '@/types';

/**
 * Servicio para gestión de clientes guest
 */
export const guestCustomersService = {
  /**
   * Busca un cliente guest por su identificación
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
