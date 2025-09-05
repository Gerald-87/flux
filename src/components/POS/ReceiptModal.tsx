import React, { useRef } from 'react';
import { X, Download, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ReceiptModalProps {
  sale: any;
  customer: any;
  onClose: () => void;
}

export function ReceiptModal({ sale, customer, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    const canvas = await html2canvas(receiptRef.current);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`receipt-${sale.receiptNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Receipt</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-6 bg-white">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">FluxPOS</h2>
            <p className="text-sm text-gray-600">123 Business Street</p>
            <p className="text-sm text-gray-600">City, State 12345</p>
            <p className="text-sm text-gray-600">Tel: (555) 123-4567</p>
          </div>

          {/* Receipt Info */}
          <div className="border-t border-b border-gray-200 py-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Receipt #:</p>
                <p className="font-medium">{sale.receiptNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Date:</p>
                <p className="font-medium">{formatDate(sale.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Cashier:</p>
                <p className="font-medium">Alice Johnson</p>
              </div>
              <div>
                <p className="text-gray-600">Payment:</p>
                <p className="font-medium capitalize">{sale.paymentMethod}</p>
              </div>
            </div>
            
            {customer && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-600 text-sm">Customer:</p>
                <p className="font-medium">{customer.name}</p>
                {customer.phone && (
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                )}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Items</h4>
            <div className="space-y-2">
              {sale.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-600">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span>{formatCurrency(sale.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paid:</span>
              <span>{formatCurrency(sale.paid)}</span>
            </div>
            {sale.change > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Change:</span>
                <span>{formatCurrency(sale.change)}</span>
              </div>
            )}
          </div>

          {/* Loyalty Points */}
          {customer && sale.loyaltyPointsEarned > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700 text-sm font-medium">
                Loyalty Points Earned: {sale.loyaltyPointsEarned}
              </p>
              <p className="text-blue-600 text-sm">
                Total Points: {customer.loyaltyPoints + sale.loyaltyPointsEarned}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Thank you for your business!</p>
            <p className="text-xs text-gray-500 mt-2">
              Visit us at www.fluxpos.com
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
