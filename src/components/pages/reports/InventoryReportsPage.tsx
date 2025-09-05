import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { Product } from '../../../types';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';

export function InventoryReportsPage() {
    const { products } = mockData;
    const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
    const totalSKUs = products.length;
    const lowStockItems = products.filter(p => p.stock < p.minStock);

    return (
        <div>
            <PageHeader title="Inventory Reports" subtitle="Track stock levels, turnover rates, and low-stock items.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Total Stock Value</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{formatCurrency(totalStockValue)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Total SKUs</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{totalSKUs}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Low Stock Items</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-orange-500">{lowStockItems.length}</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="font-semibold flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                        Items with Low Stock
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3">SKU</th>
                                    <th className="px-6 py-3">Current Stock</th>
                                    <th className="px-6 py-3">Min Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockItems.map((product: Product) => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{product.name}</td>
                                        <td className="px-6 py-4">{product.sku}</td>
                                        <td className="px-6 py-4 font-bold text-red-600">{product.stock}</td>
                                        <td className="px-6 py-4">{product.minStock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
