import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Product } from '../../../types';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: '',
      sku: '',
      category: '',
      price: 0,
      costPrice: 0,
      stock: 0,
      minStock: 10,
      isActive: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | boolean = value;
    if (type === 'number') {
      processedValue = parseFloat(value);
    }
    if (e.target.localName === 'input' && (e.target as HTMLInputElement).type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Product);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Product</Button>
        </div>
      }
    >
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" value={formData.category} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="costPrice">Cost Price</Label>
          <Input id="costPrice" name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="minStock">Min Stock Level</Label>
          <Input id="minStock" name="minStock" type="number" value={formData.minStock} onChange={handleChange} />
        </div>
        <div className="md:col-span-2 flex items-center space-x-2">
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded" />
            <Label htmlFor="isActive">Product is Active</Label>
        </div>
      </form>
    </Modal>
  );
}
