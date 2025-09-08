import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Plus, Download } from 'lucide-react';
import { usePurchases } from '../../hooks/usePurchases';
import { useSuppliers } from '../../hooks/useSuppliers';
import { Purchase } from '../../types';
import { CreatePurchaseData } from '../../services/purchaseService';
import { formatCurrency, formatDate, exportToCsv } from '../../lib/utils';
import { Pagination } from '../ui/Pagination';
import toast from 'react-hot-toast';
import { PurchaseFormModal } from './purchases/PurchaseFormModal';

export function PurchasesPage() {
  const { purchases, loading, createPurchase } = usePurchases();
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p =>
      p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (suppliers.find(s => s.id === p.supplierId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchases, searchTerm, suppliers]);

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPurchases, currentPage]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  const handleExportCsv = () => {
    const dataToExport = filteredPurchases.map(p => ({
      purchaseNumber: p.purchaseNumber,
      supplier: suppliers.find(s => s.id === p.supplierId)?.name,
      date: formatDate(p.createdAt),
      total: formatCurrency(p.total),
      status: p.status,
      deliveryDate: p.deliveryDate ? formatDate(p.deliveryDate) : 'N/A'
    }));
    exportToCsv(dataToExport, 'purchases_export');
    toast.success('Purchases exported successfully');
  };

  const handleAddPurchase = async (purchaseData: CreatePurchaseData) => {
    try {
      await createPurchase(purchaseData);
      setIsModalOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div>
      <PageHeader title="Purchases" subtitle="Create and manage purchase orders from suppliers.">
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handleExportCsv}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </PageHeader>

      <Card>
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>
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
                  <th className="px-6 py-3">Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading purchases...
                    </td>
                  </tr>
                ) : paginatedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  paginatedPurchases.map(purchase => (
                    <tr key={purchase.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{purchase.purchaseNumber}</td>
                      <td className="px-6 py-4">{suppliers.find(s => s.id === purchase.supplierId)?.name}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(purchase.createdAt)}</td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(purchase.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          purchase.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          purchase.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {purchase.deliveryDate ? formatDate(purchase.deliveryDate) : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
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
        <PurchaseFormModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddPurchase}
        />
      )}
    </div>
  );
}
