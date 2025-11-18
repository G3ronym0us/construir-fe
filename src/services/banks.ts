import type { Bank } from '@/types';

/**
 * Servicio para gestión de bancos
 */
export const banksService = {
  /**
   * Obtiene todos los bancos activos
   */
  async getAllBanks(): Promise<Bank[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/banks`
    );

    if (!response.ok) {
      throw new Error('Error fetching banks');
    }

    return response.json();
  },
};
