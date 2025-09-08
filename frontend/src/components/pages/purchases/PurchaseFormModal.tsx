import React, { useState, useMemo } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { PurchaseItem, Supplier, Product } from '../../../types';
import { CreatePurchaseData } from '../../../services/purchaseService';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useProducts } from '../../../hooks/useProducts';
import { Search, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { ProductFormModal } from '../products/ProductFormModal';

interface PurchaseFormModalProps {
  onClose: () => void;
  onSave: (purchaseData: CreatePurchaseData) => void;
}

export function PurchaseFormModal({ onClose, onSave }: PurchaseFormModalProps) {
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const [supplierId, setSupplierId] = useState<string>('');
  const [items, setItems] = useState<{productId: string; name: string; sku: string; costPrice: number; quantity: number;}[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleAddItem = (product: Product) => {
    if (items.some(item => item.productId === product.id)) {
      toast.error(`${product.name} is already in the purchase order.`);
      return;
    }
    const newItem = {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      costPrice: product.costPrice,
      quantity: 1,
    };
    setItems([...items, newItem]);
    setProductSearchTerm('');
  };

  const handleUpdateItem = (productId: string, field: 'quantity' | 'costPrice', value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) && value !== '') return;

    setItems(items.map(item => {
      if (item.productId === productId) {
        return { ...item, [field]: numericValue };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };
  
  const handleSaveNewProduct = (product: Product) => {
    // Product creation is handled by the ProductFormModal and useProducts hook
    setIsProductModalOpen(false);
    toast.success(`${product.name} created successfully!`);
  };

  const handleSubmit = () => {
    if (!supplierId) {
      toast.error('Please select a supplier.');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item to the purchase order.');
      return;
    }

    const purchaseData: CreatePurchaseData = {
      supplierId,
      items,
      deliveryDate: deliveryDate || undefined,
      notes: notes || undefined,
    };
    onSave(purchaseData);
  };

  const searchedProducts = useMemo(() => {
    if (!productSearchTerm) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
    ).slice(0, 5);
  }, [productSearchTerm, products]);

  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title="New Purchase Order"
        footer={
          <div className="flex justify-between w-full items-center">
              <div className="text-lg font-bold">Total: {formatCurrency(total)}</div>
              <div className="space-x-2">
                  <Button variant="secondary" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleSubmit}>Create Purchase Order</Button>
              </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Supplier Selection */}
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <select
              id="supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select a supplier...</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          {/* Product Search and Add New Product */}
          <div>
            {/* Product Search */}
            <div>
              <Label htmlFor="product-search">Add Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="product-search"
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProductModalOpen(true)}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {searchedProducts.length > 0 && (
                <div className="mt-2 border rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto">
                  {searchedProducts.map(product => (
                    <div
                      key={product.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleAddItem(product)}
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.sku} • {formatCurrency(product.costPrice)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Date */}
          <div>
            <Label htmlFor="delivery-date">Delivery Date (Optional)</Label>
            <Input
              id="delivery-date"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={3}
              placeholder="Additional notes for this purchase order..."
            />
          </div>

          {/* Items Table */}
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2 text-center w-24">Quantity</th>
                  <th className="p-2 text-center w-32">Cost Price</th>
                  <th className="p-2 text-right w-32">Total</th>
                  <th className="p-2 text-center w-12"></th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? items.map(item => (
                  <tr key={item.productId} className="border-b">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2"><Input type="number" value={item.quantity} onChange={e => handleUpdateItem(item.productId, 'quantity', e.target.value)} className="w-full text-center" /></td>
                    <td className="p-2"><Input type="number" value={item.costPrice} onChange={e => handleUpdateItem(item.productId, 'costPrice', e.target.value)} className="w-full text-center" /></td>
                    <td className="p-2 text-right font-medium">{formatCurrency(item.costPrice * item.quantity)}</td>
                    <td className="p-2 text-center">
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.productId)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                      <td colSpan={5} className="text-center p-8 text-gray-500">
                          No items added yet.
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
      {isProductModalOpen && (
        <ProductFormModal
            product={null}
            onClose={() => setIsProductModalOpen(false)}
            onSave={handleSaveNewProduct}
        />
      )}
    </>
  );
}
