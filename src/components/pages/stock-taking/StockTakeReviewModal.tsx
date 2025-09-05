import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface StockTakeReviewModalProps {
  items: any[];
  onClose: () => void;
  onConfirm: () => void;
}

export function StockTakeReviewModal({ items, onClose, onConfirm }: StockTakeReviewModalProps) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Review Stock Take Variances"
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Go Back & Edit</Button>
          <Button variant="primary" onClick={onConfirm}>Confirm & Update Inventory</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
            <div>
                <h4 className="font-semibold text-yellow-800">Confirm Changes</h4>
                <p className="text-sm text-yellow-700">You are about to finalize the stock take. The following {items.length} items have variances and their stock levels will be updated permanently.</p>
            </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-center">Expected</th>
                        <th className="p-2 text-center">Counted</th>
                        <th className="p-2 text-center">Variance</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="border-b">
                            <td className="p-2 font-medium">{item.name}</td>
                            <td className="p-2 text-center">{item.stock}</td>
                            <td className="p-2 text-center">{item.countedStock}</td>
                            <td className={`p-2 text-center font-bold ${item.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.variance > 0 ? `+${item.variance}` : item.variance}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </Modal>
  );
}
