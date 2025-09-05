import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Product, ProductVariant } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

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
      variants: [],
    }
  );
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);

  useEffect(() => {
    if (variants.length > 0) {
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      setFormData(prev => ({ ...prev, stock: totalStock }));
    }
  }, [variants]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | boolean = value;
    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    }
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
        processedValue = e.target.checked;
    }

    setFormData({ ...formData, [name]: processedValue });
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string) => {
    const newVariants = [...variants];
    const numValue = parseFloat(value);
    newVariants[index] = { ...newVariants[index], [field]: isNaN(numValue) ? value : numValue };
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { id: `new-${Date.now()}`, name: 'Size', value: '', priceModifier: 0, stock: 0, sku: '' }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, variants } as Product);
  };

  const hasVariants = variants.length > 0;

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
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="sku">Base SKU</Label>
            <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" value={formData.category} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="price">Base Price</Label>
            <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="costPrice">Cost Price</Label>
            <Input id="costPrice" name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="stock">Total Stock</Label>
            <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required disabled={hasVariants} />
            {hasVariants && <p className="text-xs text-gray-500 mt-1">Total stock is calculated from variants.</p>}
          </div>
          <div>
            <Label htmlFor="minStock">Min Stock Level</Label>
            <Input id="minStock" name="minStock" type="number" value={formData.minStock} onChange={handleChange} />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Variants</h4>
            <Button type="button" variant="secondary" size="sm" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>
          {hasVariants ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-3"><Label>Type</Label><Input value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} placeholder="e.g. Size"/></div>
                  <div className="col-span-3"><Label>Value</Label><Input value={variant.value} onChange={e => handleVariantChange(index, 'value', e.target.value)} placeholder="e.g. Large"/></div>
                  <div className="col-span-2"><Label>Price +/-</Label><Input type="number" value={variant.priceModifier} onChange={e => handleVariantChange(index, 'priceModifier', e.target.value)} /></div>
                  <div className="col-span-2"><Label>Stock</Label><Input type="number" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} /></div>
                  <div className="col-span-1"><Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}><Trash2 className="h-4 w-4 text-red-500"/></Button></div>
                  <div className="col-span-12"><Label>Variant SKU</Label><Input value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} placeholder="SKU for this variant" /></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No variants added. The product will be treated as a single item.</p>
          )}
        </div>
        
        <div className="md:col-span-2 flex items-center space-x-2">
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded" />
            <Label htmlFor="isActive">Product is Active</Label>
        </div>
      </form>
    </Modal>
  );
}
