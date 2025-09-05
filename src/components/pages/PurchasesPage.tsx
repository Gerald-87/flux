import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Plus, Download } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { Purchase, Product } from '../../types';
import { formatCurrency, formatDate, exportToCsv } from '../../lib/utils';
import { Pagination } from '../ui/Pagination';
import toast from 'react-hot-toast';
import { PurchaseFormModal } from './purchases/PurchaseFormModal';

export function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>(mockData.purchases);
  const [products, setProducts] = useState<Product[]>(mockData.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p =>
      p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mockData.suppliers.find(s => s.id === p.supplierId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchases, searchTerm]);

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPurchases, currentPage]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  const handleExportCsv = () => {
    const dataToExport = filteredPurchases.map(p => ({
      purchaseNumber: p.purchaseNumber,
      supplier: mockData.suppliers.find(s => s.id === p.supplierId)?.name,
      date: formatDate(p.createdAt),
      total: formatCurrency(p.total),
      status: p.status,
    }));
    exportToCsv(dataToExport, 'purchases');
    toast.success('Purchases exported to CSV');
  };
  
  const handleSavePurchase = (purchase: Purchase, newProducts: Product[]) => {
    setPurchases([purchase, ...purchases]);
    if (newProducts.length > 0) {
        setProducts([...newProducts, ...products]);
    }
    toast.success('Purchase Order created successfully!');
    setIsModalOpen(false);
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
                </tr>
              </thead>
              <tbody>
                {paginatedPurchases.map(purchase => (
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
            onSave={handleSavePurchase}
        />
      )}
    </div>
  );
}
