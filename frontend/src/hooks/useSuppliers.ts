import { useState, useEffect } from 'react';
import { supplierService } from '../services/supplierService';
import { Supplier } from '../types';
import toast from 'react-hot-toast';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getSuppliers();
      setSuppliers(Array.isArray(data) ? data : data.data || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch suppliers';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSupplier = await supplierService.createSupplier(supplierData);
      setSuppliers(prev => [newSupplier, ...prev]);
      toast.success('Supplier created successfully');
      return newSupplier;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create supplier';
      toast.error(message);
      throw err;
    }
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    try {
      const updatedSupplier = await supplierService.updateSupplier(id, supplierData);
      setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
      toast.success('Supplier updated successfully');
      return updatedSupplier;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update supplier';
      toast.error(message);
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await supplierService.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast.success('Supplier deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete supplier';
      toast.error(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers
  };
}
