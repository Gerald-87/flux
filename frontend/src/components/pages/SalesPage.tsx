import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Download, Eye, RotateCcw } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Sale } from '../../types';
import { Pagination } from '../ui/Pagination';
import { SaleReceiptModal } from './sales/SaleReceiptModal';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function SalesPage() {
  const { user } = useAuth();
  
  const sales = useMemo(() => {
    if (!user) return [];
    if (user.role === 'cashier') {
        return mockData.sales.filter(s => s.cashierId === user.id);
    }
    if (user.role === 'vendor') {
        return mockData.sales.filter(s => s.vendorId === user.id);
    }
    return [];
  }, [user]);

  const customers = useMemo(() => {
    if (!user) return [];
    const vendorId = user.role === 'vendor' ? user.id : user.vendorId;
    if (!vendorId) return [];
    return mockData.customers.filter(c => c.vendorId === vendorId);
  }, [user]);

  const cashiers = useMemo(() => {
    if (!user) return [];
    const vendorId = user.role === 'vendor' ? user.id : user.vendorId;
    if (!vendorId) return [];
    return mockData.cashiers.filter(c => c.vendorId === vendorId);
  }, [user]);

  const [searchTerm, setSearchTerm] = useState('');
  const [cashierFilter, setCashierFilter] = useState('all');
  const [terminalFilter, setTerminalFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const itemsPerPage = 10;

  const uniqueCashiers = useMemo(() => [...new Set(sales.map(s => s.cashierId))], [sales]);
  const terminals = useMemo(() => [...new Set(sales.map(s => s.terminalId))], [sales]);

  const handleRefund = (saleId: string) => {
    if (window.confirm('Are you sure you want to refund this transaction? This action is permanent.')) {
        // Here you would call an API to process the refund.
        // For now, we'll just show a toast.
        toast.success(`Sale ${saleId} has been refunded.`);
    }
  };

  const handleViewReceipt = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const customerName = customers.find(c => c.id === sale.customerId)?.name || '';
      const searchMatch = sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const cashierMatch = user?.role === 'cashier' || cashierFilter === 'all' || sale.cashierId === cashierFilter;
      const terminalMatch = terminalFilter === 'all' || sale.terminalId === terminalFilter;
      return searchMatch && cashierMatch && terminalMatch;
    });
  }, [sales, customers, searchTerm, cashierFilter, terminalFilter, user]);

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSales, currentPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  return (
    <div>
      <PageHeader title="Sales History" subtitle={`Reviewing ${sales.length} sales transactions.`}>
        <div className="flex items-center space-x-2">
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </PageHeader>

      <Card>
        <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                type="text"
                placeholder="Search by receipt or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm sm:text-base"
                />
            </div>
            {user?.role === 'vendor' && (
                <>
                    <select value={cashierFilter} onChange={(e) => setCashierFilter(e.target.value)} className="w-full sm:w-auto border rounded-lg px-3 py-2 text-sm">
                        <option value="all">All Cashiers</option>
                        {uniqueCashiers.map(id => (
                            <option key={id} value={id}>{cashiers.find(c => c.id === id)?.name || id}</option>
                        ))}
                    </select>
                    <select value={terminalFilter} onChange={(e) => setTerminalFilter(e.target.value)} className="w-full sm:w-auto border rounded-lg px-3 py-2 text-sm">
                        <option value="all">All Terminals</option>
                        {terminals.map(id => (
                            <option key={id} value={id}>{id}</option>
                        ))}
                    </select>
                </>
            )}
        </div>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-3 sm:px-6 py-3">Receipt</th>
                  <th className="px-3 sm:px-6 py-3 hidden sm:table-cell">Customer</th>
                  <th className="px-3 sm:px-6 py-3">Date</th>
                  {user?.role === 'vendor' && <th className="px-3 sm:px-6 py-3 hidden md:table-cell">Cashier</th>}
                  <th className="px-3 sm:px-6 py-3 hidden lg:table-cell">Terminal</th>
                  <th className="px-3 sm:px-6 py-3">Total</th>
                  <th className="px-3 sm:px-6 py-3 hidden sm:table-cell">Status</th>
                  <th className="px-3 sm:px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map(sale => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm">
                      <div className="truncate max-w-[80px] sm:max-w-none">{sale.receiptNumber}</div>
                      <div className="sm:hidden text-xs text-gray-500 mt-1">
                        {customers.find(c => c.id === sale.customerId)?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">{customers.find(c => c.id === sale.customerId)?.name || 'N/A'}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-500 text-xs sm:text-sm">
                      <div className="truncate">{formatDate(sale.createdAt)}</div>
                      <div className="sm:hidden text-xs mt-1">
                        <span className="px-1 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800 capitalize">
                          {sale.status}
                        </span>
                      </div>
                    </td>
                    {user?.role === 'vendor' && <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">{cashiers.find(c => c.id === sale.cashierId)?.name || 'N/A'}</td>}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">{sale.terminalId}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base">{formatCurrency(sale.total)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(sale)} title="View Receipt">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            {user?.role === 'vendor' && (
                                <Button variant="ghost" size="sm" className="text-orange-500" onClick={() => handleRefund(sale.id)} title="Refund Sale">
                                    <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                            )}
                        </div>
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
      
      {selectedSale && (
        <SaleReceiptModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}
