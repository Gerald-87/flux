import React, { useState, useMemo } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Product } from '../../../types';
import { mockData } from '../../../lib/mockData';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface TransferFormModalProps {
  onClose: () => void;
  onSave: (transferData: any) => void;
}

export function TransferFormModal({ onClose, onSave }: TransferFormModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [fromLocation] = useState('Main Inventory');
  const [toLocation, setToLocation] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const availableStock = selectedProduct ? selectedProduct.stockByLocation[fromLocation] || 0 : 0;

  const handleSubmit = () => {
    if (!selectedProduct) {
      toast.error('Please select a product to transfer.');
      return;
    }
    if (quantity <= 0) {
      toast.error('Quantity must be greater than zero.');
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Transfer quantity cannot exceed available stock (${availableStock}).`);
      return;
    }
    if (!toLocation) {
      toast.error('Please specify a destination.');
      return;
    }

    onSave({
      product: selectedProduct,
      quantity,
      from: fromLocation,
      to: toLocation,
    });
  };

  const searchedProducts = useMemo(() => {
    if (!productSearchTerm) return [];
    return mockData.products.filter(p =>
      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
    ).slice(0, 5);
  }, [productSearchTerm]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="New Stock Transfer"
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm Transfer</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Label>Product</Label>
          {selectedProduct ? (
            <div className="p-2 bg-gray-100 rounded-lg flex justify-between items-center mt-1">
              <span>{selectedProduct.name} (Stock: {availableStock})</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>Change</Button>
            </div>
          ) : (
            <>
              <Search className="absolute left-3 top-10 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or SKU..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pl-10 mt-1"
              />
              {searchedProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {searchedProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedProduct(p); setProductSearchTerm(''); }}
                      className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    >
                      <span>{p.name} ({p.sku})</span>
                      <Plus className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10) || 0)} min="1" max={availableStock} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" value={fromLocation} disabled />
          </div>
          <div>
            <Label htmlFor="to">To (Destination)</Label>
            <select id="to" value={toLocation} onChange={e => setToLocation(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                <option value="">Select Destination</option>
                {mockData.locations.filter(l => l !== fromLocation).map(l => (
                    <option key={l} value={l}>{l}</option>
                ))}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
