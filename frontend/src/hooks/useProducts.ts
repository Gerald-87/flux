import { useState, useEffect } from 'react';
import { productService, ProductFilters } from '../services/productService';
import { Product } from '../types';
import toast from 'react-hot-toast';

export const useProducts = (filters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchProducts = async (newFilters?: ProductFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts({ ...filters, ...newFilters });
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: any) => {
    try {
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      toast.success('Product created successfully');
      return newProduct;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      const updatedProduct = await productService.updateProduct(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast.success('Product updated successfully');
      return updatedProduct;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
      throw err;
    }
  };

  const updateStock = async (id: string, stockData: any) => {
    try {
      const updatedProduct = await productService.updateStock(id, stockData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast.success('Stock updated successfully');
      return updatedProduct;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stock');
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refetch: () => fetchProducts()
  };
};
