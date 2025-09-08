import { useState, useEffect } from 'react';
import { customerService, CustomerFilters } from '../services/customerService';
import { Customer } from '../types';
import toast from 'react-hot-toast';

export const useCustomers = (filters: CustomerFilters = {}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchCustomers = async (newFilters?: CustomerFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getCustomers({ ...filters, ...newFilters });
      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: any) => {
    try {
      const newCustomer = await customerService.createCustomer(customerData);
      setCustomers(prev => [newCustomer, ...prev]);
      toast.success('Customer created successfully');
      return newCustomer;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer');
      throw err;
    }
  };

  const updateCustomer = async (id: string, updates: any) => {
    try {
      const updatedCustomer = await customerService.updateCustomer(id, updates);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      toast.success('Customer updated successfully');
      return updatedCustomer;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update customer');
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customerService.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success('Customer deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer');
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    pagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: () => fetchCustomers()
  };
};
