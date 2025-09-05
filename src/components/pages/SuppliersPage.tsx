import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Plus } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { Supplier } from '../../types';
import { Pagination } from '../ui/Pagination';
import { SupplierFormModal } from './suppliers/SupplierFormModal';
import toast from 'react-hot-toast';

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockData.suppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const itemsPerPage = 10;

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = (supplier: Supplier) => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => (s.id === supplier.id ? supplier : s)));
      toast.success('Supplier updated successfully');
    } else {
      setSuppliers([{ ...supplier, id: `sup-${Date.now()}` }, ...suppliers]);
      toast.success('Supplier added successfully');
    }
    setIsModalOpen(false);
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSuppliers, currentPage]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  return (
    <div>
      <PageHeader title="Suppliers" subtitle={`Manage your ${suppliers.length} suppliers.`}>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <Button onClick={handleAddSupplier}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
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
                  <th className="px-6 py-3">Contact Person</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.map(supplier => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{supplier.name}</td>
                    <td className="px-6 py-4">{supplier.contactPerson}</td>
                    <td className="px-6 py-4">{supplier.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {supplier.isActive ? 'Active' : 'Inactive'}
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
        <SupplierFormModal
          supplier={editingSupplier}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSupplier}
        />
      )}
    </div>
  );
}
