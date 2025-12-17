import { apiClient } from "@/lib/api";
import type {
  ApiLog,
  ApiLogStats,
  ApiLogFilters,
  ApiLogCleanupResponse,
  PaginatedResponse,
} from "@/types";

export const apiLogsService = {
  /**
   * Get paginated list of API logs with optional filters
   */
  async getLogs(filters: ApiLogFilters = {}): Promise<PaginatedResponse<ApiLog>> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.isError !== undefined) params.append('isError', filters.isError.toString());
    if (filters.consumerKey) params.append('consumerKey', filters.consumerKey);
    if (filters.statusCode) params.append('statusCode', filters.statusCode.toString());
    if (filters.path) params.append('path', filters.path);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `/admin/api-logs?${queryString}` : '/admin/api-logs';

    return apiClient.get<PaginatedResponse<ApiLog>>(url);
  },

  /**
   * Get API logs statistics summary
   */
  async getStats(): Promise<ApiLogStats> {
    return apiClient.get<ApiLogStats>('/admin/api-logs/stats/summary');
  },

  /**
   * Get single log by UUID
   */
  async getLogByUuid(uuid: string): Promise<ApiLog> {
    return apiClient.get<ApiLog>(`/admin/api-logs/${uuid}`);
  },

  /**
   * Delete old logs (minimum 7 days)
   */
  async cleanupLogs(days: number): Promise<ApiLogCleanupResponse> {
    if (days < 7) {
      throw new Error('El período mínimo de limpieza es de 7 días');
    }
    return apiClient.delete<ApiLogCleanupResponse>(`/admin/api-logs/cleanup/${days}`);
  },
};
