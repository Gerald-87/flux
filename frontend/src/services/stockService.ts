import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';
import { StockMovement, StockTake } from '../types';

export interface CreateStockMovementData {
  productId: string;
  type: 'ADJUSTMENT' | 'TRANSFER' | 'DAMAGE' | 'RETURN';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  notes?: string;
}

export interface CreateStockTakeData {
  name: string;
  description?: string;
  locations: string[];
  scheduledDate?: string;
}

export interface StockTakeItemData {
  productId: string;
  expectedQuantity: number;
  actualQuantity: number;
  location: string;
  notes?: string;
}

export interface StockFilters {
  productId?: string;
  type?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const stockService = {
  async getStockMovements(filters: StockFilters = {}): Promise<PaginatedResponse<StockMovement>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/stock/movements?${queryString}` : '/stock/movements';
    
    return apiClient.get<PaginatedResponse<StockMovement>>(endpoint);
  },

  async createStockMovement(data: CreateStockMovementData): Promise<StockMovement> {
    const response = await apiClient.post<ApiResponse<StockMovement>>('/stock/movements', data);
    return response.data;
  },

  async getStockTakes(filters: StockFilters = {}): Promise<PaginatedResponse<StockTake>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/stock/takes?${queryString}` : '/stock/takes';
    
    return apiClient.get<PaginatedResponse<StockTake>>(endpoint);
  },

  async getStockTake(id: string): Promise<StockTake> {
    const response = await apiClient.get<ApiResponse<StockTake>>(`/stock/takes/${id}`);
    return response.data;
  },

  async createStockTake(data: CreateStockTakeData): Promise<StockTake> {
    const response = await apiClient.post<ApiResponse<StockTake>>('/stock/takes', data);
    return response.data;
  },

  async updateStockTake(id: string, data: Partial<CreateStockTakeData>): Promise<StockTake> {
    const response = await apiClient.put<ApiResponse<StockTake>>(`/stock/takes/${id}`, data);
    return response.data;
  },

  async completeStockTake(id: string, items: StockTakeItemData[]): Promise<StockTake> {
    const response = await apiClient.put<ApiResponse<StockTake>>(`/stock/takes/${id}/complete`, { items });
    return response.data;
  }
};
