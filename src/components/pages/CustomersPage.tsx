import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Download, Plus, Eye } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { Customer } from '../../types';
import { Pagination } from '../ui/Pagination';
import { CustomerFormModal } from './customers/CustomerFormModal';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export function CustomersPage() {
  const { user } = useAuth();
  const [allCustomers, setAllCustomers] = useState<Customer[]>(mockData.customers);
  
  const customers = useMemo(() => {
    if (!user?.vendorId) return [];
    return allCustomers.filter(c => c.vendorId === user.vendorId);
  }, [allCustomers, user]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const itemsPerPage = 10;

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (customer: Customer) => {
    if (editingCustomer) {
      setAllCustomers(allCustomers.map(c => (c.id === customer.id ? customer : c)));
      toast.success('Customer updated successfully');
    } else {
      const newCustomer = { ...customer, id: `cust-${Date.now()}`, vendorId: user!.vendorId! };
      setAllCustomers([newCustomer, ...allCustomers]);
      toast.success('Customer added successfully');
    }
    setIsModalOpen(false);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <div>
      <PageHeader title="Customers" subtitle={`Manage your ${customers.length} customers.`}>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddCustomer}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Visits</th>
                  <th className="px-6 py-3">Loyalty Points</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map(customer => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{customer.name}</td>
                    <td className="px-6 py-4">{customer.email}</td>
                    <td className="px-6 py-4">{customer.visitCount}</td>
                    <td className="px-6 py-4">{customer.loyaltyPoints}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
      {isModalOpen && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCustomer}
        />
      )}
    </div>
  );
}
