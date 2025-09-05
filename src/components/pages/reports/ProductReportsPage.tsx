import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';

export function ProductReportsPage() {
    const { products, sales } = mockData;

    const productPerformance = products.map(product => {
        const salesForItem = sales.flatMap(s => s.items).filter(i => i.productId === product.id);
        const quantitySold = salesForItem.reduce((sum, i) => sum + i.quantity, 0);
        const revenue = salesForItem.reduce((sum, i) => sum + i.total, 0);
        const cogs = quantitySold * product.costPrice;
        const profit = revenue - cogs;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
        return { ...product, quantitySold, revenue, cogs, profit, profitMargin };
    });

    const topSellersByRevenue = [...productPerformance].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const mostProfitable = [...productPerformance].sort((a, b) => b.profit - a.profit).slice(0, 10);

    return (
        <div>
            <PageHeader title="Product Reports" subtitle="Analyze product performance and profitability.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>

            <Card>
                <CardHeader><h3 className="font-semibold">Product Performance Details</h3></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3 text-right">Units Sold</th>
                                    <th className="px-6 py-3 text-right">Revenue</th>
                                    <th className="px-6 py-3 text-right">COGS</th>
                                    <th className="px-6 py-3 text-right">Profit</th>
                                    <th className="px-6 py-3 text-right">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSellersByRevenue.map(p => (
                                    <tr key={p.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{p.name}</td>
                                        <td className="px-6 py-4 text-right">{p.quantitySold}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(p.revenue)}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(p.cogs)}</td>
                                        <td className="px-6 py-4 text-right font-bold">{formatCurrency(p.profit)}</td>
                                        <td className={`px-6 py-4 text-right font-medium ${p.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {p.profitMargin.toFixed(2)}%
                                        </td>
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
