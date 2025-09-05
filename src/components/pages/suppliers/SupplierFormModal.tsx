import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Supplier } from '../../../types';

interface SupplierFormModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
}

export function SupplierFormModal({ supplier, onClose, onSave }: SupplierFormModalProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>(
    supplier || {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: 'Net 30',
      isActive: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Supplier);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={supplier ? 'Edit Supplier' : 'Add New Supplier'}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Supplier</Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Supplier Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" value={formData.address} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="paymentTerms">Payment Terms</Label>
          <select id="paymentTerms" name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            <option>Net 30</option>
            <option>Net 60</option>
            <option>On Delivery</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded" />
            <Label htmlFor="isActive">Supplier is Active</Label>
        </div>
      </form>
    </Modal>
  );
}
