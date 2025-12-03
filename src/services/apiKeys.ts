import { apiClient } from "@/lib/api";
import type { ApiKey, CreateApiKeyDto, CreateApiKeyResponse } from "@/types";

export const apiKeysService = {
  async getAll(): Promise<ApiKey[]> {
    return apiClient.get<ApiKey[]>("/admin/api-keys");
  },

  async getByUuid(uuid: string): Promise<ApiKey> {
    return apiClient.get<ApiKey>(`/admin/api-keys/${uuid}`);
  },

  async create(data: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
    return apiClient.post<CreateApiKeyResponse>("/admin/api-keys", data);
  },

  async revoke(uuid: string): Promise<ApiKey> {
    return apiClient.post<ApiKey>(`/admin/api-keys/${uuid}/revoke`, {});
  },

  async delete(uuid: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/admin/api-keys/${uuid}`);
  },
};
