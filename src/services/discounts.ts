import { apiClient } from "@/lib/api";
import type {
  Discount,
  CreateDiscountDto,
  UpdateDiscountDto,
  ValidateDiscountDto,
  ValidateDiscountResponse,
  DiscountStats,
} from "@/types";

export const discountsService = {
  // Listar todos los cupones (Admin)
  async getAll(token: string): Promise<Discount[]> {
    return apiClient.get<Discount[]>("/discounts", token);
  },

  // Obtener estadísticas (Admin)
  async getStats(token: string): Promise<DiscountStats> {
    return apiClient.get<DiscountStats>("/discounts/stats", token);
  },

  // Obtener cupón por UUID (Admin)
  async getByUuid(uuid: string, token: string): Promise<Discount> {
    return apiClient.get<Discount>(`/discounts/${uuid}`, token);
  },

  // Validar cupón (Público)
  async validate(data: ValidateDiscountDto): Promise<ValidateDiscountResponse> {
    return apiClient.post<ValidateDiscountResponse>(
      "/discounts/validate",
      data
    );
  },

  // Crear cupón (Admin)
  async create(data: CreateDiscountDto, token: string): Promise<Discount> {
    return apiClient.post<Discount>("/discounts", data, token);
  },

  // Actualizar cupón (Admin)
  async update(
    uuid: string,
    data: UpdateDiscountDto,
    token: string
  ): Promise<Discount> {
    return apiClient.patch<Discount>(`/discounts/${uuid}`, data, token);
  },

  // Eliminar cupón (Admin)
  async delete(uuid: string, token: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/discounts/${uuid}`, token);
  },
};
