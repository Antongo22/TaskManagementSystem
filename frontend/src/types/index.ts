export enum TaskStatus {
  New = 0,
  InProgress = 1,
  Completed = 2
}

export interface User {
  id: number;
  username: string;
}

export interface UserDto {
  id: number;
  username: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt?: string;
  createdByUserId: number;
  createdByUsername: string;
  assignedToUserId?: number;
  assignedToUsername?: string;
}

export interface Notification {
  id: number;
  taskId: number;
  taskTitle: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  invitationCode: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  assignedToUserId?: number | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedToUserId?: number | null;
}

