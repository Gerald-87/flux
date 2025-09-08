import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Plus } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';
import { Supplier } from '../../types';
import { Pagination } from '../ui/Pagination';
import { SupplierFormModal } from './suppliers/SupplierFormModal';

export function SuppliersPage() {
  const { suppliers, loading, createSupplier, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  const handleAddSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createSupplier(supplierData);
      setIsModalOpen(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await deleteSupplier(id);
    } catch (error) {
      // Error is handled by the hook
    }
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
          <Button onClick={() => setIsModalOpen(true)}>
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
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading suppliers...
                    </td>
                  </tr>
                ) : paginatedSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  paginatedSuppliers.map(supplier => (
                    <tr key={supplier.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{supplier.name}</td>
                      <td className="px-6 py-4">{supplier.contactPerson}</td>
                      <td className="px-6 py-4">{supplier.email}</td>
                      <td className="px-6 py-4">{supplier.phone}</td>
                      <td className="px-6 py-4">{supplier.address}</td>
                      <td className="px-6 py-4">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
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
        <SupplierFormModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddSupplier}
        />
      )}
    </div>
  );
}
