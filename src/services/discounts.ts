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
  async getAll(): Promise<Discount[]> {
    return apiClient.get<Discount[]>("/discounts");
  },

  // Obtener estadísticas (Admin)
  async getStats(): Promise<DiscountStats> {
    return apiClient.get<DiscountStats>("/discounts/stats");
  },

  // Obtener cupón por UUID (Admin)
  async getByUuid(uuid: string, ): Promise<Discount> {
    return apiClient.get<Discount>(`/discounts/${uuid}`);
  },

  // Validar cupón (Público)
  async validate(data: ValidateDiscountDto): Promise<ValidateDiscountResponse> {
    return apiClient.post<ValidateDiscountResponse>(
      "/discounts/validate",
      data
    );
  },

  // Crear cupón (Admin)
  async create(data: CreateDiscountDto, ): Promise<Discount> {
    return apiClient.post<Discount>("/discounts", data);
  },

  // Actualizar cupón (Admin)
  async update(
    uuid: string,
    data: UpdateDiscountDto,
    
  ): Promise<Discount> {
    return apiClient.patch<Discount>(`/discounts/${uuid}`, data);
  },

  // Eliminar cupón (Admin)
  async delete(uuid: string, ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/discounts/${uuid}`);
  },
};
