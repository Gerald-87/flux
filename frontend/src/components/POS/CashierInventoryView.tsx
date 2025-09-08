import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Search, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockData } from '../../lib/mockData';

export function CashierInventoryView() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const assignedProducts = useMemo(() => {
    if (!user?.assignedInventoryIds) return [];
    return mockData.products.filter(product => 
      user.assignedInventoryIds?.includes(product.id) && 
      product.vendorId === user.vendorId
    );
  }, [user]);

  const filteredProducts = useMemo(() => {
    return assignedProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignedProducts, searchTerm]);

  if (!user || user.role !== 'cashier') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <Package className="h-5 w-5 mr-2" />
          My Assigned Inventory ({assignedProducts.length} items)
        </h3>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assigned products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {assignedProducts.length === 0 
                ? "No inventory assigned to you yet" 
                : "No products match your search"
              }
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                  <div className="text-xs text-gray-500">Category: {product.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">${product.price.toFixed(2)}</div>
                  <div className={`text-xs ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    Stock: {product.stock}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
