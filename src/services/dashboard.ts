import { apiClient } from '@/lib/api';

export interface MonthlyMetric {
  month: string;
  total: number;
  totalVes: number;
  count: number;
  percentageChange: number;
  percentageChangeVes: number;
  percentageChangeCount: number;
}

export interface DashboardStats {
  currentMonth: MonthlyMetric;
  previousMonth: MonthlyMetric;
  totalRevenue: number;
  totalRevenueVes: number;
  totalOrders: number;
  averageOrderValue: number;
  averageOrderValueVes: number;
}

/**
 * Dashboard service for admin metrics and statistics
 */
export const dashboardService = {
  /**
   * Get dashboard statistics for admin panel
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/orders/admin/dashboard-stats');
  },
};
