import { apiClient } from './api';
import { Notification } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/api/notifications');
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.patch(`/api/notifications/${id}/read`);
  },
};

