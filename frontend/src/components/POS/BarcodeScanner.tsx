import React, { useEffect, useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (scannerRef.current && !scanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'barcode-scanner',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          onScan(decodedText);
          html5QrcodeScanner.clear();
        },
        (error) => {
          console.warn('Barcode scan error:', error);
        }
      );

      setScanner(html5QrcodeScanner);
      setIsScanning(true);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scanner, onScan]);

  const handleClose = () => {
    if (scanner) {
      scanner.clear().catch(console.error);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Scan Barcode
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <div
            id="barcode-scanner"
            ref={scannerRef}
            className="w-full rounded-lg overflow-hidden border border-gray-200"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Position the barcode within the scanning area
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
