import { useState, useEffect } from 'react';
import { saleService, SaleFilters } from '../services/saleService';
import { Sale } from '../types';
import toast from 'react-hot-toast';

export const useSales = (filters: SaleFilters = {}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchSales = async (newFilters?: SaleFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await saleService.getSales({ ...filters, ...newFilters });
      setSales(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: any) => {
    try {
      const newSale = await saleService.createSale(saleData);
      setSales(prev => [newSale, ...prev]);
      toast.success('Sale completed successfully');
      return newSale;
    } catch (err: any) {
      toast.error(err.message || 'Failed to process sale');
      throw err;
    }
  };

  const refundSale = async (id: string, refundData: any) => {
    try {
      const refundedSale = await saleService.refundSale(id, refundData);
      setSales(prev => prev.map(s => s.id === id ? refundedSale : s));
      toast.success('Sale refunded successfully');
      return refundedSale;
    } catch (err: any) {
      toast.error(err.message || 'Failed to process refund');
      throw err;
    }
  };

  const getSalesAnalytics = async (startDate?: string, endDate?: string) => {
    try {
      return await saleService.getSalesAnalytics(startDate, endDate);
    } catch (err: any) {
      toast.error('Failed to fetch sales analytics');
      throw err;
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    loading,
    error,
    pagination,
    fetchSales,
    createSale,
    refundSale,
    getSalesAnalytics,
    refetch: () => fetchSales()
  };
};
