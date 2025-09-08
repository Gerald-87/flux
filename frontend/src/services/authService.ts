import { apiClient, setAuthToken, ApiResponse } from '../lib/api';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessType: string;
  phone?: string;
  address?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<any>('/auth/login', credentials);
    
    if (response.success && response.token && response.user) {
      setAuthToken(response.token);
      return {
        token: response.token,
        user: response.user
      };
    }
    
    throw new Error('Invalid response format from server');
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<any>('/auth/register', data);
    
    if (response.success && response.token && response.user) {
      setAuthToken(response.token);
      return {
        token: response.token,
        user: response.user
      };
    }
    
    throw new Error('Invalid response format from server');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  },

  logout(): void {
    setAuthToken(null);
  }
};
