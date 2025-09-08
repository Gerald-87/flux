import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';
import { Supplier } from '../types';

export interface CreateSupplierData {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface SupplierFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const supplierService = {
  async getSuppliers(filters: SupplierFilters = {}): Promise<PaginatedResponse<Supplier>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/suppliers?${queryString}` : '/suppliers';
    
    return apiClient.get<PaginatedResponse<Supplier>>(endpoint);
  },

  async getSupplier(id: string): Promise<Supplier> {
    const response = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return response.data;
  },

  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    const response = await apiClient.post<ApiResponse<Supplier>>('/suppliers', data);
    return response.data;
  },

  async updateSupplier(id: string, data: Partial<CreateSupplierData>): Promise<Supplier> {
    const response = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    return response.data;
  },

  async deleteSupplier(id: string): Promise<void> {
    await apiClient.delete(`/suppliers/${id}`);
  }
};
