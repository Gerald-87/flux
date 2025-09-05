import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { Product } from '../../../types';
import toast from 'react-hot-toast';
import { downloadCsvTemplate } from '../../../lib/utils';

interface ProductImportModalProps {
  onClose: () => void;
  onImport: (products: Product[]) => void;
}

export function ProductImportModal({ onClose, onImport }: ProductImportModalProps) {
  const [parsedData, setParsedData] = useState<Product[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const products = results.data.map((row: any) => ({
            id: `imported-${Math.random()}`,
            vendorId: 'vendor1',
            name: row.name || 'Unnamed Product',
            description: row.description || '',
            sku: row.sku || `SKU-${Math.random().toString(36).substr(2, 9)}`,
            barcode: row.barcode || '',
            category: row.category || 'Uncategorized',
            brand: row.brand || '',
            price: parseFloat(row.price) || 0,
            costPrice: parseFloat(row.costPrice) || 0,
            stock: parseInt(row.stock, 10) || 0,
            minStock: parseInt(row.minStock, 10) || 10,
            maxStock: 100,
            unit: 'piece',
            images: [],
            isActive: row.isActive ? row.isActive.toLowerCase() === 'true' : true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          setParsedData(products as Product[]);
          toast.success(`${products.length} products parsed successfully.`);
        },
        error: (error: any) => {
          toast.error(`Error parsing file: ${error.message}`);
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  const handleImport = () => {
    onImport(parsedData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Import Products from CSV"
      footer={
        <div className="flex justify-between w-full">
          <Button variant="secondary" onClick={downloadCsvTemplate}>Download Template</Button>
          <div className="space-x-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={parsedData.length === 0}>
              Import {parsedData.length > 0 ? `${parsedData.length} Products` : ''}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-12 w-12 mx-auto text-gray-400" />
          {isDragActive ? (
            <p className="mt-2 text-blue-600">Drop the file here ...</p>
          ) : (
            <p className="mt-2 text-gray-600">Drag & drop a CSV file here, or click to select file</p>
          )}
        </div>
        {fileName && (
          <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">{fileName}</span>
            </div>
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{parsedData.length} products found</span>
            </div>
          </div>
        )}
        {parsedData.length > 0 && (
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">SKU</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {parsedData.slice(0, 5).map(p => (
                        <tr key={p.id} className="border-b">
                            <td className="p-2">{p.name}</td>
                            <td className="p-2">{p.sku}</td>
                            <td className="p-2 text-right">{p.price}</td>
                            <td className="p-2 text-right">{p.stock}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {parsedData.length > 5 && <p className="p-2 text-center text-xs text-gray-500">...and {parsedData.length - 5} more rows.</p>}
          </div>
        )}
      </div>
    </Modal>
  );
}
