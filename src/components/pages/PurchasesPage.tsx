import React, { useState } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Plus } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { Purchase } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

export function PurchasesPage() {
  const [purchases] = useState<Purchase[]>(mockData.purchases);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPurchases = purchases.filter(p =>
    p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Purchases" subtitle="Manage purchase orders from suppliers.">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">PO Number</th>
                  <th className="px-6 py-3">Supplier</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(purchase => (
                  <tr key={purchase.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{purchase.purchaseNumber}</td>
                    <td className="px-6 py-4">{mockData.suppliers.find(s => s.id === purchase.supplierId)?.name}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(purchase.createdAt)}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(purchase.total)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize">
                        {purchase.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
