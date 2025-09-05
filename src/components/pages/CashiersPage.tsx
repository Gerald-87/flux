import React, { useState } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { formatDate } from '../../lib/utils';
import { User } from '../../types';
import { CashierFormModal } from './cashiers/CashierFormModal';
import toast from 'react-hot-toast';

export function CashiersPage() {
    const [cashiers, setCashiers] = useState<User[]>(mockData.cashiers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCashier, setEditingCashier] = useState<User | null>(null);

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
            setCashiers(cashiers.filter(c => c.id !== cashierId));
            toast.success('Cashier deleted successfully');
        }
    };

    const handleSaveCashier = (cashier: User) => {
        if (editingCashier) {
            setCashiers(cashiers.map(c => c.id === cashier.id ? cashier : c));
            toast.success('Cashier updated successfully');
        } else {
            setCashiers([{ ...cashier, id: new Date().toISOString(), role: 'cashier', createdAt: new Date() }, ...cashiers]);
            toast.success('Cashier added successfully');
        }
        setIsModalOpen(false);
    };

  return (
    <div>
      <PageHeader title="Cashiers" subtitle="Manage your cashier accounts and permissions.">
        <Button onClick={handleAddCashier}>
          <Plus className="h-4 w-4 mr-2" />
          Add Cashier
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cashiers.map(cashier => (
          <Card key={cashier.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <img src={cashier.avatar} alt={cashier.name} className="w-16 h-16 rounded-full" />
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
