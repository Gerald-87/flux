import React from 'react';
import { Eye, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Sale } from '../../types';
import { mockData } from '../../lib/mockData';
import { useAuth } from '../../hooks/useAuth';

interface RecentSalesProps {
    sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  const { user } = useAuth();
  const cashiers = mockData.cashiers.filter(c => c.vendorId === user?.vendorId);
  const customers = mockData.customers.filter(c => c.vendorId === user?.vendorId);
  
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const paymentMethodColors: { [key: string]: string } = {
    card: 'bg-blue-100 text-blue-800',
    cash: 'bg-green-100 text-green-800',
    mobile: 'bg-purple-100 text-purple-800',
    loyalty: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              {user?.role === 'vendor' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cashier
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sale.receiptNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customers.find(c => c.id === sale.customerId)?.name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sale.items.length}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(sale.total)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                    paymentMethodColors[sale.paymentMethod]
                  }`}>
                    {sale.paymentMethod}
                  </span>
                </td>
                {user?.role === 'vendor' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                            {cashiers.find(c => c.id === sale.cashierId)?.name || 'N/A'}
                        </div>
                    </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(new Date(sale.createdAt))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-900 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <button className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
          View All Sales
        </button>
      </div>
    </div>
  );
}
