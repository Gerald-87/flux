import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';
import { Customer, Sale } from '../types';

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
}

export interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const customerService = {
  async getCustomers(filters: CustomerFilters = {}): Promise<PaginatedResponse<Customer>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/customers?${queryString}` : '/customers';
    
    return apiClient.get<PaginatedResponse<Customer>>(endpoint);
  },

  async getCustomer(id: string): Promise<Customer> {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data;
  },

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  async updateCustomer(id: string, data: Partial<CreateCustomerData>): Promise<Customer> {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  async getCustomerSales(id: string): Promise<Sale[]> {
    const response = await apiClient.get<ApiResponse<Sale[]>>(`/customers/${id}/sales`);
    return response.data;
  }
};
