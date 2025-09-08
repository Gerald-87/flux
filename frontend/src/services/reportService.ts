import { apiClient, ApiResponse, PaginatedResponse } from '../lib/api';
import { Report } from '../types';

export interface GenerateReportData {
  type: 'SALES' | 'INVENTORY' | 'CUSTOMER' | 'PROFIT';
  name: string;
  startDate: string;
  endDate: string;
  filters?: {
    productIds?: string[];
    customerIds?: string[];
    categories?: string[];
    locations?: string[];
  };
}

export interface ReportFilters {
  type?: 'SALES' | 'INVENTORY' | 'CUSTOMER' | 'PROFIT';
  page?: number;
  limit?: number;
}

export const reportService = {
  async getReports(filters: ReportFilters = {}): Promise<PaginatedResponse<Report>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/reports?${queryString}` : '/reports';
    
    return apiClient.get<PaginatedResponse<Report>>(endpoint);
  },

  async getReport(id: string): Promise<Report> {
    const response = await apiClient.get<ApiResponse<Report>>(`/reports/${id}`);
    return response.data;
  },

  async generateReport(data: GenerateReportData): Promise<Report> {
    const response = await apiClient.post<ApiResponse<Report>>('/reports/generate', data);
    return response.data;
  },

  async deleteReport(id: string): Promise<void> {
    await apiClient.delete(`/reports/${id}`);
  }
};
