import React, { useState, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Download, Upload, Edit, Trash2, MoreVertical, Layers } from 'lucide-react';
import { mockData } from '../../lib/mockData';
import { Product } from '../../types';
import { formatCurrency, exportToCsv } from '../../lib/utils';
import { ProductFormModal } from './products/ProductFormModal';
import toast from 'react-hot-toast';
import { Pagination } from '../ui/Pagination';
import { ProductImportModal } from './products/ProductImportModal';
import { useAuth } from '../../hooks/useAuth';

export function ProductsPage() {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>(mockData.products);
  
  const products = useMemo(() => {
    if (!user?.vendorId) return [];
    return allProducts.filter(p => p.vendorId === user.vendorId);
  }, [allProducts, user]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action is permanent.')) {
      setAllProducts(allProducts.filter(p => p.id !== productId));
      toast.success('Product deleted successfully!');
    }
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setAllProducts(allProducts.map(p => (p.id === product.id ? product : p)));
      toast.success('Product updated successfully!');
    }
    // Note: Adding new products is now handled through the Purchases workflow.
    setIsFormModalOpen(false);
  };
  
  const handleImportProducts = (newProducts: Product[]) => {
    const productsForThisVendor = newProducts.map(p => ({ ...p, vendorId: user!.vendorId! }));
    setAllProducts(prev => [...productsForThisVendor, ...prev]);
    toast.success(`${newProducts.length} products imported successfully!`);
    setIsImportModalOpen(false);
  };

  const handleExportProducts = () => {
    const dataToExport = products.map(p => ({
        ...p,
        variants: p.variants?.map(v => `${v.name}:${v.value}`).join('; ')
    }));
    exportToCsv(dataToExport, 'products_export');
    toast.success('Products exported successfully!');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div>
      <PageHeader title="Products" subtitle={`View and manage your ${products.length} products.`}>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="secondary" onClick={handleExportProducts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                        <div className="flex items-center">
                            {product.name}
                            {product.variants && product.variants.length > 0 && (
                                <span className="ml-2 text-blue-500" title={`${product.variants.length} variants`}>
                                    <Layers className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4">{product.sku}</td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={product.stock < product.minStock ? 'text-red-600 font-medium' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
           <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
      
      {isFormModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {isImportModalOpen && (
        <ProductImportModal
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImportProducts}
        />
      )}
    </div>
  );
}
