import { useState, useEffect } from 'react';
import { purchaseService, PurchaseFilters, CreatePurchaseData } from '../services/purchaseService';
import { Purchase } from '../types';
import toast from 'react-hot-toast';

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async (filters?: PurchaseFilters) => {
    try {
      setLoading(true);
      const response = await purchaseService.getPurchases(filters);
      setPurchases(response.data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch purchases';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createPurchase = async (purchaseData: CreatePurchaseData) => {
    try {
      const newPurchase = await purchaseService.createPurchase(purchaseData);
      setPurchases(prev => [newPurchase, ...prev]);
      toast.success('Purchase order created successfully');
      return newPurchase;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create purchase order';
      toast.error(message);
      throw err;
    }
  };

  const updatePurchase = async (id: string, purchaseData: Partial<CreatePurchaseData>) => {
    try {
      const updatedPurchase = await purchaseService.updatePurchase(id, purchaseData);
      setPurchases(prev => prev.map(p => p.id === id ? updatedPurchase : p));
      toast.success('Purchase order updated successfully');
      return updatedPurchase;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update purchase order';
      toast.error(message);
      throw err;
    }
  };

  const completePurchase = async (id: string) => {
    try {
      const completedPurchase = await purchaseService.completePurchase(id);
      setPurchases(prev => prev.map(p => p.id === id ? completedPurchase : p));
      toast.success('Purchase order completed successfully');
      return completedPurchase;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete purchase order';
      toast.error(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return {
    purchases,
    loading,
    error,
    createPurchase,
    updatePurchase,
    completePurchase,
    refetch: fetchPurchases
  };
}
