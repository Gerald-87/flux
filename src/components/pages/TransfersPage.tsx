import React from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { formatDate } from '../../lib/utils';

export function TransfersPage() {
    const transfers = mockData.stockMovements.filter(m => m.type === 'transfer');
  return (
    <div>
      <PageHeader title="Stock Transfers" subtitle="Move stock between locations.">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center">
            <ArrowLeftRight className="h-5 w-5 mr-2" />
            Transfer History
          </h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{mockData.products.find(p => p.id === t.productId)?.name}</td>
                    <td className="px-6 py-4">{formatDate(t.createdAt)}</td>
                    <td className="px-6 py-4">{t.quantity}</td>
                    <td className="px-6 py-4">{t.reference}</td>
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
