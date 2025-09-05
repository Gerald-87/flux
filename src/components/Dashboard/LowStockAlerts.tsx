import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { Product } from '../../types';

interface LowStockAlertsProps {
  products: Product[];
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
  const lowStockItems = products
    .filter(p => p.stock < p.minStock && p.isActive)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
          Low Stock Alerts
        </h3>
        <span className="text-sm text-gray-500">{lowStockItems.length} items</span>
      </div>

      <div className="space-y-3 flex-grow">
        {lowStockItems.length > 0 ? (
          lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <Package className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-orange-600">
                  {item.stock} left
                </p>
                <p className="text-xs text-gray-500">Min: {item.minStock}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No low stock items.</p>
          </div>
        )}
      </div>

      <button className="w-full mt-4 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors">
        View All Low Stock Items
      </button>
    </div>
  );
}
