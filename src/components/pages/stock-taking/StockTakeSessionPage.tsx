import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { mockData } from '../../../lib/mockData';
import { Product } from '../../../types';
import toast from 'react-hot-toast';
import { Save, Ban, Search, CheckCircle } from 'lucide-react';
import { StockTakeReviewModal } from './StockTakeReviewModal';

interface CountedItem extends Product {
    countedStock: number | '';
}

export function StockTakeSessionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState<CountedItem[]>(
        mockData.products.map(p => ({ ...p, countedStock: '' }))
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const handleCountChange = (productId: string, count: string) => {
        const newCount = count === '' ? '' : parseInt(count, 10);
        if (isNaN(newCount as number) && count !== '') return;

        setProducts(products.map(p => 
            p.id === productId ? { ...p, countedStock: newCount } : p
        ));
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const itemsWithVariance = useMemo(() => {
        return products
            .filter(p => p.countedStock !== '' && p.countedStock !== p.stock)
            .map(p => ({
                ...p,
                variance: (p.countedStock as number) - p.stock,
            }));
    }, [products]);

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel this stock take? All progress will be lost.')) {
            navigate('/stock-taking');
        }
    };

    const handleFinalize = () => {
        // In a real app, this would send the data to the backend.
        toast.success('Stock take finalized and inventory updated!');
        navigate('/stock-taking');
    };

    return (
        <div>
            <PageHeader title={`Stock Take: ${id}`} subtitle="Enter the physical count for each item.">
                <div className="flex items-center space-x-2">
                    <Button variant="danger" onClick={handleCancel}>
                        <Ban className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={() => setIsReviewModalOpen(true)} disabled={itemsWithVariance.length === 0}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review & Finalize
                    </Button>
                </div>
            </PageHeader>
            <Card>
                <div className="p-4 border-b">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by product name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3">SKU</th>
                                    <th className="px-6 py-3 text-center">Expected Stock</th>
                                    <th className="px-6 py-3 text-center">Counted Stock</th>
                                    <th className="px-6 py-3 text-center">Variance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => {
                                    const variance = product.countedStock !== '' ? (product.countedStock as number) - product.stock : null;
                                    return (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{product.name}</td>
                                            <td className="px-6 py-4">{product.sku}</td>
                                            <td className="px-6 py-4 text-center">{product.stock}</td>
                                            <td className="px-6 py-4">
                                                <Input 
                                                    type="number" 
                                                    className="w-24 text-center mx-auto"
                                                    value={product.countedStock}
                                                    onChange={(e) => handleCountChange(product.id, e.target.value)}
                                                />
                                            </td>
                                            <td className={`px-6 py-4 text-center font-bold ${
                                                variance === 0 ? 'text-green-600' : 
                                                variance === null ? '' : 'text-red-600'
                                            }`}>
                                                {variance}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            {isReviewModalOpen && (
                <StockTakeReviewModal
                    items={itemsWithVariance}
                    onClose={() => setIsReviewModalOpen(false)}
                    onConfirm={handleFinalize}
                />
            )}
        </div>
    );
}
