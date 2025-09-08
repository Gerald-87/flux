import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../ui/PageHeader';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { mockData } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { Customer } from '../../../types';
import { subMonths, subDays } from 'date-fns';
import { Button } from '../../ui/Button';
import { ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export function CustomerReportsPage() {
    const { customers, sales } = mockData;
    const totalCustomers = customers.length;
    const newCustomers = customers.filter(c => c.createdAt > subMonths(new Date(), 1)).length;
    const topSpenders = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

    const activeCustomersLast30Days = new Set(sales.filter(s => s.createdAt > subDays(new Date(), 30)).map(s => s.customerId));
    const repeatCustomerCount = [...activeCustomersLast30Days].filter(id => (customers.find(c => c.id === id)?.visitCount || 0) > 1).length;
    const repeatRate = activeCustomersLast30Days.size > 0 ? (repeatCustomerCount / activeCustomersLast30Days.size) * 100 : 0;

    const customerSegmentData = [
        { name: 'New Customers', value: newCustomers },
        { name: 'Returning Customers', value: totalCustomers - newCustomers },
    ];
    const COLORS = ['#0088FE', '#00C49F'];

    return (
        <div>
            <PageHeader title="Customer Reports" subtitle="Understand customer behavior, loyalty, and purchase history.">
                <Link to="/reports">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Reports
                    </Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader><h3 className="font-semibold">Total Customers</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{totalCustomers}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">New Customers (30d)</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{newCustomers}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Repeat Customer Rate (30d)</h3></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{repeatRate.toFixed(1)}%</p></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><h3 className="font-semibold">Top 5 Spenders</h3></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Total Spent</th>
                                        <th className="px-6 py-3">Visits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topSpenders.map((customer: Customer) => (
                                        <tr key={customer.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">{customer.name}</td>
                                            <td className="px-6 py-4">{customer.email}</td>
                                            <td className="px-6 py-4 font-medium">{formatCurrency(customer.totalSpent)}</td>
                                            <td className="px-6 py-4">{customer.visitCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><h3 className="font-semibold">Customer Segments</h3></CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={customerSegmentData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {customerSegmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
