import React from 'react';
import { Modal } from '../ui/Modal';
import { Product, ProductVariant } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';

interface VariantSelectModalProps {
  product: Product;
  onClose: () => void;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantSelectModal({ product, onClose, onSelect }: VariantSelectModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} title={`Select variant for ${product.name}`}>
      <div className="space-y-3">
        <p className="text-sm text-gray-600">This product has multiple options. Please choose one to add to the cart.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {product.variants?.map(variant => (
            <button
              key={variant.id}
              onClick={() => onSelect(variant)}
              disabled={variant.stock <= 0}
              className="p-4 rounded-lg border text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:bg-blue-50"
            >
              <p className="font-semibold">{variant.value}</p>
              <p className="text-sm text-gray-600">
                {formatCurrency(product.price + variant.priceModifier)}
              </p>
              <p className={`text-xs ${variant.stock > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
