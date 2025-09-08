import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { formatDate } from '../../lib/utils';
import { Pagination } from '../ui/Pagination';
import toast from 'react-hot-toast';
import { TransferFormModal } from './transfers/TransferFormModal';
import { StockMovement } from '../../types';

export function TransfersPage() {
    const [transfers, setTransfers] = useState(mockData.stockMovements.filter(m => m.type === 'transfer'));
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 10;

    const handleSaveTransfer = (transferData: any) => {
        const newTransfer: StockMovement = {
            id: `transfer-${Date.now()}`,
            vendorId: 'vendor1',
            productId: transferData.product.id,
            type: 'transfer',
            quantity: transferData.quantity,
            from: transferData.from,
            to: transferData.to,
            reference: 'Manual Transfer',
            createdAt: new Date(),
            createdBy: 'user1',
        };
        
        // Simulate stock update in mock data
        const productIndex = mockData.products.findIndex(p => p.id === transferData.product.id);
        if (productIndex !== -1) {
            mockData.products[productIndex].stockByLocation[transferData.from] -= transferData.quantity;
            mockData.products[productIndex].stockByLocation[transferData.to] = (mockData.products[productIndex].stockByLocation[transferData.to] || 0) + transferData.quantity;
        }

        setTransfers([newTransfer, ...transfers]);
        toast.success(`Transferred ${transferData.quantity} x ${transferData.product.name}`);
        setIsModalOpen(false);
    };

    const paginatedTransfers = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return transfers.slice(startIndex, startIndex + itemsPerPage);
    }, [transfers, currentPage]);

    const totalPages = Math.ceil(transfers.length / itemsPerPage);

  return (
    <div>
      <PageHeader title="Stock Transfers" subtitle="Move stock between locations and track history.">
        <Button onClick={() => setIsModalOpen(true)}>
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
                  <th className="px-6 py-3">From</th>
                  <th className="px-6 py-3">To</th>
                  <th className="px-6 py-3">Performed By</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransfers.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{mockData.products.find(p => p.id === t.productId)?.name}</td>
                    <td className="px-6 py-4">{formatDate(t.createdAt)}</td>
                    <td className="px-6 py-4">{t.quantity}</td>
                    <td className="px-6 py-4">{t.from || 'Main Inventory'}</td>
                    <td className="px-6 py-4">{t.to || 'N/A'}</td>
                    <td className="px-6 py-4">{mockData.cashiers.find(c => c.id === t.createdBy)?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
      {isModalOpen && (
        <TransferFormModal
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTransfer}
        />
      )}
    </div>
  );
}
