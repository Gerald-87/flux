import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const topProducts = [
  { id: 1, name: 'iPhone 13 Pro', sales: 45, revenue: 44550, trend: 12 },
  { id: 2, name: 'Samsung Galaxy S21', sales: 32, revenue: 25600, trend: 8 },
  { id: 3, name: 'AirPods Pro', sales: 67, revenue: 16750, trend: 15 },
  { id: 4, name: 'MacBook Air', sales: 18, revenue: 17820, trend: -3 },
  { id: 5, name: 'iPad Pro', sales: 28, revenue: 22400, trend: 6 }
];

export function TopProducts() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        <span className="text-sm text-gray-500">This week</span>
      </div>

      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={product.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">{index + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sales} sold</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(product.revenue)}
              </p>
              <div className="flex items-center">
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  product.trend > 0 ? 'text-green-500' : 'text-red-500'
                }`} />
                <span className={`text-xs ${
                  product.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.trend > 0 ? '+' : ''}{product.trend}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
        View All Products
      </button>
    </div>
  );
}
