import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';
import { Notification } from '../types';

export interface NotificationFilters {
  type?: 'LOW_STOCK' | 'SYSTEM' | 'PURCHASE' | 'SALE';
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export const notificationService = {
  async getNotifications(filters: NotificationFilters = {}): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    
    return apiClient.get<PaginatedResponse<Notification>>(endpoint);
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }
};
