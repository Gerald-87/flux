import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { Sale } from '../../../types';
import { Button } from '../../ui/Button';
import { ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format, subMonths } from 'date-fns';

export function ProfitAndLossPage() {
    const { sales, products } = mockData;

    const calculateCOGS = (sale: Sale) => {
        return sale.items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            return sum + (product ? product.costPrice * item.quantity : 0);
        }, 0);
    };

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCOGS = sales.reduce((sum, sale) => sum + calculateCOGS(sale), 0);
    const grossProfit = totalRevenue - totalCOGS;
    
    // Mock operating expenses
    const operatingExpenses = 15000;
    const netProfit = grossProfit - operatingExpenses;

    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
        const month = subMonths(new Date(), 5 - i);
        const monthlySales = sales.filter(s => format(s.createdAt, 'yyyy-MM') === format(month, 'yyyy-MM'));
        const revenue = monthlySales.reduce((sum, s) => sum + s.total, 0);
        const profit = revenue - monthlySales.reduce((sum, s) => sum + calculateCOGS(s), 0);
        return { name: format(month, 'MMM'), revenue, profit };
    });

    return (
        <div>
            <PageHeader title="Profit & Loss Report" subtitle="Monitor revenue, costs, and overall profitability.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Total Revenue</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Gross Profit</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-blue-600">{formatCurrency(grossProfit)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Net Profit</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-indigo-600">{formatCurrency(netProfit)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Profit Margin</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-purple-600">{profitMargin.toFixed(2)}%</p></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Financial Summary</h3></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <tbody>
                                    <tr className="border-b"><td className="px-6 py-3 font-medium">Total Revenue</td><td className="px-6 py-3 text-right">{formatCurrency(totalRevenue)}</td></tr>
                                    <tr className="border-b"><td className="px-6 py-3 font-medium">Cost of Goods Sold</td><td className="px-6 py-3 text-right">({formatCurrency(totalCOGS)})</td></tr>
                                    <tr className="border-b bg-gray-50"><td className="px-6 py-3 font-bold">Gross Profit</td><td className="px-6 py-3 text-right font-bold">{formatCurrency(grossProfit)}</td></tr>
                                    <tr className="border-b"><td className="px-6 py-3 font-medium">Operating Expenses</td><td className="px-6 py-3 text-right">({formatCurrency(operatingExpenses)})</td></tr>
                                    <tr className="bg-blue-50"><td className="px-6 py-3 font-bold text-lg">Net Profit</td><td className="px-6 py-3 text-right font-bold text-lg">{formatCurrency(netProfit)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><h3 className="font-semibold">Revenue vs. Profit (6 Months)</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="profit" name="Profit" stroke="#22c55e" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
