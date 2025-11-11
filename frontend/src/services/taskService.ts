import { apiClient } from './api';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../types';

export const taskService = {
  getTasks: async (status?: TaskStatus): Promise<Task[]> => {
    const params = status !== undefined ? { status } : {};
    const response = await apiClient.get<Task[]>('/api/tasks', { params });
    return response.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await apiClient.get<Task>(`/api/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskDto): Promise<Task> => {
    const response = await apiClient.post<Task>('/api/tasks', data);
    return response.data;
  },

  updateTask: async (id: number, data: UpdateTaskDto): Promise<Task> => {
    const response = await apiClient.patch<Task>(`/api/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/${id}`);
  },
};

