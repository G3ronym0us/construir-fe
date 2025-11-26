import { apiClient } from '@/lib/api';
import type { ExchangeRate } from '@/types';

class ExchangeRateService {
  private cachedRate: ExchangeRate | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en millisegundos

  /**
   * Obtiene el tipo de cambio actual desde el backend
   * Incluye caché de 5 minutos para reducir llamadas al servidor
   */
  async getCurrentRate(): Promise<ExchangeRate> {
    const now = Date.now();

    // Retornar caché si está vigente
    if (this.cachedRate && (now - this.cacheTimestamp < this.CACHE_DURATION)) {
      return this.cachedRate;
    }

    try {
      const rate = await apiClient.get<ExchangeRate>('/exchange-rates/current');
      this.cachedRate = rate;
      this.cacheTimestamp = now;
      return rate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);

      // Si hay caché antiguo, usarlo como fallback
      if (this.cachedRate) {
        console.warn('Using cached exchange rate as fallback');
        return this.cachedRate;
      }

      throw error;
    }
  }

  /**
   * Forzar actualización del caché (útil después de sincronización manual)
   */
  clearCache(): void {
    this.cachedRate = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Convertir monto de USD a VES
   */
  async convertUsdToVes(amountUsd: number): Promise<number> {
    const rate = await this.getCurrentRate();
    return amountUsd * rate.rate;
  }

  /**
   * Convertir monto de VES a USD
   */
  async convertVesToUsd(amountVes: number): Promise<number> {
    const rate = await this.getCurrentRate();
    return amountVes / rate.rate;
  }
}

export const exchangeRateService = new ExchangeRateService();
