import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface PaymentModalProps {
  total: number;
  onPayment: (data: { method: string; amount: number; change: number }) => void;
  onClose: () => void;
}

export function PaymentModal({ total, onPayment, onClose }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [amountReceived, setAmountReceived] = useState(total.toString());
  const [processing, setProcessing] = useState(false);

  const change = parseFloat(amountReceived) - total;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onPayment({
      method: paymentMethod,
      amount: parseFloat(amountReceived),
      change: Math.max(0, change)
    });
    
    setProcessing(false);
  };

  const quickAmounts = [total, Math.ceil(total / 10) * 10, Math.ceil(total / 20) * 20, Math.ceil(total / 50) * 50];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-2xl font-bold text-center text-gray-900 mb-2">
            {formatCurrency(total)}
          </p>
          <p className="text-center text-gray-500">Total Amount</p>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Payment Method</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`p-4 rounded-lg border text-center transition-colors ${
                paymentMethod === 'cash'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Banknote className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Cash</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-lg border text-center transition-colors ${
                paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod('mobile')}
              className={`p-4 rounded-lg border text-center transition-colors ${
                paymentMethod === 'mobile'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Mobile</span>
            </button>
          </div>
        </div>

        {/* Cash Payment */}
        {paymentMethod === 'cash' && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Amount Received</p>
            <input
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-lg text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              step="0.01"
              min={total}
            />
            
            <div className="grid grid-cols-4 gap-2 mt-3">
              {quickAmounts.map((amount, index) => (
                <button
                  key={`${amount}-${index}`}
                  onClick={() => setAmountReceived(amount.toString())}
                  className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            {change >= 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Change:</span>
                  <span className="text-green-700 font-bold text-lg">
                    {formatCurrency(change)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card/Mobile Payment */}
        {(paymentMethod === 'card' || paymentMethod === 'mobile') && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-blue-700 font-medium">
              {paymentMethod === 'card' ? 'Insert or tap card' : 'Show QR code to customer'}
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Waiting for payment confirmation...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={processing || (paymentMethod === 'cash' && parseFloat(amountReceived) < total)}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'Processing...' : 'Complete Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
