import { apiClient } from '@/lib/api';
import type {
  Order,
  OrderSummary,
  CreateOrderDto,
  UpdateOrderStatusDto,
} from '@/types';

/**
 * Servicio para gestión de órdenes
 */
export const ordersService = {
  /**
   * Crea una nueva orden desde el carrito del usuario
   */
  async createOrder(data: CreateOrderDto): Promise<Order> {
    return apiClient.post<Order>('/orders', data);
  },

  /**
   * Sube el comprobante de pago para una orden
   */
  async uploadReceipt(orderUuid: string, receipt: File): Promise<Order> {
    const formData = new FormData();
    formData.append('receipt', receipt);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderUuid}/receipt`,
      {
        method: 'POST',
        body: formData,
        headers,
      }
    );

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message);
      } catch (e) {
        throw new Error('Error uploading receipt');
      }
    }

    return response.json();
  },

  /**
   * Obtiene todas las órdenes del usuario autenticado
   */
  async getMyOrders(): Promise<OrderSummary[]> {
    return apiClient.get<OrderSummary[]>('/orders');
  },

  /**
   * Obtiene los detalles de una orden específica
   */
  async getOrderById(id: number): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  /**
   * Rastrea una orden por su número (público, sin autenticación)
   */
  async trackOrder(orderNumber: string): Promise<Order> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/track/${orderNumber}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Order not found');
    }

    return response.json();
  },

  /**
   * Actualiza el estado de una orden (Solo Admin)
   */
  async updateOrderStatus(
    uuid: string,
    data: UpdateOrderStatusDto
  ): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${uuid}/status`, data);
  },

  /**
   * Cancela una orden y restaura el inventario
   */
  async cancelOrder(id: number): Promise<Order> {
    return apiClient.delete<Order>(`/orders/${id}`);
  },

  // ============================================
  // Admin Endpoints
  // ============================================

  /**
   * Obtiene estadísticas del dashboard (Solo Admin)
   */
  async getAdminStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
    todayOrders: number;
    monthOrders: number;
    ordersByStatus: Record<string, number>;
  }> {
    return apiClient.get('/orders/admin/stats');
  },

  /**
   * Filtra órdenes con múltiples opciones (Solo Admin)
   */
  async filterOrders(filters: {
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: OrderSummary[]; total: number }> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    return apiClient.get(`/orders/admin/filter?${params.toString()}`);
  },

  /**
   * Exporta órdenes a CSV (Solo Admin)
   */
  async exportToCSV(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/admin/export/csv?${params.toString()}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Error exporting orders');
    }

    return response.blob();
  },
};
