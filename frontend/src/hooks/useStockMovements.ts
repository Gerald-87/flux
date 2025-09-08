import { useState, useEffect } from 'react';
import { stockService } from '../services/stockService';
import { StockMovement } from '../types';
import toast from 'react-hot-toast';

export function useStockMovements() {
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockMovements = async (filters?: { type?: string; productId?: string }) => {
    try {
      setLoading(true);
      const data = await stockService.getStockMovements(filters);
      setStockMovements(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stock movements';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const createStockMovement = async (movementData: Omit<StockMovement, 'id' | 'createdAt'>) => {
    try {
      const newMovement = await stockService.createStockMovement(movementData);
      setStockMovements(prev => [newMovement, ...prev]);
      toast.success('Stock movement recorded successfully');
      return newMovement;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record stock movement';
      toast.error(message);
      throw err;
    }
  };

  const createStockTake = async (stockTakeData: any) => {
    try {
      const newStockTake = await stockService.createStockTake(stockTakeData);
      toast.success('Stock take created successfully');
      return newStockTake;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create stock take';
      toast.error(message);
      throw err;
    }
  };

  const completeStockTake = async (id: string) => {
    try {
      const completedStockTake = await stockService.completeStockTake(id);
      toast.success('Stock take completed successfully');
      return completedStockTake;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete stock take';
      toast.error(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchStockMovements();
  }, []);

  return {
    stockMovements,
    loading,
    error,
    createStockMovement,
    createStockTake,
    completeStockTake,
    refetch: fetchStockMovements
  };
}
