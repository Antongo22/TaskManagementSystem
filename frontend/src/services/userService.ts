import { apiClient } from './api';
import { UserDto } from '../types';

export const userService = {
  getUsers: async (): Promise<UserDto[]> => {
    const response = await apiClient.get<UserDto[]>('/api/users');
    return response.data;
  },
};

