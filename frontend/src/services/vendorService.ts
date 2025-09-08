import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  businessType?: string;
  subscriptionPlan: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  subscriptionStatus: 'TRIALING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  subscriptionExpiry?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin?: string;
  }>;
  _count?: {
    users: number;
    products: number;
    sales: number;
    customers?: number;
  };
}

export interface SystemAnalytics {
  overview: {
    totalVendors: number;
    activeVendors: number;
    newVendors: number;
    totalUsers: number;
    totalSales: number;
    totalRevenue: number;
  };
  growth: Array<{
    date: string;
    count: number;
  }>;
}

export interface SupportTicket {
  id: string;
  vendorId: string;
  vendorName: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const vendorService = {
  async getCashiers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await apiClient.get<PaginatedResponse<any>>(
      `/vendors/cashiers?${searchParams.toString()}`
    );
    return response;
  },
  async getVendors(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Vendor>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);

    const response = await apiClient.get<PaginatedResponse<Vendor>>(
      `/vendors?${searchParams.toString()}`
    );
    return response;
  },

  async getVendor(id: string): Promise<Vendor> {
    const response = await apiClient.get<ApiResponse<Vendor>>(`/vendors/${id}`);
    return response.data;
  },

  async createVendor(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    businessType?: string;
    subscriptionPlan?: string;
  }): Promise<Vendor> {
    const response = await apiClient.post<ApiResponse<Vendor>>('/vendors', data);
    return response.data;
  },

  async updateVendorStatus(id: string, data: {
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    subscriptionExpiry?: string;
  }): Promise<Vendor> {
    const response = await apiClient.put<ApiResponse<Vendor>>(`/vendors/${id}/status`, data);
    return response.data;
  },

  async deleteVendor(id: string): Promise<void> {
    await apiClient.delete(`/vendors/${id}`);
  },

  async getSystemAnalytics(period?: string): Promise<SystemAnalytics> {
    const searchParams = new URLSearchParams();
    if (period) searchParams.append('period', period);

    const response = await apiClient.get<ApiResponse<SystemAnalytics>>(
      `/vendors/analytics?${searchParams.toString()}`
    );
    return response.data;
  },

  async getSupportTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
  }): Promise<PaginatedResponse<SupportTicket>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);

    const response = await apiClient.get<PaginatedResponse<SupportTicket>>(
      `/vendors/support-tickets?${searchParams.toString()}`
    );
    return response;
  },

  async createSupportTicket(data: {
    vendorId: string;
    subject: string;
    description: string;
    priority?: string;
  }): Promise<SupportTicket> {
    const response = await apiClient.post<ApiResponse<SupportTicket>>('/vendors/support-tickets', data);
    return response.data;
  },

  async updateSupportTicket(id: string, data: {
    subject?: string;
    description?: string;
    status?: string;
    priority?: string;
  }): Promise<SupportTicket> {
    const response = await apiClient.put<ApiResponse<SupportTicket>>(`/vendors/support-tickets/${id}`, data);
    return response.data;
  },

  async deleteSupportTicket(id: string): Promise<void> {
    await apiClient.delete(`/vendors/support-tickets/${id}`);
  },

  async getPricingPlans(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PricingPlan>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await apiClient.get<PaginatedResponse<PricingPlan>>(
      `/vendors/pricing-plans?${searchParams.toString()}`
    );
    return response;
  },

  async createPricingPlan(data: {
    name: string;
    price: number;
    duration: number;
    features: string[];
    isActive?: boolean;
  }): Promise<PricingPlan> {
    const response = await apiClient.post<ApiResponse<PricingPlan>>('/vendors/pricing-plans', data);
    return response.data;
  },

  async updatePricingPlan(id: string, data: {
    name?: string;
    price?: number;
    duration?: number;
    features?: string[];
    isActive?: boolean;
  }): Promise<PricingPlan> {
    const response = await apiClient.put<ApiResponse<PricingPlan>>(`/vendors/pricing-plans/${id}`, data);
    return response.data;
  },

  async deletePricingPlan(id: string): Promise<void> {
    await apiClient.delete(`/vendors/pricing-plans/${id}`);
  }
};
