import React, { useMemo } from 'react';
import { TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Sale, Product } from '../../types';

interface TopProductsProps {
  sales: Sale[];
  products: Product[];
}

export function TopProducts({ sales, products }: TopProductsProps) {
  const topProducts = useMemo(() => {
    const productSales = new Map<string, { quantity: number; revenue: number }>();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const stats = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
        stats.quantity += item.quantity;
        stats.revenue += item.total;
        productSales.set(item.productId, stats);
      });
    });

    return Array.from(productSales.entries())
      .map(([productId, stats]) => {
        const product = products.find(p => p.id === productId);
        return {
          id: productId,
          name: product?.name || 'Unknown Product',
          ...stats,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales, products]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        <span className="text-sm text-gray-500">This week</span>
      </div>

      <div className="space-y-4 flex-grow">
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.quantity} sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No sales data available.</p>
          </div>
        )}
      </div>

      <button className="w-full mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
        View All Products
      </button>
    </div>
  );
}
