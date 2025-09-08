import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';
import { User } from '../types';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'SUPERADMIN' | 'VENDOR' | 'CASHIER';
  terminalId?: string;
  assignedLocations?: string[];
  workSchedule?: {
    checkInTime: string;
    checkOutTime: string;
    workDays: number[];
    timezone?: string;
  };
}

export interface UpdateScheduleData {
  checkInTime: string;
  checkOutTime: string;
  workDays: number[];
  timezone: string;
  isActive: boolean;
}

export interface UserFilters {
  role?: 'VENDOR' | 'CASHIER';
  search?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return apiClient.get<PaginatedResponse<User>>(endpoint);
  },

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<CreateUserData>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  async updateSchedule(id: string, data: UpdateScheduleData): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}/schedule`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async getCashiers(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users/cashiers');
    return response.data;
  }
};
