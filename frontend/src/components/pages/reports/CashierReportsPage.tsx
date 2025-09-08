import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { User } from '../../../types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function CashierReportsPage() {
    const { cashiers, sales } = mockData;

    const cashierPerformance = cashiers.map(cashier => {
        const cashierSales = sales.filter(s => s.cashierId === cashier.id);
        const totalRevenue = cashierSales.reduce((sum, s) => sum + s.total, 0);
        const totalTransactions = cashierSales.length;
        const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        const itemsPerTransaction = totalTransactions > 0 ? cashierSales.reduce((sum, s) => sum + s.items.length, 0) / totalTransactions : 0;
        return { ...cashier, totalRevenue, totalTransactions, avgTransactionValue, itemsPerTransaction };
    }).sort((a,b) => b.totalRevenue - a.totalRevenue);

    return (
        <div>
            <PageHeader title="Cashier Reports" subtitle="Monitor performance and sales activity by cashier.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Revenue by Cashier</h3></CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cashierPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                <Bar dataKey="totalRevenue" name="Total Revenue" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><h3 className="font-semibold">Detailed Cashier Performance</h3></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Cashier</th>
                                    <th className="px-6 py-3 text-right">Total Revenue</th>
                                    <th className="px-6 py-3 text-right">Transactions</th>
                                    <th className="px-6 py-3 text-right">Avg. Sale Value</th>
                                    <th className="px-6 py-3 text-right">Avg. Items/Sale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cashierPerformance.map(c => (
                                    <tr key={c.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{c.name}</td>
                                        <td className="px-6 py-4 text-right font-medium">{formatCurrency(c.totalRevenue)}</td>
                                        <td className="px-6 py-4 text-right">{c.totalTransactions}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(c.avgTransactionValue)}</td>
                                        <td className="px-6 py-4 text-right">{c.itemsPerTransaction.toFixed(2)}</td>
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
