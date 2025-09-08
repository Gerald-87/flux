import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';
import { Product, ProductVariant } from '../types';

export interface CreateProductData {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  price: number;
  costPrice: number;
  totalStock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  images?: string[];
  trackExpiry?: boolean;
  trackSerial?: boolean;
  tags?: string[];
  variants?: ProductVariant[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  lowStock?: boolean;
  location?: string;
  page?: number;
  limit?: number;
}

export interface StockUpdateData {
  quantity: number;
  location: string;
  reason?: string;
  notes?: string;
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return apiClient.get<PaginatedResponse<Product>>(endpoint);
  },

  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async updateStock(id: string, data: StockUpdateData): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}/stock`, data);
    return response.data;
  },

  async getLowStockProducts(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products/low-stock');
    return response.data;
  },

  async getProductsByLocation(location: string): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(`/products?location=${encodeURIComponent(location)}`);
    return response.data;
  }
};
