import React, { useState, useMemo } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Purchase, PurchaseItem, Supplier, Product } from '../../../types';
import { mockData } from '../../../lib/mockData';
import { Search, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import toast from 'react-hot-toast';
import { ProductFormModal } from '../products/ProductFormModal';

interface PurchaseFormModalProps {
  onClose: () => void;
  onSave: (purchase: Purchase, newProducts: Product[]) => void;
}

export function PurchaseFormModal({ onClose, onSave }: PurchaseFormModalProps) {
  const [supplierId, setSupplierId] = useState<string>('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newlyCreatedProducts, setNewlyCreatedProducts] = useState<Product[]>([]);

  const handleAddItem = (product: Product) => {
    if (items.some(item => item.productId === product.id)) {
      toast.error(`${product.name} is already in the purchase order.`);
      return;
    }
    const newItem: PurchaseItem = {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      costPrice: product.costPrice,
      quantity: 1,
      total: product.costPrice * 1,
    };
    setItems([...items, newItem]);
    setProductSearchTerm('');
  };

  const handleUpdateItem = (productId: string, field: 'quantity' | 'costPrice', value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) && value !== '') return;

    setItems(items.map(item => {
      if (item.productId === productId) {
        const updatedItem = { ...item, [field]: numericValue };
        return { ...updatedItem, total: updatedItem.quantity * updatedItem.costPrice };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };
  
  const handleSaveNewProduct = (product: Product) => {
    const newProduct = { ...product, id: `prod-${Date.now()}`};
    // Add to mock data so it can be searched
    mockData.products.unshift(newProduct);
    setNewlyCreatedProducts([...newlyCreatedProducts, newProduct]);
    handleAddItem(newProduct);
    setIsProductModalOpen(false);
    toast.success(`${product.name} created and added to order.`);
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

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // Assuming 8% tax for purchases
    const newPurchase: Purchase = {
      id: `PO-${new Date().getTime()}`,
      vendorId: 'vendor1',
      supplierId,
      purchaseNumber: `PO-${new Date().getTime()}`,
      items,
      subtotal,
      tax,
      total: subtotal + tax,
      status: 'pending',
      createdAt: new Date(),
    };
    onSave(newPurchase, newlyCreatedProducts);
  };

  const searchedProducts = useMemo(() => {
    if (!productSearchTerm) return [];
    return mockData.products.filter(p =>
      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
    ).slice(0, 5);
  }, [productSearchTerm]);

  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
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
          {/* Supplier and Product Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <select
                id="supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a supplier</option>
                {mockData.suppliers.map((s: Supplier) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Label htmlFor="productSearch">Add Products</Label>
              <Search className="absolute left-3 top-10 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="productSearch"
                placeholder="Search by name or SKU..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pl-10"
              />
              {productSearchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {searchedProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleAddItem(p)}
                      className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    >
                      <span>{p.name} ({p.sku})</span>
                      <Plus className="h-4 w-4" />
                    </div>
                  ))}
                  <div
                    onClick={() => setIsProductModalOpen(true)}
                    className="p-3 hover:bg-blue-50 cursor-pointer flex justify-center items-center text-blue-600 font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Product
                  </div>
                </div>
              )}
            </div>
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
                    <td className="p-2 text-right font-medium">{formatCurrency(item.total)}</td>
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
