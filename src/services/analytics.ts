import { apiClient } from '@/lib/api';

export interface PageViewDto {
  path: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
}

export interface PageViewStats {
  path: string;
  views: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
}

/**
 * Analytics service for custom backend tracking
 */
export const analyticsService = {
  /**
   * Track a page view in the backend
   */
  async trackPageView(data: PageViewDto): Promise<void> {
    try {
      await apiClient.post('/analytics/page-view', data);
    } catch (error) {
      console.error('Error tracking page view:', error);
      // Silently fail - analytics shouldn't block user experience
    }
  },

  /**
   * Get page view statistics
   */
  async getPageViews(
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<PageViewStats[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit.toString());

    const query = params.toString();
    return apiClient.get<PageViewStats[]>(
      `/analytics/page-views${query ? `?${query}` : ''}`
    );
  },
};
