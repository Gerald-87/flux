import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { User } from '../../types';
import { CashierFormModal } from './cashiers/CashierFormModal';
import toast from 'react-hot-toast';
import { Pagination } from '../ui/Pagination';
import { useAuth } from '../../hooks/useAuth';

export function CashiersPage() {
    const { user, users, addCashier, updateUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCashier, setEditingCashier] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const myCashiers = useMemo(() => {
        return users.filter(u => u.role === 'cashier' && u.vendorId === user?.id);
    }, [users, user]);

    const handleAddCashier = () => {
        setEditingCashier(null);
        setIsModalOpen(true);
    };

    const handleEditCashier = (cashier: User) => {
        setEditingCashier(cashier);
        setIsModalOpen(true);
    };

    const handleDeleteCashier = (cashierId: string) => {
        if (window.confirm('Are you sure you want to delete this cashier?')) {
            updateUser(cashierId, { isActive: false });
            toast.success('Cashier marked as inactive.');
        }
    };

    const handleSaveCashier = (cashier: User) => {
        if (editingCashier) {
            updateUser(cashier.id, cashier);
            toast.success('Cashier updated successfully');
        } else {
            addCashier(cashier);
            toast.success('Cashier added successfully');
        }
        setIsModalOpen(false);
    };

    const paginatedCashiers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return myCashiers.slice(startIndex, startIndex + itemsPerPage);
    }, [myCashiers, currentPage]);

    const totalPages = Math.ceil(myCashiers.length / itemsPerPage);

  return (
    <div>
      <PageHeader title="Cashiers" subtitle="Manage your cashier accounts and permissions.">
        <Button onClick={handleAddCashier}>
          <Plus className="h-4 w-4 mr-2" />
          Add Cashier
        </Button>
      </PageHeader>
      
      {myCashiers.length > 0 ? (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCashiers.map(cashier => (
                <Card key={cashier.id}>
                    <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <img src={cashier.avatar || `https://i.pravatar.cc/150?u=${cashier.id}`} alt={cashier.name} className="w-16 h-16 rounded-full" />
                            <div>
                                <h3 className="font-semibold text-lg">{cashier.name}</h3>
                                <p className="text-sm text-gray-500">{cashier.email}</p>
                                <div className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${cashier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {cashier.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditCashier(cashier)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteCashier(cashier.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Last login: {cashier.lastLogin ? formatDate(cashier.lastLogin) : 'N/A'}</p>
                    </CardContent>
                </Card>
                ))}
            </div>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-semibold text-gray-900">No Cashiers Found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first cashier account.</p>
            <div className="mt-6">
                <Button onClick={handleAddCashier}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Cashier
                </Button>
            </div>
        </div>
      )}

      {isModalOpen && (
        <CashierFormModal
            cashier={editingCashier}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveCashier}
        />
      )}
    </div>
  );
}
