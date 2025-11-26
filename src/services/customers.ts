import { apiClient } from '@/lib/api';
import type {
  CustomerListResponseDto,
  CustomerDetailResponseDto,
} from '@/types';

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'totalOrders' | 'totalSpent' | 'totalSpentVes' | 'firstOrderDate' | 'lastOrderDate' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Customer service for managing registered users and guest customers
 */
export const customersService = {
  /**
   * Get list of customers with pagination, search, and sorting
   */
  async getCustomers(params: GetCustomersParams = {}): Promise<CustomerListResponseDto> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const query = queryParams.toString();
    return apiClient.get<CustomerListResponseDto>(
      `/customers${query ? `?${query}` : ''}`
    );
  },

  /**
   * Get detailed information for a specific customer
   */
  async getCustomerDetail(id: string): Promise<CustomerDetailResponseDto> {
    return apiClient.get<CustomerDetailResponseDto>(`/customers/${id}`);
  },

  /**
   * Export customers to CSV
   */
  async exportCustomersCSV(): Promise<Blob> {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const response = await fetch(`${apiUrl}/customers/export/csv`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error downloading CSV');
    }

    return response.blob();
  },
};
