import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';
import { Purchase, PurchaseItem } from '../types';

export interface CreatePurchaseData {
  supplierId: string;
  items: {
    productId: string;
    name: string;
    sku: string;
    costPrice: number;
    quantity: number;
  }[];
  deliveryDate?: string;
  notes?: string;
}

export interface PurchaseFilters {
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const purchaseService = {
  async getPurchases(filters: PurchaseFilters = {}): Promise<PaginatedResponse<Purchase>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/purchases?${queryString}` : '/purchases';
    
    return apiClient.get<PaginatedResponse<Purchase>>(endpoint);
  },

  async getPurchase(id: string): Promise<Purchase> {
    const response = await apiClient.get<ApiResponse<Purchase>>(`/purchases/${id}`);
    return response.data;
  },

  async createPurchase(data: CreatePurchaseData): Promise<Purchase> {
    const response = await apiClient.post<ApiResponse<Purchase>>('/purchases', data);
    return response.data;
  },

  async updatePurchase(id: string, data: Partial<CreatePurchaseData>): Promise<Purchase> {
    const response = await apiClient.put<ApiResponse<Purchase>>(`/purchases/${id}`, data);
    return response.data;
  },

  async completePurchase(id: string): Promise<Purchase> {
    const response = await apiClient.put<ApiResponse<Purchase>>(`/purchases/${id}/complete`);
    return response.data;
  },

  async deletePurchase(id: string): Promise<void> {
    await apiClient.delete(`/purchases/${id}`);
  }
};
