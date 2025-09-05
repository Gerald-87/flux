import React, { useState, useEffect } from 'react';
import { ProductSearch } from './ProductSearch';
import { Cart } from './Cart';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { CustomerSelect } from './CustomerSelect';
import { BarcodeScanner } from './BarcodeScanner';
import { VariantSelectModal } from './VariantSelectModal';
import { Product, Customer, SaleItem, ProductVariant } from '../../types';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { generateReceiptNumber, formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';
import { mockData } from '../../lib/mockData';
import { useAuth } from '../../hooks/useAuth';

export function POSTerminal() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [productForVariantSelection, setProductForVariantSelection] = useState<Product | null>(null);
  const { addOfflineAction, isOnline } = useOfflineSync();

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const itemId = variant ? variant.id : product.id;
    const existingItem = cartItems.find(item => (variant ? item.variantId === itemId : item.productId === itemId && !item.variantId));

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        (variant ? item.variantId === itemId : item.productId === itemId && !item.variantId)
          ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
          : item
      ));
    } else {
      const finalPrice = variant ? product.price + variant.priceModifier : product.price;
      const newItem: SaleItem = {
        productId: product.id,
        variantId: variant?.id,
        name: variant ? `${product.name} (${variant.value})` : product.name,
        sku: variant ? variant.sku : product.sku,
        price: finalPrice,
        quantity,
        discount: 0,
        total: finalPrice * quantity
      };
      setCartItems([...cartItems, newItem]);
    }
    
    toast.success(`${variant ? `${product.name} (${variant.value})` : product.name} added to cart`);
    setProductForVariantSelection(null);
  };

  const updateCartItem = (itemId: string, updates: Partial<SaleItem>) => {
    setCartItems(cartItems.map(item => {
      const currentItemId = item.variantId || item.productId;
      if (currentItemId === itemId) {
        const updatedItem = { ...item, ...updates };
        return { ...updatedItem, total: (updatedItem.quantity) * (updatedItem.price) - (updatedItem.discount) };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => (item.variantId || item.productId) !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
  };

  const handlePayment = (paymentData: any) => {
    if (!user) {
        toast.error("No user logged in.");
        return;
    }
    const sale = {
      id: generateReceiptNumber(),
      vendorId: user.vendorId!,
      cashierId: user.id,
      terminalId: user.terminalId || 'default',
      customerId: selectedCustomer?.id,
      receiptNumber: generateReceiptNumber(),
      items: cartItems,
      subtotal: cartItems.reduce((sum, item) => sum + item.total, 0),
      tax: cartItems.reduce((sum, item) => sum + item.total, 0) * 0.1,
      discount: 0,
      total: cartItems.reduce((sum, item) => sum + item.total, 0) * 1.1,
      paid: paymentData.amount,
      change: paymentData.change,
      paymentMethod: paymentData.method,
      status: 'completed' as const,
      loyaltyPointsEarned: selectedCustomer ? Math.floor(cartItems.reduce((sum, item) => sum + item.total, 0) / 10) : 0,
      loyaltyPointsUsed: 0,
      createdAt: new Date()
    };

    if (!isOnline) {
      addOfflineAction('CREATE_SALE', sale);
    }

    setLastSale(sale);
    setShowPayment(false);
    setShowReceipt(true);
    clearCart();
    toast.success('Sale completed successfully!');
  };

  const handleBarcodeScanned = (barcode: string) => {
    const product = mockData.products.find(p => p.barcode === barcode || p.variants?.some(v => v.barcode === barcode));
    if (product) {
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.barcode === barcode);
        if (variant) {
            addToCart(product, variant);
        } else {
            setProductForVariantSelection(product);
        }
      } else {
        addToCart(product);
      }
      setShowScanner(false);
    } else {
      toast.error('Product not found');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="h-full flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
      {/* Left side - Product search and cart */}
      <div className="flex-1 flex flex-col space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">POS Terminal ({user?.terminalId || 'Default'})</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowScanner(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Scan Barcode
              </button>
            </div>
          </div>
          
          <ProductSearch products={mockData.products} onProductSelect={setProductForVariantSelection} onAddToCart={addToCart} />
        </div>

        <div className="flex-1">
          <Cart
            items={cartItems}
            onUpdateItem={updateCartItem}
            onRemoveItem={removeFromCart}
            onClear={clearCart}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />
        </div>
      </div>

      {/* Right side - Customer and checkout */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <CustomerSelect
          selectedCustomer={selectedCustomer}
          onCustomerSelect={setSelectedCustomer}
        />

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkout</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (10%):</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            disabled={cartItems.length === 0}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Process Payment
          </button>
        </div>
      </div>

      {/* Modals */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}

      {productForVariantSelection && (
        <VariantSelectModal
            product={productForVariantSelection}
            onClose={() => setProductForVariantSelection(null)}
            onSelect={(variant) => addToCart(productForVariantSelection, variant)}
        />
      )}

      {showPayment && (
        <PaymentModal
          total={total}
          onPayment={handlePayment}
          onClose={() => setShowPayment(false)}
        />
      )}

      {showReceipt && lastSale && (
        <ReceiptModal
          sale={lastSale}
          customer={selectedCustomer}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
