import React from 'react';
import { Minus, Plus, X, ShoppingCart } from 'lucide-react';
import { SaleItem } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface CartProps {
  items: SaleItem[];
  onUpdateItem: (itemId: string, updates: Partial<SaleItem>) => void;
  onRemoveItem: (itemId: string) => void;
  onClear: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

export function Cart({ items, onUpdateItem, onRemoveItem, onClear, subtotal, tax, total }: CartProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart ({items.length} items)
        </h3>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-red-600 hover:text-red-700 text-sm transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.map(item => {
          const itemId = item.variantId || item.productId;
          return (
            <div key={itemId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                <p className="text-xs text-gray-500">{item.sku}</p>
                <p className="text-sm font-medium text-blue-600">
                  {formatCurrency(item.price)} each
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateItem(itemId, { quantity: Math.max(1, item.quantity - 1) })}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => onUpdateItem(itemId, { quantity: item.quantity + 1 })}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(item.total)}
                </p>
              </div>

              <button
                onClick={() => onRemoveItem(itemId)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Your cart is empty</p>
          <p className="text-sm">Add products to start a sale</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (10%):</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
