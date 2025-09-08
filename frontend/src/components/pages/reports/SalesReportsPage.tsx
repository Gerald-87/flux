import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { mockData } from '../../../lib/mockData';
import { format, subDays, getHours } from 'date-fns';
import { formatCurrency } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export function SalesReportsPage() {
    const { user } = useAuth();

    const sales = useMemo(() => {
        if (!user?.vendorId) return [];
        return mockData.sales.filter(s => s.vendorId === user.vendorId);
    }, [user]);

    const products = useMemo(() => {
        if (!user?.vendorId) return [];
        return mockData.products.filter(p => p.vendorId === user.vendorId);
    }, [user]);

    // Process data for charts
    const salesOverTime = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dailySales = sales
            .filter(sale => format(sale.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
            .reduce((sum, sale) => sum + sale.total, 0);
        return { date: format(date, 'MMM d'), sales: dailySales };
    });

    const salesByPayment = sales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
    }, {} as Record<string, number>);

    const paymentData = Object.entries(salesByPayment).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    const salesByHourData = Array.from({ length: 24 }, (_, i) => ({ hour: i, sales: 0 }));
    sales.forEach(sale => {
        const hour = getHours(sale.createdAt);
        salesByHourData[hour].sales += sale.total;
    });

    const salesByCategory = sales
        .flatMap(sale => sale.items.map(item => ({ ...item, category: products.find(p => p.id === item.productId)?.category || 'Unknown' })))
        .reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.total;
            return acc;
        }, {} as Record<string, number>);
    const categoryData = Object.entries(salesByCategory).map(([name, sales]) => ({ name, sales })).sort((a,b) => b.sales - a.sales).slice(0, 5);


    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalOrders = sales.length;
    const totalItemsSold = sales.reduce((sum, s) => sum + s.items.reduce((itemSum, i) => itemSum + i.quantity, 0), 0);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                    <CardContent><p className="text-3xl font-bold">{totalOrders > 0 ? formatCurrency(totalSales / totalOrders) : formatCurrency(0)}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><h3 className="font-semibold">Total Items Sold</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{totalItemsSold}</p></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
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
                <Card>
                    <CardHeader><h3 className="font-semibold">Sales by Hour of Day</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesByHourData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                                    <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Bar dataKey="sales" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Top 5 Categories by Sales</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value as number)} />
                                    <YAxis type="category" dataKey="name" width={80} />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Bar dataKey="sales" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
