import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Download, Eye } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Sale } from '../../types';

export function SalesPage() {
  const [sales] = useState<Sale[]>(mockData.sales);
  const [searchTerm, setSearchTerm] = useState('');
  const [cashierFilter, setCashierFilter] = useState('all');
  const [terminalFilter, setTerminalFilter] = useState('all');

  const cashiers = useMemo(() => [...new Set(mockData.sales.map(s => s.cashierId))], []);
  const terminals = useMemo(() => [...new Set(mockData.sales.map(s => s.terminalId))], []);

  const filteredSales = sales.filter(sale => {
    const customerName = mockData.customers.find(c => c.id === sale.customerId)?.name || '';
    const searchMatch = sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const cashierMatch = cashierFilter === 'all' || sale.cashierId === cashierFilter;
    const terminalMatch = terminalFilter === 'all' || sale.terminalId === terminalFilter;
    return searchMatch && cashierMatch && terminalMatch;
  });

  return (
    <div>
      <PageHeader title="Sales" subtitle={`Manage and review all ${sales.length} sales transactions.`}>
        <div className="flex items-center space-x-2">
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </PageHeader>

      <Card>
        <div className="p-4 border-b flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative flex-grow w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                type="text"
                placeholder="Search by receipt or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
            </div>
            <select value={cashierFilter} onChange={(e) => setCashierFilter(e.target.value)} className="w-full md:w-auto border rounded-lg px-4 py-2">
                <option value="all">All Cashiers</option>
                {cashiers.map(id => (
                    <option key={id} value={id}>{mockData.cashiers.find(c => c.id === id)?.name || id}</option>
                ))}
            </select>
            <select value={terminalFilter} onChange={(e) => setTerminalFilter(e.target.value)} className="w-full md:w-auto border rounded-lg px-4 py-2">
                <option value="all">All Terminals</option>
                {terminals.map(id => (
                    <option key={id} value={id}>{id}</option>
                ))}
            </select>
        </div>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Receipt</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Cashier</th>
                  <th className="px-6 py-3">Terminal</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{sale.receiptNumber}</td>
                    <td className="px-6 py-4">{mockData.customers.find(c => c.id === sale.customerId)?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(sale.createdAt)}</td>
                    <td className="px-6 py-4">{mockData.cashiers.find(c => c.id === sale.cashierId)?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{sale.terminalId}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(sale.total)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
