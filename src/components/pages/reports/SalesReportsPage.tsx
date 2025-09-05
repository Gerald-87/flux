import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { mockData } from '../../../lib/mockData';
import { format, subDays } from 'date-fns';
import { formatCurrency } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { ArrowLeft } from 'lucide-react';

// Process data for charts
const salesOverTime = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dailySales = mockData.sales
        .filter(sale => format(sale.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        .reduce((sum, sale) => sum + sale.total, 0);
    return { date: format(date, 'MMM d'), sales: dailySales };
});

const salesByPayment = mockData.sales.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
    return acc;
}, {} as Record<string, number>);

const paymentData = Object.entries(salesByPayment).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const topProducts = mockData.sales
    .flatMap(sale => sale.items)
    .reduce((acc, item) => {
        if (!acc[item.productId]) {
            acc[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        acc[item.productId].quantity += item.quantity;
        acc[item.productId].revenue += item.total;
        return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number }>)
    
Object.values(topProducts).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

export function SalesReportsPage() {
    const totalSales = mockData.sales.reduce((sum, s) => sum + s.total, 0);
    const totalOrders = mockData.sales.length;

    return (
        <div>
            <PageHeader title="Sales Reports" subtitle="Analyze sales trends, peak hours, and payment methods.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Total Revenue</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{formatCurrency(totalSales)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Total Orders</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{totalOrders}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Average Order Value</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{formatCurrency(totalSales / totalOrders)}</p></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><h3 className="font-semibold">Sales Over Last 7 Days</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Sales by Payment Method</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={paymentData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
