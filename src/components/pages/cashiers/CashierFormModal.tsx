import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { User } from '../../../types';

interface CashierFormModalProps {
  cashier: User | null;
  onClose: () => void;
  onSave: (cashier: User) => void;
}

export function CashierFormModal({ cashier, onClose, onSave }: CashierFormModalProps) {
  const [formData, setFormData] = useState<Partial<User>>(
    cashier || {
      name: '',
      email: '',
      isActive: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as User);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={cashier ? 'Edit Cashier' : 'Add New Cashier'}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Cashier</Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder={cashier ? 'Leave blank to keep unchanged' : ''} />
        </div>
        <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded" />
            <Label htmlFor="isActive">Cashier is Active</Label>
        </div>
      </form>
    </Modal>
  );
}
