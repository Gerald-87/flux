import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format, subMonths } from 'date-fns';

export function PurchaseReportsPage() {
    const { purchases, suppliers } = mockData;

    const totalSpend = purchases.reduce((sum, p) => sum + p.total, 0);
    const totalPOs = purchases.length;
    
    const topSuppliers = Object.entries(
        purchases.reduce((acc, p) => {
            const supplierName = suppliers.find(s => s.id === p.supplierId)?.name || 'Unknown';
            acc[supplierName] = (acc[supplierName] || 0) + p.total;
            return acc;
        }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a).slice(0, 5);

    const monthlyPurchases = Array.from({ length: 6 }).map((_, i) => {
        const month = subMonths(new Date(), 5 - i);
        const monthlyTotal = purchases
            .filter(p => format(p.createdAt, 'yyyy-MM') === format(month, 'yyyy-MM'))
            .reduce((sum, p) => sum + p.total, 0);
        return { name: format(month, 'MMM'), total: monthlyTotal };
    });

    return (
        <div>
            <PageHeader title="Purchase Reports" subtitle="Analyze spending, supplier performance, and purchase history.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Total Purchase Spend</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{formatCurrency(totalSpend)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Total Purchase Orders</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{totalPOs}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Avg. Purchase Order Value</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{formatCurrency(totalSpend / totalPOs)}</p></CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Purchases Over Last 6 Months</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyPurchases}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Bar dataKey="total" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Top 5 Suppliers by Spend</h3></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Supplier</th>
                                        <th className="px-6 py-3 text-right">Total Spend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topSuppliers.map(([name, total]) => (
                                        <tr key={name} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{name}</td>
                                            <td className="px-6 py-4 text-right font-medium">{formatCurrency(total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
