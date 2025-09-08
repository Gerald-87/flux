import { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Sale, ReceiptData } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface SaleReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export function SaleReceiptModal({ sale, onClose }: SaleReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleDownload = () => {
    const receiptContent = generateReceiptHTML(sale.receiptData || createReceiptData(sale));
    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${sale.receiptNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded successfully');
  };

  const createReceiptData = (sale: Sale): ReceiptData => ({
    receiptNumber: sale.receiptNumber,
    businessName: 'FluxPOS Store',
    businessAddress: '123 Business St, City, State 12345',
    businessPhone: '+1 (555) 123-4567',
    cashierName: 'Cashier',
    items: sale.items,
    subtotal: sale.subtotal,
    tax: sale.tax,
    discount: sale.discount,
    total: sale.total,
    paid: sale.paid,
    change: sale.change,
    paymentMethod: sale.paymentMethod,
    loyaltyPointsEarned: sale.loyaltyPointsEarned,
    loyaltyPointsUsed: sale.loyaltyPointsUsed,
    saleDate: sale.createdAt,
    thankYouMessage: 'Thank you for your business!'
  });

  const receiptData = sale.receiptData || createReceiptData(sale);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Sale Receipt"
      footer={
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={handleDownload} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting} className="flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
        </div>
      }
    >
      <div className="receipt-content bg-white p-6 max-w-md mx-auto border rounded-lg">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">{receiptData.businessName}</h2>
          <p className="text-sm text-gray-600">{receiptData.businessAddress}</p>
          {receiptData.businessPhone && (
            <p className="text-sm text-gray-600">{receiptData.businessPhone}</p>
          )}
        </div>

        <div className="border-t border-b border-gray-300 py-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Receipt #:</span>
            <span className="font-mono">{receiptData.receiptNumber}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Date:</span>
            <span>{formatDate(receiptData.saleDate)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Cashier:</span>
            <span>{receiptData.cashierName}</span>
          </div>
          {receiptData.customerName && (
            <div className="flex justify-between text-sm">
              <span>Customer:</span>
              <span>{receiptData.customerName}</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm font-semibold mb-2 border-b pb-2">
            <span>Item</span>
            <span>Total</span>
          </div>
          {receiptData.items.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between text-sm">
                <span className="flex-1">{item.name}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
              <div className="text-xs text-gray-500 ml-2">
                {item.quantity} × {formatCurrency(item.price)}
                {item.discount > 0 && ` (${formatCurrency(item.discount)} off)`}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-300 pt-4 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal:</span>
            <span>{formatCurrency(receiptData.subtotal)}</span>
          </div>
          {receiptData.discount > 0 && (
            <div className="flex justify-between text-sm mb-1 text-green-600">
              <span>Discount:</span>
              <span>-{formatCurrency(receiptData.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-1">
            <span>Tax:</span>
            <span>{formatCurrency(receiptData.tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(receiptData.total)}</span>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Payment Method:</span>
            <span className="capitalize">{receiptData.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Amount Paid:</span>
            <span>{formatCurrency(receiptData.paid)}</span>
          </div>
          {receiptData.change > 0 && (
            <div className="flex justify-between text-sm">
              <span>Change:</span>
              <span>{formatCurrency(receiptData.change)}</span>
            </div>
          )}
        </div>

        {(receiptData.loyaltyPointsEarned > 0 || receiptData.loyaltyPointsUsed > 0) && (
          <div className="border-t border-gray-300 pt-4 mb-4">
            {receiptData.loyaltyPointsUsed > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span>Loyalty Points Used:</span>
                <span>{receiptData.loyaltyPointsUsed}</span>
              </div>
            )}
            {receiptData.loyaltyPointsEarned > 0 && (
              <div className="flex justify-between text-sm">
                <span>Loyalty Points Earned:</span>
                <span>{receiptData.loyaltyPointsEarned}</span>
              </div>
            )}
          </div>
        )}

        {receiptData.thankYouMessage && (
          <div className="text-center text-sm text-gray-600 mt-6">
            {receiptData.thankYouMessage}
          </div>
        )}
      </div>
    </Modal>
  );
}

function generateReceiptHTML(receiptData: ReceiptData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt ${receiptData.receiptNumber}</title>
      <style>
        body { font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 10px 0; }
        .flex { display: flex; justify-content: space-between; }
        .bold { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="center bold">
        <h2>${receiptData.businessName}</h2>
        <p>${receiptData.businessAddress}</p>
        ${receiptData.businessPhone ? `<p>${receiptData.businessPhone}</p>` : ''}
      </div>
      
      <div class="line"></div>
      
      <div class="flex"><span>Receipt #:</span><span>${receiptData.receiptNumber}</span></div>
      <div class="flex"><span>Date:</span><span>${formatDate(receiptData.saleDate)}</span></div>
      <div class="flex"><span>Cashier:</span><span>${receiptData.cashierName}</span></div>
      ${receiptData.customerName ? `<div class="flex"><span>Customer:</span><span>${receiptData.customerName}</span></div>` : ''}
      
      <div class="line"></div>
      
      ${receiptData.items.map(item => `
        <div class="flex"><span>${item.name}</span><span>${formatCurrency(item.total)}</span></div>
        <div style="margin-left: 10px; font-size: 0.8em;">${item.quantity} × ${formatCurrency(item.price)}</div>
      `).join('')}
      
      <div class="line"></div>
      
      <div class="flex"><span>Subtotal:</span><span>${formatCurrency(receiptData.subtotal)}</span></div>
      ${receiptData.discount > 0 ? `<div class="flex"><span>Discount:</span><span>-${formatCurrency(receiptData.discount)}</span></div>` : ''}
      <div class="flex"><span>Tax:</span><span>${formatCurrency(receiptData.tax)}</span></div>
      <div class="flex bold"><span>Total:</span><span>${formatCurrency(receiptData.total)}</span></div>
      
      <div class="line"></div>
      
      <div class="flex"><span>Payment:</span><span>${receiptData.paymentMethod}</span></div>
      <div class="flex"><span>Paid:</span><span>${formatCurrency(receiptData.paid)}</span></div>
      ${receiptData.change > 0 ? `<div class="flex"><span>Change:</span><span>${formatCurrency(receiptData.change)}</span></div>` : ''}
      
      ${receiptData.loyaltyPointsEarned > 0 || receiptData.loyaltyPointsUsed > 0 ? `
        <div class="line"></div>
        ${receiptData.loyaltyPointsUsed > 0 ? `<div class="flex"><span>Points Used:</span><span>${receiptData.loyaltyPointsUsed}</span></div>` : ''}
        ${receiptData.loyaltyPointsEarned > 0 ? `<div class="flex"><span>Points Earned:</span><span>${receiptData.loyaltyPointsEarned}</span></div>` : ''}
      ` : ''}
      
      <div class="center" style="margin-top: 20px;">
        ${receiptData.thankYouMessage || ''}
      </div>
    </body>
    </html>
  `;
}
