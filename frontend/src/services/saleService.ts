import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';
import { Sale, SaleItem } from '../types';

export interface CreateSaleData {
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    discount?: number;
  }[];
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE';
  discount?: number;
  loyaltyPointsUsed?: number;
  notes?: string;
}

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  cashierId?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}

export interface SalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

export interface RefundData {
  reason: string;
  items: {
    saleItemId: string;
    quantity: number;
  }[];
  refundAmount: number;
}

export const saleService = {
  async getSales(filters: SaleFilters = {}): Promise<PaginatedResponse<Sale>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/sales?${queryString}` : '/sales';
    
    return apiClient.get<PaginatedResponse<Sale>>(endpoint);
  },

  async getSale(id: string): Promise<Sale> {
    const response = await apiClient.get<ApiResponse<Sale>>(`/sales/${id}`);
    return response.data;
  },

  async createSale(data: CreateSaleData): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>('/sales', data);
    return response.data;
  },

  async getReceiptData(id: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/sales/${id}/receipt`);
    return response.data;
  },

  async refundSale(id: string, data: RefundData): Promise<Sale> {
    const response = await apiClient.put<ApiResponse<Sale>>(`/sales/${id}/refund`, data);
    return response.data;
  },

  async getSalesAnalytics(startDate?: string, endDate?: string): Promise<SalesAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/sales/analytics?${queryString}` : '/sales/analytics';
    
    const response = await apiClient.get<ApiResponse<SalesAnalytics>>(endpoint);
    return response.data;
  }
};
