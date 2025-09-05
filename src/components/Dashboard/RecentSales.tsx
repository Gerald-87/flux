import React from 'react';
import { Eye, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

const recentSales = [
  {
    id: 'RCP-1701234567-abc123',
    customer: 'John Doe',
    items: 3,
    total: 299.99,
    paymentMethod: 'Card',
    cashier: 'Alice Johnson',
    createdAt: new Date('2025-01-26T10:30:00')
  },
  {
    id: 'RCP-1701234566-def456',
    customer: 'Jane Smith',
    items: 1,
    total: 89.99,
    paymentMethod: 'Cash',
    cashier: 'Bob Wilson',
    createdAt: new Date('2025-01-26T10:15:00')
  },
  {
    id: 'RCP-1701234565-ghi789',
    customer: 'Mike Johnson',
    items: 5,
    total: 455.50,
    paymentMethod: 'Mobile',
    cashier: 'Alice Johnson',
    createdAt: new Date('2025-01-26T09:45:00')
  },
  {
    id: 'RCP-1701234564-jkl012',
    customer: 'Sarah Davis',
    items: 2,
    total: 129.98,
    paymentMethod: 'Card',
    cashier: 'Charlie Brown',
    createdAt: new Date('2025-01-26T09:30:00')
  }
];

const paymentMethodColors = {
  Card: 'bg-blue-100 text-blue-800',
  Cash: 'bg-green-100 text-green-800',
  Mobile: 'bg-purple-100 text-purple-800'
};

export function RecentSales() {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cashier
              </th>
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
                  <div className="text-sm font-medium text-gray-900">{sale.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sale.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sale.items}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(sale.total)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    paymentMethodColors[sale.paymentMethod as keyof typeof paymentMethodColors]
                  }`}>
                    {sale.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{sale.cashier}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(sale.createdAt)}
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
